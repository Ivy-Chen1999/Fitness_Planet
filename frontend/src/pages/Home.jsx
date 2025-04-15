// src/pages/Home.jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL;
import { useEffect, useState } from "react";
import { useCurrentUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

function Home() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const [traineeStats, setTraineeStats] = useState(null);
  const [coachStats, setCoachStats] = useState([]);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) {
          setActivities(data.data);
        } else {
          setError("Failed to load activities");
        }
      } catch (err) {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    }

    async function fetchStats() {
      if (user?.role === 1) {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/stats/trainee`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) setTraineeStats(data.data);
      } else if (user?.role === 2) {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/stats/coach`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) setCoachStats(data.data);
      }
    }

    fetchActivities();
    fetchStats();
  }, [user]);

  const handleDelete = async (activityId) => {
    const confirmDelete = window.confirm("Are you sure to delete this course?");
    if (!confirmDelete) return;

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/${activityId}`, {
      method: "DELETE",
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
    } else {
      alert("Failed to delete activity");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🏠 Welcome to Fitness Planet</h2>

      {}
      {user?.role === 1 && traineeStats && (
        <div>
          <h3>📈 My Stats</h3>
          <p>
            Total: {traineeStats.summary.total_courses} | Completed: {traineeStats.summary.completed_courses} | Rate: {traineeStats.summary.completion_rate}%
          </p>
          <PieChart width={300} height={300}>
            <Pie
              data={[
                { name: "Completed", value: traineeStats.summary.completed_courses },
                { name: "Incomplete", value: traineeStats.summary.total_courses - traineeStats.summary.completed_courses }
              ]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label
            >
              <Cell fill="#00C49F" />
              <Cell fill="#FF8042" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      )}

      {}
      {user?.role === 2 && coachStats.length > 0 && (
        <div>
          <h3>📊 My Course Performance</h3>
          <BarChart width={600} height={300} data={coachStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="activity_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_participants" fill="#8884d8" name="Participants" />
            <Bar dataKey="completed_count" fill="#82ca9d" name="Completed" />
            <Bar dataKey="average_rating" fill="#ffc658" name="Rating" />
          </BarChart>
        </div>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <h2>📚 All Activities</h2>

      {user && user.role === 2 && (
        <button onClick={() => navigate("/add")} style={{ marginBottom: "1rem" }}>
          ➕ Add Course
        </button>
      )}

      {user?.role === 2 && (
        <button onClick={() => navigate("/my-courses")}>My Courses</button>
      )}

      {user && user.role === 1 && (
        <button onClick={() => navigate("/my-activities")} style={{ marginBottom: "1rem", marginLeft: "1rem" }}>
          📋 My Activities
        </button>
      )}

      {user && user.role === 1 && (
        <button onClick={() => navigate("/my-stats")} style={{ marginBottom: "1rem", marginLeft: "1rem" }}>
          📋 My Stats
        </button>
      )}

      {activities.length === 0 ? (
        <p>No activities available.</p>
      ) : (
        <ul>
          {activities.map((a) => (
            <li key={a.id}>
              <strong
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate(`/activity/${a.id}`)}
              >
                {a.name}
              </strong>{" "}
              — by {a.coach_name} at {a.time}
              {user?.role === 2 && a.coach_name === user.name && (
                <button onClick={() => handleDelete(a.id)} style={{ marginLeft: "1rem" }}>
                  🗑 Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;

