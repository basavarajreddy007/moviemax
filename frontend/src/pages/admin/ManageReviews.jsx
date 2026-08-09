import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import "../../css/Admin.css";

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getReviews().then(({ data }) => setReviews(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await adminAPI.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success("Review deleted");
    } catch { toast.error("Failed to delete review"); }
  };

  return (
    <div className="a-page">
      <div className="a-page-header">
        <h1 className="a-page-title">Reviews</h1>
        <p className="a-page-sub">Moderate user-submitted reviews</p>
      </div>

      {loading ? (
        <div className="a-loading"><span className="a-spinner" /></div>
      ) : reviews.length === 0 ? (
        <div className="a-empty"><p>No reviews found</p></div>
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id}>
                  <td className="a-td-bold">{r.user?.name || "Anonymous"}</td>
                  <td><span className="a-badge a-badge--gold"> {r.rating}/10</span></td>
                  <td className="a-td-truncate">{r.review}</td>
                  <td className="a-td-meta">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="a-btn-sm a-btn-danger" onClick={() => deleteReview(r._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
