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
                <div style={{width: 196, height: 74, left: 292, top: 330, position: 'absolute'}}>
                    <div style={{width: 196, left: 0, top: 0, position: 'absolute', color: '#39236B', fontSize: 16, fontFamily: 'Nunito', fontWeight: '400', lineHeight: 24, letterSpacing: 0.16, wordWrap: 'break-word'}}>Mileage</div>
                    <div style={{width: 196, height: 48, padding: 12, left: 0, top: 26, position: 'absolute', borderRadius: 64, outline: '2px #39236B solid', outlineOffset: '-2px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#B8BCCA', fontSize: 16, fontFamily: 'Nunito', fontWeight: '400', lineHeight: 24, letterSpacing: 0.16, wordWrap: 'break-word'}}>123 456</div>
                    </div>
                </div>
                <div style={{width: 75, height: 32, left: 413, top: 664, position: 'absolute'}}>
                    <div style={{width: 75, height: 32, left: 0, top: 0, position: 'absolute'}} />
                    <div data-size="16" style={{width: 16, height: 16, left: 67, top: 24, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', overflow: 'hidden'}}>
                        <div style={{width: 9.33, height: 9.33, left: 3.33, top: 3.33, position: 'absolute', outline: '1.60px #39236B solid', outlineOffset: '-0.80px'}} />
                    </div>
                    <div style={{left: 8, top: 4, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#39236B', fontSize: 16, fontFamily: 'Nunito', fontWeight: '400', lineHeight: 24, letterSpacing: 0.16, wordWrap: 'break-word'}}>Next</div>
                </div>
            </div>
        </div>
    );
}

export default Sell0Page;
