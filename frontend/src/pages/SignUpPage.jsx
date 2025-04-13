import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";
import "./SignUpPage.css";

const SignUpPage = () => {
  const navigate = useNavigate();

  // Використовуємо один об'єкт стану для всіх полів форми
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });

  // Функція для обробки змін у полях форми:
  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обробник відправки форми, який надсилає дані на backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // Запобігаємо перезавантаженню сторінки
    try {
      const response = await axios.post("/api/signup", formData);
      console.log("Success:", response.data);
      // Перенаправлення після успішної реєстрації
      navigate("/");
    } catch (error) {
      console.error("Error during sign up:", error);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Username"
            type="text"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
          />
          <FormInput
            label="Email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          <FormInput
            label="First Name"
            type="text"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
          />
          <FormInput
            label="Last Name"
            type="text"
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
          />
          <FormInput
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
          <FormButton type="submit">Sign Up</FormButton>
        </form>
        <p className="page-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
