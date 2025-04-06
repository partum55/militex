import React from "react";
import { Link } from "react-router-dom";
import "./Sell1Page.css";

function Sell1Page() {
  return (
    <div className="sell-page">
      <div className="sell-blur" />

      <footer className="sell-footer">2025. All rights reserved</footer>

      <Link to="/" className="sell-back">
        <span className="sell-circle" />
        Back to site
      </Link>

      <div className="sell-form">
        <h2 className="sell-title">Sell your car</h2>

        <InputBlock label="Country" value="Ukraine" />
        <InputBlock label="City/Region" value="Lviv" />
        <div className="sell-row">
          <InputBlock label="Price" value="$20000" />
          <InputBlock label="Negotiable Price?" toggle />
        </div>
        <InputBlock label="Car Description" value="Good car for ..." />
        <InputBlock label="Upload Photo" value="Drag your photo" center />

        <div className="sell-buttons">
          <button className="sell-btn">
            <span className="sell-circle-dark" /> Back
          </button>
          <button className="sell-btn">
            Next <span className="sell-circle-dark" />
          </button>
        </div>
      </div>
    </div>
  );
}

function InputBlock({ label, value, center = false, toggle = false }) {
  return (
    <div className={`sell-input-block ${toggle ? "sell-toggle-block" : ""}`}>
      <label className="sell-label">{label}</label>
      {toggle ? (
        <div className="sell-toggle">
          <div className="sell-toggle-knob" />
        </div>
      ) : (
        <div className={`sell-input ${center ? "sell-center" : ""}`}>{value}</div>
      )}
    </div>
  );
}

export default Sell1Page;
