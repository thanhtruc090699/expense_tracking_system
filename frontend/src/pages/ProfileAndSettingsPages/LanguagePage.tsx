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

export default function LanguagePage() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(
    localStorage.getItem("language") || "EN"
  );

  const handleSelect = (id: string) => {
    setSelected(id);
    localStorage.setItem("language", id);
  };

  return (
    <div className="currency-page !bg-[#f5f6fa] !text-[#101828] dark:!bg-[#0f1f14] dark:!text-[#f4fff6]">
      {/* HEADER */}
      <div className="currency-header !bg-white !text-[#101828] dark:!bg-[#182d1f] dark:!text-[#f4fff6]">
        <button
          className="back-btn !bg-[#f0f1f4] !text-[#101828] dark:!bg-[#213826] dark:!text-[#f4fff6]"
          onClick={() => navigate("/settings")}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h2 className="!text-[#101828] dark:!text-[#f4fff6]">Language</h2>

        <div className="header-placeholder" />
      </div>

      {/* LIST */}
      <div className="currency-content !bg-[#f5f6fa] dark:!bg-[#0f1f14]">
        <div className="currency-group">
          {languages.map((language) => (
            <button
              key={language.id}
              className={`currency-item !text-[#101828] dark:!border dark:!border-[#3f6548] dark:!text-[#f4fff6] ${
                selected === language.id
                  ? "!bg-[#2d5b2d] !text-white dark:!bg-[#2f5f35] dark:!text-[#f4fff6]"
                  : "!bg-[#dceeb0] dark:!bg-[#182d1f]"
              }`}
              onClick={() => handleSelect(language.id)}
            >
              <span>{language.label}</span>

              {selected === language.id && (
                <span className="check-circle !bg-[#0f1f14] dark:!bg-[#a7f3a1]">
                  <Check
                    size={16}
                    strokeWidth={3}
                    className="text-white dark:text-[#0f1f14]"
                  />
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