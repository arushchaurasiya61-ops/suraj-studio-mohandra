import { EventSearch } from "@/components/EventSearch";

export default function Gallery() {
  return (
    <main className="section">
      <div
        className="container"
        style={{
          maxWidth: 980,
        }}
      >
        <div
          style={{
            marginBottom: 24,
          }}
        >
          <p
            className="muted"
            style={{
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontSize: 12,
            }}
          >
            Client Access
          </p>

          <h1
            style={{
              marginBottom: 10,
            }}
          >
            Client Gallery
          </h1>

          <p className="muted">
            Search your event using event code, event name, bride name,
            groom name, client name, or event date.
          </p>
        </div>

        <EventSearch />
      </div>
    </main>
  );
}