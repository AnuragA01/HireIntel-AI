# 🚀 HireIntel AI — AI-Powered Recruitment & Career Intelligence Platform

<p align="center">
  <strong>Smart Resume Analysis • Intelligent Job Matching • Career Insights</strong>
</p>

<p align="center">
  An AI-powered recruitment and career intelligence platform that helps candidates understand their resumes, discover relevant job opportunities, identify skill gaps, and make data-driven career decisions.
</p>

---

## 📌 About the Project

**HireIntel AI** is a full-stack recruitment and career intelligence platform built to simplify the job search process through resume analysis, job matching, and personalized career insights.

Candidates can upload their resumes, review extracted information, analyze their skills, and compare their profiles against available job opportunities. Recruiters can manage job listings and recruitment activities through role-based workflows.

The platform combines a modern React frontend with a FastAPI backend, database integration, secure authentication, and AI/NLP-oriented analysis capabilities.

🎯 **Project Goal:** Make recruitment more intelligent and help candidates understand how well their profiles align with job requirements.

## ✨ Key Features

### 📄 1. Resume Management
- Upload resumes in PDF format.
- Extract resume text and relevant candidate information.
- Store uploaded resumes and associate them with user accounts.
- Re-analyze resumes when needed.

### 🤖 2. AI-Powered Resume Analysis
- Analyze resume content and identify relevant skills.
- Extract education, experience, projects, and certifications where supported by the analysis pipeline.
- Generate resume scores and insights.
- Provide recommendations to improve resume quality.

### 🎯 3. Intelligent Job Matching
- Compare a resume with a selected job description.
- Calculate a match score using available matching signals.
- Identify matched and missing skills.
- Compare relevant keywords and experience requirements.
- Provide recommendations to improve alignment with a job.

### 💼 4. Job Discovery
- Browse available job opportunities.
- View job descriptions, required skills, and experience requirements.
- Discover roles relevant to a candidate's skills and experience.

### 🧭 5. Career Intelligence
- Explore career-related insights based on available profile and analysis data.
- Identify potential skill gaps.
- Receive guidance on skills that may improve job readiness.

### 📝 6. Application Management
- Apply for available job opportunities.
- Track submitted applications through the candidate interface.
- Support recruitment workflows through application records.

### 🏢 7. Recruiter Features
- Create and manage job listings.
- Access recruiter-oriented dashboards and recruitment workflows.
- Support candidate and application management, subject to configured permissions.

### 🔐 8. Authentication & Security
- User authentication using JSON Web Tokens (JWT).
- Protected API endpoints.
- Role-based access control for supported candidate and recruiter features.
- User-associated resume and job data.

### 📊 9. Dashboard & Profile
- View relevant career and recruitment information.
- Manage candidate profile information.
- Access resumes, job matches, and applications from the platform interface.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, HTML5, CSS3 |
| Backend | Python, FastAPI |
| API Documentation | Swagger UI, OpenAPI |
| Database | SQLAlchemy ORM with a configured database driver |
| Authentication | JWT, Passlib, password hashing |
| Resume Processing | PyMuPDF, python-docx |
| Data Processing | Pandas, NumPy |
| Machine Learning / NLP | scikit-learn, spaCy, Sentence Transformers (where integrated) |
| Development Tools | VS Code, Git, GitHub, npm, Python virtual environments |

> **Note:** The exact database engine and the AI/NLP libraries used by each feature depend on the project's current configuration and implementation.

---

## 🏗️ Project Architecture

```text
HireIntel-AI/
│
├── backend/
│   ├── app/
│   │   ├── core/                 # Configuration, database and security
│   │   ├── models/               # SQLAlchemy database models
│   │   ├── routers/              # FastAPI API endpoints
│   │   ├── schemas/              # Request and response schemas
│   │   ├── services/             # Business logic and analysis services
│   │   └── main.py               # FastAPI application entry point
│   ├── requirements.txt
│   └── .env                      # Local environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Application pages
│   │   └── App.jsx               # Main React application
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .env.example                  # Environment variable template
├── .gitignore
└── README.md
```

*The directory structure above is representative. Some files and folders may differ depending on the current version of the project.*

---

## ⚙️ Getting Started

Follow these steps to run HireIntel AI locally.

### ✅ Prerequisites

Install the following tools:

- 🐍 Python 3.11 or another version supported by the installed dependencies
- 🟢 Node.js and npm
- 🗄️ A database supported by your SQLAlchemy configuration
- 🔧 Git

Verify your installations:

```bash
python --version
node --version
npm --version
git --version
```

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/AnuragA01/HireIntel-AI.git
cd HireIntel-AI
```

### 2️⃣ Configure the Backend

Open a terminal in the project root.

Create and activate a Python virtual environment:

**Windows PowerShell**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install backend dependencies:

```bash
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

Configure the backend environment variables using the project's `.env.example` as a reference. Create `backend/.env` if that is where the current application configuration expects it.

Set the database connection details, JWT secret, and other required values according to `backend/app/core/config.py` and `backend/app/core/database.py`.

⚠️ **Never commit real credentials, database passwords, or JWT secrets to GitHub.**

### 3️⃣ Start the Backend API

From the project root, activate the virtual environment and run:

```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The API should be available at:

- 🌐 API base URL: `http://127.0.0.1:8000`
- 📚 Swagger UI: `http://127.0.0.1:8000/docs`
- ❤️ Health check: `http://127.0.0.1:8000/health`

> These URLs assume the corresponding endpoints are registered in the current backend version. If the health endpoint uses a different path, check the routes shown in Swagger UI.

Keep this terminal running.

### 4️⃣ Configure and Start the Frontend

Open a **second terminal** from the project root.

Install frontend dependencies:

```powershell
cd frontend
npm install
```

Configure the frontend API base URL using the environment variable expected by the current source code. For example, if the app reads `VITE_API_BASE_URL`, create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

⚠️ Use the exact variable name read by your frontend code. If the project currently uses a different variable, configure that variable instead.

Start the development server:

```bash
npm run dev
```

Open the local URL printed in the terminal, commonly:

`http://localhost:5173`

---

## 🔄 Application Workflow

1. 👤 Register an account or log in.
2. 📄 Upload a resume in PDF format.
3. 🧠 Review the extracted resume information and AI analysis.
4. 💼 Browse available job opportunities.
5. 🎯 Match a resume against an existing job.
6. 📈 Review match scores, matched skills, missing skills, and recommendations.
7. 📝 Apply for suitable jobs and review application records.
8. 🧭 Use career insights and skill-gap information to plan improvements.

Recruiters can use the available recruiter features to create job listings and manage recruitment workflows.

---

## 🧪 API Testing

HireIntel AI provides interactive API documentation through FastAPI's Swagger UI.

1. Start the backend.
2. Open `http://127.0.0.1:8000/docs`.
3. Register or log in using the available authentication endpoints.
4. Authorize protected requests using the authentication mechanism shown in Swagger.
5. Upload a resume and note the returned resume ID.
6. Run resume analysis using that resume ID.
7. Retrieve available jobs and note a valid job ID.
8. Run job matching with the selected resume ID and job ID.
9. Inspect the returned match score, matched skills, missing skills, and recommendations.

**Important:** Use IDs returned by your running application. A valid resume ID does not guarantee that a particular job ID exists or is accessible to the current user.

---

## 🔒 Security & Configuration

Before deploying the project:

- 🔑 Use a strong, unique JWT secret stored in environment variables.
- 🛡️ Keep `.env` and `.env.local` files out of version control.
- 🗄️ Configure a production database and appropriate database permissions.
- 🌍 Restrict CORS to trusted frontend origins.
- 🔐 Protect recruiter and candidate endpoints with appropriate authorization checks.
- 📦 Avoid exposing private files, uploaded resumes, tokens, and sensitive API responses.
- 🧪 Test invalid tokens, unauthorized access, and cross-user data access.

Never publish an active JWT token. If a token has been exposed, log out or invalidate the session where supported and review your authentication setup.

---

## 🚀 Deployment

The application can be deployed as separate frontend and backend services.

### Frontend
- Platform: Vercel or another React-compatible hosting provider.
- Root directory: `frontend`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Configure the production API URL using the frontend environment variable expected by the code.

### Backend
- Platform: A Python-compatible hosting provider or cloud server.
- Configure the start command, environment variables, database, and CORS.
- Make sure the production database is persistent.
- Configure the API URL and health-check path supported by the application.

### Production Checklist

- [ ] Frontend build completes successfully.
- [ ] Backend starts without errors.
- [ ] Database connectivity is verified.
- [ ] Registration and login work.
- [ ] Resume upload and analysis work.
- [ ] Job matching works for valid resume and job IDs.
- [ ] Candidate application workflow works.
- [ ] Recruiter access and permissions are verified.
- [ ] Production CORS and environment variables are configured.
- [ ] No secrets or local-only URLs are exposed in the deployed application.

---

## 🔮 Future Enhancements

Potential improvements for future versions include:

- ✨ More advanced semantic resume-to-job matching.
- 📊 Visual skill-gap dashboards and career progress tracking.
- 🎓 Personalized learning recommendations.
- 📬 Job alerts and application status notifications.
- 🧑‍💼 Improved recruiter search and candidate filtering.
- 📈 Analytics for recruitment and candidate engagement.
- ☁️ More robust cloud deployment, monitoring, and automated testing.

These are potential enhancements and should not be interpreted as completed features unless implemented.

---

## 🎓 Learning Outcomes

This project provides practical experience with:

- Full-stack web application development.
- REST API design using FastAPI.
- React-based frontend development.
- Database modeling and ORM integration.
- JWT authentication and access control.
- Resume text extraction and
