import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";
import "./Sell0Page.css";

function Sell0Page() {
  return (
    <div className="sell-page">
      <Navbar />

      {/* This overlay can be used for a blur effect */}
      <div className="blur-overlay"></div>

      <div className="form-card">
        <h1 className="form-title">Sell Your Car</h1>

        {/* Car Make and Model */}
        <FormInput label="Car Make" defaultValue="Ford" />
        <FormInput label="Car Model" defaultValue="Ranger" />

        {/* Year and Mileage */}
        <div className="form-row">
          <FormInput label="Year of Manufacture" defaultValue="2015" />
          <FormInput label="Mileage" defaultValue="123 456" />
        </div>

        {/* Vehicle Type and Condition */}
        <div className="form-row">
          <FormInput label="Vehicle Type" defaultValue="Pickup" />
          <FormInput label="Condition" defaultValue="Used" />
        </div>

        {/* Fuel Type and Transmission */}
        <div className="form-row">
          <FormInput label="Fuel Type" defaultValue="Diesel" />
          <FormInput label="Transmission" defaultValue="Manual" />
        </div>

        {/* Next Button */}
        <FormButton label="Next" />
      </div>

      <footer className="footer">
        <div className="footer-bar"></div>
        <div className="footer-text">2025. All rights reserved</div>
      </footer>

      {/* Back to site link */}
      <Link to="/" className="back-button">
        <div className="back-icon"></div>
        <span className="back-text">Back to site</span>
      </Link>
    </div>
  );
}

export default Sell0Page;
