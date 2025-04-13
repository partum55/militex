import React from "react";
import "./FormButton.css";

const FormButton = ({ children, type = "button", onClick }) => (
  <button type={type} onClick={onClick} className="form-button">
    {children}
  </button>
);

export default FormButton;
