import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="home-hero">
        <div className="hero-overlay" />

        <div className="container hero-content">
          <div className="hero-brand-block">
            <p className="eyebrow">
              PREMIUM WEDDING PHOTOGRAPHY • CINEMATIC FILMS
            </p>

            <h1 className="hero-studio-title">
              <span>SURAJ PHOTOGRAPHY</span>
              <span>& DESIGN STUDIO</span>
              <span className="gold-text">MOHANDRA</span>
            </h1>

            <p className="hero-subtitle">
              Wedding Photography • Pre-Wedding • Cinematic Films •
              Albums • Photo Design • Printing
            </p>

            <div className="hero-actions">
              <Link
                href="/portfolio"
                className="btn btn-primary"
              >
                View Our Work
              </Link>

              <Link
                href="/booking"
                className="btn btn-glass"
              >
                Book Your Event
              </Link>

              <a
                href="https://wa.me/919752579532?text=Hello%20Suraj%20Studio%20Mohandra%2C%20I%20want%20information%20about%20photography%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-glass"
              >
                WhatsApp Us
              </a>

              <Link
                href="/gallery"
                className="btn btn-glass"
              >
                Client Gallery
              </Link>
            </div>

            <div className="social-panel">
              <p className="social-label">
                Follow Suraj Studio
              </p>

              <div className="social-buttons">
                <a
                  href="https://instagram.com/suraj_studio__01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                >
                  Instagram
                  <span>@suraj_studio__01</span>
                </a>

                <a
                  href="https://instagram.com/suraj_designes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                >
                  Instagram
                  <span>@suraj_designes</span>
                </a>

                <a
                  href="https://www.facebook.com/share/1JjgtnKTtz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                >
                  Facebook
                  <span>Follow Us</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">
              SURAJ STUDIO MOHANDRA
            </p>

            <h2>
              Capturing Moments.
              <br />
              Creating Memories.
            </h2>

            <p className="muted">
              Wedding photography, cinematic films, albums,
              professional photo editing and premium studio
              services in Mohandra, Madhya Pradesh.
            </p>
          </div>

          <div className="home-feature-grid">
            <article className="glass gold card home-feature-card">
              <h3>Wedding Photography</h3>
              <p className="muted">
                Traditional, candid and premium wedding coverage.
              </p>

              <Link href="/services" className="text-button">
                Explore Services →
              </Link>
            </article>

            <article className="glass gold card home-feature-card">
              <h3>Cinematic Films</h3>
              <p className="muted">
                Wedding highlights, teasers, reels and cinematic
                memories.
              </p>

              <Link href="/portfolio" className="text-button">
                View Portfolio →
              </Link>
            </article>

            <article className="glass gold card home-feature-card">
              <h3>Client Galleries</h3>
              <p className="muted">
                Private event galleries with sharing, favorites
                and photo selection.
              </p>

              <Link href="/gallery" className="text-button">
                Find Your Gallery →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section home-contact-section">
        <div className="container">
          <div className="glass gold card home-contact-card">
            <div>
              <p className="eyebrow">
                BOOK YOUR EVENT
              </p>

              <h2>
                Make your memories unforgettable.
              </h2>

              <p className="muted">
                Mohandra, Madhya Pradesh
                <br />
                9752579532 • 9131590791
              </p>
            </div>

            <div className="hero-actions">
              <Link
                href="/booking"
                className="btn btn-primary"
              >
                Book Event
              </Link>

              <a
                href="https://wa.me/919752579532"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-glass"
              >
                WhatsApp
              </a>

              <a
                href="tel:+919752579532"
                className="btn btn-glass"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}