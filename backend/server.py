from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from openai import OpenAI
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# AI Configuration - Support both Ollama (free) and Emergent API
USE_OLLAMA = os.environ.get('USE_OLLAMA', 'true').lower() == 'true'

if USE_OLLAMA:
    # Ollama - Free local AI
    openai_client = OpenAI(
        api_key='ollama',  # Ollama doesn't need a real API key
        base_url=os.environ.get('OLLAMA_BASE_URL', 'http://localhost:11434/v1')
    )
    AI_MODEL = os.environ.get('OLLAMA_MODEL', 'llama2')
else:
    # Emergent LLM - Requires API key
    openai_client = OpenAI(
        api_key=os.environ.get('EMERGENT_LLM_KEY'),
        base_url="https://api.emergentagi.com/v1"
    )
    AI_MODEL = "gpt-5"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ========== MODELS ==========

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    category: str
    description: str
    type: str  # 'income' or 'expense'
    mood: Optional[str] = None
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransactionCreate(BaseModel):
    amount: float
    category: str
    description: str
    type: str
    mood: Optional[str] = None
    date: Optional[datetime] = None

class Goal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    target_amount: float
    current_amount: float = 0.0
    deadline: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GoalCreate(BaseModel):
    title: str
    target_amount: float
    deadline: datetime

class InsightRequest(BaseModel):
    context: str
    transactions: List[dict]

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    conversation_history: Optional[List[dict]] = []

class CategoryLimit(BaseModel):
    category: str
    limit: float

class CategoryLimitsUpdate(BaseModel):
    limits: List[CategoryLimit]

class UserProfile(BaseModel):
    monthly_income: Optional[float] = None
    savings_goal: Optional[float] = None
    primary_goal: Optional[str] = None
    spending_triggers: Optional[List[str]] = []
    budget_priority: Optional[str] = None
    risk_tolerance: Optional[str] = None
    financial_experience: Optional[str] = None

# ========== HELPER FUNCTIONS ==========

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str, email: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail='Invalid token')
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

# ========== AUTH ENDPOINTS ==========

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({'email': user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name
    )
    
    user_doc = user.model_dump()
    user_doc['password'] = hash_password(user_data.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token(user.id, user.email)
    return {'token': token, 'user': user}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({'email': credentials.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    token = create_access_token(user_doc['id'], user_doc['email'])
    user = User(
        id=user_doc['id'],
        email=user_doc['email'],
        name=user_doc['name'],
        created_at=datetime.fromisoformat(user_doc['created_at'])
    )
    return {'token': token, 'user': user}

@api_router.get("/auth/me", response_model=User)
async def get_me(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({'id': user_id}, {'_id': 0, 'password': 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail='User not found')
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return user_doc

# ========== TRANSACTION ENDPOINTS ==========

@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction_data: TransactionCreate, user_id: str = Depends(get_current_user)):
    transaction = Transaction(
        user_id=user_id,
        amount=transaction_data.amount,
        category=transaction_data.category,
        description=transaction_data.description,
        type=transaction_data.type,
        mood=transaction_data.mood,
        date=transaction_data.date or datetime.now(timezone.utc)
    )
    
    doc = transaction.model_dump()
    doc['date'] = doc['date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.transactions.insert_one(doc)
    return transaction

@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(user_id: str = Depends(get_current_user)):
    transactions = await db.transactions.find({'user_id': user_id}, {'_id': 0}).sort('date', -1).to_list(1000)
    
    for t in transactions:
        if isinstance(t['date'], str):
            t['date'] = datetime.fromisoformat(t['date'])
        if isinstance(t['created_at'], str):
            t['created_at'] = datetime.fromisoformat(t['created_at'])
    
    return transactions

@api_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str, user_id: str = Depends(get_current_user)):
    result = await db.transactions.delete_one({'id': transaction_id, 'user_id': user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Transaction not found')
    return {'message': 'Transaction deleted'}

# ========== GOAL ENDPOINTS ==========

@api_router.post("/goals", response_model=Goal)
async def create_goal(goal_data: GoalCreate, user_id: str = Depends(get_current_user)):
    goal = Goal(
        user_id=user_id,
        title=goal_data.title,
        target_amount=goal_data.target_amount,
        deadline=goal_data.deadline
    )
    
    doc = goal.model_dump()
    doc['deadline'] = doc['deadline'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.goals.insert_one(doc)
    return goal

@api_router.get("/goals", response_model=List[Goal])
async def get_goals(user_id: str = Depends(get_current_user)):
    goals = await db.goals.find({'user_id': user_id}, {'_id': 0}).to_list(1000)
    
    for g in goals:
        if isinstance(g['deadline'], str):
            g['deadline'] = datetime.fromisoformat(g['deadline'])
        if isinstance(g['created_at'], str):
            g['created_at'] = datetime.fromisoformat(g['created_at'])
    
    return goals

@api_router.patch("/goals/{goal_id}")
async def update_goal_progress(goal_id: str, amount: float, user_id: str = Depends(get_current_user)):
    result = await db.goals.update_one(
        {'id': goal_id, 'user_id': user_id},
        {'$set': {'current_amount': amount}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail='Goal not found')
    return {'message': 'Goal updated'}

@api_router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, user_id: str = Depends(get_current_user)):
    result = await db.goals.delete_one({'id': goal_id, 'user_id': user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Goal not found')
    return {'message': 'Goal deleted'}

# ========== AI INSIGHTS ENDPOINTS ==========

@api_router.post("/insights/analyze")
async def get_ai_insights(request: InsightRequest, user_id: str = Depends(get_current_user)):
    try:
        # Prepare transaction summary for AI
        transaction_summary = "\n".join([
            f"- {t.get('type', 'expense')}: ${t.get('amount', 0)} on {t.get('category', 'unknown')} - {t.get('description', '')} (Mood: {t.get('mood', 'neutral')})"
            for t in request.transactions[:20]  # Limit to recent 20
        ])
        
        prompt = f"""You are a financial advisor analyzing spending patterns and emotional well-being.

User's recent transactions:
{transaction_summary}

Context: {request.context}

Provide:
1. Key spending patterns
2. Emotional spending insights (how mood affects spending)
3. 2-3 actionable recommendations

Keep response concise and friendly."""
        
        response = openai_client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful financial advisor focused on emotional intelligence and smart money management."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        insight = response.choices[0].message.content
        return {'insight': insight}
    
    except Exception as e:
        logger.error(f"AI insight error: {str(e)}")
        raise HTTPException(status_code=500, detail='Failed to generate insights')

@api_router.get("/insights/mood-analysis")
async def get_mood_analysis(user_id: str = Depends(get_current_user)):
    transactions = await db.transactions.find({'user_id': user_id, 'mood': {'$ne': None}}, {'_id': 0}).to_list(1000)
    
    mood_spending = {}
    for t in transactions:
        mood = t.get('mood', 'neutral')
        amount = t.get('amount', 0)
        if t.get('type') == 'expense':
            mood_spending[mood] = mood_spending.get(mood, 0) + amount
    
    return {'mood_spending': mood_spending}

# ========== CHATBOT ENDPOINT ==========

@api_router.post("/chatbot/chat")
async def chat_with_ai(request: ChatRequest, user_id: str = Depends(get_current_user)):
    try:
        # Build conversation context
        messages = [
            {
                "role": "system",
                "content": """You are a friendly and helpful AI financial assistant. 
                You help users understand their finances, provide budgeting advice, and answer questions about their spending habits.
                Be conversational, supportive, and give actionable advice. Keep responses concise but helpful.
                Use emojis occasionally to be friendly. If the user's data shows concerning patterns, gently point them out."""
            }
        ]
        
        # Add context about user's financial data if available
        if request.context:
            messages.append({
                "role": "system",
                "content": f"Here's the user's financial data:\n{request.context}"
            })
        
        # Add conversation history
        if request.conversation_history:
            messages.extend(request.conversation_history[-6:])  # Last 3 exchanges
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Call AI model
        response = openai_client.chat.completions.create(
            model=AI_MODEL,
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        return {'response': ai_response}
    
    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        # Return a friendly fallback message
        return {
            'response': "I'm having trouble connecting to my AI brain right now 🤔. Please make sure Ollama is running (try 'ollama serve' in your terminal) and try again!"
        }

# ========== DASHBOARD STATS ==========

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user_id: str = Depends(get_current_user)):
    # Get all transactions
    transactions = await db.transactions.find({'user_id': user_id}, {'_id': 0}).to_list(1000)
    
    total_income = sum(t['amount'] for t in transactions if t.get('type') == 'income')
    total_expenses = sum(t['amount'] for t in transactions if t.get('type') == 'expense')
    balance = total_income - total_expenses
    
    # Category breakdown
    category_spending = {}
    for t in transactions:
        if t.get('type') == 'expense':
            cat = t.get('category', 'Other')
            category_spending[cat] = category_spending.get(cat, 0) + t['amount']
    
    # Recent transactions
    recent = sorted(transactions, key=lambda x: x.get('date', ''), reverse=True)[:5]
    
    return {
        'balance': balance,
        'total_income': total_income,
        'total_expenses': total_expenses,
        'category_spending': category_spending,
        'transaction_count': len(transactions),
        'recent_transactions': recent
    }

# ========== CATEGORY LIMITS ==========

@api_router.get("/category-limits")
async def get_category_limits(user_id: str = Depends(get_current_user)):
    settings = await db.settings.find_one({'user_id': user_id}, {'_id': 0})
    if not settings or 'category_limits' not in settings:
        return {'limits': []}
    return {'limits': settings['category_limits']}

@api_router.post("/category-limits")
async def update_category_limits(data: CategoryLimitsUpdate, user_id: str = Depends(get_current_user)):
    limits_dict = [{'category': l.category, 'limit': l.limit} for l in data.limits]
    
    await db.settings.update_one(
        {'user_id': user_id},
        {'$set': {'category_limits': limits_dict, 'user_id': user_id}},
        upsert=True
    )
    
    return {'message': 'Category limits updated successfully', 'limits': limits_dict}

@api_router.get("/category-limits/check")
async def check_category_limits(user_id: str = Depends(get_current_user)):
    # Get current month's spending
    from datetime import datetime
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    transactions = await db.transactions.find({
        'user_id': user_id,
        'type': 'expense',
        'date': {'$gte': start_of_month.isoformat()}
    }, {'_id': 0}).to_list(1000)
    
    # Calculate spending by category
    category_spending = {}
    for t in transactions:
        cat = t.get('category', 'Other')
        category_spending[cat] = category_spending.get(cat, 0) + t['amount']
    
    # Get limits
    settings = await db.settings.find_one({'user_id': user_id}, {'_id': 0})
    limits = settings.get('category_limits', []) if settings else []
    
    # Check which categories exceeded limits
    warnings = []
    for limit_obj in limits:
        cat = limit_obj['category']
        limit = limit_obj['limit']
        spent = category_spending.get(cat, 0)
        
        if spent >= limit:
            warnings.append({
                'category': cat,
                'limit': limit,
                'spent': spent,
                'percentage': (spent / limit * 100) if limit > 0 else 0
            })
    
    return {
        'category_spending': category_spending,
        'warnings': warnings
    }

# ========== USER PROFILE ==========

@api_router.get("/profile")
async def get_user_profile(user_id: str = Depends(get_current_user)):
    profile = await db.profiles.find_one({'user_id': user_id}, {'_id': 0})
    if not profile:
        return {'has_profile': False, 'profile': None}
    return {'has_profile': True, 'profile': profile}

@api_router.post("/profile")
async def save_user_profile(profile: UserProfile, user_id: str = Depends(get_current_user)):
    profile_dict = profile.model_dump()
    profile_dict['user_id'] = user_id
    profile_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.profiles.update_one(
        {'user_id': user_id},
        {'$set': profile_dict},
        upsert=True
    )
    
    return {'message': 'Profile saved successfully', 'profile': profile_dict}

@api_router.get("/")
async def root():
    return {"message": "FINE API - Finance Intelligent Ecosystem"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()