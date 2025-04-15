const API_BASE = import.meta.env.VITE_API_BASE_URL;
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCurrentUser } from "../contexts/UserContext";

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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/${id}`, {
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

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!activity) return <p>Loading...</p>;

  const { info, participation, reviews } = activity;

  
  const handleJoin = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/${id}/join`, {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();
    alert(data.message || (data.success ? "Joined!" : "Join failed"));
    if (data.success) fetchDetail();
  };

  const handleComplete = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/${id}/complete`, {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();
    alert(data.message || (data.success ? "Completed!" : "Failed to mark complete"));
    if (data.success) fetchDetail();
  };

  const handleReview = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/${id}/review`, {
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

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/${id}/feedback`, {
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
    <div style={{ padding: "2rem" }}>
      <h2>{info.name}</h2>
      <p><strong>Time:</strong> {info.time}</p>
      <p><strong>Coach:</strong> {info.coach_name}</p>
      <p><strong>Description:</strong> {info.description}</p>

      <hr />

      <h3>Participants</h3>
      <ul>
        {participation.map((p) => (
          <li key={p.id} style={{ marginBottom: "1rem" }}>
            {p.name} — {p.completed ? "✅ Completed" : "❌ Not yet"}

            {}
            {user?.role === 2 && info.coach_name === user.name && (
              <div style={{ marginTop: "0.5rem" }}>
                <textarea
                  placeholder="Write feedback"
                  value={feedbackMap[p.id] || ""}
                  onChange={(e) =>
                    setFeedbackMap((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                  rows={2}
                  cols={40}
                />
                <br />
                <button onClick={() => handleFeedback(p.id)}>✍️ Submit Feedback</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <hr />

      <h3>Reviews</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul>
          {reviews.map((r, i) => (
            <li key={i}>
              ⭐ {r.stars} — {r.trainee_name}: {r.comment}
            </li>
          ))}
        </ul>
      )}

      {}
      {user?.role === 1 && (
        <div style={{ marginTop: "2rem" }}>
          <button onClick={handleJoin}>✅ Join</button>
          <button onClick={handleComplete} style={{ marginLeft: "1rem" }}>
            ✔️ Mark as Completed
          </button>

          <div style={{ marginTop: "1.5rem" }}>
            <h4>Write a Review</h4>
            <input
              type="number"
              min="1"
              max="5"
              value={stars}
              onChange={(e) => setStars(Number(e.target.value))}
              placeholder="Stars (1-5)"
            />
            <br />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment"
              rows={3}
              cols={40}
              style={{ marginTop: "0.5rem" }}
            />
            <br />
            <button onClick={handleReview} style={{ marginTop: "0.5rem" }}>
              📝 Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityDetail;
