import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CreditCard, Target, Lightbulb, MessageCircle, Settings, LogOut } from 'lucide-react';
import './Layout.css';

const Layout = ({ children, user, onLogout, currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/insights', label: 'Insights', icon: Lightbulb },
    { path: '/chatbot', label: 'AI Chat', icon: MessageCircle },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout-container" data-testid="layout-container">
      <aside className="sidebar" data-testid="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">F</div>
            <span className="logo-text">FINE</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info" data-testid="user-info">
            <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button onClick={onLogout} className="logout-btn" data-testid="logout-button">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content" data-testid="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;