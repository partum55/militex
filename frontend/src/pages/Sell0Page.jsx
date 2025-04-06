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
      <div className="blur-overlay" />

      <div className="form-card">
        <h1 className="form-title">Sell your car</h1>

        <FormInput label="Car Make" value="Ford" />
        <FormInput label="Car Model" value="Ranger" />

        <div className="form-row">
          <FormInput label="Year of Manufacture" value="2015" />
          <FormInput label="Mileage" value="123 456" />
        </div>

        <div className="form-row">
          <FormInput label="Vehicle Type" value="Pickup" />
          <FormInput label="Condition" value="Used" />
        </div>

        <div className="form-row">
          <FormInput label="Fuel Type" value="Diesel" />
          <FormInput label="Transmission" value="Manual" />
        </div>

        <FormButton label="Next" />
      </div>

      <footer className="footer">
        <div className="footer-bar" />
        <div className="footer-text">2025. All rights reserved</div>
      </footer>

      <Link to="/" className="back-button">
        <div className="back-icon" />
        <span className="back-text">Back to site</span>
      </Link>
    </div>
  );
}

export default Sell0Page;
