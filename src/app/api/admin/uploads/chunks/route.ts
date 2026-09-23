import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CHUNK_SIZE =
  4 * 1024 * 1024;

function validateGoogleUploadUrl(
  value: string
) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "Invalid upload URL."
    );
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !==
      "www.googleapis.com" ||
    url.pathname !==
      "/upload/drive/v3/files"
  ) {
    throw new Error(
      "Upload URL is not allowed."
    );
  }

  if (
    url.searchParams.get(
      "uploadType"
    ) !== "resumable"
  ) {
    throw new Error(
      "Invalid resumable upload URL."
    );
  }

  return url.toString();
}

export async function POST(
  req: Request
) {
  try {
    await requireAdmin();

    const uploadUrlHeader =
      req.headers.get(
        "x-upload-url"
      );

    const fileSizeHeader =
      req.headers.get(
        "x-file-size"
      );

    const chunkStartHeader =
      req.headers.get(
        "x-chunk-start"
      );

    const chunkEndHeader =
      req.headers.get(
        "x-chunk-end"
      );

    const mimeType =
      req.headers.get(
        "x-mime-type"
      ) ||
      "application/octet-stream";

    if (
      !uploadUrlHeader ||
      !fileSizeHeader ||
      !chunkStartHeader ||
      !chunkEndHeader
    ) {
      return NextResponse.json(
        {
          error:
            "Missing upload headers.",
        },
        {
          status: 400,
        }
      );
    }

    const uploadUrl =
      validateGoogleUploadUrl(
        uploadUrlHeader
      );

    const fileSize =
      Number(fileSizeHeader);

    const chunkStart =
      Number(chunkStartHeader);

    const chunkEnd =
      Number(chunkEndHeader);

    if (
      !Number.isSafeInteger(
        fileSize
      ) ||
      !Number.isSafeInteger(
        chunkStart
      ) ||
      !Number.isSafeInteger(
        chunkEnd
      ) ||
      fileSize <= 0 ||
      chunkStart < 0 ||
      chunkEnd < chunkStart ||
      chunkEnd >= fileSize
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid chunk range.",
        },
        {
          status: 400,
        }
      );
    }

    const buffer =
      await req.arrayBuffer();

    if (
      buffer.byteLength === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Empty upload chunk.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      buffer.byteLength >
      MAX_CHUNK_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "Upload chunk is too large.",
        },
        {
          status: 413,
        }
      );
    }

    const expectedLength =
      chunkEnd -
      chunkStart +
      1;

    if (
      buffer.byteLength !==
      expectedLength
    ) {
      return NextResponse.json(
        {
          error:
            "Chunk size does not match Content-Range.",
        },
        {
          status: 400,
        }
      );
    }

    const googleResponse =
      await fetch(
        uploadUrl,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              mimeType,

            "Content-Length":
              String(
                buffer.byteLength
              ),

            "Content-Range":
              `bytes ${chunkStart}-${chunkEnd}/${fileSize}`,
          },

          body: buffer,
        }
      );

    // Google returns 308 while
    // resumable upload is incomplete.
    if (
      googleResponse.status ===
      308
    ) {
      return NextResponse.json({
        complete: false,

        range:
          googleResponse.headers.get(
            "range"
          ),
      });
    }

    if (
      !googleResponse.ok
    ) {
      const text =
        await googleResponse.text();

      console.error(
        "Google Drive chunk error:",
        googleResponse.status,
        text
      );

      return NextResponse.json(
        {
          error:
            `Google Drive upload failed (${googleResponse.status}): ${text}`,
        },
        {
          status: 502,
        }
      );
    }

    let driveFile:
      | Record<string, unknown>
      | null = null;

    const text =
      await googleResponse.text();

    if (text) {
      try {
        driveFile =
          JSON.parse(text);
      } catch {
        driveFile = null;
      }
    }

    return NextResponse.json({
      complete: true,
      file: driveFile,
    });
  } catch (error) {
    console.error(
      "Upload chunk error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Chunk upload failed.",
      },
      {
        status: 400,
      }
    );
  }
}