# ⚡ FINE - Quick Start Guide

## 🎯 What is FINE?

**FINE (Finance Intelligent Ecosystem)** is a personal finance app that tracks your spending, understands your emotional behavior, and gives you AI-powered advice to improve your financial habits.

---

## 🚀 Get Started in 5 Minutes

### Step 1️⃣: Install Prerequisites

**Install these in order:**

1. **MongoDB** (Database)
   - Download: https://www.mongodb.com/try/download/community
   - Install with default settings
   - Verify: Open Command Prompt and run `mongosh`

2. **Python 3.8+** (Backend)
   - Download: https://www.python.org/downloads/
   - ✅ Check "Add Python to PATH" during installation
   - Verify: Run `python --version`

3. **Node.js 16+** (Frontend)
   - Download: https://nodejs.org/
   - Install LTS version
   - Verify: Run `node --version`

4. **Ollama** (FREE AI - Optional but recommended)
   - Download: https://ollama.ai/download
   - Install and run: `ollama pull llama2`
   - Verify: Run `ollama list` (should show llama2)

---

### Step 2️⃣: Run Automated Setup

```powershell
# Navigate to project folder
cd c:\FINE\FINE_CSP_final\fine-jain-main

# Run setup script
setup.bat
```

**This will:**
- ✅ Start MongoDB
- ✅ Check Ollama installation
- ✅ Create Python virtual environment
- ✅ Install all dependencies
- ✅ Set up configuration files

---

### Step 3️⃣: Start the Application

**Option A: Use Launcher Scripts (Easiest)**

Open TWO terminal windows:

**Terminal 1 - Backend:**
```powershell
start-backend.bat
```

**Terminal 2 - Frontend:**
```powershell
start-frontend.bat
```

**Option B: Manual Start**

**Terminal 1 - Backend:**
```powershell
cd backend
venv\Scripts\activate
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

---

### Step 4️⃣: Open the App

**Your browser should automatically open:**
http://localhost:3000

If not, manually navigate to that URL.

---

## ✨ First Time Setup

### 1. Create Your Account
- Click "Register" on the auth page
- Enter email, name, and password
- Click "Create Account"

### 2. Add Your First Transaction
- Navigate to "Transactions" (sidebar)
- Click "+ Add Transaction"
- Fill in:
  - Type: Expense
  - Amount: 50
  - Category: Food
  - Description: Lunch
  - Mood: Happy 😊
- Click "Add Transaction"

### 3. Set a Goal
- Navigate to "Goals"
- Click "+ Add Goal"
- Fill in:
  - Title: Emergency Fund
  - Target: 5000
  - Deadline: Select a future date
- Click "Create Goal"

### 4. Get AI Insights (Requires Ollama)
- Navigate to "Insights"
- Click "Generate Insights"
- Wait for AI to analyze your data
- Read personalized recommendations!

---

## 🎨 What Each Page Does

### 🏠 Dashboard
**What you see:**
- Current balance
- Total income and expenses
- Number of transactions
- Recent transactions list
- Top spending categories

**When to use:** Daily overview of your finances

---

### 💰 Transactions
**What you can do:**
- Add new income or expense entries
- Choose from categories (Food, Transport, Shopping, etc.)
- Tag with your current mood (Happy, Sad, Stressed, etc.)
- View all transaction history
- Delete mistakes

**When to use:** Every time you spend or earn money

---

### 🎯 Goals
**What you can do:**
- Create financial goals with deadlines
- Track progress toward each goal
- Update how much you've saved
- Delete achieved goals

**When to use:** Planning for future purchases or savings

---

### 🧠 Insights
**What you get:**
- AI-powered analysis of your spending
- Mood-based spending breakdown
- Emotional spending patterns
- Personalized recommendations
- Financial tips

**When to use:** Weekly or monthly to understand your habits

---

## 🔑 AI Setup - Two Options

### ✅ Option 1: FREE - Ollama (Recommended)

**Already installed Ollama? Great!** It's configured to work automatically.

**Not installed?**
1. Download from https://ollama.ai/download
2. Run: `ollama pull llama2`
3. Restart backend server

**Benefits:**
- ✅ Completely free
- ✅ No API keys
- ✅ Works offline
- ✅ Private (data stays on your computer)

---

### ❌ Option 2: PAID - Emergent API

**Only if you can't use Ollama:**

1. Get API key from Emergent AGI
2. Edit `backend/.env`:
```env
USE_OLLAMA=false
EMERGENT_LLM_KEY=your-api-key-here
```
3. Restart backend server

**Cons:** Costs money, requires internet, data sent to cloud

---

## 🛠️ Troubleshooting

### ❌ MongoDB Error
```
Error: Could not connect to MongoDB
```

**Fix:**
```powershell
net start MongoDB
# Or manually start MongoDB Compass
```

---

### ❌ Backend Won't Start
```
ModuleNotFoundError: No module named 'fastapi'
```

**Fix:**
```powershell
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

---

### ❌ Frontend Won't Start
```
Error: Cannot find module 'react'
```

**Fix:**
```powershell
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ AI Insights Not Working
```
Failed to generate insights
```

**Fix:**
1. Check if Ollama is running: `ollama list`
2. Start Ollama: `ollama serve`
3. Pull model: `ollama pull llama2`
4. Restart backend server

---

### ❌ Port Already in Use
```
Error: Port 8000 is already in use
```

**Fix:**
```powershell
# Find and kill the process
netstat -ano | findstr :8000
taskkill /PID <number> /F

# Or use a different port
uvicorn server:app --port 8001
```

---

## 📱 Using the App

### Daily Workflow

**Morning:**
- Open app → Dashboard → Check balance

**When you spend money:**
- Transactions → Add Transaction → Fill details → Note your mood

**Weekly:**
- Insights → Generate Insights → Read AI recommendations
- Goals → Update progress

**Monthly:**
- Review spending by category
- Adjust budget based on insights
- Set new goals

---

## 🎓 Pro Tips

1. **Tag Every Transaction with Mood**
   - More data = Better AI insights
   - Helps identify emotional spending triggers

2. **Be Consistent**
   - Log transactions immediately
   - Don't wait until end of day

3. **Review Insights Weekly**
   - AI needs data to learn patterns
   - After 2-3 weeks, insights become very personalized

4. **Set Realistic Goals**
   - Start small (e.g., $500 emergency fund)
   - Gradually increase targets

5. **Use Categories Consistently**
   - Helps identify spending patterns
   - Makes AI analysis more accurate

---

## 📊 Understanding Your Data

### Balance Calculation
```
Balance = Total Income - Total Expenses

Example:
Income: $3,000 (salary) + $200 (freelance) = $3,200
Expenses: $1,500 (rent) + $300 (food) + $200 (other) = $2,000
Balance: $3,200 - $2,000 = $1,200
```

### Mood Impact Example
```
When Stressed: $450 total spent (40% on food)
When Happy: $230 total spent (60% on experiences)
When Calm: $150 total spent (balanced)

AI Insight: "You spend 3x more when stressed. 
Try free stress-relief activities."
```

---

## 🔐 Security Notes

- **Passwords**: Encrypted with bcrypt (unhackable)
- **Sessions**: 24-hour JWT tokens (auto-logout after 1 day)
- **Data Privacy**: Only you can see your data
- **Local AI**: With Ollama, data never leaves your computer

---

## 📚 Additional Resources

- **Full Setup Guide**: See `SETUP_GUIDE.md`
- **Functionality Details**: See `FUNCTIONALITY_SUMMARY.md`
- **API Documentation**: http://localhost:8000/docs
- **Project Overview**: See `README.md`

---

## ✅ Checklist

Before you start using FINE, make sure:

- [ ] MongoDB is installed and running
- [ ] Python and Node.js are installed
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Ollama installed and llama2 model downloaded (optional)
- [ ] `.env` files exist in backend and frontend folders
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] You've created an account and logged in

---

## 🎉 You're Ready!

**Start tracking your finances with emotional intelligence!**

1. Add transactions daily
2. Tag them with your mood
3. Set financial goals
4. Get AI-powered insights
5. Improve your financial habits!

---

**Need Help?**

- Check `SETUP_GUIDE.md` for detailed instructions
- View API docs at http://localhost:8000/docs
- Check console logs for error messages

**Happy tracking! 💰🧠✨**
