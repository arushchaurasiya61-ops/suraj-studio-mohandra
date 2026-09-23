import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import { GalleryClient } from "@/components/GalleryClient";
import { GalleryPassword } from "@/components/GalleryPassword";
import { hasGalleryAccess } from "@/lib/gallery-access";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function EventGallery({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const { data: event, error } =
    await db()
      .from("events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!event) {
    notFound();
  }

  if (
    event.expiry_date &&
    new Date(
      event.expiry_date
    ).getTime() < Date.now()
  ) {
    return (
      <main className="section">
        <div className="container">
          <h1>
            This gallery is no longer
            available.
          </h1>
        </div>
      </main>
    );
  }

  if (
    !(await hasGalleryAccess(
      event.id,
      event.password_protected
    ))
  ) {
    return (
      <main className="section">
        <div className="container">
          <GalleryPassword
            eventId={event.id}
          />
        </div>
      </main>
    );
  }

  const {
    data: photos,
    error: photoError,
  } = await db()
    .from("photos")
    .select(
      "id,public_photo_code,file_name"
    )
    .eq("event_id", event.id)
    .eq("active", true)
    .order("created_at", {
      ascending: false,
    })
    .limit(200);

  if (photoError) {
    throw new Error(
      photoError.message
    );
  }

  return (
    <GalleryClient
      event={{
        id: event.id,
        eventName:
          event.event_name ||
          "Event Gallery",
        eventCode:
          event.event_code || "",
        allowPhotoSharing:
          event.allow_photo_sharing !==
          false,
        allowGallerySharing:
          event.allow_gallery_sharing !==
          false,
        allowOptimizedDownload:
          event.allow_optimized_download ===
          true,
        passwordProtected:
          event.password_protected ===
          true,
      }}
      photos={(photos || []).map(
        (p: any) => ({
          id: p.id,
          publicPhotoCode:
            p.public_photo_code ||
            p.id,
          fileName:
            p.file_name ||
            "Photo",
        })
      )}
    />
  );
}