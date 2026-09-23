"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type EventData = {
  id: string;

  event_name: string;
  client_name: string | null;

  bride_name: string | null;
  groom_name: string | null;

  phone: string | null;
  whatsapp: string | null;

  event_date: string | null;

  event_type: string | null;

  location: string | null;

  description: string | null;

  visibility: string | null;

  drive_folder_id:
    | string
    | null;
};

export function EventActions({
  event,
}: {
  event: EventData;
}) {
  const router = useRouter();

  const [editing, setEditing] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function saveEvent(
    formData: FormData
  ) {
    setSaving(true);
    setMessage("");

    try {
      const response =
        await fetch(
          `/api/admin/events/${event.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              eventName:
                formData.get(
                  "eventName"
                ),

              clientName:
                formData.get(
                  "clientName"
                ),

              brideName:
                formData.get(
                  "brideName"
                ),

              groomName:
                formData.get(
                  "groomName"
                ),

              phone:
                formData.get(
                  "phone"
                ),

              whatsapp:
                formData.get(
                  "whatsapp"
                ),

              eventDate:
                formData.get(
                  "eventDate"
                ),

              eventType:
                formData.get(
                  "eventType"
                ),

              location:
                formData.get(
                  "location"
                ),

              description:
                formData.get(
                  "description"
                ),

              visibility:
                formData.get(
                  "visibility"
                ),
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Event update failed."
        );
      }

      setEditing(false);

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Update failed."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(
    deleteDrive: boolean
  ) {
    const text =
      deleteDrive
        ? "Event aur Google Drive folder/photos dono delete honge. Continue?"
        : "Event website/database se delete hoga. Google Drive photos safe rahengi. Continue?";

    if (!window.confirm(text)) {
      return;
    }

    if (
      deleteDrive &&
      !window.confirm(
        "FINAL CONFIRMATION: Drive photos bhi permanently delete karni hain?"
      )
    ) {
      return;
    }

    setDeleting(true);
    setMessage("");

    try {
      const response =
        await fetch(
          `/api/admin/events/${event.id}?deleteDrive=${
            deleteDrive
              ? "true"
              : "false"
          }`,
          {
            method:
              "DELETE",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Delete failed."
        );
      }

      if (
        result.driveWarning
      ) {
        alert(
          `Event database se delete ho gaya, lekin Drive folder delete nahi hua:\n\n${result.driveWarning}`
        );
      }

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Delete failed."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div
        className="glass gold card"
        style={{
          position: "fixed",
          inset: 20,
          zIndex: 9999,
          overflowY: "auto",
          maxWidth: 760,
          height: "fit-content",
          maxHeight:
            "calc(100vh - 40px)",
          margin: "auto",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: 16,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
              }}
            >
              Edit Event
            </h2>

            <p className="muted">
              {event.event_name}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() =>
              setEditing(false)
            }
          >
            Close
          </button>
        </div>

        <form
          action={saveEvent}
          className="form"
        >
          <div className="form-grid two-col">
            <label>
              Event Name
              <input
                className="input"
                name="eventName"
                defaultValue={
                  event.event_name
                }
                required
              />
            </label>

            <label>
              Client Name
              <input
                className="input"
                name="clientName"
                defaultValue={
                  event.client_name ||
                  ""
                }
                required
              />
            </label>

            <label>
              Bride Name
              <input
                className="input"
                name="brideName"
                defaultValue={
                  event.bride_name ||
                  ""
                }
              />
            </label>

            <label>
              Groom Name
              <input
                className="input"
                name="groomName"
                defaultValue={
                  event.groom_name ||
                  ""
                }
              />
            </label>

            <label>
              Phone
              <input
                className="input"
                name="phone"
                defaultValue={
                  event.phone || ""
                }
              />
            </label>

            <label>
              WhatsApp
              <input
                className="input"
                name="whatsapp"
                defaultValue={
                  event.whatsapp ||
                  ""
                }
              />
            </label>

            <label>
              Event Date
              <input
                className="input"
                type="date"
                name="eventDate"
                defaultValue={
                  event.event_date ||
                  ""
                }
                required
              />
            </label>

            <label>
              Event Type
              <input
                className="input"
                name="eventType"
                defaultValue={
                  event.event_type ||
                  "Wedding"
                }
              />
            </label>

            <label
              className="span-2"
            >
              Location
              <input
                className="input"
                name="location"
                defaultValue={
                  event.location ||
                  ""
                }
              />
            </label>

            <label
              className="span-2"
            >
              Description
              <textarea
                className="input"
                name="description"
                rows={3}
                defaultValue={
                  event.description ||
                  ""
                }
              />
            </label>

            <label
              className="span-2"
            >
              Gallery Visibility

              <select
                className="input"
                name="visibility"
                defaultValue={
                  event.visibility ||
                  "unlisted"
                }
              >
                <option value="public">
                  Public
                </option>

                <option value="unlisted">
                  Unlisted
                </option>

                <option value="password">
                  Password Protected
                </option>
              </select>
            </label>
          </div>

          {message && (
            <p className="error">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() =>
          setEditing(true)
        }
      >
        Edit
      </button>

      <button
        type="button"
        className="btn btn-ghost"
        disabled={deleting}
        onClick={() =>
          deleteEvent(false)
        }
      >
        {deleting
          ? "Deleting..."
          : "Delete"}
      </button>

      {event.drive_folder_id && (
        <button
          type="button"
          className="btn btn-ghost"
          disabled={deleting}
          onClick={() =>
            deleteEvent(true)
          }
          style={{
            borderColor:
              "rgba(255,80,80,0.5)",
          }}
        >
          Delete + Drive
        </button>
      )}

      {message && (
        <small className="error">
          {message}
        </small>
      )}
    </div>
  );
}