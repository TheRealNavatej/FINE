import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import './Transactions.css';

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
  'Travel',
  'Salary',
  'Investment',
  'Other'
];

const MOODS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '😔', label: 'Sad', value: 'sad' },
  { emoji: '😰', label: 'Stressed', value: 'stressed' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' }
];

const Transactions = ({ user, onLogout }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food & Dining',
    description: '',
    type: 'expense',
    mood: 'neutral'
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/transactions`, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Transaction added successfully!');
      setIsDialogOpen(false);
      setFormData({
        amount: '',
        category: 'Food & Dining',
        description: '',
        type: 'expense',
        mood: 'neutral'
      });
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMoodEmoji = (mood) => {
    return MOODS.find(m => m.value === mood)?.emoji || '😐';
  };

  return (
    <Layout user={user} onLogout={onLogout} currentPage="transactions">
      <div className="transactions-container" data-testid="transactions-page">
        <div className="transactions-header">
          <div>
            <h1 className="page-title" data-testid="transactions-title">Transactions</h1>
            <p className="page-subtitle">Track your income and expenses</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="add-transaction-btn" data-testid="add-transaction-button">
                <Plus size={20} />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="transaction-dialog" data-testid="transaction-dialog">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="transaction-form">
                <div className="form-group">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger data-testid="transaction-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    data-testid="transaction-amount-input"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger data-testid="transaction-category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="E.g., Lunch at restaurant"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    data-testid="transaction-description-input"
                  />
                </div>

                <div className="form-group">
                  <Label>How are you feeling?</Label>
                  <div className="mood-picker" data-testid="mood-picker">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        type="button"
                        className={`mood-btn ${formData.mood === mood.value ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, mood: mood.value })}
                        data-testid={`mood-${mood.value}`}
                      >
                        <span className="mood-emoji">{mood.emoji}</span>
                        <span className="mood-label">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="submit-btn" data-testid="transaction-submit-button">
                  Add Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="transactions-card" data-testid="transactions-list-card">
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="loading-container">
                <div className="loader"></div>
              </div>
            ) : transactions.length > 0 ? (
              <div className="transactions-table">
                {transactions.map((transaction, index) => (
                  <div key={transaction.id} className="transaction-row" data-testid={`transaction-row-${index}`}>
                    <div className="transaction-main">
                      <div className="transaction-mood">{getMoodEmoji(transaction.mood)}</div>
                      <div className="transaction-details">
                        <div className="transaction-desc" data-testid={`transaction-desc-${index}`}>{transaction.description}</div>
                        <div className="transaction-meta">
                          <span className="transaction-category">{transaction.category}</span>
                          <span className="transaction-date">{formatDate(transaction.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="transaction-actions">
                      <div className={`transaction-amount ${transaction.type}`} data-testid={`transaction-row-amount-${index}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="delete-btn"
                        data-testid={`delete-transaction-${index}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" data-testid="no-transactions-message">
                <p>No transactions yet</p>
                <p className="empty-subtitle">Start tracking by adding your first transaction</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Transactions;