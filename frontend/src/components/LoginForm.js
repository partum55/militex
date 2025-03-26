import React, { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import "./Form.css";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/api/accounts/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }
      const data = await response.json();
      console.log("Login success:", data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form className="form-container" onSubmit={handleLogin}>
      <h2 className="form-title">Login</h2>
      <Input
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit">Login</Button>
    </form>
  );
};

export default LoginForm;
