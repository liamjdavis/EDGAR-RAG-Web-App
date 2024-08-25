from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, TIMESTAMP, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import bcrypt
from dotenv import load_dotenv
import os

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
    user_id = Column(Integer, nullable=False)
    thread_id = Column(Integer, nullable=False, unique=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
class ThreadCreate(BaseModel):
    user_id: int
    thread_id: int
    title: str

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

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# registration endpoint
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
    return new_user

# login endpoint
@app.post("/login/")
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"message": "Login successful"}

# retrieve user ID
@app.get("/users/id/")
def get_user_id_by_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user.id}

# retrieve threads
@app.get("/threads/")
def get_threads(db: Session = Depends(get_db)):
    threads = db.query(Thread).all()
    return threads

# add threads
@app.post("/threads/")
def create_thread(thread: ThreadCreate, db: Session = Depends(get_db)):
    db_thread = db.query(Thread).filter(Thread.thread_id == thread.thread_id).first()
    if db_thread:
        raise HTTPException(status_code=400, detail="Thread ID already exists")
    
    new_thread = Thread(
        user_id=thread.user_id,
        thread_id=thread.thread_id,
        title=thread.title
    )
    
    db.add(new_thread)
    db.commit()
    db.refresh(new_thread)
    return new_thread

# retrieve chats
@app.get("/threads/{thread_id}/chats/")
def get_chats(thread_id: int, db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(Chat.thread_id == thread_id).all()
    return chats

# add chats
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
