from fastapi import FastAPI,File,UploadFile
from sqlalchemy import create_engine,Column,Integer,String,Float,TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from datetime import datetime,timezone
import os
from dotenv import load_dotenv
import pandas as pd
import io
from sklearn.linear_model import LogisticRegression
import joblib
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

app=FastAPI(title="LeadScorer AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],                    
)

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

#upload
@app.post("/upload-csv")
async def upload_csv(file:UploadFile=File(...)):
  content=await file.read()
  df=pd.read_csv(io.StringIO(content.decode("utf-8")))

  df=df.fillna("")
  df=df.drop_duplicates()

  leads=df.to_dict(orient="records")

  db=SessionLocal()

  for lead in leads:
    db_lead=LeadDB(
      name=lead.get("name",""),
      email=lead.get("email",""),
      industry=lead.get("industry",""),
      website_visits=int(lead.get("website_visits",0)),
      time_spent=int(lead.get("time_spent",0))
    )
    
    db.add(db_lead)

  db.commit()
  db.close()

  return{"message":f"Successfully Uploaded {len(leads)} leads"}

@app.post("/train-and-predict")
async def train_and_predict():
  db=SessionLocal()
  leads=db.query(LeadDB).all()
  db.close()

  if len(leads)==0:
    return{"message":"No leads found to train on"}
  
  #x for visits and y for hot/cold
  X=[]
  y=[]

  for lead in leads:
    X.append([lead.website_visits,lead.time_spent])

    is_hot=1 if (lead.website_visits>5 or lead.time_spent>60) else 0
    y.append(is_hot)

  unique_classes = set(y)
  if len(unique_classes) < 2:
        return {
            "message": f"AI cannot train. Only found class '{unique_classes}' in your data. "
                       "Please upload a CSV with BOTH Hot and Cold leads"
        }
  
  model=LogisticRegression()

  model.fit(X,y)

#save brain to file so dont have to retain every time
  joblib.dump(model,"ml_model.pkl")

  db=SessionLocal()
  all_leads=db.query(LeadDB).all()

  for lead in all_leads:
    features=[[lead.website_visits,lead.time_spent]]

    score=model.predict_proba(features)[0][1]
    lead.prediction_score=float(score)

  db.commit()
  db.close()

  return {"message": f"AI trained and scored {len(all_leads)} leads! Model saved."}

#to check view all leads
@app.get("/leads/")
def get_leads():
  db=SessionLocal()

  leads=db.query(LeadDB).all()
  db.close()

  return leads







  