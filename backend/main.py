from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt 
from dotenv import load_dotenv
import pandas as pd
import io
from sklearn.linear_model import LogisticRegression
import joblib
import os

load_dotenv()


app = FastAPI(title="LeadScorer AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SECRET_KEY = "your-super-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class LeadDB(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    industry = Column(String)
    website_visits = Column(Integer)
    time_spent = Column(Integer)
    prediction_score = Column(Float, default=0.0)
    created_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc))

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class LeadCreate(BaseModel):
    name: str
    email: str
    industry: str
    website_visits: int
    time_spent: int

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str


@app.get("/")
def read_root():
    return {"message": "LeadScorer AI backend is running"}


@app.post("/signup")
def signup(user: UserCreate):
    db = SessionLocal()
    
    existing_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if existing_user:
        db.close()
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed = get_password_hash(user.password)
    db_user = UserDB(username=user.username, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    db.close()
    
    return {"message": "User created successfully", "username": user.username}

@app.post("/login")
def login(user: UserLogin):
    db = SessionLocal()
    db_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    db.close()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/leads/")
def create_lead(lead: LeadCreate):
    db = SessionLocal()
    db_lead = LeadDB(**lead.model_dump())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    db.close()
    return db_lead

@app.get("/leads/")
def get_leads(
    industry: Optional[str] = None,
    min_score: Optional[float] = None,
    token: str = Depends(oauth2_scheme)  # Protected route
):
    db = SessionLocal()
    query = db.query(LeadDB)
    
    if industry:
        query = query.filter(LeadDB.industry == industry)
    if min_score is not None:
        query = query.filter(LeadDB.prediction_score >= min_score)
    
    leads = query.all()
    db.close()
    return leads

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    df = df.fillna("")
    df = df.drop_duplicates()
    leads = df.to_dict(orient="records")
    
    db = SessionLocal()
    for lead in leads:
        db_lead = LeadDB(
            name=lead.get("name", ""),
            email=lead.get("email", ""),
            industry=lead.get("industry", ""),
            website_visits=int(lead.get("website_visits", 0)),
            time_spent=int(lead.get("time_spent", 0))
        )
        db.add(db_lead)
    db.commit()
    db.close()
    
    return {"message": f"Successfully Uploaded {len(leads)} leads"}

@app.post("/train-and-predict")
async def train_and_predict():
    db = SessionLocal()
    leads = db.query(LeadDB).all()
    db.close()

    if len(leads) == 0:
        return {"message": "No leads found to train on"}
    
    X = []
    y = []
    for lead in leads:
        X.append([lead.website_visits, lead.time_spent])
        is_hot = 1 if (lead.website_visits > 5 or lead.time_spent > 60) else 0
        y.append(is_hot)

    unique_classes = set(y)
    if len(unique_classes) < 2:
        return {
            "message": f"AI cannot train. Only found class '{unique_classes}' in your data. "
                       "Please upload a CSV with BOTH Hot and Cold leads"
        }
    
    model = LogisticRegression()
    model.fit(X, y)
    joblib.dump(model, "ml_model.pkl")

    db = SessionLocal()
    all_leads = db.query(LeadDB).all()
    for lead in all_leads:
        features = [[lead.website_visits, lead.time_spent]]
        score = model.predict_proba(features)[0][1]
        lead.prediction_score = float(score)
    db.commit()
    db.close()

    return {"message": f"AI trained and scored {len(all_leads)} leads! Model saved."}

Base.metadata.create_all(bind=engine)