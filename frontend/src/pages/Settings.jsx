import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Settings as SettingsIcon, DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import './Settings.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel'
];

const Settings = ({ user, onLogout }) => {
  const [limits, setLimits] = useState({});
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLimits();
    checkLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const response = await axios.get(`${API}/category-limits`);
      const limitsObj = {};
      response.data.limits.forEach(l => {
        limitsObj[l.category] = l.limit;
      });
      setLimits(limitsObj);
    } catch (error) {
      console.error('Failed to fetch limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLimits = async () => {
    try {
      const response = await axios.get(`${API}/category-limits/check`);
      setWarnings(response.data.warnings || []);
    } catch (error) {
      console.error('Failed to check limits:', error);
    }
  };

  const handleLimitChange = (category, value) => {
    setLimits(prev => ({
      ...prev,
      [category]: value === '' ? '' : parseFloat(value)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const limitsArray = Object.entries(limits)
        .filter(([_, limit]) => limit && limit > 0)
        .map(([category, limit]) => ({ category, limit }));

      await axios.post(`${API}/category-limits`, { limits: limitsArray });
      toast.success('Category limits saved!');
      checkLimits();
    } catch (error) {
      toast.error('Failed to save limits');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout} currentPage="settings">
      <div className="settings-container">
        <div className="settings-header">
          <div className="header-content">
            <div className="header-icon">
              <SettingsIcon size={32} />
            </div>
            <div>
              <h1 className="page-title">Settings</h1>
              <p className="page-subtitle">Manage your spending limits</p>
            </div>
          </div>
        </div>

        {warnings.length > 0 && (
          <Card className="warnings-card">
            <CardHeader>
              <div className="card-title-wrapper">
                <AlertTriangle size={20} className="warning-icon" />
                <CardTitle>Budget Warnings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="warnings-list">
                {warnings.map((warning, index) => (
                  <div key={index} className="warning-item">
                    <div className="warning-info">
                      <span className="warning-category">{warning.category}</span>
                      <span className="warning-details">
                        Spent ₹{warning.spent.toFixed(2)} of ₹{warning.limit.toFixed(2)} limit
                      </span>
                    </div>
                    <div className="warning-percentage">
                      {warning.percentage.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="limits-card">
          <CardHeader>
            <CardTitle>Monthly Category Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="limits-grid">
              {CATEGORIES.map((category) => (
                <div key={category} className="limit-item">
                  <Label htmlFor={category} className="limit-label">
                    {category}
                  </Label>
                  <div className="limit-input-wrapper">
                    <DollarSign size={18} className="dollar-icon" />
                    <Input
                      id={category}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="No limit"
                      value={limits[category] || ''}
                      onChange={(e) => handleLimitChange(category, e.target.value)}
                      className="limit-input"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="save-btn"
            >
              {saving ? 'Saving...' : 'Save Limits'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
