# ResumeIQ

## AI-Powered Resume Intelligence & Recruitment Platform

ResumeIQ is a recruitment platform designed to simplify candidate management, resume processing, and candidate discovery using AI.

The platform allows recruiters to upload resumes, extract candidate information, manage candidate profiles, preview and download resumes, and use an AI Assistant to search candidates using natural-language queries.

---

## Features

### Candidate Management

- Upload candidate resumes
- Parse resume information
- Store candidate information in PostgreSQL
- View candidate profiles
- Search and manage candidates
- Track candidate information from a centralized dashboard

### AI Candidate Search

ResumeIQ includes an AI-powered Assistant that allows recruiters to search candidates using natural-language queries.

Examples:

```text
Show me all candidates
Find candidates who know Python
Show me candidates with React experience
Find candidates with Java experience

The AI Assistant respects the authenticated user's access permissions when retrieving candidates.

# Resume Management
Resume upload
Resume parsing
Resume preview
Resume download
Authenticated resume access

# Authentication & Security
JWT-based authentication
Authenticated API requests
Candidate ownership checks
Protected candidate profile endpoints
Protected resume access
Role-based access for administrative functionality

# Dashboard & Analytics
Recruitment dashboard
Candidate statistics
Analytics
Candidate profile management
Administrator profile management

## Technology Stack

# Frontend
React
Vite
JavaScript
Tailwind CSS
Axios
React Router
Lucide React

# Backend
Python
FastAPI
Uvicorn
JWT Authentication

# Database
PostgreSQL

# AI
Ollama
Llama-based local AI model

# Development Tools
Git
GitHub
VS Code

## Application Architecture
ResumeIQ
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── ai_chat.py
│   ├── auth.py
│   ├── database.py
│   ├── database_operations.py
│   ├── excel_exporter.py
│   ├── main.py
│   ├── resume_parser.py
│   └── structured_parser.py
│
├── database/
│
├── resumes/
│
├── .gitignore
└── README.md


## System Flow
Recruiter
    │
    ▼
React Frontend
    │
    │ JWT Authentication
    ▼
FastAPI Backend
    │
    ├──────────────► PostgreSQL
    │
    ├──────────────► Resume Parser
    │
    └──────────────► Ollama AI
                         │
                         ▼
                   AI Candidate Search


## Prerequisites

Before running ResumeIQ locally, install:

Python 3.12+
Node.js
npm
PostgreSQL
Ollama
Git


## Environment Variables

Create the required .env files for your local environment.

For the Vite frontend:

VITE_API_URL=http://127.0.0.1:8000

Do not commit .env files or secrets to GitHub.

## Running ResumeIQ Locally

1. Clone the Repository
git clone https://github.com/jamilunnisha/ResumeIQ.git
cd ResumeIQ

2. Backend Setup

Navigate to the backend:

</> cd backend

Create a Python virtual environment:

</> python -m venv venv

Activate it on Windows:

</> venv\Scripts\activate

Install the required Python packages:

</> pip install -r requirements.txt

Start the FastAPI server:

</> uvicorn main:app --reload

The backend will normally run at:

http://127.0.0.1:8000


3. Frontend Setup

Open another terminal and navigate to:

</> cd frontend

Install dependencies:

</> npm install

Start the development server:

</> npm run dev

Vite will provide the local frontend URL in the terminal.

4. PostgreSQL

ResumeIQ uses PostgreSQL for storing application and candidate data.

Make sure PostgreSQL is running and configure the required database connection settings through environment variables used by the backend.

Never commit database passwords or other credentials to GitHub.

5. Ollama

ResumeIQ uses Ollama for AI-powered candidate search.

Make sure Ollama is installed and running locally before using the AI Assistant.

The backend communicates with the local Ollama service to process natural-language candidate queries.

## AI Assistant

The ResumeIQ AI Assistant allows recruiters to search candidates using natural language.

For example:

Show me all candidates
Find candidates with Python skills
Show candidates who have React experience

# The AI processing flow is:

User Query
    ↓
React AI Assistant
    ↓
FastAPI /chat
    ↓
JWT Authentication
    ↓
Candidate Search
    ↓
Ollama AI
    ↓
Authorized Candidate Results
    ↓
Candidate Profile

Candidate access is validated by the backend rather than relying only on frontend navigation.

## Authentication

ResumeIQ uses JWT authentication.

# The authentication flow is:

Login
  ↓
FastAPI Authentication
  ↓
JWT Token
  ↓
Frontend Storage
  ↓
Authorization: Bearer <token>
  ↓
Protected API Endpoints

The frontend API client automatically attaches the authentication token to authenticated API requests.

## Resume Processing

When a recruiter uploads a resume:

Resume Upload
     ↓
FastAPI Backend
     ↓
Resume Parser
     ↓
Candidate Information Extraction
     ↓
PostgreSQL
     ↓
Candidate Profile

Recruiters can then preview or download the associated resume through authenticated endpoints.

## Security

ResumeIQ applies authentication and authorization to protected resources.

Important security considerations include:

JWT authentication
Protected API endpoints
Candidate ownership validation
Authenticated resume access
Environment variables for sensitive configuration
Exclusion of local resumes and generated data from Git


## Production Deployment

The application can be deployed using separate frontend and backend services.

Recommended deployment architecture:

                ┌─────────────────┐
                │     Vercel      │
                │ React Frontend  │
                └────────┬────────┘
                         │
                         │ HTTPS API
                         ▼
                ┌─────────────────┐
                │ Backend Hosting │
                │ FastAPI         │
                └────────┬────────┘
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
      ┌─────────────┐         ┌─────────────┐
      │ PostgreSQL  │         │ AI Service  │
      │  Database   │         │   Ollama    │
      └─────────────┘         └─────────────┘

The frontend uses:

</> VITE_API_URL=<deployed-backend-url>

for production API communication.

## Current Development Status
 React frontend
 FastAPI backend
 PostgreSQL integration
 JWT authentication
 Resume upload
 Resume parsing
 Candidate management
 Candidate profiles
 Resume preview/download
 AI candidate search
 Authenticated AI candidate access
 Production frontend build
 Git/GitHub repository


## Future Enhancements

Potential future improvements include:

Advanced candidate ranking
Improved semantic candidate matching
Recruitment pipeline automation
Email notifications
Interview scheduling
Advanced analytics
Candidate recommendation system
Production AI infrastructure
Cloud-based resume storage