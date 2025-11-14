import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Lightbulb, TrendingUp, Brain, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import './Insights.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Insights = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsRes, moodRes] = await Promise.all([
        axios.get(`${API}/transactions`),
        axios.get(`${API}/insights/mood-analysis`)
      ]);
      setTransactions(transactionsRes.data);
      setMoodAnalysis(moodRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const generateInsights = async () => {
    if (transactions.length === 0) {
      toast.error('Add some transactions first to get insights!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/insights/analyze`, {
        context: 'Please analyze my spending patterns and provide personalized financial advice.',
        transactions: transactions.slice(0, 20)
      });
      setAiInsight(response.data.insight);
      toast.success('AI insights generated!');
    } catch (error) {
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: '#00c853',
      calm: '#00bcd4',
      sad: '#ff6b6b',
      stressed: '#ff9800',
      neutral: '#9e9e9e'
    };
    return colors[mood] || colors.neutral;
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      calm: '😌',
      sad: '😔',
      stressed: '😰',
      neutral: '😐'
    };
    return emojis[mood] || emojis.neutral;
  };

  return (
    <Layout user={user} onLogout={onLogout} currentPage="insights">
      <div className="insights-container" data-testid="insights-page">
        <div className="insights-header">
          <div>
            <h1 className="page-title" data-testid="insights-title">AI-Powered Insights</h1>
            <p className="page-subtitle">Understand your financial behavior with emotional intelligence</p>
          </div>
          <Button
            onClick={generateInsights}
            disabled={loading}
            className="generate-btn"
            data-testid="generate-insights-button"
          >
            {loading ? (
              <>
                <div className="btn-loader"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Insights
              </>
            )}
          </Button>
        </div>

        <div className="insights-grid">
          {aiInsight && (
            <Card className="ai-insight-card" data-testid="ai-insight-card">
              <CardHeader>
                <div className="card-title-wrapper">
                  <div className="card-icon ai-icon">
                    <Brain size={24} />
                  </div>
                  <CardTitle>AI Financial Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="ai-insight-content" data-testid="ai-insight-content">
                  {aiInsight.split('\n').map((paragraph, index) => (
                    paragraph.trim() && <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!aiInsight && (
            <Card className="prompt-card" data-testid="prompt-card">
              <CardContent className="prompt-content">
                <div className="prompt-icon">
                  <Lightbulb size={48} />
                </div>
                <h2>Get Personalized Insights</h2>
                <p>Click "Generate Insights" to get AI-powered financial advice based on your spending patterns and emotional behavior.</p>
                <ul className="insights-features">
                  <li>
                    <TrendingUp size={16} />
                    <span>Spending pattern analysis</span>
                  </li>
                  <li>
                    <Brain size={16} />
                    <span>Emotional spending insights</span>
                  </li>
                  <li>
                    <Sparkles size={16} />
                    <span>Personalized recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          {moodAnalysis && Object.keys(moodAnalysis.mood_spending).length > 0 && (
            <Card className="mood-analysis-card" data-testid="mood-analysis-card">
              <CardHeader>
                <div className="card-title-wrapper">
                  <div className="card-icon mood-icon">
                    <Brain size={24} />
                  </div>
                  <CardTitle>Mood-Based Spending</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mood-spending-list">
                  {Object.entries(moodAnalysis.mood_spending)
                    .sort((a, b) => b[1] - a[1])
                    .map(([mood, amount], index) => (
                      <div key={mood} className="mood-item" data-testid={`mood-item-${index}`}>
                        <div className="mood-info">
                          <span className="mood-emoji">{getMoodEmoji(mood)}</span>
                          <span className="mood-name">{mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
                        </div>
                        <div className="mood-bar-container">
                          <div
                            className="mood-bar"
                            style={{
                              width: `${(amount / Math.max(...Object.values(moodAnalysis.mood_spending))) * 100}%`,
                              background: getMoodColor(mood)
                            }}
                          ></div>
                        </div>
                        <div className="mood-amount" data-testid={`mood-amount-${index}`}>{formatCurrency(amount)}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="tips-card" data-testid="tips-card">
            <CardHeader>
              <div className="card-title-wrapper">
                <div className="card-icon tips-icon">
                  <Lightbulb size={24} />
                </div>
                <CardTitle>Financial Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="tips-list">
                <div className="tip-item">
                  <div className="tip-number">1</div>
                  <div className="tip-content">
                    <h4>Track Your Emotions</h4>
                    <p>Notice patterns between your mood and spending habits. Awareness is the first step to change.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-number">2</div>
                  <div className="tip-content">
                    <h4>Set Clear Goals</h4>
                    <p>Having specific financial goals helps you stay motivated and make better spending decisions.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-number">3</div>
                  <div className="tip-content">
                    <h4>Review Regularly</h4>
                    <p>Check your insights weekly to identify trends and adjust your financial behavior accordingly.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Insights;