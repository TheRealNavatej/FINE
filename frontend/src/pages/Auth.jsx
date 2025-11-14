import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import './Auth.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      onLogin(response.data.token, response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container" data-testid="auth-page">
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="auth-content">
        <div className="auth-header">
          <div className="logo-container">
            <div className="logo-icon">F</div>
          </div>
          <h1 className="auth-title">FINE</h1>
          <p className="auth-subtitle">Finance Intelligent Ecosystem</p>
        </div>

        <Card className="auth-card" data-testid="auth-form-card">
          <CardHeader>
            <CardTitle data-testid="auth-form-title">{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription data-testid="auth-form-description">
              {isLogin ? 'Sign in to manage your finances' : 'Start your financial journey'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="form-group">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    data-testid="auth-input-name"
                  />
                </div>
              )}

              <div className="form-group">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="auth-input-email"
                />
              </div>

              <div className="form-group">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  data-testid="auth-input-password"
                />
              </div>

              <Button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
                data-testid="auth-submit-button"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>

              <div className="auth-toggle">
                <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="toggle-btn"
                  data-testid="auth-toggle-button"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;