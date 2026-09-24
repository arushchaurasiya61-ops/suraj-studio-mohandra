import {
  NextRequest,
  NextResponse,
} from "next/server";

import { Readable } from "node:stream";
import sharp from "sharp";

import { db } from "@/lib/supabase";
import { getDriveForGallery } from "@/lib/google-drive";
import { hasGalleryAccess } from "@/lib/gallery-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeFileName(
  value: string | null | undefined
) {
  const fileName =
    (value || "photo").trim() ||
    "photo";

  return fileName.replace(
    /[\r\n"\\/:*?<>|]/g,
    "_"
  );
}

function contentDisposition(
  fileName: string,
  download: boolean
) {
  const safeName =
    safeFileName(fileName);

  const asciiName =
    safeName.replace(
      /[^\x20-\x7E]/g,
      "_"
    );

  const encodedName =
    encodeURIComponent(safeName)
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29");

  return `${
    download
      ? "attachment"
      : "inline"
  }; filename="${asciiName}"; filename*=UTF-8''${encodedName}`;
}

async function streamToBuffer(
  stream: Readable
) {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(
      Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk)
    );
  }

  return Buffer.concat(chunks);
}

function outputMimeType(
  format: string | undefined,
  fallback: string
) {
  switch (format) {
    case "jpeg":
    case "jpg":
      return "image/jpeg";

    case "png":
      return "image/png";

    case "webp":
      return "image/webp";

    case "gif":
      return "image/gif";

    case "tiff":
      return "image/tiff";

    case "avif":
      return "image/avif";

    case "heif":
      return "image/heif";

    default:
      return fallback;
  }
}

function watermarkSvg(
  width: number,
  height: number
) {
  const fontSize = Math.max(
    24,
    Math.min(
      Math.round(width * 0.045),
      Math.round(height * 0.075),
      96
    )
  );

  const subSize = Math.max(
    13,
    Math.round(fontSize * 0.38)
  );

  const strokeWidth = Math.max(
    1,
    Math.round(fontSize * 0.045)
  );

  return Buffer.from(`
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        transform="translate(${width / 2} ${height / 2}) rotate(-24)"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
      >
        <text
          x="0"
          y="0"
          font-size="${fontSize}"
          font-weight="700"
          letter-spacing="${Math.max(1, Math.round(fontSize * 0.08))}"
          fill="#ffffff"
          fill-opacity="0.30"
          stroke="#000000"
          stroke-opacity="0.28"
          stroke-width="${strokeWidth}"
          paint-order="stroke fill"
        >
          SURAJ STUDIO MOHANDRA
        </text>

        <text
          x="0"
          y="${Math.round(fontSize * 0.72)}"
          font-size="${subSize}"
          font-weight="600"
          letter-spacing="${Math.max(1, Math.round(subSize * 0.12))}"
          fill="#ffffff"
          fill-opacity="0.24"
          stroke="#000000"
          stroke-opacity="0.22"
          stroke-width="${Math.max(1, Math.round(strokeWidth * 0.7))}"
          paint-order="stroke fill"
        >
          CLIENT PREVIEW
        </text>
      </g>
    </svg>
  `);
}

async function createWatermarkedPreview(
  input: Buffer,
  fallbackContentType: string
) {
  const source = sharp(input, {
    failOn: "error",
  });

  const metadata =
    await source.metadata();

  if (
    !metadata.width ||
    !metadata.height
  ) {
    throw new Error(
      "Image dimensions could not be read."
    );
  }

  const orientation =
    metadata.orientation || 1;

  const swapsDimensions =
    orientation >= 5 &&
    orientation <= 8;

  const width =
    swapsDimensions
      ? metadata.height
      : metadata.width;

  const height =
    swapsDimensions
      ? metadata.width
      : metadata.height;

  const watermark =
    watermarkSvg(
      width,
      height
    );

  const result = await sharp(
    input,
    {
      failOn: "error",
    }
  )
    .rotate()
    .composite([
      {
        input: watermark,
        gravity: "center",
      },
    ])
    .toBuffer({
      resolveWithObject: true,
    });

  return {
    buffer: result.data,
    contentType:
      outputMimeType(
        result.info.format,
        fallbackContentType
      ),
  };
}

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      photoId: string;
    }>;
  }
) {
  try {
    const { photoId } =
      await context.params;

    const downloadRequested =
      req.nextUrl.searchParams.get(
        "download"
      ) === "1";

    // 1. Find active photo.
    const {
      data: photo,
      error: photoError,
    } = await db()
      .from("photos")
      .select(
        "id,event_id,drive_file_id,file_name,mime_type,active,watermark_enabled"
      )
      .eq("id", photoId)
      .eq("active", true)
      .maybeSingle();

    if (photoError) {
      throw new Error(
        photoError.message
      );
    }

    if (
      !photo ||
      !photo.drive_file_id
    ) {
      return NextResponse.json(
        {
          error:
            "Photo not found.",
        },
        {
          status: 404,
        }
      );
    }

    // 2. Find event and permissions.
    const {
      data: event,
      error: eventError,
    } = await db()
      .from("events")
      .select(
        "id,visibility,password_protected,expiry_date,allow_optimized_download"
      )
      .eq("id", photo.event_id)
      .maybeSingle();

    if (eventError) {
      throw new Error(
        eventError.message
      );
    }

    if (!event) {
      return NextResponse.json(
        {
          error:
            "Gallery not found.",
        },
        {
          status: 404,
        }
      );
    }

    // 3. Block expired gallery.
    if (
      event.expiry_date &&
      new Date(
        event.expiry_date
      ).getTime() < Date.now()
    ) {
      return NextResponse.json(
        {
          error:
            "Gallery has expired.",
        },
        {
          status: 410,
        }
      );
    }

    // 4. Block private gallery.
    if (
      event.visibility ===
      "private"
    ) {
      return NextResponse.json(
        {
          error:
            "Gallery not available.",
        },
        {
          status: 404,
        }
      );
    }

    // 5. Check password access.
    const allowed =
      await hasGalleryAccess(
        event.id,
        event.password_protected ===
          true
      );

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Gallery access required.",
        },
        {
          status: 401,
        }
      );
    }

    // 6. Enforce gallery download permission.
    if (
      downloadRequested &&
      event.allow_optimized_download !==
        true
    ) {
      return NextResponse.json(
        {
          error:
            "Photo download is disabled for this gallery.",
        },
        {
          status: 403,
        }
      );
    }

    // 7. Fetch the private file from Google Drive.
    const drive =
      await getDriveForGallery();

    const driveResponse =
      await drive.files.get(
        {
          fileId:
            photo.drive_file_id,
          alt: "media",
        },
        {
          responseType:
            "stream",
        }
      );

    const nodeStream =
      driveResponse.data as unknown as Readable;

    const contentType =
      photo.mime_type ||
      driveResponse.headers[
        "content-type"
      ] ||
      "image/jpeg";

    const fileName =
      safeFileName(
        photo.file_name
      );

    const watermarkPreview =
      !downloadRequested &&
      photo.watermark_enabled ===
        true &&
      contentType
        .toLowerCase()
        .startsWith("image/");

    // 8. Secure preview watermark.
    // Original Drive file is never modified.
    if (watermarkPreview) {
      const originalBuffer =
        await streamToBuffer(
          nodeStream
        );

      let preview: {
        buffer: Buffer;
        contentType: string;
      };

      try {
        preview =
          await createWatermarkedPreview(
            originalBuffer,
            contentType
          );
      } catch (error) {
        console.error(
          "Watermark processing error:",
          error
        );

        // Fail closed: do not expose the raw original
        // when watermarking was required.
        return NextResponse.json(
          {
            error:
              "Watermarked preview could not be generated.",
          },
          {
            status: 500,
          }
        );
      }

      return new Response(
        new Uint8Array(
          preview.buffer
        ),
        {
          status: 200,
          headers: {
            "Content-Type":
              preview.contentType,

            "Content-Length":
              String(
                preview.buffer.length
              ),

            "Content-Disposition":
              contentDisposition(
                fileName,
                false
              ),

            "Cache-Control":
              "private, no-store, max-age=0",

            "X-Content-Type-Options":
              "nosniff",

            "Cross-Origin-Resource-Policy":
              "same-origin",

            "X-Watermark":
              "applied",
          },
        }
      );
    }

    // 9. Normal inline preview or permitted download.
    const webStream =
      Readable.toWeb(
        nodeStream
      ) as ReadableStream;

    return new Response(
      webStream,
      {
        status: 200,
        headers: {
          "Content-Type":
            contentType,

          "Content-Disposition":
            contentDisposition(
              fileName,
              downloadRequested
            ),

          "Cache-Control":
            "private, no-store, max-age=0",

          "X-Content-Type-Options":
            "nosniff",

          "Cross-Origin-Resource-Policy":
            "same-origin",

          "X-Watermark":
            "not-applied",
        },
      }
    );
  } catch (error) {
    console.error(
      "Gallery photo error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Photo could not be loaded.",
      },
      {
        status: 500,
      }
    );
  }
}
