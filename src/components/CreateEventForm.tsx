"use client";

import { useState } from "react";

type Category = "Tilak" | "Haldi" | "Shadi";

type SelectedFiles = Record<Category, File[]>;

const categories: Category[] = [
  "Tilak",
  "Haldi",
  "Shadi",
];

export function CreateEventForm() {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const [visibility, setVisibility] =
    useState("unlisted");

  const [files, setFiles] =
    useState<SelectedFiles>({
      Tilak: [],
      Haldi: [],
      Shadi: [],
    });

  const [progress, setProgress] = useState({
    uploaded: 0,
    total: 0,
    current: "",
  });

  function selectFiles(
    category: Category,
    list: FileList | null
  ) {
    if (!list) return;

    const selected = Array.from(list).filter(
      (file) =>
        file.type.startsWith("image/")
    );

    setFiles((prev) => ({
      ...prev,
      [category]: selected,
    }));
  }

  const totalFiles =
    files.Tilak.length +
    files.Haldi.length +
    files.Shadi.length;

  async function submit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (totalFiles === 0) {
      setStatus(
        "Kam se kam ek category me photos select karo."
      );
      return;
    }

    const formElement = e.currentTarget;
    const form = new FormData(formElement);

    setSubmitting(true);
    setStatus("");

    try {
      // STEP 1 — Create event + Drive folders

      const createResponse = await fetch(
        "/api/admin/events/upload-init",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            eventName:
              form.get("eventName"),
            clientName:
              form.get("clientName"),
            brideName:
              form.get("brideName"),
            groomName:
              form.get("groomName"),
            phone: form.get("phone"),
            whatsapp:
              form.get("whatsapp"),
            eventDate:
              form.get("eventDate"),
            eventType:
              form.get("eventType"),
            location:
              form.get("location"),
            description:
              form.get("description"),
            visibility,
            password:
              form.get("password"),
          }),
        }
      );

      const eventData =
        await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(
          eventData.error ||
            "Event create nahi hua."
        );
      }

      let uploaded = 0;

      setProgress({
        uploaded: 0,
        total: totalFiles,
        current: "",
      });

      // STEP 2 — Upload category photos

      for (const category of categories) {
        for (const file of files[category]) {
          setProgress({
            uploaded,
            total: totalFiles,
            current: `${category} • ${file.name}`,
          });

          // Ask server for Google Drive upload session

          const sessionResponse =
            await fetch(
              "/api/admin/uploads/session",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  eventId:
                    eventData.eventId,
                  folderId:
                    eventData.folders[
                      category
                    ],
                  category,
                  fileName: file.name,
                  mimeType:
                    file.type ||
                    "application/octet-stream",
                  size: file.size,
                }),
              }
            );

          const session =
            await sessionResponse.json();

          if (!sessionResponse.ok) {
            throw new Error(
              session.error ||
                `Upload session failed: ${file.name}`
            );
          }

          // File directly Google Drive upload session par jayegi

          const uploadResponse =
            await fetch(
              session.uploadUrl,
              {
                method: "PUT",
                headers: {
                  "Content-Type":
                    file.type ||
                    "application/octet-stream",
                  "Content-Length":
                    String(file.size),
                },
                body: file,
              }
            );

          if (!uploadResponse.ok) {
            throw new Error(
              `Upload failed: ${file.name}`
            );
          }

          uploaded++;

          setProgress({
            uploaded,
            total: totalFiles,
            current: file.name,
          });
        }
      }

      // STEP 3 — Sync uploaded Drive files into Supabase

      await fetch(
        "/api/admin/drive/sync",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            eventId:
              eventData.eventId,
          }),
        }
      );

      setStatus(
        `Event ready: ${eventData.eventCode} • ${uploaded} photos uploaded`
      );

      formElement.reset();

      setFiles({
        Tilak: [],
        Haldi: [],
        Shadi: [],
      });

      setProgress({
        uploaded: 0,
        total: 0,
        current: "",
      });

      setVisibility("unlisted");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Upload failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const percentage =
    progress.total > 0
      ? Math.round(
          (progress.uploaded /
            progress.total) *
            100
        )
      : 0;

  return (
    <form
      className="glass gold card form event-form"
      onSubmit={submit}
    >
      <div className="form-grid two-col">
        <label>
          Event Name
          <input
            className="input"
            name="eventName"
            placeholder="Shivam & Ragini Wedding"
            required
          />
        </label>

        <label>
          Client Name
          <input
            className="input"
            name="clientName"
            required
          />
        </label>

        <label>
          Bride Name
          <input
            className="input"
            name="brideName"
          />
        </label>

        <label>
          Groom Name
          <input
            className="input"
            name="groomName"
          />
        </label>

        <label>
          Phone
          <input
            className="input"
            name="phone"
          />
        </label>

        <label>
          WhatsApp
          <input
            className="input"
            name="whatsapp"
          />
        </label>

        <label>
          Event Date
          <input
            className="input"
            type="date"
            name="eventDate"
            required
          />
        </label>

        <label>
          Event Type
          <input
            className="input"
            name="eventType"
            defaultValue="Wedding"
          />
        </label>

        <label className="span-2">
          Location
          <input
            className="input"
            name="location"
            placeholder="Mohandra / Panna / Venue"
          />
        </label>

        <label className="span-2">
          Description
          <textarea
            className="input"
            name="description"
            rows={3}
          />
        </label>
      </div>

      <div className="form-section">
        <h3>Gallery Access</h3>

        <select
          className="input"
          name="visibility"
          value={visibility}
          onChange={(e) =>
            setVisibility(
              e.target.value
            )
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

        {visibility ===
          "password" && (
          <input
            className="input"
            type="password"
            name="password"
            placeholder="Gallery password"
            minLength={4}
            required
          />
        )}
      </div>

      <div className="form-section">
        <h3>Event Photos</h3>

        <p className="muted">
          Tilak, Haldi aur Shadi ki
          photos alag-alag select karo.
        </p>

        {categories.map((category) => (
  <div
    className="glass card"
    key={category}
    style={{ marginBottom: 16 }}
  >
    <h3>{category} Photos</h3>

    <input
      type="file"
      accept="image/*"
      multiple
      disabled={submitting}
      onChange={(e) =>
        selectFiles(category, e.target.files)
      }
    />

    <p className="muted">
      {files[category].length} photos selected
    </p>
  </div>
))}

        <div className="glass gold card">
          <strong>
            Total Photos:{" "}
            {totalFiles}
          </strong>
        </div>
      </div>

      {submitting &&
        progress.total > 0 && (
          <div className="form-section">
            <h3>
              Uploading Event
            </h3>

            <p>
              {progress.uploaded} /{" "}
              {progress.total}
            </p>

            <progress
              value={
                progress.uploaded
              }
              max={progress.total}
              style={{
                width: "100%",
              }}
            />

            <p>
              {percentage}% complete
            </p>

            <small className="muted">
              {progress.current}
            </small>
          </div>
        )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={
          submitting ||
          totalFiles === 0
        }
      >
        {submitting
          ? `Uploading ${percentage}%`
          : "Create Event & Upload Photos"}
      </button>

      {status && (
        <p
          className={
            status.startsWith(
              "Event ready"
            )
              ? "success"
              : "error"
          }
        >
          {status}
        </p>
      )}
    </form>
  );
}