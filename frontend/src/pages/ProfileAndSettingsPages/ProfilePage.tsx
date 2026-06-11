import "../../styles/ProfileAndSettingsStyles/ProfileStyle.css";

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getFullName, logout as authLogout, isAdmin } from "../../auth";
import { ProfileAvatar } from "../../components/ProfileAvatar";

import {
  User,
  Settings,
  LogOut,
  X,
  Shield,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [showLogout, setShowLogout] = useState(false);
  const [fullName, setFullName] = useState(getFullName() || "User");
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const name = getFullName();
    if (name) setFullName(name);
    setAdmin(isAdmin());
  }, []);

  const handleLogout = () => {
    authLogout();
    window.location.reload();
  };

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header">
        <h2>Profile</h2>

        <button
          className="close-btn"
          onClick={() => navigate("/")}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* USER INFO */}
      <div className="profile-info">
        <h1>Hello, {fullName}.</h1>

        <ProfileAvatar name={fullName} size={115} />

        <div className="profile-buttons">
          <button
            className="gray-btn"
            aria-label="Change your name"
            onClick={() => navigate("/profile/edit")}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* MENU */}
      <div className="profile-menu">

        <div
          className="menu-item"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/profile/edit")}
        >
          <div className="menu-icon green-light">
            <User size={22} />
          </div>

          <span>Edit Profile</span>
        </div>

        <div className="divider"></div>

        <div
          className="menu-item"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/settings")}
        >
          <div className="menu-icon green-light">
            <Settings size={22} />
          </div>

          <span>Settings</span>
        </div>

        {admin && (
          <>
            <div className="divider"></div>

            <div
              className="menu-item"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/admin")}
            >
              <div className="menu-icon green-light">
                <Shield size={22} />
              </div>

              <span>Admin Panel</span>
            </div>
          </>
        )}

        <div className="divider"></div>

        <div
          className="menu-item"
          role="button"
          tabIndex={0}
          onClick={() => setShowLogout(true)}
        >
          <div className="menu-icon red-light">
            <LogOut size={22} />
          </div>

          <span>Logout</span>
        </div>

      </div>

      {/* LOGOUT MODAL */}
      {showLogout && (
        <div className="logout-modal">
          <div className="logout-sheet">

            <div className="logout-handle"></div>

            <h3>Logout?</h3>

            <p>Are you sure do you want to logout?</p>

            <div className="logout-actions">

              <button
                className="logout-no"
                onClick={() => setShowLogout(false)}
              >
                No
              </button>

              <button
                className="logout-yes"
                onClick={handleLogout}
              >
                Yes
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
