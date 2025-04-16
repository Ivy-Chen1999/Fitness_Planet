// src/pages/AddCourse.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../contexts/UserContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function AddCourse() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  if (!user || user.role !== 2) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          Only coaches can access this page.
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/activities/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, time })
      });
      const data = await res.json();
      if (data.success) {
        navigate("/");
      } else {
        setError(data.message || "Failed to create activity");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "600px" }}>
        <h2 className="text-center mb-4" style={{ color: "#6f42c1" }}>Add New Course</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Course name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Course description"
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "#6f42c1", color: "white" }}
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddCourse;
