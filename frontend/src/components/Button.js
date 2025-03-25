import React from "react";
import "./Button.css";

const Button = ({ children, variant = "primary", ...props }) => {
  return (
    <button className={`custom-btn custom-btn-${variant}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
