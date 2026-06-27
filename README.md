# LeadScorer AI

A full-stack AI-powered sales intelligence dashboard that predicts which leads are "Hot" (likely to convert) vs "Cold". Users upload CSV data, and a machine learning model (Logistic Regression) scores each lead in real-time.

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** SQLAlchemy
- **ML Library:** Scikit-Learn
- **Data Processing:** Pandas

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Table:** TanStack Table (sorting, pagination, search)
- **Data Fetching:** TanStack Query (React Query)
- **HTTP Client:** Axios
- **File Upload:** React Dropzone



### Backend
- Add leads manually via API (`POST /leads/`)
- Fetch all leads (`GET /leads/`)
- Bulk CSV upload (Pandas ETL pipeline)
- AI scoring with Logistic Regression (`/train-and-predict`)
- Model saved and reused (`ml_model.pkl`)

### Frontend
- **Interactive Data Table** with:
- Sorting (click column headers)
- Global search (filter by name/email)
-Pagination (5, 10, 20, 50 rows per page)
- Smart Dashboard** with:
- Summary Cards (Total, Hot, Cold, Conversion Rate)
- Bar Chart (Leads by Industry)
- Pie Chart (Hot vs Cold Split)
- CSV Upload via Drag-and-Drop
- One-Click AI Predictions from the UI

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or a Supabase account)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Aaditya010/leadscorer-ai.git
   cd leadscorer-ai/backend