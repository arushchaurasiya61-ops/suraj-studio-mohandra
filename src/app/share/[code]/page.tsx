import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function Shared({
  params,
}: {
  params: Promise<{
    code: string;
  }>;
}) {
  const { code } = await params;

  const { data: shared, error } =
    await db()
      .from("share_collections")
      .select("*")
      .eq("code", code)
      .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!shared) {
    notFound();
  }

  if (
    shared.expires_at &&
    new Date(
      shared.expires_at
    ).getTime() < Date.now()
  ) {
    return (
      <main className="section">
        <div className="container">
          <h1>
            Shared selection expired.
          </h1>
        </div>
      </main>
    );
  }

  const { data: event } =
    await db()
      .from("events")
      .select(
        "id,event_name,password_protected"
      )
      .eq(
        "id",
        shared.event_id
      )
      .maybeSingle();

  if (!event) {
    notFound();
  }

  if (event.password_protected) {
    return (
      <main className="section">
        <div className="container">
          <h1>
            Protected gallery
          </h1>

          <p className="muted">
            Open the original event gallery
            and authenticate before viewing
            this selection.
          </p>
        </div>
      </main>
    );
  }

  const ids: string[] =
    shared.photo_ids || [];

  const { data: photos } =
    ids.length
      ? await db()
          .from("photos")
          .select(
            "id,file_name"
          )
          .in("id", ids)
      : {
          data: [],
        };

  return (
    <main className="section">
      <div className="container">
        <h1>
          {event.event_name ||
            "Shared Photos"}
        </h1>

        <div className="grid photo-grid">
          {(photos || []).map(
            (photo: any) => (
              <div
                key={photo.id}
                className="photo"
              >
                <small>
                  {photo.file_name ||
                    photo.id}
                </small>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}