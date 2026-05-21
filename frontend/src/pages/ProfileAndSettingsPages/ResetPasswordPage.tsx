import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/ProfileAndSettingsStyles/ResetPasswordStyle.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    console.log({ currentPassword, newPassword });
    navigate("/settings");
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-header">
        <button className="back-btn" onClick={() => navigate("/settings")}>
          <ArrowLeft size={24} />
        </button>

        <h2>Reset Password</h2>

        <div className="header-placeholder" />
      </div>

      <div className="reset-password-content">
        <label>Current Password</label>
        <input
          type="password"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <label>Confirm New Password</label>
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="reset-save-btn" onClick={handleSave}>
          Save Password
        </button>
      </div>

      <NavBar />
    </div>
  );
}