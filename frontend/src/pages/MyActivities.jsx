const API_BASE = import.meta.env.VITE_API_BASE_URL;
import { useEffect, useState } from "react";

function MyActivities() {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMyActivities() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/trainee/activities`, {
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

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📋 My Activities</h2>

      {activities.length === 0 ? (
        <p>You have not joined any activities yet.</p>
      ) : (
        <ul>
          {activities.map((a, i) => (
            <li key={i} style={{ marginBottom: "1.5rem" }}>
              <strong>{a.name}</strong> — {new Date(a.time).toLocaleString()}  
              <br />
              ✅ Completed: {a.completed ? "Yes" : "No"}
              <br />
              🗣️ Coach Feedback:
              {a.feedback && a.feedback.length > 0 ? (
                <ul>
                  {a.feedback.map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
              ) : (
                <span> None</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyActivities;
