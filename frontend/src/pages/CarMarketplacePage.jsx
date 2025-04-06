import React from "react";
import FilterSidebar from "../components/FilterSidebar";
import CarCard from "../components/CarCard";
import "./CarMarketplacePage.css";

export default function CarMarketplacePage({ cars = [] }) {
  return (
    <div className="marketplace-container">
      <FilterSidebar />

      <main className="marketplace-main">
        <div className="search-bar">
          <input type="text" placeholder="Search" className="search-input" />
        </div>

        <div className="tag-filters">
          {[
            "New Arrivals",
            "Cheapest",
            "Almost New",
            "Needs Repair",
            "Drivable",
            "For Humanitarian Use",
          ].map((tag, idx) => (
            <button className="tag-button" key={idx}>
              {tag}
            </button>
          ))}
        </div>

        <div className="car-list">
          {cars.map((car, idx) => (
            <CarCard key={idx} car={car} />
          ))}
        </div>

        <div className="pagination">
          <button className="pagination-button">← Previous</button>
          <button className="pagination-button">Next →</button>
        </div>
      </main>
    </div>
  );
}
