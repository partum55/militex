import React, { useState } from "react"
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";
import "./Sell1Page.css";

function Sell1Page() {
  const [country, setCountry] = useState("");
  const [city_region, setCityRegion] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [car_description, setCarDescription] = useState("");
  const [photo, setPhoto] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace with your backend API call to Django
    console.log("Register car with", country, city_region, price, negotiable, car_description, photo);
  }
  return (
    <div className="sell1-page">

      <Link to="/" className="back-to-site">
        <div className="back-icon">←</div>
        <span className="back-text">Back to site</span>
      </Link>

      <div className="form-container" onSubmit={handleSubmit}>
        <h1 className="form-title">Sell your car</h1>

        <FormInput 
          label="Country"
          type='country'
          placeholder="Select your country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <FormInput
          label="City/Region"
          type='city/region'
          placeholder="Select your city/region"
          value={city_region}
          onChange={(e) => setCityRegion(e.target.value)}
        />
        < FormInput
          label="Price"
          type='price'
          placeholder="Enter price" 
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <div className="form-group">
          <label className="form-label">Negotiable Price?</label>
          <div className="toggle-switch" onClick={() => setNegotiable(!negotiable)}>
            <div className="toggle-circle" />
          </div>
        </div>

        <FormInput 
          label="Car Description"
          type='car description'
          placeholder="Describe your car"
          value={car_description}
          onChange={(e) => setCarDescription(e.target.value)}
        />
        <FormInput 
          label="Upload Photo"
          type='file'
          placeholder="Drag your photo"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
        />

        <div className="form-navigation">
          <Link to="/sell0" className="form-button">
            <FormButton>← Back</FormButton>
          </Link>
          <Link to="/sell2" className="form-button">
            <FormButton>Next →</FormButton>
          </Link>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-text">2025. All rights reserved</div>
      </footer>
    </div>
  );
}

export default Sell1Page;