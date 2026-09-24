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

  const { data: event, error } = await db()
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

  // Gallery expiry check
  if (
    event.expiry_date &&
    new Date(event.expiry_date).getTime() < Date.now()
  ) {
    return (
      <main className="section">
        <div className="container">
          <div
            className="glass gold card"
            style={{
              padding: 24,
            }}
          >
            <h1>This gallery is no longer available.</h1>

            <p className="muted">
              The access period for this gallery has expired.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Password access check
  if (
    !(await hasGalleryAccess(
      event.id,
      event.password_protected === true
    ))
  ) {
    return (
      <main className="section">
        <div className="container">
          <GalleryPassword eventId={event.id} />
        </div>
      </main>
    );
  }

  // Load active photos
  const { data: photos, error: photoError } = await db()
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
    throw new Error(photoError.message);
  }

  return (
    <GalleryClient
      event={{
  id: event.id,

  eventName:
    event.event_name || "Event Gallery",

  eventCode:
    event.event_code || "",

  brideName:
    event.bride_name || "",

  groomName:
    event.groom_name || "",

  clientName:
    event.client_name || "",

  eventDate:
    event.event_date || "",

  eventType:
    event.event_type || "",

  location:
    event.location || "",

  description:
    event.description || "",

  allowPhotoSharing:
    event.allow_photo_sharing !== false,

  allowGallerySharing:
    event.allow_gallery_sharing !== false,

  allowOptimizedDownload:
    event.allow_optimized_download === true,

  passwordProtected:
    event.password_protected === true,
}}
      photos={(photos || []).map(
        (photo: any) => ({
          id: photo.id,

          publicPhotoCode:
            photo.public_photo_code ||
            photo.id,

          fileName:
            photo.file_name ||
            "Photo",
        })
      )}
    />
  );
}