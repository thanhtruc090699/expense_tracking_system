import { useNavigate, useLocation } from 'react-router-dom';
import { getToken, redirectToLogin, logout } from '../auth';
import NavBar from './NavBar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleLogin = () => {
    redirectToLogin();
  };

  return (
    <div className="layout-container">
      <header className="mobile-header">
        <div className="header-left">
          <h1 className="header-title">BillBuddy</h1>
        </div>
        <div className="header-right">
          {token ? (
            <button className="header-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="header-btn primary" onClick={handleLogin}>
              Login
            </button>
          )}
        </div>
      </header>

      <main className="mobile-content">
        {children}
      </main>

      <NavBar />
    </div>
  );
}
