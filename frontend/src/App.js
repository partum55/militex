// frontend/src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import CarMarketplacePage from "./pages/CarMarketplacePage";
import BuyPage from "./pages/BuyPage";
import Sell0Page from "./pages/Sell0Page";
import Sell1Page from "./pages/Sell1Page";
import Sell2Page from "./pages/Sell2Page";
import SellCarPage from "./pages/SellCarPage";

import Navbar from "./components/Navbar";

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/buy" element={<CarMarketplacePage />} />
                <Route path="/buy-test" element={<BuyPage />} />
                <Route path="/sell" element={<SellCarPage />} />
                <Route path="/sell-0" element={<Sell0Page />} />
                <Route path="/sell-1" element={<Sell1Page />} />
                <Route path="/sell-2" element={<Sell2Page />} />
            </Routes>
        </Router>
    );
}

export default App;
