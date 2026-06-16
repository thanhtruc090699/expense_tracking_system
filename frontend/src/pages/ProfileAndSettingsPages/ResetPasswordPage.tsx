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
    <div className="reset-password-page !bg-[#f5f6fa] !text-[#101828] dark:!bg-[#0f1f14] dark:!text-[#f4fff6]">
      <div className="reset-password-header !bg-white !text-[#101828] dark:!bg-[#182d1f] dark:!text-[#f4fff6]">
        <button
          className="back-btn !bg-[#f0f1f4] !text-[#101828] dark:!bg-[#213826] dark:!text-[#f4fff6]"
          onClick={() => navigate("/settings")}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h2 className="!text-[#101828] dark:!text-[#f4fff6]">
          Reset Password
        </h2>

        <div className="header-placeholder" />
      </div>

      <div className="reset-password-content !bg-white !text-[#101828] dark:!bg-[#182d1f] dark:!text-[#f4fff6]">
        <label className="!text-[#101828] dark:!text-[#f4fff6]">
          Current Password
        </label>

        <input
          type="password"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="!w-full !rounded-2xl !border-2 !border-[#d0d5dd] !bg-white !px-5 !py-4 !text-[#101828] !outline-none placeholder:!text-[#98a2b3] dark:!border-[#a7c9a8] dark:!bg-[#0f1f14] dark:!text-[#f4fff6] dark:placeholder:!text-[#c6d8c8] focus:!border-[#2f5f35] dark:focus:!border-[#d9f99d]"
        />

        <label className="!text-[#101828] dark:!text-[#f4fff6]">
          New Password
        </label>

        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="!w-full !rounded-2xl !border-2 !border-[#d0d5dd] !bg-white !px-5 !py-4 !text-[#101828] !outline-none placeholder:!text-[#98a2b3] dark:!border-[#a7c9a8] dark:!bg-[#0f1f14] dark:!text-[#f4fff6] dark:placeholder:!text-[#c6d8c8] focus:!border-[#2f5f35] dark:focus:!border-[#d9f99d]"
        />

        <label className="!text-[#101828] dark:!text-[#f4fff6]">
          Confirm New Password
        </label>

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="!w-full !rounded-2xl !border-2 !border-[#d0d5dd] !bg-white !px-5 !py-4 !text-[#101828] !outline-none placeholder:!text-[#98a2b3] dark:!border-[#a7c9a8] dark:!bg-[#0f1f14] dark:!text-[#f4fff6] dark:placeholder:!text-[#c6d8c8] focus:!border-[#2f5f35] dark:focus:!border-[#d9f99d]"
        />

        <button
          className="reset-save-btn !mt-8 !w-full !rounded-2xl !bg-[#2d5b2d] !py-4 !text-lg !font-bold !text-white hover:!bg-[#3d7544] dark:!bg-[#2f5f35] dark:!text-[#f4fff6]"
          onClick={handleSave}
        >
          Save Password
        </button>
      </div>

      <NavBar />
    </div>
  );
}