import { useState } from 'react';
import logo from '../assets/billbuddy.svg';
import './LoginPage.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { email, password });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="BillBuddy" className="login-logo" />
        
        <h1 className="login-title">Sign in to BillBuddy</h1>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="login-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="login-input"
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" />
              Remember me
            </label>
          </div>
          
          <button type="submit" className="login-submit-btn">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
