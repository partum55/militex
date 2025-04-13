import React from "react";
import Navbar from "../components/Navbar";
// import FilterButton from "../components/FilterButton";
import FilterSidebar from "../components/FilterSidebar";
import CarCard from "../components/CarCard";
import FormButton from "../components/FormButton";
import "./BuyPage.css";

function BuyPage() {
  return (
    <div className="buy-page">
      <Navbar />
      <div className="content">
        <FilterSidebar />
        <div className="main-content">
          <div className="filter-buttons">
            <FilterButton label="Sedan" />
            <FilterButton label="Estate" />
            <FilterButton label="SUV" active />
            <FilterButton label="Pickup" />
            <FilterButton label="Hatchback" />
            <FilterButton label="Liftback" />
            <FilterButton label="Coupe" />
            <FilterButton label="Fastback" />
            <FilterButton label="Hardtop" />
          </div>
          <div className="car-cards">
            <CarCard title="Car 1" description="Description of Car 1" />
            <CarCard title="Car 2" description="Description of Car 2" />
            <CarCard title="Car 3" description="Description of Car 3" />
          </div>
          <div className="pagination">
            <FormButton label="Previous" />
            <FormButton label="Next" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyPage;