const API_BASE = import.meta.env.VITE_API_BASE_URL;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/stats/coach`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) {
          setCourses(data.data);
        } else {
          setError("Failed to load stats");
        }
      } catch (err) {
        setError("Server error");
      }
    }

    fetchStats();
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📚 My Courses & Stats</h2>

      {courses.length === 0 ? (
        <p>You haven't created any courses yet.</p>
      ) : (
        courses.map((c, i) => (
          <div key={i} style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            backgroundColor: "#f9f9f9",
            cursor: "pointer"
          }}
          onClick={() => navigate(`/activity/${c.activity_id}`)}
          >
            <h3>{c.activity_name}</h3>
            <p>
      
              👥 Participants: {c.total_participants ?? 0} (✅ {c.completed_count ?? 0})<br />
              📊 Completion Rate: {c.completion_rate ?? 0}%<br />
              ⭐ Rating: {(c.average_rating ?? 0).toFixed(2)}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyCourses;
