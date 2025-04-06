import React from "react";
import { Link } from "react-router-dom";
import "./Sell2Page.css";

function Sell2Page() {
  return (
    <div className="sell2-page">
      <div className="sell2-blur" />

      <footer className="sell2-footer">
        2025. All rights reserved
      </footer>

      <Link to="/" className="sell2-back">
        <span className="sell2-circle" />
        Back to site
      </Link>

      <div className="sell2-form">
        <h2 className="sell2-title">Sell your car</h2>
        <p className="sell2-subtext">All right?</p>

        <button className="sell2-button">Sell Car</button>

        <button className="sell2-back-btn">
          <span className="sell2-circle-dark" />
          Back
        </button>
      </div>
    </div>
  );
}

export default Sell2Page;
