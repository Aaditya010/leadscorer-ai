# LeadScorer AI

A web tool that helps sales teams figure out which potential customers are worth calling right now and which ones are a waste of time. Instead of randomly calling a long list of names, the app uses machine learning to give each person a "hot" or "cold" score.

## How it works

1. A salesperson uploads a CSV file containing their list of leads, including details like industry, website visits, and time spent on the site.
2. The application processes this data through a machine learning model. The model looks for patterns and learns which factors indicate a likely purchase.
3. The app assigns a probability score (0% to 100%) to every lead based on these patterns.
4. The dashboard displays the results in a clear table and charts. High scores are marked as "Hot" (call immediately) and low scores as "Cold" (don't bother).

## Who is it for?

- Sales teams who want to save time and increase conversion rates.
- Business owners who want to prioritize their sales efforts on high-value prospects.
- Anyone tired of cold calling and looking for a data-driven approach.

## Live Demo

https://leadscorer-ai-1.onrender.com

## Tech Stack

- Backend: FastAPI (Python), SQLAlchemy, PostgreSQL (Supabase)
- Machine Learning: Scikit-Learn, Pandas
- Frontend: React (Vite), Tailwind CSS, Recharts, TanStack Table
- Authentication: JWT (python-jose + bcrypt)
- Deployment: Render (Backend + Frontend)

## Features

- User authentication (Signup / Login) with JWT tokens.
- Upload CSV files containing lead data.
- AI scoring using Logistic Regression to predict conversion probability.
- Interactive dashboard with summary stats, bar chart, pie chart, and a sortable, searchable, paginated data table.
- Dockerized backend and frontend.

## How to Run Locally

1. Clone the repository:
   git clone https://github.com/Aaditya010/leadscorer-ai.git
   cd leadscorer-ai

2. Backend Setup:
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload

3. Frontend Setup:
   cd ../frontend
   npm install
   npm run dev

The frontend runs on http://localhost:5173 and the backend on http://localhost:8000.

## Author

Aaditya Khanal
GitHub: https://github.com/Aaditya010