import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";
import "./Sell1Page.css";

function Sell1Page() {
  return (
    <div className="sell1-page">
      <Navbar />
      <div className="background-overlay" />

      <div className="form-container">
        <h1 className="form-title">Sell your car</h1>

        <FormInput label="Country" value="Ukraine" />
        <FormInput label="City/Region" value="Lviv" />
        <FormInput label="Price" value="$20000" />

        <div className="form-group">
          <label className="form-label">Negotiable Price?</label>
          <div className="toggle-switch">
            <div className="toggle-circle" />
          </div>
        </div>

        <FormInput label="Car Description" value="Good car for ..." />
        <FormInput label="Upload Photo" value="Drag your photo" />

        <div className="form-navigation">
          <FormButton label="Back" />
          <FormButton label="Next" />
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

export default Sell1Page;
