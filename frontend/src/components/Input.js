import React from "react";
import "./Input.css";

const Input = ({ label, ...props }) => {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}
      <input className="custom-input" {...props} />
    </div>
  );
};

export default Input;
