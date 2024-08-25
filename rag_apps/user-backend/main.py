from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, TIMESTAMP, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import bcrypt
from dotenv import load_dotenv
import os

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Fetch DATABASE_URL from environment variables
DATABASE_URL = os.getenv('DATABASE_URL')

# Manually fix the scheme if it’s incorrect
if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://')

if DATABASE_URL is None:
    raise ValueError("DATABASE_URL environment variable not set")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()

origins = [
    "http://nextjs_app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

class UserCreate(BaseModel):
    email: str
    password: str
    
class Thread(Base):
    __tablename__ = "threads"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # Added user_id column
    thread_id = Column(Integer, nullable=False, unique=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
class ThreadCreate(BaseModel):
    user_id: int
    thread_id: int

class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
class ChatCreate(BaseModel):
    thread_id: int
    user_id: int
    message: str

# Drop all tables
Base.metadata.drop_all(bind=engine)

# Call the log_tables function after creating all tables
Base.metadata.create_all(bind=engine)
log_tables()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to create initial threads and chats if needed
def create_initial_data(user_id: int, db: Session):
    # Check if there are any threads for the user
    existing_threads = db.query(Thread).filter(Thread.user_id == user_id).all()
    if not existing_threads:
        # Optionally, create default threads here if needed
        pass

    # Check if there are any chats for the user
    existing_chats = db.query(Chat).filter(Chat.user_id == user_id).all()
    if not existing_chats:
        # Optionally, create default chats here if needed
        pass

# Registration endpoint
@app.post("/register/")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password before storing it
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    new_user = User(email=user.email, password=hashed_password.decode('utf-8'))
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create initial threads and chats for the new user
    create_initial_data(new_user.id, db)

    return new_user

# Login endpoint
@app.post("/login/")
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Create initial threads and chats for the logged-in user
    create_initial_data(db_user.id, db)

    return {"message": "Login successful"}

# Retrieve user ID by email
@app.get("/userid/")
def get_user_id_by_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user.id}

# Retrieve threads by user_id
@app.get("/threads/")
def get_threads(user_id: int = None, db: Session = Depends(get_db)):
    if user_id:
        threads = db.query(Thread).filter(Thread.user_id == user_id).all()
    else:
        threads = db.query(Thread).all()
    return threads

# Add threads
@app.post("/threads/")
def create_thread(thread: ThreadCreate, db: Session = Depends(get_db)):
    db_thread = db.query(Thread).filter(Thread.thread_id == thread.thread_id).first()
    if db_thread:
        raise HTTPException(status_code=400, detail="Thread ID already exists")
    
    new_thread = Thread(
        user_id=thread.user_id,
        thread_id=thread.thread_id
    )
    
    db.add(new_thread)
    db.commit()
    db.refresh(new_thread)
    return new_thread

# Retrieve chats
@app.get("/threads/{thread_id}/chats/")
def get_chats(thread_id: int, db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(Chat.thread_id == thread_id).all()
    return chats

# Add chats
@app.post("/threads/{thread_id}/chats/")
def create_chat(thread_id: int, chat: ChatCreate, db: Session = Depends(get_db)):
    new_chat = Chat(
        thread_id=thread_id,
        user_id=chat.user_id,
        message=chat.message
    )
    
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat
