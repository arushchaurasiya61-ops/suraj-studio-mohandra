import {
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  requireAdmin,
} from "@/lib/admin-session";

import {
  getDriveForAdmin,
} from "@/lib/google-drive";

const schema = z.object({
  eventId: z.string(),
  folderId: z.string(),
  category: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

export async function POST(
  req: Request
) {
  try {
    const admin =
      await requireAdmin();

    const body =
      schema.parse(
        await req.json()
      );

    const drive =
      await getDriveForAdmin(
        admin.uid
      );

    const auth =
      drive.context
        ._options.auth as any;

    const token =
      await auth.getAccessToken();

    if (!token?.token) {
      throw new Error(
        "Unable to get Google Drive access token."
      );
    }

    const response =
      await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token.token}`,

            "Content-Type":
              "application/json; charset=UTF-8",

            "X-Upload-Content-Type":
              body.mimeType,

            "X-Upload-Content-Length":
              String(
                body.size
              ),
          },

          body: JSON.stringify({
            name:
              body.fileName,

            parents: [
              body.folderId,
            ],

            appProperties: {
              eventId:
                body.eventId,

              category:
                body.category,
            },
          }),
        }
      );

    if (!response.ok) {
      const text =
        await response.text();

      throw new Error(
        `Drive upload session failed: ${text}`
      );
    }

    const uploadUrl =
      response.headers.get(
        "location"
      );

    if (!uploadUrl) {
      throw new Error(
        "Google Drive did not return an upload URL."
      );
    }

    return NextResponse.json({
      uploadUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start upload.",
      },

      {
        status: 400,
      }
    );
  }
}