import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SellCarPage.css";

function SellCarPage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Use field names that match the backend Car model
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    vehicleType: "",
    condition: "",
    country: "",
    city: "",
    price: "",
    negotiable: false,
    description: "",
    photo: null, // For file uploads; you'll need extra handling if you want to support files
  });

  // Update form data helper
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // This function sends the form data to the backend and, on success, navigates to /buy
  const handleSell = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/cars/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include authentication headers here if necessary
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert("Error selling car: " + JSON.stringify(errorData));
        return;
      }
      // On success, redirect to the Buy page (which shows the car list)
      navigate("/buy");
    } catch (error) {
      console.error("Error selling car:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="sell-container">
      <div className="sell-form">
        {step === 1 && (
          <StepOne formData={formData} onChange={handleChange} onNext={nextStep} />
        )}
        {step === 2 && (
          <StepTwo formData={formData} onChange={handleChange} onNext={nextStep} onPrev={prevStep} />
        )}
        {step === 3 && (
          <StepThree formData={formData} onPrev={prevStep} onSell={handleSell} />
        )}
      </div>
    </div>
  );
}

export default SellCarPage;

/* Step One: Basic Car Details */
function StepOne({ formData, onChange, onNext }) {
  return (
    <div className="step-card">
      <h1 className="step-title">Sell Your Car</h1>

      <div className="form-group">
        <label>Car Make</label>
        <input
          type="text"
          value={formData.make}
          onChange={(e) => onChange("make", e.target.value)}
          placeholder="Enter Car Make"
        />
      </div>

      <div className="form-group">
        <label>Car Model</label>
        <input
          type="text"
          value={formData.model}
          onChange={(e) => onChange("model", e.target.value)}
          placeholder="Enter Car Model"
        />
      </div>

      <div className="two-columns">
        <div className="form-group">
          <label>Year of Manufacture</label>
          <input
            type="text"
            value={formData.year}
            onChange={(e) => onChange("year", e.target.value)}
            placeholder="e.g. 2015"
          />
        </div>
        <div className="form-group">
          <label>Mileage</label>
          <input
            type="text"
            value={formData.mileage}
            onChange={(e) => onChange("mileage", e.target.value)}
            placeholder="e.g. 123456"
          />
        </div>
      </div>

      <div className="two-columns">
        <div className="form-group">
          <label>Fuel Type</label>
          <input
            type="text"
            value={formData.fuelType}
            onChange={(e) => onChange("fuelType", e.target.value)}
            placeholder="e.g. Diesel"
          />
        </div>
        <div className="form-group">
          <label>Transmission</label>
          <input
            type="text"
            value={formData.transmission}
            onChange={(e) => onChange("transmission", e.target.value)}
            placeholder="e.g. Manual"
          />
        </div>
      </div>

      <button className="form-button next-button" onClick={onNext}>
        Next →
      </button>
    </div>
  );
}

/* Step Two: Additional Details */
function StepTwo({ formData, onChange, onNext, onPrev }) {
  return (
    <div className="step-card">
      <h1 className="step-title">Sell Your Car</h1>

      <div className="two-columns">
        <div className="form-group">
          <label>Vehicle Type</label>
          <input
            type="text"
            value={formData.vehicleType}
            onChange={(e) => onChange("vehicleType", e.target.value)}
            placeholder="e.g. Pickup"
          />
        </div>
        <div className="form-group">
          <label>Condition</label>
          <input
            type="text"
            value={formData.condition}
            onChange={(e) => onChange("condition", e.target.value)}
            placeholder="e.g. Used / New"
          />
        </div>
      </div>

      <div className="two-columns">
        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => onChange("country", e.target.value)}
            placeholder="Country"
          />
        </div>
        <div className="form-group">
          <label>City/Region</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="City/Region"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Price</label>
        <input
          type="text"
          value={formData.price}
          onChange={(e) => onChange("price", e.target.value)}
          placeholder="Car Price"
        />
      </div>

      <div className="form-group negotiable-row">
        <label>Negotiable?</label>
        <input
          type="checkbox"
          checked={formData.negotiable}
          onChange={(e) => onChange("negotiable", e.target.checked)}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Describe your car..."
        />
      </div>

      <div className="form-group">
        <label>Upload Photo</label>
        <input
          type="file"
          onChange={(e) => onChange("photo", e.target.files[0])}
        />
      </div>

      <div className="form-nav">
        <button className="form-button back-button" onClick={onPrev}>
          ← Back
        </button>
        <button className="form-button next-button" onClick={onNext}>
          Next →
        </button>
      </div>
    </div>
  );
}

/* Step Three: Confirmation & Submit */
function StepThree({ formData, onPrev, onSell }) {
  return (
    <div className="step-card">
      <h1 className="step-title">Confirm Your Listing</h1>
      <div className="summary">
        <p>
          <strong>Make:</strong> {formData.make || "N/A"} <br />
          <strong>Model:</strong> {formData.model || "N/A"} <br />
          <strong>Year:</strong> {formData.year || "N/A"} <br />
          <strong>Mileage:</strong> {formData.mileage || "N/A"} <br />
          <strong>Fuel Type:</strong> {formData.fuelType || "N/A"} <br />
          <strong>Transmission:</strong> {formData.transmission || "N/A"} <br />
          <strong>Vehicle Type:</strong> {formData.vehicleType || "N/A"} <br />
          <strong>Condition:</strong> {formData.condition || "N/A"} <br />
          <strong>Country:</strong> {formData.country || "N/A"} <br />
          <strong>City:</strong> {formData.city || "N/A"} <br />
          <strong>Price:</strong> {formData.price || "N/A"}{" "}
          {formData.negotiable ? "(Negotiable)" : ""} <br />
          <strong>Description:</strong> {formData.description || "N/A"} <br />
        </p>
      </div>

      <div className="form-nav">
        <button className="form-button back-button" onClick={onPrev}>
          ← Back
        </button>
        <button className="form-button next-button" onClick={onSell}>
          Sell Car
        </button>
      </div>
    </div>
  );
}
