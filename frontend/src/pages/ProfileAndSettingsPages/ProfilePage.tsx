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
    <div className="profile-page bg-[#f5f6fa] text-[#101828] dark:bg-[#0f1f14] dark:text-[#f4fff6]">

      {/* HEADER */}
      <div className="profile-header bg-white text-[#101828] dark:bg-[#182d1f] dark:text-[#f4fff6]">
        <h2 className="dark:text-[#f4fff6]">Profile</h2>

        <button
          className="close-btn bg-[#f0f1f4] text-[#101828] dark:bg-[#213826] dark:text-[#f4fff6]"
          onClick={() => navigate("/")}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* USER INFO */}
      <div className="profile-info">
        <h1 className="text-[#101828] dark:text-[#f4fff6]">
          Hello, {fullName}.
        </h1>

        <ProfileAvatar name={fullName} size={115} />

        <div className="profile-buttons">
          <button
            className="gray-btn bg-[#2d2d2d] text-white dark:bg-[#2f5f35] dark:text-[#f4fff6]"
            aria-label="Change your name"
            onClick={() => navigate("/profile/edit")}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* MENU */}
      <div className="profile-menu bg-white text-[#101828] dark:bg-[#182d1f] dark:text-[#f4fff6]">

        <div
          className="menu-item dark:text-[#f4fff6]"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/profile/edit")}
        >
          <div className="menu-icon green-light dark:bg-[#2f5f35] dark:text-[#d9f99d]">
            <User size={22} />
          </div>

          <span>Edit Profile</span>
        </div>

        <div className="divider dark:bg-[#3f6548]"></div>

        <div
          className="menu-item dark:text-[#f4fff6]"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/settings")}
        >
          <div className="menu-icon green-light dark:bg-[#2f5f35] dark:text-[#d9f99d]">
            <Settings size={22} />
          </div>

          <span>Settings</span>
        </div>

        {admin && (
          <>
            <div className="divider dark:bg-[#3f6548]"></div>

            <div
              className="menu-item dark:text-[#f4fff6]"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/admin")}
            >
              <div className="menu-icon green-light dark:bg-[#2f5f35] dark:text-[#d9f99d]">
                <Shield size={22} />
              </div>

              <span>Admin Panel</span>
            </div>
          </>
        )}

        <div className="divider dark:bg-[#3f6548]"></div>

        <div
          className="menu-item dark:text-[#f4fff6]"
          role="button"
          tabIndex={0}
          onClick={() => setShowLogout(true)}
        >
          <div className="menu-icon red-light dark:bg-[#4a2525] dark:text-red-300">
            <LogOut size={22} />
          </div>

          <span>Logout</span>
        </div>

      </div>

      {/* LOGOUT MODAL */}
      {showLogout && (
        <div className="logout-modal">
          <div className="logout-sheet bg-white text-[#101828] dark:bg-[#182d1f] dark:text-[#f4fff6]">

            <div className="logout-handle dark:bg-[#c6d8c8]"></div>

            <h3 className="dark:text-[#f4fff6]">Logout?</h3>

            <p className="dark:text-[#c6d8c8]">
              Are you sure do you want to logout?
            </p>

            <div className="logout-actions">

              <button
                className="logout-no dark:bg-[#213826] dark:text-[#f4fff6]"
                onClick={() => setShowLogout(false)}
              >
                No
              </button>

              <button
                className="logout-yes dark:bg-red-500 dark:text-white"
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