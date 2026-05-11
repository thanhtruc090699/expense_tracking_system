import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { MerchantsPage } from "./pages/MerchantsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { BudgetsPage } from "./pages/BudgetsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { EasyOcrPage } from "./pages/EasyOcrPage";
import { LoginPage } from "./pages/LoginPage";
import { UsersPage } from "./pages/UsersPage";
import { LisaChatPage } from "./pages/LisaChatPage";
import { DocsPage } from "./pages/DocsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout><Navigate to="/dashboard" replace /></Layout>} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/expenses" element={<Layout><ExpensesPage /></Layout>} />
        <Route path="/merchants" element={<Layout><MerchantsPage /></Layout>} />
        <Route path="/categories" element={<Layout><CategoriesPage /></Layout>} />
        <Route path="/budgets" element={<Layout><BudgetsPage /></Layout>} />
        <Route path="/ocr" element={<Layout><EasyOcrPage /></Layout>} />
        <Route path="/lisa" element={<Layout><LisaChatPage /></Layout>} />
        <Route path="/docs" element={<Layout><DocsPage /></Layout>} />
        <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
        <Route path="/users" element={<Layout><UsersPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;