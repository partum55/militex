import React, { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import "./Form.css";

const SignupForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/api/accounts/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          password
        }),
      });
      if (!response.ok) {
        throw new Error("Signup failed");
      }
      const data = await response.json();
      console.log("Signup success:", data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form className="form-container" onSubmit={handleSignup}>
      <h2 className="form-title">Sign Up</h2>
      <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit">Create Account</Button>
    </form>
  );
};

export default SignupForm;
