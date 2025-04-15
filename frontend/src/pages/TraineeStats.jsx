const API_BASE = import.meta.env.VITE_API_BASE_URL;
import { useEffect, useState } from "react";
import { useCurrentUser } from "../contexts/UserContext";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Link } from "react-router-dom";

function TraineeStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const { user } = useCurrentUser();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/stats/trainee`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
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
  if (!stats) return <p>Loading...</p>;

  const pieData = [
    { name: "Completed", value: stats.summary.completed_courses },
    { name: "Incomplete", value: stats.summary.total_courses - stats.summary.completed_courses }
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 My Training Dashboard</h2>

      <div style={{ display: "flex", gap: "2rem" }}>
        <div style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
          backgroundColor: "#f0f9ff"
        }}>
          <p>
            📚 Total Courses: {stats.summary.total_courses}<br />
            ✅ Completed Courses: {stats.summary.completed_courses}<br />
            📈 Completion Rate: {stats.summary.completion_rate}%
          </p>
        </div>

        <PieChart width={300} height={300}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      <h3>📝 Course Completion List</h3>
      {stats.participation.length === 0 ? (
        <p>You haven't joined any courses yet.</p>
      ) : (
        <ul>
          {stats.participation.map((item, idx) => (
            <li key={idx}>
              {item.activity_name} — {item.completed ? "✅ Completed" : "❌ Incomplete"}
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: "2rem" }}>
        <Link to="/">← Back to Home</Link>
      </div>
    </div>
  );
}

export default TraineeStats;
