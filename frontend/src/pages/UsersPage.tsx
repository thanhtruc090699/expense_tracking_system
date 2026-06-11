import { useState, useEffect } from 'react';
import { getToken } from '../auth';
import './UsersPage.css';

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

interface User {
  id: string;
  email: string;
  username: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = getToken();

  if (!token) {
    return (
      <div className="users-page">
        <h1>Users</h1>
        <p>Authentication required to view users</p>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${ALLOWED_HOST}:3000/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password) return;
    if (!token) return;
    setIsLoading(true);
    try {
      await fetch(`${ALLOWED_HOST}:3000/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username || undefined,
        }),
      });
      setFormData({ email: '', password: '', username: '' });
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    if (!token) return;
    try {
      await fetch(`${ALLOWED_HOST}:3000/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  if (loading) {
    return <div className="users-loading">Loading...</div>;
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <h1>Users</h1>
        <button className="add-user-btn" onClick={() => setIsModalOpen(true)}>
          Add User
        </button>
      </div>

      <div className="users-list">
        {users.length > 0 ? (
          users.map((user) => (
            <div className="user-card" key={user.id}>
              <div className="user-info">
                <span className="user-email">{user.email}</span>
                <span className="user-username">{user.username || 'No username'}</span>
                <span className="user-created">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                className="delete-user-btn"
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div className="users-empty">
            <p>No users found</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New User</h2>
            
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="modal-email">Email</label>
                <input
                  id="modal-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  className="modal-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="modal-username">Username</label>
                <input
                  id="modal-username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Optional"
                  className="modal-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="modal-password">Password</label>
                <input
                  id="modal-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="modal-input"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`modal-submit-btn ${isLoading ? 'loading' : ''}`}
                onClick={handleCreateUser}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
