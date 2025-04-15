// src/components/Navbar.jsx
console.log("Navbar loaded");
import { Link, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../contexts/UserContext";

function Navbar() {
  const { user, setUser, loading } = useCurrentUser();
  const navigate = useNavigate();

  if (loading) return null;

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
    navigate("/login");
  };

  return (
    <nav style={{ padding: "1rem", background: "#eee" }}>
      <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
      {!user && <>
        <Link to="/login" style={{ marginRight: "1rem" }}>Login</Link>
        <Link to="/register">Register</Link>
      </>}
      {user && <>
        <span style={{ marginRight: "1rem" }}>Hello, {user.name} ({user.role === 1 ? "Trainee" : "Coach"})</span>
        <button onClick={handleLogout}>Logout</button>
      </>}
    </nav>
  );
}

export default Navbar;
