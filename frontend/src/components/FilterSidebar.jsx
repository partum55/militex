// src/components/FilterSidebar.jsx
import React from "react";
import "./FilterSidebar.css";

export default function FilterSidebar() {
  return (
    <aside className="filter-sidebar">
      <h2 className="sidebar-title">Filters</h2>

      <div className="filter-group">
        <label>Price Range</label>
        <input type="range" min="0" max="50000" />
      </div>

      <div className="filter-group">
        <label>Mileage</label>
        <input type="range" min="0" max="500000" />
      </div>

      <div className="filter-group">
        <label>Fuel Type</label>
        <div>
          <input type="checkbox" /> Gasoline
        </div>
        <div>
          <input type="checkbox" /> Diesel
        </div>
        <div>
          <input type="checkbox" /> LPG
        </div>
      </div>
    </aside>
  );
}
