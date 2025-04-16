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

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
        const res = await fetch(`${API_BASE}/api/activities/`, {
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
        const res = await fetch(`${API_BASE}/api/stats/trainee`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) setTraineeStats(data.data);
      } else if (user?.role === 2) {
        const res = await fetch(`${API_BASE}/api/stats/coach`, {
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

    const res = await fetch(`${API_BASE}/api/activities/${activityId}`, {
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

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <>
      <div className="container py-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-center mb-4 text-primary">Welcome to Fitness Planet!</h2>

          {user?.role === 1 && traineeStats && (
            <div className="card mb-4 p-3">
              <h4 className="card-title">My Activity Stats</h4>
              <p>
                Total: <strong>{traineeStats.summary.total_courses}</strong> | Completed:{" "}
                <strong>{traineeStats.summary.completed_courses}</strong> | Rate:{" "}
                <strong>{traineeStats.summary.completion_rate}%</strong>
              </p>
              <div className="d-flex justify-content-center">
                <PieChart width={300} height={300}>
                  <Pie
                    data={[
                      {
                        name: "Completed",
                        value: traineeStats.summary.completed_courses
                      },
                      {
                        name: "Incomplete",
                        value:
                          traineeStats.summary.total_courses -
                          traineeStats.summary.completed_courses
                      }
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
            </div>
          )}

          {user?.role === 2 && coachStats.length > 0 && (
            <div className="card mb-4 p-3">
              <h4 className="card-title">My Course Performance</h4>
              <div className="d-flex justify-content-center">
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
            </div>
          )}

          <div className="mb-4 d-flex gap-2 flex-wrap">
            {user?.role === 2 && (
              <>
                <button
                  className="btn"
                  style={{ backgroundColor: "#6f42c1", color: "white" }}
                  onClick={() => navigate("/add")}
                >
                  ➕ Add Course
                </button>
                <button
                  className="btn btn-outline-primary"
                  style={{ borderColor: "#6f42c1", color: "#6f42c1" }}
                  onClick={() => navigate("/my-courses")}
                >
                  My Courses
                </button>
              </>
            )}
            {user?.role === 1 && (
              <>
                <button
                  className="btn btn-outline-primary"
                  style={{ borderColor: "#6f42c1", color: "#6f42c1" }}
                  onClick={() => navigate("/my-activities")}
                >
                  My Activities
                </button>
                <button
                  className="btn btn-outline-primary"
                  style={{ borderColor: "#6f42c1", color: "#6f42c1" }}
                  onClick={() => navigate("/my-stats")}
                >
                  My Stats
                </button>
              </>
            )}
          </div>

          <h4 className="mb-3">All Activities</h4>

          {activities.length === 0 ? (
            <p>No activities available.</p>
          ) : (
            <div className="row">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className="col-md-6 mb-4"
                  onClick={() => navigate(`/activity/${a.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="card card-hover h-100 shadow-sm border-0"
                    style={{ transition: "transform 0.2s" }}
                  >
                    <div className="card-body">
                      <h5 className="card-title text-primary">{a.name}</h5>
                      <p className="card-text text-muted mb-1"> Coach: {a.coach_name}</p>
                      <p className="card-text text-muted">⏰ {new Date(a.time).toLocaleString()}</p>
                    </div>
                    {user?.role === 2 && a.coach_name === user.name && (
                      <div className="card-footer bg-white border-top-0 d-flex justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(a.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {}
      <div className="text-center mt-5 mb-3">
        <img
          src="/meme.png"
          alt="fun meme"
          className="img-fluid rounded"
          style={{ maxWidth: "400px" }}
        />
      </div>

      {}
      <div className="text-center text-muted mb-5" style={{ fontSize: "0.9rem" }}>
        Made with 💜 by <strong>Ivy Chen</strong>
      </div>
    </>
  );
}

export default Home;
