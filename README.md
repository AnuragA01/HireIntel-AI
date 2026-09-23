# HireIntel AI

AI-Powered Recruitment & Career Intelligence Platform.

HireIntel AI is a full-stack recruitment platform designed to connect candidates and recruiters through intelligent job matching, resume analysis, application management, and recruitment insights.

## Features

### Candidate

- Candidate registration and login
- JWT authentication
- Candidate dashboard
- Resume upload
- Resume analysis
- Job search
- Job filtering
- AI-powered job matching
- Job application
- Cover letter submission
- Application tracking
- Application status tracking

### Recruiter

- Recruiter login
- Recruiter dashboard
- Create job postings
- Manage jobs
- View applications
- Review candidate profiles
- Candidate matching
- AI match scores
- Matched and missing skills
- Experience matching
- Application status management
- Recruiter notes

## AI Matching

HireIntel AI analyzes candidate resumes against job requirements.

The matching system considers:

- Required skills
- Candidate skills
- Experience
- Resume information
- Job requirements

The system produces an AI match score such as:

- 51.97%
- 72.50%
- 86.35%

## Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- CSS
- React Router

### Backend

- Python
- FastAPI
- SQLAlchemy
- PyMySQL
- JWT Authentication

### Database

- MySQL

### AI / Data Processing

- Python
- Pandas
- NumPy
- Scikit-learn
- PyMuPDF

### Development Tools

- VS Code
- Git
- GitHub
- Postman / Swagger

## Project Structure

HireIntel-AI/

├── backend/

│   └── app/

│       ├── models/

│       ├── schemas/

│       ├── routers/

│       ├── services/

│       ├── core/

│       └── main.py

│

├── frontend/

│   ├── src/

│   ├── public/

│   └── package.json

│

├── .gitignore

├── .env.example

└── README.md

## Backend Setup

Navigate to the backend:

cd backend

Create virtual environment:

python -m venv .venv

Activate virtual environment:

.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Start FastAPI:

uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs

## Frontend Setup

Navigate to frontend:

cd frontend

Install dependencies:

npm install

Start development server:

npm run dev

Frontend:

http://localhost:5173

## Database

Create a MySQL database named:

hireintel

Configure the database connection using your local environment variables.

Never commit real database passwords or secret keys to GitHub.

## Authentication

HireIntel AI uses JWT-based authentication.

Two main roles are supported:

- Candidate
- Recruiter

## Application Workflow

Candidate:

Register/Login
    ↓
Upload Resume
    ↓
Resume Analysis
    ↓
Find Jobs
    ↓
View Job
    ↓
Apply
    ↓
Application Submitted
    ↓
Track Application Status

Recruiter:

Login
    ↓
Post Job
    ↓
AI Candidate Matching
    ↓
Review Candidates
    ↓
View Applications
    ↓
Update Application Status
    ↓
Interview / Hiring Process

## Current Demo

The project includes candidate and recruiter workflows with:

- Candidate account
- Recruiter account
- Resume
- Python Developer job
- AI match score
- Job application
- Recruiter application review
- Application status management

## Security

Sensitive information such as:

- Database passwords
- JWT secrets
- Environment variables
- Local virtual environments

must not be committed to GitHub.

## Author

Anurag Aski

Computer Science Engineering

HireIntel AI - AI-Powered Recruitment & Career Intelligence Platform
