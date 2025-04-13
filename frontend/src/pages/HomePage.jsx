import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h1>Welcome to MILITEX</h1>
          <p>Exclusive Car Deals Tailored for Military Personnel</p>
          <Link to="/buy" className="cta-button">Explore Cars</Link>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <h2>Our Mission</h2>
        <div className="mission-content">
          <p>
            At Militex, we understand the unique lifestyle and commitments of
            military families and service members. Our platform curates
            high-quality cars designed to meet your needs—providing robust,
            rugged vehicles at competitive prices so you can find the perfect
            ride with confidence.
          </p>
          <img
            src="/images/humvee.jpg"
            alt="Military vehicle"
            className="mission-image"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Simple. Transparent. Tailored.</h2>
        <div className="features">
          <div className="feature-item">
            <h3>Browse</h3>
            <p>
              Explore our handpicked car listings that fit military life.
            </p>
          </div>
          <div className="feature-item">
            <h3>Compare</h3>
            <p>
              Review detailed specs, prices, and benefits side by side.
            </p>
          </div>
          <div className="feature-item">
            <h3>Connect</h3>
            <p>
              Directly connect with trusted sellers for a smooth transaction.
            </p>
          </div>
        </div>
      </section>

      {/* Heroes Section */}
      <section className="heroes-section">
        <h2>Built for Our Heroes</h2>
        <p>
          We are proud to serve those who serve our country. From robust SUVs
          to efficient family cars, we ensure you find the best vehicle for
          your needs—no hassle, no hidden fees.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 All rights reserved</p>
      </footer>
    </div>
  );
}

export default HomePage;
