import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminPage.css";
import { getToken } from "../auth";
import { X } from "lucide-react";

interface User {
  id: string;
  keycloakId: string;
  email: string;
  username: string | null;
  currency: string | null;
  userAvatar: string | null;
  createdAt: string;
}

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? "";

export default function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const token = getToken();
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${ALLOWED_HOST}:3000/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError("Access denied. Admin role required.");
        } else {
          setError(`Failed to fetch users: ${res.status}`);
        }
        return;
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <button className="close-btn" onClick={() => navigate("/profile")}>
            <X size={18} />
          </button>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <button className="close-btn" onClick={() => navigate("/profile")}>
          <X size={18} />
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Currency</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username || "-"}</td>
                  <td>{user.email}</td>
                  <td>{user.currency || "-"}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
