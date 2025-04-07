import React from "react";
import { Link } from "react-router-dom";
import FormButton from "../components/FormButton";
import "./Sell2Page.css";

function Sell2Page() {
  return (
    <div className="sell2-page">

      <div className="confirmation-card">
        <h1 className="confirmation-title">Sell your car</h1>
        <p className="confirmation-text">All right?</p>
        <Link to='/'>
          <button className='sell-button' label="Yes, I am sure">Yes, I am sure</button>
        </Link>
        <div className="form-navigation">
          <FormButton className='form-button' label="Back">← Back</FormButton>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-text">2025. All rights reserved</div>
      </footer>
      <Link to="/" className="back-to-site">
        <div className="back-icon">←</div>
        <span className="back-text">Back to site</span>
      </Link>
    </div>
  );
}

export default Sell2Page;
