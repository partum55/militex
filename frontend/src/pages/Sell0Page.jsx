import React, { useState } from "react"
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";
import "./Sell0Page.css";

function Sell0Page() {
  const [car_make, setCarMake] = useState("");
  const [car_model, setCarModel] = useState("");
  const [year_of_manufacture, setYearOfManufacture] = useState("");
  const [mileage, setMileage] = useState("");
  const [vehicle_type, setVehicleType] = useState("");
  const [condition, setCondition] = useState("");
  const [fuel_type, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace with your backend API call to Django
    console.log("Register car with", car_make, car_model, year_of_manufacture, mileage, vehicle_type, condition, fuel_type, transmission);
  };

  return (
    <div className="sell-page">
      {/* Напівпрозорий темний шар для розмиття фону */}
      {/* <div className="blur-overlay" /> */}

      {/* Центрована картка форми */}
      <div className="form-card" onSubmit={handleSubmit}>
        <h1 className="form-title">Sell your car</h1>

        {/* Поля форми у дві колонки */}
        <div className="form-row">
          <FormInput
           label="Car Make" 
           type="car make"
           placeholder="Enter car make"
           value={car_make}
           onChange={(e) => setCarMake(e.target.value)}
          />
          <FormInput
           label="Car Model" 
           type="car model"
           placeholder="Enter car model"
           value={car_model}
           onChange={(e) => setCarModel(e.target.value)}
          />
        </div>
        <div className="form-row">
          <FormInput 
            label="Year of Manufacture"
            type='year of manufacture'
            placeholder="Enter year of manufacture"
            value={year_of_manufacture}
            onChange={(e) => setYearOfManufacture(e.target.value)} 
          />
          <FormInput
           label="Mileage"
           type='mileage'
           placeholder="Enter mileage"
           value={mileage}
           onChange={(e) => setMileage(e.target.value)}
          />
        </div>
        <div className="form-row">
          <FormInput 
            label="Vehicle Type"
            type='vehicle type'
            placeholder="Enter vehicle type"
            value={vehicle_type}
            onChange={(e) => setVehicleType(e.target.value)}
          />
          <FormInput 
            label="Condition"
            type={'condition'}
            placeholder="Enter condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
        </div>
        <div className="form-row">
          <FormInput
            label="Fuel Type"
            type='fuel type'
            placeholder="Enter fuel type"
            value={fuel_type}
            onChange={(e) => setFuelType(e.target.value)}
          />
          <FormInput
            label="Transmission"
            type='transmission'
            placeholder="Enter transmission"
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
          />
        </div>

        {/* Кнопка Next зі стрілкою, вирівняна вправо */}
        <div className="form-actions">
          <Link to="/sell1" className="back-button">
            <FormButton>← Back</FormButton>
          </Link>
          <FormButton >Next →</FormButton>
        </div>
      </div>

      {/* Футер з копірайтом */}
      <footer className="footer">
        <div className="footer-bar" />
        <div className="footer-text">2025. All rights reserved</div>
      </footer>

      {/* Посилання Back to site у верхньому лівому куті */}
      {/* Дописати link на наступну сторінку та на попередню */}
      <Link to="/" className="back-button">
        <div className="back-icon">←</div>
        <span className="back-text">Back to site</span>
      </Link>
    </div>
  );
}

export default Sell0Page;