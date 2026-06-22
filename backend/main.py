from fastapi import FastAPI
from sqlalchemy import create_engine,Column,Integer,String,Float,TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from datetime import datetime,timezone
import os
from dotenv import load_dotenv

load_dotenv()

app=FastAPI(title="LeadScorer AI")

DATABASE_URL=os.getenv("DATABASE_URL")

#connection,save and fetch,
engine=create_engine(DATABASE_URL) 
SessionLocal=sessionmaker(bind=engine)
Base=declarative_base()

#pydantic defining table(blueprint  of table)
class LeadDB(Base):
  __tablename__="leads"
  id = Column(Integer, primary_key=True, index=True)
  name=Column(String)
  email = Column(String)
  industry = Column(String)
  website_visits = Column(Integer)
  time_spent = Column(Integer)
  prediction_score=Column(Float,default=0.0)
  created_at=Column(TIMESTAMP,default=lambda:datetime.now(timezone.utc))

Base.metadata.create_all(bind=engine)

#API DATA CHECK 
class LeadCreate(BaseModel):
  name:str
  email:str
  industry:str
  website_visits:int
  time_spent:int

#homepage
@app.get("/")
def read_root():
  return{"message":"LeadScorer AI backend is running"}

#is someone saves data
@app.post("/leads/")
def create_lead(lead:LeadCreate):
  db=SessionLocal()
  db_lead=LeadDB(**lead.model_dump())
  db.add(db_lead)
  db.commit()
  db.refresh(db_lead)
  db.close()
  return db_lead

#to check view all leads
@app.get("/leads/")
def get_leads():
  db=SessionLocal()

  leads=db.query(LeadDB).all()
  db.close()

  return leads





  