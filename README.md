# LeadScorer AI

A smart sales dashboard that uses AI to score leads (hot vs cold) based on website behavior.

## Tech Stack
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL (Supabase)
- **Frontend:** React (Coming soon)
- **ML Library:** Scikit-Learn

## Features
- ✅ Add leads manually via API
- ✅ Fetch all leads from database
- ✅ Bulk CSV upload (Pandas ETL pipeline)
- ✅ AI scoring (Logistic Regression) to predict Hot/Cold leads
- ✅ Model saved and reused (`ml_model.pkl`)
- React Dashboard (In progress)

## How to Run Locally

1. Clone this repository
   ```bash
   git clone https://github.com/YOUR-USERNAME/leadscorer-ai.git
   cd leadscorer-ai/backend