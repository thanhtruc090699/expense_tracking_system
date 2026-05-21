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
      // TODO: Add API call to save profile
      console.log("Saving profile:", { fullName });
      // Simulating API call
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
    <div className="edit-profile-page">
      
      {/* TOP NAVIGATION */}
      <div className="edit-profile-header">
        <button 
          className="back-btn"
          onClick={() => navigate("/profile")}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h2>Edit Profile</h2>

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
          className="camera-btn"
          aria-label="Change profile picture"
        >
          <Camera size={20} />
        </button>
      </div>

      {/* FORM */}
      <div className="edit-profile-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name:</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="form-input"
            placeholder="Enter your name"
          />
          <span className="form-helper">This is your display name.</span>
        </div>

        <button 
          className="save-btn"
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
