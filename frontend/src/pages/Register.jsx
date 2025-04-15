// src/pages/Register.jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../contexts/UserContext";

function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("1");
  const [error, setError] = useState("");
  const { setUser } = useCurrentUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, role })
      });
      const data = await res.json();
      if (data.success) {
        const loginRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password })
        });
        const loginData = await loginRes.json();
        if (loginData.success) {
          setUser(loginData.data); 
          navigate("/");
        } else {
          setError("Registered but auto-login failed");
        }
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Role: </label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="1">Trainee</option>
            <option value="2">Coach</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
