import "../../styles/ProfileAndSettingsStyles/ProfileStyle.css";

import profileImg from "../../assets/profilbild.jpg";
import NavBar from "../../components/NavBar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  User,
  Settings,
  LogOut,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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
        <h1>Hallo, User.</h1>

        <img
          src={profileImg}
          alt="Profile"
          className="profile-image"
        />

        <div className="profile-buttons">
          <button
            className="green-btn"
            aria-label="Change profile picture"
          >
            Change picture
          </button>

          <button
            className="gray-btn"
            aria-label="Change your name"
          >
            Change name
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

      <NavBar />
    </div>
  );
}