import React from "react";
import "./FilterSidebar.css";

export default function FilterSidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Фільтри</h2>
      <div className="filter-group">
        <label>Ціна</label>
        <input type="range" min="0" max="50000" />
      </div>
      <div className="filter-group">
        <label>Пробіг</label>
        <input type="range" min="0" max="500000" />
      </div>
      <div className="filter-group">
        <label>Паливо</label>
        <div><input type="checkbox" /> Бензин</div>
        <div><input type="checkbox" /> Дизель</div>
        <div><input type="checkbox" /> ГАЗ</div>
      </div>
    </aside>
  );
}
