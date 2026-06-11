import billbuddyLogo from "../assets/billbuddy.svg";
import "../styles/LoginPage.css";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <img src={billbuddyLogo} alt="BillBuddy" className="login-logo" />
          <div className="login-brand-text">
            <span className="brand-title">Bill</span>
            <span className="brand-title-highlight">Buddy</span>
          </div>
        </div>

        <h1 className="login-welcome">Welcome Back!</h1>
        <p className="login-subtitle">Sign in to manage your expenses</p>

        <button className="login-button" onClick={onLogin}>
          Sign In with Keycloak
        </button>
      </div>
    </div>
  );
}
