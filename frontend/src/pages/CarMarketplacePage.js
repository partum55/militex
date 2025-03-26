import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FilterSidebar from "./components/FilterSidebar";
import CarCard from "./components/CarCard";
import "./CarMarketplacePage.css";

export default function CarMarketplacePage({ cars = [] }) {
  return (
    <div className="marketplace-container">
      <FilterSidebar />

      <main className="marketplace-main">
        <div className="search-bar">
          <Input placeholder="Пошук" className="w-full" />
        </div>

        <div className="tag-filters">
          {['новинки!', 'найдешевші', 'майже нові', 'потрібен ремонт', 'на ходу', 'для гуманітарки'].map((tag, idx) => (
            <Button variant="outline" key={idx}>{tag}</Button>
          ))}
        </div>

        <div className="car-list">
          {cars.map((car, idx) => (
            <CarCard key={idx} car={car} />
          ))}
        </div>

        <div className="pagination">
          <Button variant="ghost">← Previous</Button>
          <Button variant="ghost">Next →</Button>
        </div>
      </main>
    </div>
  );
}
