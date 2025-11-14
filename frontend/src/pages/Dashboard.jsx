import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { TrendingUp, TrendingDown, Wallet, Target, PieChart, BarChart3, Activity, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limitWarnings, setLimitWarnings] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [statsRes, limitsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/category-limits/check`)
      ]);
      setStats(statsRes.data);
      setLimitWarnings(limitsRes.data.warnings || []);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getCategoryColor = (index) => {
    const colors = [
      '#7c4dff', '#00bcd4', '#ff6b6b', '#00c853', '#ffa726',
      '#ab47bc', '#26c6da', '#ff7043', '#66bb6a', '#ffd54f'
    ];
    return colors[index % colors.length];
  };

  const getPercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <Card className="stat-card" data-testid={`stat-card-${title.toLowerCase().replace(' ', '-')}`}>
      <CardHeader className="stat-card-header">
        <div className="stat-icon" style={{ background: color }}>
          <Icon size={24} />
        </div>
        <CardTitle className="stat-title">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="stat-value" data-testid={`stat-value-${title.toLowerCase().replace(' ', '-')}`}>{value}</div>
        {trend && (
          <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Layout user={user} onLogout={onLogout} currentPage="dashboard">
      <div className="dashboard-container" data-testid="dashboard-page">
        <div className="dashboard-header">
          <h1 className="page-title" data-testid="dashboard-title">Welcome back, {user?.name}!</h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>

        {limitWarnings.length > 0 && (
          <Card className="limit-warnings-card">
            <CardHeader>
              <div className="card-title-wrapper">
                <AlertTriangle size={20} className="warning-icon" />
                <CardTitle>Budget Alert</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="limit-warnings-list">
                {limitWarnings.map((warning, index) => (
                  <div key={index} className="limit-warning-item">
                    <div>
                      <strong>{warning.category}</strong> has exceeded its limit!
                      <div className="warning-text">
                        Spent ₹{warning.spent.toFixed(2)} of ₹{warning.limit.toFixed(2)}
                      </div>
                    </div>
                    <div className="warning-badge">{warning.percentage.toFixed(0)}%</div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/settings')} className="settings-link">
                Manage Limits →
              </button>
            </CardContent>
          </Card>
        )}

        <div className="stats-grid">
          <StatCard
            title="Balance"
            value={formatCurrency(stats?.balance || 0)}
            icon={Wallet}
            color="linear-gradient(135deg, #7c4dff 0%, #536dfe 100%)"
          />
          <StatCard
            title="Income"
            value={formatCurrency(stats?.total_income || 0)}
            icon={TrendingUp}
            color="linear-gradient(135deg, #00c853 0%, #64dd17 100%)"
          />
          <StatCard
            title="Expenses"
            value={formatCurrency(stats?.total_expenses || 0)}
            icon={TrendingDown}
            color="linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)"
          />
          <StatCard
            title="Transactions"
            value={stats?.transaction_count || 0}
            icon={Target}
            color="linear-gradient(135deg, #00bcd4 0%, #2196f3 100%)"
          />
        </div>

        {/* Category Pie Chart Visualization */}
        {stats?.category_spending && Object.keys(stats.category_spending).length > 0 && (
          <div className="visualization-section">
            <Card className="chart-card">
              <CardHeader>
                <div className="card-title-wrapper">
                  <PieChart size={20} />
                  <CardTitle>Spending Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="pie-chart-container">
                  <div className="pie-chart">
                    {Object.entries(stats.category_spending)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([category, amount], index, array) => {
                        const total = array.reduce((sum, [, amt]) => sum + amt, 0);
                        const percentage = getPercentage(amount, total);
                        const rotation = array
                          .slice(0, index)
                          .reduce((sum, [, amt]) => sum + getPercentage(amt, total), 0);
                        
                        return (
                          <div
                            key={category}
                            className="pie-slice"
                            style={{
                              '--percentage': percentage,
                              '--rotation': rotation,
                              '--color': getCategoryColor(index)
                            }}
                          />
                        );
                      })}
                  </div>
                  <div className="pie-chart-legend">
                    {Object.entries(stats.category_spending)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([category, amount], index) => {
                        const total = Object.values(stats.category_spending).reduce((a, b) => a + b, 0);
                        return (
                          <div key={category} className="legend-item">
                            <div 
                              className="legend-color" 
                              style={{ background: getCategoryColor(index) }}
                            />
                            <div className="legend-info">
                              <span className="legend-category">{category}</span>
                              <span className="legend-amount">
                                {formatCurrency(amount)} ({getPercentage(amount, total)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="chart-card">
              <CardHeader>
                <div className="card-title-wrapper">
                  <BarChart3 size={20} />
                  <CardTitle>Category Breakdown</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bar-chart-container">
                  {Object.entries(stats.category_spending)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([category, amount], index) => {
                      const maxAmount = Math.max(...Object.values(stats.category_spending));
                      const barWidth = getPercentage(amount, maxAmount);
                      
                      return (
                        <div key={category} className="bar-chart-item">
                          <div className="bar-label">
                            <span className="bar-category">{category}</span>
                            <span className="bar-amount">{formatCurrency(amount)}</span>
                          </div>
                          <div className="bar-container">
                            <div 
                              className="bar-fill" 
                              style={{ 
                                width: `${barWidth}%`,
                                background: getCategoryColor(index)
                              }}
                            >
                              <span className="bar-percentage">{getPercentage(amount, stats.total_expenses)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Income vs Expense Comparison */}
        <Card className="comparison-card">
          <CardHeader>
            <div className="card-title-wrapper">
              <Activity size={20} />
              <CardTitle>Financial Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="comparison-container">
              <div className="comparison-item">
                <div className="comparison-header">
                  <TrendingUp size={18} className="comparison-icon income" />
                  <span>Total Income</span>
                </div>
                <div className="comparison-amount income">
                  {formatCurrency(stats?.total_income || 0)}
                </div>
                <div className="comparison-bar">
                  <div 
                    className="comparison-fill income"
                    style={{ 
                      width: `${getPercentage(stats?.total_income || 0, (stats?.total_income || 0) + (stats?.total_expenses || 0))}%` 
                    }}
                  />
                </div>
              </div>
              <div className="comparison-item">
                <div className="comparison-header">
                  <TrendingDown size={18} className="comparison-icon expense" />
                  <span>Total Expenses</span>
                </div>
                <div className="comparison-amount expense">
                  {formatCurrency(stats?.total_expenses || 0)}
                </div>
                <div className="comparison-bar">
                  <div 
                    className="comparison-fill expense"
                    style={{ 
                      width: `${getPercentage(stats?.total_expenses || 0, (stats?.total_income || 0) + (stats?.total_expenses || 0))}%` 
                    }}
                  />
                </div>
              </div>
              <div className="comparison-result">
                <div className="result-label">Net Balance</div>
                <div className={`result-amount ${(stats?.balance || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(stats?.balance || 0)}
                </div>
                <div className="result-description">
                  {(stats?.balance || 0) >= 0 ? '🎉 Great job! You\'re saving money' : '⚠️ Spending more than earning'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="dashboard-grid">
          <Card className="recent-transactions-card" data-testid="recent-transactions-card">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recent_transactions && stats.recent_transactions.length > 0 ? (
                <div className="transactions-list">
                  {stats.recent_transactions.map((transaction, index) => (
                    <div key={index} className="transaction-item" data-testid={`transaction-item-${index}`}>
                      <div className="transaction-info">
                        <div className="transaction-category">{transaction.category}</div>
                        <div className="transaction-description">{transaction.description}</div>
                      </div>
                      <div className={`transaction-amount ${transaction.type}`} data-testid={`transaction-amount-${index}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" data-testid="no-transactions-message">
                  <p>No transactions yet</p>
                  <button onClick={() => navigate('/transactions')} className="empty-state-btn">
                    Add your first transaction
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="category-card" data-testid="category-spending-card">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.category_spending && Object.keys(stats.category_spending).length > 0 ? (
                <div className="category-list">
                  {Object.entries(stats.category_spending)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, amount], index) => (
                      <div key={index} className="category-item" data-testid={`category-item-${index}`}>
                        <div className="category-name">{category}</div>
                        <div className="category-amount" data-testid={`category-amount-${index}`}>{formatCurrency(amount)}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No spending data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;