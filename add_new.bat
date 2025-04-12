@echo off
setlocal

:: Перейти в папку з компонентами
cd frontend\src\components

:: Створити CarCard.jsx
(
echo import React from "react";
echo import "./CarCard.css";
echo.
echo export default function CarCard^({ car }) ^{
echo     return (^
echo         <div className="car-card">^
echo             <img src={car.image} alt={car.title} className="car-image" />^
echo             <div className="car-info">^
echo                 <h3>{car.title}</h3>^
echo                 <p>{car.engine} · {car.mileage}</p>^
echo                 <p>{car.description}</p>^
echo                 <div className="car-price">{car.price}</div>^
echo             </div>^
echo         </div>^
echo     );^
echo }
) > CarCard.jsx

:: Створити CarCard.css
(
echo .car-card {
echo   display: flex;
echo   background: white;
echo   border-radius: 1rem;
echo   overflow: hidden;
echo   box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
echo }
echo.
echo .car-image {
echo   width: 150px;
echo   object-fit: cover;
echo }
echo.
echo .car-info {
echo   padding: 1rem;
echo   flex: 1;
echo }
echo.
echo .car-price {
echo   font-weight: bold;
echo   color: #4f46e5;
echo   text-align: right;
echo }
) > CarCard.css

:: Створити FilterSidebar.jsx
(
echo import React from "react";
echo import "./FilterSidebar.css";
echo.
echo export default function FilterSidebar() ^{
echo   return (^
echo     <aside className="sidebar">^
echo       <h2 className="sidebar-title">Фільтри</h2>^
echo       <div className="filter-group">^
echo         <label>Ціна</label>^
echo         <input type="range" min="0" max="50000" />^
echo       </div>^
echo       <div className="filter-group">^
echo         <label>Пробіг</label>^
echo         <input type="range" min="0" max="500000" />^
echo       </div>^
echo       <div className="filter-group">^
echo         <label>Паливо</label>^
echo         <div><input type="checkbox" /> Бензин</div>^
echo         <div><input type="checkbox" /> Дизель</div>^
echo         <div><input type="checkbox" /> ГАЗ</div>^
echo       </div>^
echo     </aside>^
echo   );^
echo }
) > FilterSidebar.jsx

:: Створити FilterSidebar.css
(
echo .sidebar {
echo   width: 250px;
echo   padding: 1.5rem;
echo   background: white;
echo   border-radius: 1rem;
echo   box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
echo   margin: 1rem;
echo }
echo.
echo .sidebar-title {
echo   font-weight: bold;
echo   font-size: 1.2rem;
echo   margin-bottom: 1rem;
echo }
echo.
echo .filter-group {
echo   margin-bottom: 1.5rem;
echo }
echo.
echo .filter-group input[type="range"] {
echo   width: 100%;
echo }
) > FilterSidebar.css

pause
