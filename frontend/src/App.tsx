import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { BillsPage } from "./pages/BillsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { EasyOcrPage } from "./pages/EasyOcrPage";
import { LoginPage } from "./pages/LoginPage";
import { UsersPage } from "./pages/UsersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout>
          <Navigate to="/dashboard" replace />
        </Layout>} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/bills" element={<Layout><BillsPage /></Layout>} />
        <Route path="/ocr" element={<Layout><EasyOcrPage /></Layout>} />
        <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
        <Route path="/users" element={<Layout><UsersPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;