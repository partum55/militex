import React from "react";
import "./FormInput.css";

const FormInput = ({ label, type, placeholder, value, onChange }) => (
  <div className="form-group">
    <label>{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
    />
  </div>
);

export default FormInput;
