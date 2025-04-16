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
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#6f42c1" }}>
      <div className="container">
        <Link className="navbar-brand" to="/">FitnessPlanet 💜</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}
            {user && (
              <>
                <li className="nav-item d-flex align-items-center">
                  <span className="nav-link">Hello, <strong>{user.name}</strong> ({user.role === 1 ? "Trainee" : "Coach"})</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
