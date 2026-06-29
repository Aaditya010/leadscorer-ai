# LeadScorer AI

A full-stack AI-powered sales intelligence dashboard that predicts which leads are "Hot" (likely to convert) versus "Cold". Users upload CSV data, and a machine learning model (Logistic Regression) scores each lead in real-time. The application includes secure user authentication and a modern React dashboard.

## Tech Stack

### Backend
- Framework: FastAPI (Python)
- Database: PostgreSQL (hosted on Supabase)
- ORM: SQLAlchemy
- ML Library: Scikit-Learn
- Data Processing: Pandas
- Authentication: JWT (via python-jose and bcrypt)

### Frontend
- Framework: React (Vite)
- Styling: Tailwind CSS
- Charts: Recharts
- Table: TanStack Table (sorting, pagination, search)
- Data Fetching: TanStack Query (React Query)
- HTTP Client: Axios
- File Upload: React Dropzone

## Features

### Backend
- User signup and login with JWT authentication
- Password hashing using bcrypt
- Protected API endpoints (require valid JWT token)
- Add leads manually via API (`POST /leads/`)
- Fetch all leads (`GET /leads/`)
- Bulk CSV upload (Pandas ETL pipeline)
- AI scoring with Logistic Regression (`/train-and-predict`)
- Model saved and reused (`ml_model.pkl`)
- Advanced filtering (by industry and minimum score)

### Frontend
- User authentication pages (Login and Signup)
- Persistent login session using local storage
- Protected routes (redirects to login if not authenticated)
- Interactive Data Table with:
  - Sorting (click column headers)
  - Global search (filter by name/email)
  - Pagination (5, 10, 20, 50 rows per page)
  - Industry dropdown filter
  - Score range slider
- Smart Dashboard with:
  - Summary Cards (Total, Hot, Cold, Conversion Rate)
  - Bar Chart (Leads by Industry)
  - Pie Chart (Hot vs Cold Split)
- CSV Upload via Drag-and-Drop
- One-Click AI Predictions from the UI
- Toast notifications for success and error messages

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL database (or a Supabase account)

## Getting Started

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Aaditya010/leadscorer-ai.git
   cd leadscorer-ai/backend