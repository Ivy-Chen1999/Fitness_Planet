import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCurrentUser } from "../contexts/UserContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function ActivityDetail() {
  const { id } = useParams();
  const { user } = useCurrentUser();
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [feedbackMap, setFeedbackMap] = useState({});

  const fetchDetail = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/activities/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setActivity(data.data);
      } else {
        setError("Activity not found.");
      }
    } catch (err) {
      setError("Server error.");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (error) return <p className="text-danger text-center mt-5">{error}</p>;
  if (!activity) return <p className="text-center mt-5">Loading...</p>;

  const { info, participation, reviews } = activity;

  const handleJoin = async () => {
    const res = await fetch(`${API_BASE}/api/activities/${id}/join`, {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();
    alert(data.message || (data.success ? "Joined!" : "Join failed"));
    if (data.success) fetchDetail();
  };

  const handleComplete = async () => {
    const res = await fetch(`${API_BASE}/api/activities/${id}/complete`, {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();
    alert(data.message || (data.success ? "Completed!" : "Failed to mark complete"));
    if (data.success) fetchDetail();
  };

  const handleReview = async () => {
    const res = await fetch(`${API_BASE}/api/activities/${id}/review`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars, comment })
    });
    const data = await res.json();
    alert(data.message || (data.success ? "Review submitted!" : "Review failed"));
    if (data.success) {
      setComment("");
      fetchDetail();
    }
  };

  const handleFeedback = async (traineeId) => {
    const feedbackText = feedbackMap[traineeId];
    if (!feedbackText || feedbackText.trim().length === 0) {
      alert("Feedback cannot be empty");
      return;
    }

    const res = await fetch(`${API_BASE}/api/activities/${id}/feedback`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainee_id: traineeId, feedback: feedbackText })
    });

    const data = await res.json();
    alert(data.message || (data.success ? "Feedback submitted" : "Failed"));

    if (data.success) {
      setFeedbackMap((prev) => ({ ...prev, [traineeId]: "" }));
      fetchDetail();
    }
  };

  return (
    <div className="container py-4">
      <div className="card p-4 shadow-sm">
        <h2 style={{ color: "#6f42c1" }}>{info.name}</h2>
        <p><strong>Time:</strong> {info.time}</p>
        <p><strong>Coach:</strong> {info.coach_name}</p>
        <p><strong>Description:</strong> {info.description}</p>

        <hr />

        <h4>Participants</h4>
        <ul className="list-group mb-4">
          {participation.map((p) => (
            <li key={p.id} className="list-group-item">
              {p.name} — {p.completed ? "✅ Completed" : "❌ Not yet"}

              {user?.role === 2 && info.coach_name === user.name && (
                <div className="mt-2">
                  <textarea
                    className="form-control mb-2"
                    placeholder="Write feedback"
                    value={feedbackMap[p.id] || ""}
                    onChange={(e) =>
                      setFeedbackMap((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                    rows={2}
                  />
                  <button
                    className="btn btn-sm"
                    style={{ backgroundColor: "#6f42c1", color: "white" }}
                    onClick={() => handleFeedback(p.id)}
                  >
                    ✍️ Submit Feedback
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <h4>Reviews</h4>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <ul className="list-group mb-4">
            {reviews.map((r, i) => (
              <li key={i} className="list-group-item">
                ⭐ {r.stars} — {r.trainee_name}: {r.comment}
              </li>
            ))}
          </ul>
        )}

        {user?.role === 1 && (
          <div className="mt-4">
            <div className="d-flex flex-wrap gap-2 mb-3">
              <button
                className="btn"
                style={{ backgroundColor: "#6f42c1", color: "white" }}
                onClick={handleJoin}
              >
                ✅ Join
              </button>
              <button
                className="btn btn-outline-success"
                onClick={handleComplete}
              >
                ✔️ Mark as Completed
              </button>
            </div>

            <h5>Write a Review</h5>
            <input
              type="number"
              min="1"
              max="5"
              value={stars}
              onChange={(e) => setStars(Number(e.target.value))}
              className="form-control mb-2"
              placeholder="Stars (1-5)"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-control mb-2"
              placeholder="Write your comment"
              rows={3}
            />
            <button
              className="btn"
              style={{ backgroundColor: "#6f42c1", color: "white" }}
              onClick={handleReview}
            >
              📝 Submit Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityDetail;
