import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/ProfileAndSettingsStyles/CurrencyStyle.css";

  const languages = [
  { id: "EN", label: "English (EN)" },
  { id: "DE", label: "Germany (DE)" },
  { id: "AR", label: "Arabic (AR)" },
  { id: "RU", label: "Russian (RU)" },
  { id: "TR", label: "Turkish (TR)" },
  { id: "IT", label: "Italian (IT)" },
  { id: "FR", label: "French (FR)" },
  { id: "NL", label: "Dutch (NL)" },
];

export default function CurrencyPage() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(
    localStorage.getItem("language") || "EN"

  );

  const handleSelect = (id: string) => {
    setSelected(id);
    localStorage.setItem("language", id);
  };

  return (
    <div className="currency-page">

      {/* HEADER */}
      <div className="currency-header">
        <button
          className="back-btn"
          onClick={() => navigate("/settings")}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h2>Currency</h2>

        <div className="header-placeholder" />
      </div>

      {/* LIST */}
      <div className="currency-content">
        <div className="currency-group">
          {languages.map((c) => (
            <button
              key={c.id}
              className={`currency-item ${
                selected === c.id ? "selected" : ""
              }`}
              onClick={() => handleSelect(c.id)}
            >
              <span>{c.label}</span>

              {selected === c.id && (
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