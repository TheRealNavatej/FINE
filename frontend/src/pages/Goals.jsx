import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { Plus, Trash2, Target } from 'lucide-react';
import { toast } from 'sonner';
import './Goals.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Goals = ({ user, onLogout }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    deadline: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API}/goals`);
      setGoals(response.data);
    } catch (error) {
      toast.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/goals`, {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        deadline: new Date(formData.deadline).toISOString()
      });
      toast.success('Goal created successfully!');
      setIsDialogOpen(false);
      setFormData({ title: '', target_amount: '', deadline: '' });
      fetchGoals();
    } catch (error) {
      toast.error('Failed to create goal');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/goals/${id}`);
      toast.success('Goal deleted');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to delete goal');
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
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Layout user={user} onLogout={onLogout} currentPage="goals">
      <div className="goals-container" data-testid="goals-page">
        <div className="goals-header">
          <div>
            <h1 className="page-title" data-testid="goals-title">Financial Goals</h1>
            <p className="page-subtitle">Set and track your financial milestones</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="add-goal-btn" data-testid="add-goal-button">
                <Plus size={20} />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="goal-dialog" data-testid="goal-dialog">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="goal-form">
                <div className="form-group">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="E.g., Emergency Fund"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="goal-title-input"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    step="0.01"
                    placeholder="10000.00"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    required
                    data-testid="goal-amount-input"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    data-testid="goal-deadline-input"
                  />
                </div>

                <Button type="submit" className="submit-btn" data-testid="goal-submit-button">
                  Create Goal
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        ) : goals.length > 0 ? (
          <div className="goals-grid" data-testid="goals-list">
            {goals.map((goal, index) => {
              const progress = calculateProgress(goal.current_amount, goal.target_amount);
              const daysRemaining = getDaysRemaining(goal.deadline);
              
              return (
                <Card key={goal.id} className="goal-card" data-testid={`goal-card-${index}`}>
                  <CardHeader className="goal-card-header">
                    <div className="goal-icon">
                      <Target size={24} />
                    </div>
                    <CardTitle className="goal-title" data-testid={`goal-title-${index}`}>{goal.title}</CardTitle>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="delete-goal-btn"
                      data-testid={`delete-goal-${index}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </CardHeader>
                  <CardContent className="goal-content">
                    <div className="goal-amounts">
                      <div className="current-amount">
                        <span className="amount-label">Current</span>
                        <span className="amount-value" data-testid={`goal-current-${index}`}>{formatCurrency(goal.current_amount)}</span>
                      </div>
                      <div className="target-amount">
                        <span className="amount-label">Target</span>
                        <span className="amount-value" data-testid={`goal-target-${index}`}>{formatCurrency(goal.target_amount)}</span>
                      </div>
                    </div>

                    <div className="progress-section">
                      <div className="progress-header">
                        <span className="progress-label">Progress</span>
                        <span className="progress-percentage" data-testid={`goal-progress-${index}`}>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="goal-progress" />
                    </div>

                    <div className="goal-footer">
                      <div className="deadline-info">
                        <span className="deadline-label">Deadline:</span>
                        <span className="deadline-date" data-testid={`goal-deadline-${index}`}>{formatDate(goal.deadline)}</span>
                      </div>
                      <div className={`days-remaining ${daysRemaining < 30 ? 'urgent' : ''}`} data-testid={`goal-days-${index}`}>
                        {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="empty-goals-card" data-testid="no-goals-message">
            <CardContent className="empty-state">
              <div className="empty-icon">
                <Target size={64} />
              </div>
              <h2>No Goals Yet</h2>
              <p>Start setting financial goals to track your progress</p>
              <Button onClick={() => setIsDialogOpen(true)} className="empty-action-btn">
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Goals;