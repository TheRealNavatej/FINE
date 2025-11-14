# 🤖 AI Chatbot Feature

## Overview

Your FINE app now includes an **AI-powered chatbot** that lets you have natural conversations about your finances! The chatbot uses the same Ollama AI that powers your insights.

---

## ✨ What It Does

The chatbot can:

✅ **Answer questions** about your spending and finances
✅ **Provide financial advice** based on your actual data
✅ **Explain patterns** in your transactions
✅ **Give budgeting tips** tailored to your situation
✅ **Chat naturally** like a real financial advisor

---

## 🎯 How to Use

### 1. **Access the Chatbot**
- Navigate to **"AI Chat"** in the sidebar
- Or visit: `http://localhost:3000/chatbot`

### 2. **Start Chatting**
The chatbot greets you automatically. Just type your question and press Enter or click Send.

### 3. **Example Questions**

Try asking:
- "How am I doing financially?"
- "What are my biggest expenses?"
- "Give me tips to save money"
- "Why am I spending so much on food?"
- "Should I be worried about my balance?"
- "How can I reduce my expenses?"
- "Analyze my spending patterns"
- "What percentage of my income goes to rent?"

### 4. **Context-Aware Responses**

The chatbot knows about:
- Your current balance
- Total income and expenses
- Spending by category
- Recent transactions
- Your mood-tagged purchases

---

## 🧠 How It Works

```
You ask question
    ↓
Frontend sends to backend
    ↓
Backend adds your financial data as context
    ↓
Ollama AI analyzes and responds
    ↓
You get personalized answer!
```

---

## 🎨 Features

### **Smart Context**
The chatbot automatically includes your:
- Current financial summary
- Top spending categories
- Recent transaction history
- Mood-based spending data

### **Conversation Memory**
- Remembers last 6 messages
- Maintains context in conversation
- No need to repeat yourself

### **Suggested Questions**
- Click suggested questions to get started
- Quick way to explore features

### **Beautiful UI**
- Chat bubble interface
- Typing indicators
- Smooth animations
- Mobile responsive

---

## ⚙️ Requirements

### **Make Sure Ollama is Running**

The chatbot requires Ollama to be running:

```powershell
# Check if Ollama is running
ollama list

# Start Ollama if needed
ollama serve

# Verify llama2 model is installed
ollama pull llama2
```

### **Backend Must Be Running**

```powershell
# Start backend (if not running)
cd backend
venv\Scripts\activate
uvicorn server:app --reload --port 8000
```

---

## 🔧 Technical Details

### **New Files Created**

1. **Frontend:**
   - `frontend/src/pages/Chatbot.jsx` - Chatbot component
   - `frontend/src/pages/Chatbot.css` - Chatbot styles

2. **Backend:**
   - Added `/api/chatbot/chat` endpoint in `server.py`

3. **Routes:**
   - Updated `App.js` with `/chatbot` route
   - Updated `Layout.jsx` with navigation link

### **API Endpoint**

**POST** `/api/chatbot/chat`

**Request:**
```json
{
  "message": "How am I doing financially?",
  "context": "User's financial summary...",
  "conversation_history": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ]
}
```

**Response:**
```json
{
  "response": "You're doing great! Your balance is positive..."
}
```

### **AI Configuration**

Uses the same AI setup as Insights:
- **Model**: llama2 (via Ollama)
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 500 (concise responses)
- **System Prompt**: Friendly financial advisor personality

---

## 💡 Tips for Best Results

### **Be Specific**
❌ "Tell me about money"
✅ "Why is my food spending so high this month?"

### **Ask Follow-Up Questions**
The chatbot remembers context:
```
You: "What are my biggest expenses?"
Bot: "Your top 3 expenses are..."
You: "How can I reduce the food one?"
Bot: "Here are some tips..."
```

### **Request Actionable Advice**
- "What should I do to save more?"
- "Give me 3 specific budgeting tips"
- "How can I cut my entertainment budget?"

### **Explore Different Topics**
- Budgeting strategies
- Savings tips
- Expense analysis
- Financial goals
- Spending habits

---

## 🎯 Use Cases

### **1. Quick Financial Check-In**
"Give me a quick overview of my finances"

### **2. Problem Solving**
"I'm spending too much on weekends, what should I do?"

### **3. Goal Planning**
"I want to save $5000, how long will it take?"

### **4. Expense Analysis**
"Why is my balance lower than expected?"

### **5. Learning**
"Explain the 50/30/20 budget rule"

---

## 🚨 Troubleshooting

### **"Failed to get response"**
**Solution:** Make sure Ollama is running
```powershell
ollama serve
```

### **"Chatbot not responding"**
**Check:**
1. Backend is running on port 8000
2. Ollama is installed and running
3. llama2 model is downloaded
4. Frontend can reach backend (check .env)

### **Slow Responses**
- Normal for first message (model loading)
- Subsequent messages should be faster
- llama2 runs locally, so speed depends on your CPU

### **Generic Answers**
- Add more transactions for better context
- Ask more specific questions
- Include details in your query

---

## 🔐 Privacy

✅ **100% Private**
- All conversations happen locally
- No data sent to cloud
- Ollama runs on your computer
- Financial data never leaves your machine

✅ **Secure**
- Requires authentication (JWT token)
- Only you can access your data
- Conversations not stored (stateless)

---

## 🎨 Customization Ideas

Want to customize the chatbot? Edit these:

### **Personality**
Change the system prompt in `backend/server.py`:
```python
"content": "You are a [personality here] financial assistant..."
```

### **Response Length**
Adjust `max_tokens` in `server.py`:
```python
max_tokens=500,  # Increase for longer responses
```

### **Suggested Questions**
Edit `suggestedQuestions` array in `Chatbot.jsx`

### **Styling**
Modify `Chatbot.css` for colors, layout, etc.

---

## 🚀 Future Enhancements

Possible improvements:
- [ ] Voice input/output
- [ ] Export chat history
- [ ] Preset assistant personalities
- [ ] Multi-language support
- [ ] Integration with Goals page
- [ ] Proactive suggestions
- [ ] Chart generation from chat

---

## 📊 Tech Stack

**Frontend:**
- React (component)
- Lucide React (icons)
- Pure CSS (styling)
- Axios (API calls)

**Backend:**
- FastAPI (endpoint)
- Ollama (AI processing)
- OpenAI SDK (API interface)

**AI:**
- llama2 model
- 7B parameters
- Local inference

---

## ✅ Summary

**What You Get:**
- Natural language chatbot
- Financial advice on demand
- Context-aware responses
- Beautiful chat interface
- 100% free and private

**How to Access:**
1. Make sure Ollama is running
2. Start backend and frontend
3. Click "AI Chat" in sidebar
4. Start chatting!

**Best For:**
- Quick financial questions
- Personalized advice
- Understanding spending patterns
- Budget planning help

---

**Your AI financial advisor is ready to chat! 🎉💬**
