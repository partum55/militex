import React from "react";
import { Link } from "react-router-dom";
import "./Sell0Page.css";

function Sell0Page() {
    return (
        <div className="sell-page">
            <div className="blur-overlay" />
            <footer className="footer">
                <div className="footer-bar" />
                <div className="footer-text">2025. All rights reserved</div>
            </footer>

            <Link to="/" className="back-button">
                <div className="back-icon" />
                <span className="back-text">Back to site</span>
            </Link>

            <div className="form-card">
                <h1 className="form-title">Sell your car</h1>

                <div className="form-group">
                    <label className="form-label">Car Make</label>
                    <div className="form-input">Ford</div>
                </div>

                <div className="form-group">
                    <label className="form-label">Car Model</label>
                    <div className="form-input">Ranger</div>
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label className="form-label">Year of Manufacture</label>
                        <div className="form-input">2015</div>
                    </div>
                    <div className="form-group half">
                        <label className="form-label">Mileage</label>
                        <div className="form-input">123 456</div>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label className="form-label">Vehicle Type</label>
                        <div className="form-input">Pickup</div>
                    </div>
                    <div className="form-group half">
                        <label className="form-label">Condition</label>
                        <div className="form-input">Used</div>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label className="form-label">Fuel Type</label>
                        <div className="form-input">Diesel</div>
                    </div>
                    <div className="form-group half">
                        <label className="form-label">Transmission</label>
                        <div className="form-input">Manual</div>
                    </div>
                </div>

                <div className="next-button">
                    <span>Next</span>
                </div>
            </div>
        </div>
    );
}

export default Sell0Page;
