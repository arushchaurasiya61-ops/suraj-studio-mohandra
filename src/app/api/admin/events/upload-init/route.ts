import {
  NextResponse,
} from "next/server";

import { z } from "zod";
import {
  requireAdmin,
} from "@/lib/admin-session";

import {
  db,
} from "@/lib/supabase";

import {
  getDriveForAdmin,
} from "@/lib/google-drive";

import crypto from "crypto";

const schema = z.object({
  eventName: z
    .string()
    .min(2),

  clientName: z
    .string()
    .min(1),

  brideName: z
    .string()
    .optional()
    .nullable(),

  groomName: z
    .string()
    .optional()
    .nullable(),

  phone: z
    .string()
    .optional()
    .nullable(),

  whatsapp: z
    .string()
    .optional()
    .nullable(),

  eventDate: z.string(),

  eventType: z
    .string()
    .optional()
    .nullable(),

  location: z
    .string()
    .optional()
    .nullable(),

  description: z
    .string()
    .optional()
    .nullable(),

  visibility: z
    .enum([
      "public",
      "unlisted",
      "password",
    ]),

  password: z
    .string()
    .optional()
    .nullable(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(/^-|-$/g, "");
}

async function createFolder(
  drive: any,
  name: string,
  parentId?: string
) {
  const result =
    await drive.files.create({
      requestBody: {
        name,
        mimeType:
          "application/vnd.google-apps.folder",

        ...(parentId
          ? {
              parents: [
                parentId,
              ],
            }
          : {}),
      },

      fields: "id,name",
    });

  return result.data.id as string;
}

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

    const year =
      new Date(
        body.eventDate
      ).getFullYear();

    const random =
      crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    const slug = `${slugify(
      body.eventName
    )}-${random}`;

    const eventCode =
      `SSM-${year}-${random}`;

    // Root structure:
    // Suraj Studio Mohandra / Events

    const studioFolder =
      await createFolder(
        drive,
        "Suraj Studio Mohandra"
      );

    const eventsFolder =
      await createFolder(
        drive,
        "Events",
        studioFolder
      );

    const eventFolder =
      await createFolder(
        drive,
        `${body.eventName}-${year}`,
        eventsFolder
      );

    const tilakFolder =
      await createFolder(
        drive,
        "Tilak",
        eventFolder
      );

    const haldiFolder =
      await createFolder(
        drive,
        "Haldi",
        eventFolder
      );

    const shadiFolder =
      await createFolder(
        drive,
        "Shadi",
        eventFolder
      );

    const { data, error } =
      await db()
        .from("events")
        .insert({
          event_code:
            eventCode,

          slug,

          event_name:
            body.eventName,

          client_name:
            body.clientName,

          bride_name:
            body.brideName || null,

          groom_name:
            body.groomName || null,

          phone:
            body.phone || null,

          whatsapp:
            body.whatsapp || null,

          event_date:
            body.eventDate,

          event_type:
            body.eventType ||
            "Wedding",

          location:
            body.location || null,

          description:
            body.description ||
            null,

          visibility:
            body.visibility,

          password_protected:
            body.visibility ===
            "password",

          drive_folder_id:
            eventFolder,

          drive_folder_name:
            `${body.eventName}-${year}`,

          sync_status:
            "uploading",

          photo_count: 0,
        })
        .select()
        .single();

    if (error) {
      throw new Error(
        error.message
      );
    }

    return NextResponse.json({
      ok: true,

      eventId: data.id,

      eventCode,

      slug,

      folders: {
        Tilak:
          tilakFolder,

        Haldi:
          haldiFolder,

        Shadi:
          shadiFolder,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create event.",
      },
      {
        status: 400,
      }
    );
  }
}