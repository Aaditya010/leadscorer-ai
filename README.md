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
- **Table:** TanStack Table (sorting, pagination, search)
- **Data Fetching:** TanStack Query (React Query)
- **HTTP Client:** Axios

### Backend
- Add leads manually via API (`POST /leads/`)
- Fetch all leads (`GET /leads/`)
- Bulk CSV upload (Pandas ETL pipeline)
- AI scoring with Logistic Regression (`/train-and-predict`)
- Model saved and reused (`ml_model.pkl`)

### Frontend
- Interactive data table with:
 Sorting (click column headers)
 Global search (filter by name/email)
 Pagination (5, 10, 20, 50 rows per page)
- Hot/Cold status badges with color coding
- Loading and error states
- Responsive design with Tailwind CSS

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or a Supabase account)

---

### Backend Setup

1. Clone the repository and navigate to the backend folder:
   ```bash
   git clone https://github.com/aaditya010/leadscorer-ai.git
   cd leadscorer-ai/backend