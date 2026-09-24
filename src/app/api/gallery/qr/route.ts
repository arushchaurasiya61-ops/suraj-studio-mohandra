import {
  NextRequest,
  NextResponse,
} from "next/server";

import QRCode from "qrcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAppOrigin(
  req: NextRequest
) {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configured) {
    return new URL(
      configured
    ).origin;
  }

  return req.nextUrl.origin;
}

export async function GET(
  req: NextRequest
) {
  try {
    const rawUrl =
      req.nextUrl.searchParams.get(
        "url"
      );

    if (!rawUrl) {
      return NextResponse.json(
        {
          error:
            "url is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (rawUrl.length > 2000) {
      return NextResponse.json(
        {
          error:
            "URL is too long.",
        },
        {
          status: 400,
        }
      );
    }

    const appOrigin =
      getAppOrigin(req);

    let target: URL;

    try {
      target = new URL(
        rawUrl,
        appOrigin
      );
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid URL.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      target.origin !==
      appOrigin
    ) {
      return NextResponse.json(
        {
          error:
            "Only Suraj Studio links can be converted to QR.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedPath =
      target.pathname.startsWith(
        "/gallery/"
      ) ||
      target.pathname.startsWith(
        "/share/"
      );

    if (!allowedPath) {
      return NextResponse.json(
        {
          error:
            "This link type is not allowed for public QR generation.",
        },
        {
          status: 400,
        }
      );
    }

    target.hash = "";

    const png =
      await QRCode.toBuffer(
        target.toString(),
        {
          type: "png",
          width: 900,
          margin: 2,
          errorCorrectionLevel:
            "H",
        }
      );

    return new NextResponse(
      new Uint8Array(png),
      {
        status: 200,
        headers: {
          "Content-Type":
            "image/png",

          "Cache-Control":
            "private, no-store, max-age=0",

          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );
  } catch (error) {
    console.error(
      "Public QR generation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "QR generation failed.",
      },
      {
        status: 500,
      }
    );
  }
}