import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/ProfileAndSettingsStyles/CurrencyStyle.css";

const currencies = [
  { id: "USD", label: "United States (USD)" },
  { id: "EUR", label: "Germany (EUR)" },
  { id: "RUB", label: "Russia (RUB)" },
  { id: "SAR", label: "Saudi Arabia (SAR)" },
  { id: "TL", label: "Turkey (TL)" },
];

export default function CurrencyPage() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(
    localStorage.getItem("currency") || "USD"
  );

  const handleSelect = (id: string) => {
    setSelected(id);
    localStorage.setItem("currency", id);
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
          {currencies.map((c) => (
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