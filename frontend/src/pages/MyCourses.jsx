import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${API_BASE}/api/stats/coach`, {
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

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4" style={{ color: "#6f42c1" }}>📚 My Courses & Stats</h2>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <p className="text-center">You haven't created any courses yet.</p>
      ) : (
        <div className="row">
          {courses.map((c, i) => (
            <div
              key={i}
              className="col-md-6 mb-4"
              onClick={() => navigate(`/activity/${c.activity_id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-primary">{c.activity_name}</h5>
                  <p className="card-text">
                    👥 Participants: {c.total_participants ?? 0} (✅ {c.completed_count ?? 0})<br />
                    📊 Completion Rate: {c.completion_rate ?? 0}%<br />
                    ⭐ Rating: {(c.average_rating ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCourses;
