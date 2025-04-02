import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
// ... Import other pages like BuyPage, SellPage, TuningPage

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        {/* Add routes for other pages */}
        {/* e.g., /buy -> BuyPage, /sell -> SellPage, /tuning -> TuningPage */}
      </Routes>
    </Router>
  );
}

export default App;
