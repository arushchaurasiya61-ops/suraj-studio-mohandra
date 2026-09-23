import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/supabase";
import { getDriveForAdmin } from "@/lib/google-drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  eventName: z.string().min(2),
  clientName: z.string().min(1),

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

  visibility: z.enum([
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
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeDriveQueryValue(
  value: string
) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
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

  if (!result.data.id) {
    throw new Error(
      `Folder create nahi hua: ${name}`
    );
  }

  return result.data.id;
}

async function findFolder(
  drive: any,
  name: string,
  parentId?: string
) {
  const safeName =
    escapeDriveQueryValue(name);

  const queryParts = [
    `name='${safeName}'`,
    `mimeType='application/vnd.google-apps.folder'`,
    "trashed=false",
  ];

  if (parentId) {
    queryParts.push(
      `'${parentId}' in parents`
    );
  } else {
    queryParts.push(
      "'root' in parents"
    );
  }

  const result =
    await drive.files.list({
      q: queryParts.join(" and "),
      fields:
        "files(id,name,parents)",
      pageSize: 10,
    });

  const folder =
    result.data.files?.[0];

  return folder?.id || null;
}

async function findOrCreateFolder(
  drive: any,
  name: string,
  parentId?: string
) {
  const existingId =
    await findFolder(
      drive,
      name,
      parentId
    );

  if (existingId) {
    return existingId;
  }

  return createFolder(
    drive,
    name,
    parentId
  );
}

function buildEventFolderName(
  body: z.infer<typeof schema>,
  year: number
) {
  const bride =
    body.brideName?.trim();

  const groom =
    body.groomName?.trim();

  if (bride && groom) {
    return `${bride}-${groom}-${year}`;
  }

  if (
    body.clientName?.trim()
  ) {
    return `${body.clientName.trim()}-${year}`;
  }

  return `${body.eventName.trim()}-${year}`;
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

    if (
      !Number.isFinite(year)
    ) {
      throw new Error(
        "Invalid event date."
      );
    }

    const random =
      crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    const slug =
      `${slugify(
        body.eventName
      )}-${random}`;

    const eventCode =
      `SSM-${year}-${random}`;

    // 1 permanent root folder
    const studioFolder =
      await findOrCreateFolder(
        drive,
        "Suraj Studio Mohandra"
      );

    // 1 permanent Events folder
    const eventsFolder =
      await findOrCreateFolder(
        drive,
        "Events",
        studioFolder
      );

    const eventFolderName =
      buildEventFolderName(
        body,
        year
      );

    // New folder only for this client/event
    const eventFolder =
      await createFolder(
        drive,
        eventFolderName,
        eventsFolder
      );

    // Event categories
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
            body.brideName ||
            null,

          groom_name:
            body.groomName ||
            null,

          phone:
            body.phone ||
            null,

          whatsapp:
            body.whatsapp ||
            null,

          event_date:
            body.eventDate,

          event_type:
            body.eventType ||
            "Wedding",

          location:
            body.location ||
            null,

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
            eventFolderName,

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

      studioFolderId:
        studioFolder,

      eventsFolderId:
        eventsFolder,

      eventFolderId:
        eventFolder,

      eventFolderName,

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
    console.error(
      "Create event upload-init error:",
      error
    );

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