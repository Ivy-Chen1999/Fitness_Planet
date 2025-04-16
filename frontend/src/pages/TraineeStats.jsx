import { useEffect, useState } from "react";
import { useCurrentUser } from "../contexts/UserContext";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function TraineeStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const { user } = useCurrentUser();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${API_BASE}/api/stats/trainee`, {
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

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  const pieData = [
    { name: "Completed", value: stats.summary.completed_courses },
    { name: "Incomplete", value: stats.summary.total_courses - stats.summary.completed_courses }
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4" style={{ color: "#6f42c1" }}>📊 My Training Dashboard</h2>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <p className="card-text">
                📚 <strong>Total Courses:</strong> {stats.summary.total_courses} <br />
                ✅ <strong>Completed Courses:</strong> {stats.summary.completed_courses} <br />
                📈 <strong>Completion Rate:</strong> {stats.summary.completion_rate}%
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 d-flex justify-content-center align-items-center">
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
      </div>

      <h4 className="mb-3">📝 Course Completion List</h4>
      {stats.participation.length === 0 ? (
        <p>You haven't joined any courses yet.</p>
      ) : (
        <ul className="list-group">
          {stats.participation.map((item, idx) => (
            <li
              key={idx}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {item.activity_name}
              <span className={item.completed ? "text-success" : "text-danger"}>
                {item.completed ? "✅ Completed" : "❌ Incomplete"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 text-center">
        <Link to="/" style={{ color: "#6f42c1", textDecoration: "none" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default TraineeStats;
