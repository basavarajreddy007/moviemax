import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import "../../css/Admin.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    adminAPI.getUsers({ page, limit: 20, search })
      .then(({ data }) => { setUsers(data.data); setPagination(data.pagination); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch { toast.error("Failed to update role"); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success("User deleted");
      fetchUsers();
    } catch { toast.error("Failed to delete user"); }
  };

  return (
    <div className="a-page">
      <div className="a-page-header">
        <h1 className="a-page-title">Users</h1>
        <p className="a-page-sub">Manage accounts and roles</p>
      </div>

      <form onSubmit={handleSearch} className="a-search-row">
        <input
          type="text"
          className="um-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <button type="submit" className="a-btn-secondary">Search</button>
      </form>

      {loading ? (
        <div className="a-loading"><span className="a-spinner" /></div>
      ) : (
        <>
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="a-td-bold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`a-badge ${u.role === "admin" ? "a-badge--red" : "a-badge--dim"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`a-badge ${u.isVerified ? "a-badge--green" : "a-badge--dim"}`}>
                        {u.isVerified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="a-td-meta">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="a-action-row">
                        <button className="a-btn-sm a-btn-secondary" onClick={() => toggleRole(u._id, u.role)}>
                          → {u.role === "admin" ? "User" : "Admin"}
                        </button>
                        <button className="a-btn-sm a-btn-danger" onClick={() => deleteUser(u._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination?.pages > 1 && (
            <div className="a-pagination">
              <button className="a-btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span className="a-pagination-info">{page} / {pagination.pages}</span>
              <button className="a-btn-secondary" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
