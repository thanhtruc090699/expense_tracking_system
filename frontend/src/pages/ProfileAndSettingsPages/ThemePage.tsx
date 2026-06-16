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
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (selected === "dark" || (selected === "system" && prefersDark)) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark-mode");
    }
  }, [selected]);

  const handleSelect = (id: string) => {
    setSelected(id);
    localStorage.setItem("theme", id);
  };

  return (
    <div className="theme-page !bg-[#f5f6fa] !text-[#101828] dark:!bg-[#0f1f14] dark:!text-[#f4fff6]">
      <div className="theme-header !bg-white !text-[#101828] dark:!bg-[#182d1f] dark:!text-[#f4fff6]">
        <button
          className="back-btn !bg-[#f0f1f4] !text-[#101828] dark:!bg-[#213826] dark:!text-[#f4fff6]"
          onClick={() => navigate("/settings")}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <h2 className="!text-[#101828] dark:!text-[#f4fff6]">
          Theme
        </h2>

        <div className="header-placeholder" />
      </div>

      <div className="theme-content !bg-[#f5f6fa] dark:!bg-[#0f1f14]">
        <div className="theme-group">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-item !text-[#101828] dark:!border dark:!border-[#3f6548] dark:!text-[#f4fff6] ${
               selected === theme.id
                  ? "!bg-[#dceeb0] !text-[#101828] dark:!bg-[#2f5f35] dark:!text-[#f4fff6]"
                  : "!bg-[#eef5d3] !text-[#101828] dark:!bg-[#182d1f] dark:!text-[#f4fff6]"
              }`}
              onClick={() => handleSelect(theme.id)}
            >
              <span>{theme.label}</span>

              {selected === theme.id && (
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