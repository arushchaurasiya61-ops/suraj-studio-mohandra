import Link from "next/link";

import { db } from "@/lib/supabase";

import {
  SyncEventButton,
} from "@/components/SyncEventButton";

import {
  EventActions,
} from "@/components/EventActions";

export const dynamic =
  "force-dynamic";

export default async function EventsPage() {
  const { data, error } =
    await db()
      .from("events")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(100);

  if (error) {
    throw new Error(
      error.message
    );
  }

  const events =
    data || [];

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>
            Events
          </h1>

          <p className="muted">
            Manage galleries,
            Drive folders,
            event details and
            sync status.
          </p>
        </div>

        <Link
          href="/admin/create-event"
          className="btn btn-primary"
        >
          Create Event
        </Link>
      </div>

      <div className="table-wrap glass gold">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Client</th>
              <th>Drive Folder</th>
              <th>Photos</th>
              <th>Status</th>
              <th>Gallery</th>
              <th>Sync</th>
              <th>Manage</th>
            </tr>
          </thead>

          <tbody>
            {events.length ===
              0 && (
              <tr>
                <td
                  colSpan={8}
                  className="muted"
                >
                  No events yet.
                </td>
              </tr>
            )}

            {events.map(
              (event: any) => (
                <tr
                  key={event.id}
                >
                  <td>
                    <strong>
                      {
                        event.event_name
                      }
                    </strong>

                    <br />

                    <small className="muted">
                      {
                        event.event_code
                      }
                    </small>
                  </td>

                  <td>
                    {event.client_name ||
                      "—"}

                    <br />

                    <small className="muted">
                      {event.event_date ||
                        ""}
                    </small>
                  </td>

                  <td>
                    {event.drive_folder_name ||
                      (event.drive_folder_id
                        ? "Linked folder"
                        : "Not linked")}
                  </td>

                  <td>
                    {event.photo_count ||
                      0}
                  </td>

                  <td>
                    <span
                      className={`status-chip ${
                        event.sync_status ===
                        "ok"
                          ? "success-chip"
                          : event.sync_status ===
                              "error"
                            ? "error-chip"
                            : ""
                      }`}
                    >
                      {event.sync_status ||
                        "never"}
                    </span>

                    {event.sync_error && (
                      <div className="error tiny">
                        {
                          event.sync_error
                        }
                      </div>
                    )}
                  </td>

                  <td>
                    <Link
                      className="text-button"
                      href={`/gallery/${event.slug}`}
                      target="_blank"
                    >
                      Open
                    </Link>
                  </td>

                  <td>
                    <SyncEventButton
                      eventId={
                        event.id
                      }
                      disabled={
                        !event.drive_folder_id
                      }
                    />
                  </td>

                  <td>
                    <EventActions
                      event={event}
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}