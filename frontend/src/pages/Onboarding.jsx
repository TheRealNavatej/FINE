import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import './Onboarding.css';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    monthlyIncome: '',
    savingsGoal: '',
    primaryGoal: '',
    spendingTriggers: [],
    budgetPriority: '',
    riskTolerance: '',
    financialExperience: ''
  });

  const questions = [
    {
      id: 'income',
      title: 'What\'s your monthly income?',
      subtitle: 'This helps us understand your financial capacity',
      component: (
        <div className="question-content">
          <Label htmlFor="income">Monthly Income (₹)</Label>
          <Input
            id="income"
            type="number"
            placeholder="50000"
            value={profile.monthlyIncome}
            onChange={(e) => setProfile({ ...profile, monthlyIncome: e.target.value })}
            className="onboarding-input"
          />
        </div>
      )
    },
    {
      id: 'goal',
      title: 'What\'s your primary financial goal?',
      subtitle: 'We\'ll help you achieve this',
      component: (
        <div className="question-content">
          <div className="goal-options">
            {[
              { value: 'save', label: 'Build Savings', emoji: '💰' },
              { value: 'debt', label: 'Pay Off Debt', emoji: '💳' },
              { value: 'invest', label: 'Start Investing', emoji: '📈' },
              { value: 'purchase', label: 'Major Purchase', emoji: '🏠' },
              { value: 'emergency', label: 'Emergency Fund', emoji: '🆘' }
            ].map((goal) => (
              <button
                key={goal.value}
                className={`goal-option ${profile.primaryGoal === goal.value ? 'selected' : ''}`}
                onClick={() => setProfile({ ...profile, primaryGoal: goal.value })}
              >
                <span className="goal-emoji">{goal.emoji}</span>
                <span className="goal-label">{goal.label}</span>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'savings',
      title: 'How much do you want to save monthly?',
      subtitle: 'Set a realistic target',
      component: (
        <div className="question-content">
          <Label htmlFor="savings">Monthly Savings Goal (₹)</Label>
          <Input
            id="savings"
            type="number"
            placeholder="10000"
            value={profile.savingsGoal}
            onChange={(e) => setProfile({ ...profile, savingsGoal: e.target.value })}
            className="onboarding-input"
          />
          {profile.monthlyIncome && profile.savingsGoal && (
            <div className="savings-percentage">
              That\'s {((profile.savingsGoal / profile.monthlyIncome) * 100).toFixed(0)}% of your income
            </div>
          )}
        </div>
      )
    },
    {
      id: 'triggers',
      title: 'What triggers emotional spending for you?',
      subtitle: 'Select all that apply',
      component: (
        <div className="question-content">
          <div className="trigger-options">
            {[
              { value: 'stress', label: 'Stress', emoji: '😰' },
              { value: 'boredom', label: 'Boredom', emoji: '😑' },
              { value: 'celebration', label: 'Celebration', emoji: '🎉' },
              { value: 'sadness', label: 'Sadness', emoji: '😢' },
              { value: 'social', label: 'Social Pressure', emoji: '👥' },
              { value: 'none', label: 'None/Rare', emoji: '✅' }
            ].map((trigger) => (
              <button
                key={trigger.value}
                className={`trigger-option ${profile.spendingTriggers.includes(trigger.value) ? 'selected' : ''}`}
                onClick={() => {
                  const triggers = profile.spendingTriggers.includes(trigger.value)
                    ? profile.spendingTriggers.filter(t => t !== trigger.value)
                    : [...profile.spendingTriggers, trigger.value];
                  setProfile({ ...profile, spendingTriggers: triggers });
                }}
              >
                <span className="trigger-emoji">{trigger.emoji}</span>
                <span className="trigger-label">{trigger.label}</span>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'priority',
      title: 'What\'s most important in your budget?',
      subtitle: 'Choose your top priority',
      component: (
        <div className="question-content">
          <Select value={profile.budgetPriority} onValueChange={(value) => setProfile({ ...profile, budgetPriority: value })}>
            <SelectTrigger className="onboarding-select">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="savings">Maximizing Savings</SelectItem>
              <SelectItem value="balance">Balanced Lifestyle</SelectItem>
              <SelectItem value="experiences">Experiences & Enjoyment</SelectItem>
              <SelectItem value="security">Financial Security</SelectItem>
              <SelectItem value="freedom">Financial Freedom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      id: 'experience',
      title: 'How would you rate your financial knowledge?',
      subtitle: 'Be honest - we\'ll tailor advice to your level',
      component: (
        <div className="question-content">
          <div className="experience-options">
            {[
              { value: 'beginner', label: 'Beginner', desc: 'Just starting out' },
              { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
              { value: 'advanced', label: 'Advanced', desc: 'Well-versed in finance' }
            ].map((exp) => (
              <button
                key={exp.value}
                className={`experience-option ${profile.financialExperience === exp.value ? 'selected' : ''}`}
                onClick={() => setProfile({ ...profile, financialExperience: exp.value })}
              >
                <div className="exp-label">{exp.label}</div>
                <div className="exp-desc">{exp.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    onComplete(profile);
  };

  const isStepValid = () => {
    switch (step) {
      case 0: return profile.monthlyIncome;
      case 1: return profile.primaryGoal;
      case 2: return profile.savingsGoal;
      case 3: return profile.spendingTriggers.length > 0;
      case 4: return profile.budgetPriority;
      case 5: return profile.financialExperience;
      default: return false;
    }
  };

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <div className="onboarding-header">
          <div className="logo-section">
            <div className="logo-icon">F</div>
            <span className="logo-text">FINE</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-text">Step {step + 1} of {questions.length}</div>
          </div>
        </div>

        <Card className="question-card">
          <CardHeader>
            <div className="question-header">
              <Sparkles className="question-icon" size={24} />
              <CardTitle className="question-title">{currentQuestion.title}</CardTitle>
            </div>
            <p className="question-subtitle">{currentQuestion.subtitle}</p>
          </CardHeader>
          <CardContent>
            {currentQuestion.component}
          </CardContent>
        </Card>

        <div className="onboarding-actions">
          <Button
            onClick={handleBack}
            disabled={step === 0}
            variant="outline"
            className="back-btn"
          >
            <ArrowLeft size={20} />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="next-btn"
          >
            {step === questions.length - 1 ? (
              <>
                <Check size={20} />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight size={20} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
