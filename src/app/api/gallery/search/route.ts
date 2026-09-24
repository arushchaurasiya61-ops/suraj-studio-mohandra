import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rawQuery = (req.nextUrl.searchParams.get("q") || "").trim();
  const eventDate = (req.nextUrl.searchParams.get("date") || "").trim();

  if (rawQuery.length < 2 && !eventDate) {
    return NextResponse.json(
      { error: "Enter at least 2 characters or select a date." },
      { status: 400 }
    );
  }

  const q = rawQuery.replace(/[,%()]/g, " ").trim();

  try {
    let query = db()
      .from("events")
      .select(`
        id,
        slug,
        event_code,
        event_name,
        client_name,
        bride_name,
        groom_name,
        event_date,
        event_type,
        location,
        visibility
      `)
      .neq("visibility", "private")
      .order("event_date", { ascending: false })
      .limit(20);

    if (q.length >= 2) {
      query = query.or(
        [
          `event_code.ilike.%${q}%`,
          `event_name.ilike.%${q}%`,
          `bride_name.ilike.%${q}%`,
          `groom_name.ilike.%${q}%`,
          `client_name.ilike.%${q}%`,
        ].join(",")
      );
    }

    if (eventDate) {
      query = query.eq("event_date", eventDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error: "No matching gallery found.",
          results: [],
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      results: data,
      count: data.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gallery search failed.",
      },
      { status: 500 }
    );
  }
}