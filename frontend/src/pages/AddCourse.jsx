const API_BASE = import.meta.env.VITE_API_BASE_URL;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../contexts/UserContext";

function AddCourse() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  if (!user || user.role !== 2) {
    return <p style={{ padding: "2rem" }}>Only coaches can access this page.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, time })
      });
      const data = await res.json();
      if (data.success) {
        navigate("/"); 
        setError(data.message || "Failed to create activity");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Add New Course</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: </label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Description: </label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Time: </label>
          <input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default AddCourse;
