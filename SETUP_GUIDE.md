# 🚀 FINE - Finance Intelligent Ecosystem Setup Guide

## Overview
FINE is a personal finance tracking application with emotional intelligence features, combining transaction tracking, goal setting, and AI-powered insights.

---

## 📋 Prerequisites

1. **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 16+** - [Download Node.js](https://nodejs.org/)
3. **MongoDB** - [Download MongoDB Community](https://www.mongodb.com/try/download/community)
4. **Ollama (FREE AI)** - [Download Ollama](https://ollama.ai/) (Optional but recommended for AI insights)

---

## 🛠️ Installation Steps

### 1️⃣ Install MongoDB

**Windows:**
```powershell
# Download and install from: https://www.mongodb.com/try/download/community
# Or use chocolatey:
choco install mongodb

# Start MongoDB service
net start MongoDB
```

**Verify MongoDB is running:**
```powershell
# Open MongoDB Shell
mongosh
# You should see the MongoDB connection prompt
```

### 2️⃣ Install Ollama (FREE AI - Recommended)

**Windows:**
```powershell
# Download from: https://ollama.ai/download
# Or install and pull the model:
ollama pull llama2
```

**Verify Ollama:**
```powershell
ollama --version
ollama list  # Should show llama2 model
```

### 3️⃣ Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
copy .env.example .env

# Edit .env file with your settings (default settings should work)
notepad .env
```

**Default `.env` configuration (uses FREE Ollama):**
```env
MONGO_URL=mongodb://localhost:27017/
DB_NAME=fine_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please
CORS_ORIGINS=http://localhost:3000
USE_OLLAMA=true
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama2
```

### 4️⃣ Frontend Setup

```powershell
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or if you prefer yarn:
# yarn install

# Create .env file from example
copy .env.example .env

# Edit .env file (default should work)
notepad .env
```

**Default frontend `.env`:**
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## 🚀 Running the Application

### Start Backend Server

```powershell
# In backend directory with activated virtual environment
cd backend
.\venv\Scripts\activate
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Backend will run on:** `http://localhost:8000`
**API docs available at:** `http://localhost:8000/docs`

### Start Frontend Server

```powershell
# In a new terminal, navigate to frontend directory
cd frontend
npm start
```

**Frontend will run on:** `http://localhost:3000`

---

## 🎯 Using the Application

### 1. **Register/Login**
- Navigate to `http://localhost:3000`
- Create a new account or login
- Your session will be saved with JWT tokens

### 2. **Dashboard**
- View your financial overview
- See balance, income, expenses
- Track recent transactions

### 3. **Add Transactions**
- Go to Transactions page
- Add income or expenses
- Tag with categories and moods

### 4. **Set Goals**
- Navigate to Goals page
- Create financial goals with targets and deadlines
- Track progress

### 5. **Get AI Insights** (Requires Ollama)
- Go to Insights page
- Click "Generate Insights"
- AI will analyze your spending patterns and emotional behavior

---

## 🤖 AI Configuration Options

### Option 1: FREE Ollama (Recommended)

**Setup:**
1. Install Ollama: https://ollama.ai/download
2. Pull a model: `ollama pull llama2`
3. In backend `.env`: `USE_OLLAMA=true`

**Pros:** ✅ Free, ✅ Private, ✅ No API keys needed

### Option 2: Emergent AGI API (Paid)

**Setup:**
1. Get API key from Emergent AGI
2. In backend `.env`:
```env
USE_OLLAMA=false
EMERGENT_LLM_KEY=your-api-key-here
```

**Pros:** ✅ Cloud-based, ✅ No local install
**Cons:** ❌ Requires API key, ❌ Costs money

---

## 🧪 Testing the API

You can test the backend API using the interactive docs:

1. Start the backend server
2. Navigate to: `http://localhost:8000/docs`
3. Try the endpoints:
   - POST `/api/auth/register` - Create account
   - POST `/api/auth/login` - Login
   - GET `/api/transactions` - Get transactions
   - POST `/api/insights/analyze` - Generate AI insights

---

## 🔧 Troubleshooting

### MongoDB Connection Issues
```powershell
# Check if MongoDB is running
net start MongoDB

# Or start manually
mongod --dbpath "C:\data\db"
```

### Ollama Not Working
```powershell
# Check if Ollama is running
ollama list

# Start Ollama service
ollama serve

# Test with a simple prompt
ollama run llama2 "Hello"
```

### Port Already in Use
```powershell
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Frontend Build Issues
```powershell
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Technology Stack

**Backend:**
- FastAPI (Python web framework)
- MongoDB (Database)
- PyJWT (Authentication)
- OpenAI SDK (AI integration)
- Bcrypt (Password hashing)

**Frontend:**
- React 19
- React Router (Navigation)
- Axios (HTTP client)
- Tailwind CSS (Styling)
- Radix UI (Component library)
- Sonner (Toast notifications)

**AI:**
- Ollama (Free local AI)
- Emergent AGI (Alternative cloud AI)

---

## 🎨 Features

✨ **Core Features:**
- User authentication with JWT
- Transaction tracking with categories
- Mood-based spending analysis
- Financial goal setting
- AI-powered insights
- Dashboard with statistics

🧠 **Emotional Intelligence:**
- Track mood when spending
- Analyze emotional spending patterns
- Get personalized advice based on behavior

---

## 📝 Next Steps

1. Customize the AI prompts in `server.py` to fit your needs
2. Add more transaction categories
3. Implement budget limits and alerts
4. Add export functionality for reports
5. Integrate with banking APIs for automatic transaction import

---

## 🆘 Support

For issues or questions:
- Check the API docs: `http://localhost:8000/docs`
- Review MongoDB logs
- Check Ollama status: `ollama list`
- Ensure all services are running

---

**Happy tracking! 💰📊🧠**
