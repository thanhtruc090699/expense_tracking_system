import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { MerchantsPage } from "./pages/MerchantsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { BudgetsPage } from "./pages/BudgetsPage";
import { EasyOcrPage } from "./pages/EasyOcrPage";
import { LisaChatPage } from "./pages/LisaChatPage";
import { DocsPage } from "./pages/DocsPage";

import SettingsPage from "./pages/ProfileAndSettingsPages/SettingsPage";
import CurrencyPage from "./pages/ProfileAndSettingsPages/CurrencyPage";
import ProfilePage from "./pages/ProfileAndSettingsPages/ProfilePage";
import EditProfilePage from "./pages/ProfileAndSettingsPages/EditProfilePage";
import LanguagePage from "./pages/ProfileAndSettingsPages/LanguagePage";
import ResetPasswordPage from "./pages/ProfileAndSettingsPages/ResetPasswordPage";
import ThemePage from "./pages/ProfileAndSettingsPages/ThemePage";

function App() {
  useEffect(() => {
  const theme = localStorage.getItem("theme");

  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Navigate to="/dashboard" replace /></Layout>} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/expenses" element={<Layout><ExpensesPage /></Layout>} />
        <Route path="/merchants" element={<Layout><MerchantsPage /></Layout>} />
        <Route path="/categories" element={<Layout><CategoriesPage /></Layout>} />
        <Route path="/budgets" element={<Layout><BudgetsPage /></Layout>} />
        <Route path="/ocr" element={<Layout><EasyOcrPage /></Layout>} />
        <Route path="/lisa" element={<Layout><LisaChatPage /></Layout>} />
        <Route path="/docs" element={<Layout><DocsPage /></Layout>} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/currency" element={<CurrencyPage />} />
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/theme" element={<ThemePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;