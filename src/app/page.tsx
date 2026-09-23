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
      {/* PREMIUM HERO */}
      <section
        className="hero"
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "92vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background Depth Image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
          }}
        >
          <img
            src="/images/home/hero-main.jpg"
            alt="Suraj Studio Hero"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: "scale(1.08)",
              filter: "blur(1px)",
            }}
          />

          {/* Dark cinematic overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(5,5,5,0.90) 0%, rgba(5,5,5,0.72) 38%, rgba(5,5,5,0.48) 65%, rgba(5,5,5,0.82) 100%)",
            }}
          />

          {/* Bottom depth overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.62), transparent 50%)",
            }}
          />

          {/* Gold glow */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "-5%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(212,175,55,0.12)",
              filter: "blur(80px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: "-5%",
              bottom: "5%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(244,214,117,0.08)",
              filter: "blur(90px)",
            }}
          />
        </div>

        <div
          className="hero-content container premium-hero-grid"
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 34,
            alignItems: "center",
            paddingTop: 115,
            paddingBottom: 75,
          }}
        >
          {/* LEFT CONTENT */}
          <div>
            <span className="glass pill">
              BLACK • GOLD • CINEMATIC
            </span>

            <h1
              style={{
                fontSize: "clamp(48px, 7vw, 98px)",
                lineHeight: 0.92,
                marginTop: 22,
                marginBottom: 0,
                textShadow: "0 12px 35px rgba(0,0,0,0.55)",
              }}
            >
              SURAJ PHOTOGRAPHY
              <br />
              & DESIGN STUDIO
              <br />
              <span className="gold-text">MOHANDRA</span>
            </h1>

            <p
              className="muted"
              style={{
                fontSize: 19,
                marginTop: 24,
                maxWidth: 720,
                lineHeight: 1.7,
              }}
            >
              Wedding • Pre-Wedding • Cinematic Films • Photography
              <br />
              Premium photography and design experiences crafted
              for unforgettable memories.
            </p>

            {/* MAIN BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: 12,
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

          {/* RIGHT FLOATING PHOTO CARDS */}
          <div
            className="hero-floating-area"
            style={{
              position: "relative",
              minHeight: 560,
            }}
          >
            {/* MAIN PHOTO */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "78%",
                height: 420,
                overflow: "hidden",
                borderRadius: 30,
                background: "rgba(10,10,10,0.45)",
                border: "1px solid rgba(212,175,55,0.30)",
                boxShadow: "0 28px 70px rgba(0,0,0,0.50)",
                backdropFilter: "blur(20px)",
              }}
            >
              <img
                src="/images/home/hero-1.jpg"
                alt="Wedding Photography"
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
                    "linear-gradient(to top, rgba(0,0,0,0.72), transparent 60%)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: 20,
                  right: 20,
                  bottom: 20,
                }}
              >
                <div
                  className="gold-text"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1.4,
                  }}
                >
                  SIGNATURE WEDDING PHOTOGRAPHY
                </div>

                <div
                  style={{
                    color: "#fff",
                    fontSize: 20,
                    fontWeight: 700,
                    marginTop: 5,
                  }}
                >
                  Elegant. Cinematic. Timeless.
                </div>
              </div>
            </div>

            {/* SMALL FLOATING PHOTO */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 130,
                width: "44%",
                height: 190,
                overflow: "hidden",
                borderRadius: 24,
                background: "rgba(10,10,10,0.48)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 18px 50px rgba(0,0,0,0.42)",
                backdropFilter: "blur(18px)",
              }}
            >
              <img
                src="/images/home/hero-2.jpg"
                alt="Pre Wedding Photography"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

            {/* INFORMATION GLASS CARD */}
            <div
              style={{
                position: "absolute",
                right: 12,
                bottom: 0,
                width: "68%",
                padding: 20,
                borderRadius: 24,
                background: "rgba(12,12,12,0.62)",
                border: "1px solid rgba(212,175,55,0.26)",
                boxShadow: "0 20px 55px rgba(0,0,0,0.42)",
                backdropFilter: "blur(22px) saturate(140%)",
              }}
            >
              <div
                className="gold-text"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  marginBottom: 12,
                }}
              >
                SURAJ STUDIO MOHANDRA
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                {[
                  "Wedding",
                  "Pre-Wedding",
                  "Albums",
                  "Cinematic Films",
                ].map((item) => (
                  <span
                    key={item}
                    style={{
                      padding: "7px 11px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.05)",
                      border:
                        "1px solid rgba(255,255,255,0.09)",
                      color: "#fff",
                      fontSize: 12,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <p
                className="muted"
                style={{
                  margin: 0,
                  lineHeight: 1.7,
                  fontSize: 14,
                }}
              >
                Mohandra, Madhya Pradesh
                <br />
                9752579532 • 9131590791
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PHOTO SHOWCASE */}
      <section
        className="section"
        style={{ paddingTop: 35 }}
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