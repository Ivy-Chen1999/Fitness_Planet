import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function MyActivities() {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMyActivities() {
      try {
        const res = await fetch(`${API_BASE}/api/trainee/activities`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) {
          setActivities(data.data);
        } else {
          setError("Failed to load your activities");
        }
      } catch (err) {
        setError("Server error");
      }
    }

    fetchMyActivities();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4" style={{ color: "#6f42c1" }}>📋 My Activities</h2>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {activities.length === 0 ? (
        <p className="text-center">You have not joined any activities yet.</p>
      ) : (
        <ul className="list-group">
          {activities.map((a, i) => (
            <li key={i} className="list-group-item mb-3">
              <h5 className="mb-1 text-primary">{a.name}</h5>
              <p className="mb-1 text-muted">{new Date(a.time).toLocaleString()}</p>
              <p className="mb-1">
                ✅ Completed:{" "}
                <span className={a.completed ? "text-success" : "text-danger"}>
                  {a.completed ? "Yes" : "No"}
                </span>
              </p>
              <p className="mb-1">🗣️ Coach Feedback:</p>
              {a.feedback && a.feedback.length > 0 ? (
                <ul className="ms-3">
                  {a.feedback.map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted ms-3">None</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyActivities;
