import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Insights from './pages/Insights';
import Chatbot from './pages/Chatbot';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Axios interceptor for auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const [userRes, profileRes] = await Promise.all([
          axios.get(`${API}/auth/me`),
          axios.get(`${API}/profile`)
        ]);
        setUser(userRes.data);
        setIsAuthenticated(true);
        
        if (!profileRes.data.has_profile) {
          setNeedsOnboarding(true);
          setShowOnboarding(true);
        }
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    setShowOnboarding(true);
    setNeedsOnboarding(true);
  };

  const handleOnboardingComplete = async (profile) => {
    try {
      await axios.post(`${API}/profile`, {
        monthly_income: parseFloat(profile.monthlyIncome),
        savings_goal: parseFloat(profile.savingsGoal),
        primary_goal: profile.primaryGoal,
        spending_triggers: profile.spendingTriggers,
        budget_priority: profile.budgetPriority,
        risk_tolerance: profile.riskTolerance,
        financial_experience: profile.financialExperience
      });
      setShowOnboarding(false);
      setNeedsOnboarding(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (showOnboarding && isAuthenticated) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Auth onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/transactions"
          element={
            isAuthenticated ? (
              <Transactions user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/goals"
          element={
            isAuthenticated ? (
              <Goals user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/insights"
          element={
            isAuthenticated ? (
              <Insights user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/chatbot"
          element={
            isAuthenticated ? (
              <Chatbot user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated ? (
              <Settings user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;