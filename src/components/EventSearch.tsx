"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type GalleryResult = {
  id: string;
  slug: string;
  event_code: string | null;
  event_name: string;
  client_name: string | null;
  bride_name: string | null;
  groom_name: string | null;
  event_date: string | null;
  event_type: string | null;
  location: string | null;
  visibility: string | null;
};

export function EventSearch() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [date, setDate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [results, setResults] =
    useState<GalleryResult[]>([]);

  const [
    selectedEvent,
    setSelectedEvent,
  ] = useState<GalleryResult | null>(
    null
  );

  async function searchGallery(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setResults([]);
    setSelectedEvent(null);

    try {
      const params =
        new URLSearchParams();

      if (q.trim()) {
        params.set("q", q.trim());
      }

      if (date) {
        params.set("date", date);
      }

      const response =
        await fetch(
          `/api/gallery/search?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

      const text =
        await response.text();

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          `Gallery API returned invalid response (${response.status})`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No matching gallery found."
        );
      }

      const nextResults =
        Array.isArray(data.results)
          ? data.results
          : [];

      setResults(nextResults);

      if (
        nextResults.length === 0
      ) {
        setMessage(
          "No matching gallery found."
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Gallery search failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function selectEvent(
    event: GalleryResult
  ) {
    setSelectedEvent(event);
    setMessage("");
  }

  function continueToGallery() {
    if (!selectedEvent) {
      return;
    }

    router.push(
      `/gallery/${selectedEvent.slug}`
    );
  }

  return (
    <div>
      <form
        className="glass gold card form"
        onSubmit={searchGallery}
        style={{
          padding: 24,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <label>
            Search Gallery

            <input
              className="input"
              value={q}
              onChange={(e) =>
                setQ(
                  e.target.value
                )
              }
              placeholder="Event code, event, bride, groom or client"
            />
          </label>

          <label>
            Event Date

            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
            />
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{
            marginTop: 16,
          }}
        >
          {loading
            ? "Searching..."
            : "Search Gallery"}
        </button>

        {message && (
          <p
            className="error"
            style={{
              marginTop: 14,
            }}
          >
            {message}
          </p>
        )}
      </form>

      {results.length > 0 && (
        <section>
          <div
            style={{
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                marginBottom: 6,
              }}
            >
              Select Your Event
            </h2>

            <p className="muted">
              {results.length} matching{" "}
              {results.length === 1
                ? "event"
                : "events"}{" "}
              found. Select the correct
              event first.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {results.map((event) => {
              const selected =
                selectedEvent?.id ===
                event.id;

              return (
                <article
                  key={event.id}
                  className="glass gold card"
                  style={{
                    padding: 20,
                    border: selected
                      ? "2px solid #d4af37"
                      : undefined,
                    transform: selected
                      ? "translateY(-2px)"
                      : undefined,
                    transition:
                      "all .2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <p
                        className="muted"
                        style={{
                          fontSize: 12,
                          marginBottom: 6,
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.08em",
                        }}
                      >
                        {event.event_type ||
                          "Event"}
                      </p>

                      <h3
                        style={{
                          margin: 0,
                        }}
                      >
                        {event.event_name}
                      </h3>
                    </div>

                    {event.event_code && (
                      <span
                        className="muted"
                        style={{
                          fontSize: 12,
                        }}
                      >
                        {
                          event.event_code
                        }
                      </span>
                    )}
                  </div>

                  <div
                    className="muted"
                    style={{
                      display: "grid",
                      gap: 7,
                      fontSize: 14,
                      marginBottom: 18,
                    }}
                  >
                    {event.bride_name && (
                      <div>
                        Bride:{" "}
                        {
                          event.bride_name
                        }
                      </div>
                    )}

                    {event.groom_name && (
                      <div>
                        Groom:{" "}
                        {
                          event.groom_name
                        }
                      </div>
                    )}

                    {event.client_name && (
                      <div>
                        Client:{" "}
                        {
                          event.client_name
                        }
                      </div>
                    )}

                    {event.event_date && (
                      <div>
                        Date:{" "}
                        {new Date(
                          event.event_date
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </div>
                    )}

                    {event.location && (
                      <div>
                        Location:{" "}
                        {
                          event.location
                        }
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className={
                      selected
                        ? "btn btn-primary"
                        : "btn btn-ghost"
                    }
                    onClick={() =>
                      selectEvent(event)
                    }
                  >
                    {selected
                      ? "✓ Event Selected"
                      : "Select Event"}
                  </button>
                </article>
              );
            })}
          </div>

          {selectedEvent && (
            <div
              className="glass gold card"
              style={{
                padding: 20,
                marginTop: 22,
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <p
                  className="gold-text"
                  style={{
                    marginBottom: 6,
                  }}
                >
                  Selected Event
                </p>

                <h3
                  style={{
                    margin: 0,
                    marginBottom: 5,
                  }}
                >
                  {
                    selectedEvent.event_name
                  }
                </h3>

                <p
                  className="muted"
                  style={{
                    margin: 0,
                  }}
                >
                  {selectedEvent.event_code
                    ? `${selectedEvent.event_code} • `
                    : ""}
                  Continue to open this
                  gallery.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={
                  continueToGallery
                }
              >
                Continue to Gallery →
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
