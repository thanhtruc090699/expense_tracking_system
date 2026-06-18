import "../../styles/ProfileAndSettingsStyles/EditProfileStyle.css";
import profileImg from "../../assets/profilbild.jpg";
import NavBar from "../../components/NavBar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Camera, ArrowLeft } from "lucide-react";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("user:in");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log("Saving profile:", { fullName });

      setTimeout(() => {
        navigate("/profile");
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error saving profile:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-profile-page bg-[#f5f6fa] text-[#101828] dark:bg-[#0f1f14] dark:text-[#f4fff6]">
      
      {/* TOP NAVIGATION */}
      <div className="edit-profile-header bg-white text-[#101828] dark:bg-[#182d1f] dark:text-[#f4fff6]">
        <button 
          className="back-btn bg-[#f0f1f4] text-[#101828] dark:bg-[#213826] dark:text-[#f4fff6]"
          onClick={() => navigate("/profile")}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h2 className="dark:text-[#f4fff6]">Edit Profile</h2>

        <div className="header-placeholder"></div>
      </div>

      {/* PROFILE IMAGE */}
      <div className="edit-profile-image-container">
        <img
          src={profileImg}
          alt="Profile"
          className="edit-profile-image"
        />

        <button 
          className="camera-btn bg-[#2d5b2d] text-white dark:bg-[#a7f3a1] dark:text-[#0f1f14]"
          aria-label="Change profile picture"
        >
          <Camera size={20} />
        </button>
      </div>

      {/* FORM */}
      <div className="edit-profile-form bg-white text-[#101828] dark:bg-[#182d1f] dark:text-[#f4fff6]">
        <div className="form-group">
          <label htmlFor="fullName" className="dark:text-[#f4fff6]">
            Full Name:
          </label>

          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="save-btn !mt-10 !w-full !rounded-2xl !bg-[#2f5f35] !py-4 !text-lg !font-bold !text-white hover:!bg-[#3d7544] disabled:!opacity-60"            placeholder="Enter your name"
          />

          <span className="form-helper text-[#667085] dark:text-[#c6d8c8]">
            This is your display name.
          </span>
        </div>

        <button 
          className="save-btn bg-[#2d5b2d] text-white dark:bg-[#2f5f35] dark:text-[#f4fff6]"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>

      <NavBar />
    </div>
  );
}