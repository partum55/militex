import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormButton from "../components/FormButton";
import "./Sell2Page.css";

function Sell2Page() {
  return (
    <div className="sell2-page">
      <Navbar />
      <div className="background-overlay" />

      <div className="confirmation-card">
        <h1 className="confirmation-title">Sell your car</h1>
        <p className="confirmation-text">All right?</p>

        <div className="form-navigation">
          <FormButton label="Back" />
          <FormButton label="Sell Car" />
        </div>
      </div>

      <footer className="footer">
        <div className="footer-text">2025. All rights reserved</div>
      </footer>

      <Link to="/" className="back-to-site">
        <div className="back-icon" />
        <span className="back-text">Back to site</span>
      </Link>
    </div>
  );
}

export default Sell2Page;