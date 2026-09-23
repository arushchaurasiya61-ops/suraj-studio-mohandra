import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

const services = [
  "Wedding Photography",
  "Candid Photography",
  "Pre-Wedding",
  "Cinematic Wedding Films",
  "Drone Photography",
  "Premium Wedding Albums",
];

const heroPhotos = [
  "/images/home/hero-1.jpg",
  "/images/home/hero-2.jpg",
  "/images/home/hero-3.jpg",
  "/images/home/hero-4.jpg",
];

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content container">
          <span className="glass pill">
            BLACK • GOLD • CINEMATIC
          </span>

          <h1
            style={{
              fontSize: "clamp(48px, 7vw, 100px)",
              lineHeight: 0.95,
              marginTop: 22,
            }}
          >
            SURAJ PHOTOGRAPHY
            <br />
            & DESIGN STUDIO
            <br />
            <span className="gold-text">
              MOHANDRA
            </span>
          </h1>

          <p
            className="muted"
            style={{
              fontSize: 19,
              marginTop: 24,
            }}
          >
            Wedding • Pre-Wedding • Cinematic Films • Photography
          </p>

          {/* MAIN ACTION BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 28,
            }}
          >
            <Link
              className="btn btn-primary"
              href="/portfolio"
            >
              VIEW OUR WORK
            </Link>

            <Link
              className="btn btn-ghost"
              href="/booking"
            >
              BOOK YOUR EVENT
            </Link>

            <a
              className="btn btn-ghost"
              href="https://wa.me/919752579532"
              target="_blank"
              rel="noopener noreferrer"
            >
              WHATSAPP US
            </a>

            <Link
              className="btn btn-ghost"
              href="/gallery"
            >
              CLIENT GALLERY
            </Link>
          </div>

          {/* SOCIAL BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 18,
            }}
          >
            <a
              className="btn btn-ghost"
              href="https://instagram.com/suraj_studio__01"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram @suraj_studio__01
            </a>

            <a
              className="btn btn-ghost"
              href="https://instagram.com/suraj_designes"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram @suraj_designes
            </a>

            <a
              className="btn btn-ghost"
              href="https://www.facebook.com/share/1JjgtnKTtz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          </div>
        </div>
      </section>

      {/* PHOTO SHOWCASE */}
      <section
        className="section"
        style={{
          paddingTop: 35,
        }}
      >
        <div className="container">
          <div
            style={{
              textAlign: "center",
              marginBottom: 28,
            }}
          >
            <p className="gold-text">
              OUR PHOTOGRAPHY
            </p>

            <h2
              style={{
                fontSize: "clamp(30px, 5vw, 52px)",
                marginBottom: 8,
              }}
            >
              Moments We&apos;ve Captured
            </h2>

            <p className="muted">
              Wedding • Pre-Wedding • Portraits • Celebrations
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              width: "100%",
            }}
          >
            {heroPhotos.map((src, index) => (
              <div
                key={src}
                style={{
                  position: "relative",
                  width: "100%",
                  height: 380,
                  overflow: "hidden",
                  borderRadius: 22,
                  background: "#111",
                  border:
                    "1px solid rgba(212,175,55,0.30)",
                  boxShadow:
                    "0 18px 50px rgba(0,0,0,0.40)",
                }}
              >
                <img
                  src={src}
                  alt={`Suraj Studio Photography ${index + 1}`}
                  loading={index === 0 ? "eager" : "lazy"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.45), transparent 55%)",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: 18,
                    bottom: 18,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  SURAJ STUDIO MOHANDRA
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 28,
            }}
          >
            <Link
              href="/portfolio"
              className="btn btn-primary"
            >
              VIEW FULL PORTFOLIO
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section">
        <div className="container">
          <p className="gold-text">
            FEATURED SERVICES
          </p>

          <h2 style={{ fontSize: 42 }}>
            One studio. Every memory.
          </h2>

          <div className="grid service-grid">
            {services.map((service) => (
              <GlassCard
                className="service-card"
                key={service}
              >
                <h3>{service}</h3>

                <p className="muted">
                  Premium coverage, professional editing and a
                  client-first delivery workflow.
                </p>

                <Link href="/booking">
                  Book Now →
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className="section">
        <div className="container">
          <p className="gold-text">
            FEATURED PORTFOLIO
          </p>

          <div className="grid portfolio-grid">
            {[
              "Wedding Stories",
              "Pre-Wedding",
              "Bridal Portraits",
              "Cinematic Films",
            ].map((item) => (
              <div
                className="portfolio-tile"
                key={item}
              >
                <div className="tile-label">
                  <b>{item}</b>

                  <div className="muted">
                    Suraj Studio Mohandra
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section">
        <div className="container">
          <GlassCard>
            <h2>
              At Suraj Studio Mohandra, we preserve emotions,
              stories and memories.
            </h2>

            <p className="muted">
              From the first enquiry to final album selection,
              the platform is designed around a premium, secure
              and mobile-friendly client journey.
            </p>

            <Link
              className="btn btn-primary"
              href="/booking"
            >
              Book Your Event
            </Link>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}