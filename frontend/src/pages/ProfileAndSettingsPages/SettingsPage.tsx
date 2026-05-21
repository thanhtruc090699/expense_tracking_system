
import "../../styles/ProfileAndSettingsStyles/SettingsStyle.css";
import NavBar from "../../components/NavBar";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();

  const settingsItems = [
    { id: "currency", label: "Currency" },
    { id: "language", label: "Language" },
    { id: "theme", label: "Theme" },
    { id: "reset-password", label: "Reset Password" },
  ];

  const infoItems = [
    { id: "about", label: "About" },
    { id: "help", label: "Help" },
  ];

  const handleSettingClick = (id: string) => {
  if (id === "currency") {
    navigate("/currency");
  }
  if (id === "language") {
  navigate("/language");
}
  if (id === "reset-password") {
    navigate("/reset-password");
  }
  if (id === "theme") {
  navigate("/theme");
}
};


  return (
    <div className="settings-page">
      
      {/* HEADER */}
      <div className="settings-header">
        <button 
          className="back-btn"
          onClick={() => navigate("/profile")}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h2>Settings</h2>

        <div className="header-placeholder"></div>
      </div>

      {/* SETTINGS ITEMS */}
      <div className="settings-content">
        <div className="settings-group">
          {settingsItems.map((item) => (
            <button
              key={item.id}
              className="settings-item"
              onClick={() => handleSettingClick(item.id)}
              aria-label={item.label}
            >
              <span>{item.label}</span>
              <ChevronRight size={24} />
            </button>
          ))}
        </div>

        <div className="settings-group info-group">
          {infoItems.map((item) => (
            <button
              key={item.id}
              className="settings-item"
              onClick={() => handleSettingClick(item.id)}
              aria-label={item.label}
            >
              <span>{item.label}</span>
              <ChevronRight size={24} />
            </button>
          ))}
        </div>
      </div>

      <NavBar />
    </div>
  );
}