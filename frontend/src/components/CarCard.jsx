import React from "react";
import "./CarCard.css";

export default function CarCard({ car }) {
    return (
        <div className="car-card">
            <img src={car.image} alt={car.title} className="car-image" />
            <div className="car-info">
                <h3>{car.title}</h3>
                <p>{car.engine} · {car.mileage}</p>
                <p>{car.description}</p>
                <div className="car-price">{car.price}</div>
            </div>
        </div>
    );
}
