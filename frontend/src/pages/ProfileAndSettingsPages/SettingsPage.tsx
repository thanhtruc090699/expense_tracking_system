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
    if (id === "currency") navigate("/currency");
    if (id === "language") navigate("/language");
    if (id === "reset-password") navigate("/reset-password");
    if (id === "theme") navigate("/theme");
  };

  return (
    <div className="settings-page !bg-[#f5f6fa] !text-[#101828] dark:!bg-[#0f1f14] dark:!text-[#f4fff6]">
      
      {/* HEADER */}
      <div className="settings-header !bg-white !text-[#101828] dark:!bg-[#182d1f] dark:!text-[#f4fff6]">
        <button 
          className="back-btn !bg-[#f0f1f4] !text-[#101828] dark:!bg-[#213826] dark:!text-[#f4fff6]"
          onClick={() => navigate("/profile")}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h2 className="!text-[#101828] dark:!text-[#f4fff6]">Settings</h2>

        <div className="header-placeholder"></div>
      </div>

      {/* SETTINGS ITEMS */}
      <div className="settings-content !bg-[#f5f6fa] dark:!bg-[#0f1f14]">
        <div className="settings-group">
          {settingsItems.map((item) => (
            <button
              key={item.id}
              className="settings-item !bg-[#dceeb0] !text-[#101828] dark:!bg-[#182d1f] dark:!text-[#f4fff6] dark:!border dark:!border-[#3f6548]"
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
              className="settings-item !bg-[#dceeb0] !text-[#101828] dark:!bg-[#182d1f] dark:!text-[#f4fff6] dark:!border dark:!border-[#3f6548]"
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