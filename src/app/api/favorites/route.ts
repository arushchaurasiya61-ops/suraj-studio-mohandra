import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import { db } from "@/lib/supabase";
import { hasGalleryAccess } from "@/lib/gallery-access";

const postSchema = z.object({
  eventId: z.string().uuid(),
  photoId: z.string(),
  clientKey: z.string().min(8).max(100),
  favorite: z.boolean(),
});

const getSchema = z.object({
  eventId: z.string().uuid(),
  clientKey: z.string().min(8).max(100),
});

export const dynamic = "force-dynamic";

/* LOAD FAVORITES */

export async function GET(
  req: NextRequest
) {
  try {
    const data = getSchema.parse({
      eventId:
        req.nextUrl.searchParams.get(
          "eventId"
        ),
      clientKey:
        req.nextUrl.searchParams.get(
          "clientKey"
        ),
    });

    const {
      data: event,
      error: eventError,
    } = await db()
      .from("events")
      .select(
        "id,password_protected"
      )
      .eq("id", data.eventId)
      .maybeSingle();

    if (eventError) {
      throw new Error(
        eventError.message
      );
    }

    if (!event) {
      return NextResponse.json(
        {
          error: "Event not found.",
        },
        {
          status: 404,
        }
      );
    }

    const allowed =
      await hasGalleryAccess(
        data.eventId,
        event.password_protected === true
      );

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Gallery authorization required.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data: favorites,
      error: favoriteError,
    } = await db()
      .from("favorites")
      .select("photo_id")
      .eq(
        "event_id",
        data.eventId
      )
      .eq(
        "client_key",
        data.clientKey
      );

    if (favoriteError) {
      throw new Error(
        favoriteError.message
      );
    }

    return NextResponse.json({
      favorites:
        favorites?.map(
          (favorite: any) =>
            favorite.photo_id
        ) || [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load favorites.",
      },
      {
        status: 400,
      }
    );
  }
}

/* ADD / REMOVE FAVORITE */

export async function POST(
  req: Request
) {
  try {
    const data =
      postSchema.parse(
        await req.json()
      );

    const {
      data: event,
      error: eventError,
    } = await db()
      .from("events")
      .select(
        "id,password_protected"
      )
      .eq("id", data.eventId)
      .maybeSingle();

    if (eventError) {
      throw new Error(
        eventError.message
      );
    }

    if (!event) {
      return NextResponse.json(
        {
          error: "Event not found.",
        },
        {
          status: 404,
        }
      );
    }

    const allowed =
      await hasGalleryAccess(
        data.eventId,
        event.password_protected === true
      );

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Gallery authorization required.",
        },
        {
          status: 401,
        }
      );
    }

    const id = `${data.eventId}_${data.clientKey}_${data.photoId}`;

    if (data.favorite) {
      const { error } =
        await db()
          .from("favorites")
          .upsert({
            id,
            event_id:
              data.eventId,
            photo_id:
              data.photoId,
            client_key:
              data.clientKey,
          });

      if (error) {
        throw new Error(
          error.message
        );
      }
    } else {
      const { error } =
        await db()
          .from("favorites")
          .delete()
          .eq("id", id);

      if (error) {
        throw new Error(
          error.message
        );
      }
    }

    return NextResponse.json({
      ok: true,
      favorite: data.favorite,
      photoId: data.photoId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Favorite failed.",
      },
      {
        status: 400,
      }
    );
  }
}