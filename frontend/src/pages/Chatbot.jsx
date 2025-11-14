import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MessageCircle, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import './Chatbot.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Chatbot = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUserData();
    // Add welcome message
    setMessages([
      {
        role: 'assistant',
        content: `Hi ${user?.name}! 👋 I'm your AI financial assistant. I can help you understand your spending, give financial advice, and answer questions about your transactions. What would you like to know?`,
        timestamp: new Date()
      }
    ]);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserData = async () => {
    try {
      const [statsRes, transactionsRes, profileRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/transactions`),
        axios.get(`${API}/profile`)
      ]);
      setStats({
        ...statsRes.data,
        transactions: transactionsRes.data
      });
      if (profileRes.data.has_profile) {
        setUserProfile(profileRes.data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Prepare context about user's financial data
      const financialContext = stats ? `
User's Financial Summary:
- Balance: ₹${stats.balance?.toFixed(2) || 0}
- Total Income: ₹${stats.total_income?.toFixed(2) || 0}
- Total Expenses: ₹${stats.total_expenses?.toFixed(2) || 0}
- Number of Transactions: ${stats.transaction_count || 0}
- Top Spending Categories: ${Object.entries(stats.category_spending || {})
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([cat, amt]) => `${cat} (₹${amt.toFixed(2)})`)
  .join(', ')}

Recent Transactions:
${(stats.transactions || []).slice(0, 5).map(t => 
  `- ${t.type}: ₹${t.amount} on ${t.category} - ${t.description} (Mood: ${t.mood || 'N/A'})`
).join('\n')}
` : 'No financial data available yet.';

      const profileContext = userProfile ? `

User's Personal Profile:
- Monthly Income: ₹${userProfile.monthly_income || 'Not set'}
- Savings Goal: ₹${userProfile.savings_goal || 'Not set'}
- Primary Goal: ${userProfile.primary_goal || 'Not set'}
- Spending Triggers: ${userProfile.spending_triggers?.join(', ') || 'Not set'}
- Budget Priority: ${userProfile.budget_priority || 'Not set'}
- Financial Experience: ${userProfile.financial_experience || 'Not set'}

Tailor your advice based on their experience level and goals. If they're a beginner, keep explanations simple. If advanced, provide detailed analysis.
` : '';

      const response = await axios.post(`${API}/chatbot/chat`, {
        message: inputMessage,
        context: financialContext + profileContext,
        conversation_history: messages.slice(-6).map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Make sure Ollama is running!');
      
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please make sure Ollama is running (run 'ollama serve' in terminal) and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "How am I doing financially?",
    "What are my biggest expenses?",
    "Give me tips to save money",
    "Analyze my spending patterns"
  ];

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <Layout user={user} onLogout={onLogout} currentPage="chatbot">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <div className="header-content">
            <div className="header-icon">
              <MessageCircle size={32} />
            </div>
            <div>
              <h1 className="page-title">AI Financial Assistant</h1>
              <p className="page-subtitle">Chat with AI about your finances</p>
            </div>
          </div>
          <div className="ai-badge">
            <Sparkles size={16} />
            <span>Powered by Ollama</span>
          </div>
        </div>

        <Card className="chat-card">
          <CardContent className="chat-content">
            <div className="messages-container">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                >
                  <div className="message-avatar">
                    {message.role === 'user' ? (
                      <User size={20} />
                    ) : (
                      <Bot size={20} />
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{message.content}</div>
                    <div className="message-timestamp">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="message assistant-message">
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="suggested-questions">
                <p className="suggested-title">Try asking:</p>
                <div className="suggestions-grid">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="suggestion-btn"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="input-container">
              <textarea
                className="chat-input"
                placeholder="Ask me anything about your finances..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                rows={1}
              />
              <Button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
              >
                {loading ? (
                  <Loader2 size={20} className="spin" />
                ) : (
                  <Send size={20} />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Chatbot;
