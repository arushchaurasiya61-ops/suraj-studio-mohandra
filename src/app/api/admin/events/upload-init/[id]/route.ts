import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/supabase";
import { getDriveForAdmin } from "@/lib/google-drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  eventName: z.string().min(2),
  clientName: z.string().min(1),

  brideName: z.string().optional().nullable(),
  groomName: z.string().optional().nullable(),

  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),

  eventDate: z.string().min(1),

  eventType: z.string().optional().nullable(),

  location: z.string().optional().nullable(),

  description: z.string().optional().nullable(),

  visibility: z.enum([
    "public",
    "unlisted",
    "password",
  ]),
});

export async function PATCH(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireAdmin();

    const { id } =
      await context.params;

    const body =
      updateSchema.parse(
        await req.json()
      );

    const { data, error } =
      await db()
        .from("events")
        .update({
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
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
      throw new Error(
        error.message
      );
    }

    return NextResponse.json({
      ok: true,
      event: data,
    });
  } catch (error) {
    console.error(
      "Update event error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Event update failed.",
      },
      {
        status: 400,
      }
    );
  }
}

export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const admin =
      await requireAdmin();

    const { id } =
      await context.params;

    const url =
      new URL(req.url);

    const deleteDrive =
      url.searchParams.get(
        "deleteDrive"
      ) === "true";

    // Event info first save kar lo.
    const {
      data: event,
      error: readError,
    } = await db()
      .from("events")
      .select(
        "id,event_name,drive_folder_id"
      )
      .eq("id", id)
      .single();

    if (readError) {
      throw new Error(
        readError.message
      );
    }

    // First database event delete.
    // Agar schema me child tables CASCADE hain,
    // related records automatically remove honge.
    const { error: deleteError } =
      await db()
        .from("events")
        .delete()
        .eq("id", id);

    if (deleteError) {
      throw new Error(
        deleteError.message
      );
    }

    let driveDeleted = false;
    let driveWarning:
      | string
      | null = null;

    // Drive deletion optional hai.
    if (
      deleteDrive &&
      event?.drive_folder_id
    ) {
      try {
        const drive =
          await getDriveForAdmin(
            admin.uid
          );

        await drive.files.delete({
          fileId:
            event.drive_folder_id,
        });

        driveDeleted = true;
      } catch (driveError) {
        console.error(
          "Drive folder delete error:",
          driveError
        );

        driveWarning =
          driveError instanceof Error
            ? driveError.message
            : "Drive folder could not be deleted.";
      }
    }

    return NextResponse.json({
      ok: true,
      databaseDeleted: true,
      driveDeleted,
      driveWarning,
    });
  } catch (error) {
    console.error(
      "Delete event error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Event delete failed.",
      },
      {
        status: 400,
      }
    );
  }
}