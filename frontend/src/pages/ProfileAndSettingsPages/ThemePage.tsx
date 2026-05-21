import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/ProfileAndSettingsStyles/ThemeStyle.css";

const themes = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "Use device theme" },
];

export default function ThemePage() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    if (selected === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [selected]);

  const handleSelect = (id: string) => {
    setSelected(id);
    localStorage.setItem("theme", id);
  };

  return (
    <div className="theme-page">
      <div className="theme-header">
        <button
          className="back-btn"
          onClick={() => navigate("/settings")}
        >
          <ArrowLeft size={24} />
        </button>

        <h2>Theme</h2>

        <div className="header-placeholder" />
      </div>

      <div className="theme-content">
        <div className="theme-group">
          {themes.map((t) => (
            <button
              key={t.id}
              className={`theme-item ${
                selected === t.id ? "selected" : ""
              }`}
              onClick={() => handleSelect(t.id)}
            >
              <span>{t.label}</span>

              {selected === t.id && (
                <span className="check-circle">
                  <Check size={16} strokeWidth={3} color="#fff" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <NavBar />
    </div>
  );
}