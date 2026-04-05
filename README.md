# 🏥 AI Medical Transcriber & Triage System

An AI-powered healthcare application designed for the Indian Government Healthcare System. This tool converts raw, unstructured doctor's notes (or voice transcriptions) into structured medical records and detects potential medical emergencies in real time.

---

## 🚀 Features

- **Generative AI Processing**  
  Uses Gemini 2.5 Flash to extract patient details, symptoms, and diagnoses from unstructured text.

- **Automated Emergency Triage**  
  Detects critical conditions like heart attacks, trauma, etc., and suggests immediate actions.

- **Structured JSON Output**  
  Outputs standardized medical records for easy database integration.

- **Modern Full-Stack Architecture**  
  Fast React frontend + scalable FastAPI backend.

---

## 💻 Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Python
- FastAPI
- Uvicorn

### AI Engine
- Google GenAI SDK (`google-genai`)
- Gemini 2.5 Flash

---

## 📁 Project Structure

```
indian-health-ai/
│
├── backend/
│   ├── main.py
│   ├── gemini_service.py
│   ├── venv/
│   └── .env
│
├── frontend/
│   ├── src/
│   │   └── App.jsx
│   └── node_modules/
│
└── .gitignore
```

---

## 🛠️ Setup & Installation

### Prerequisites

- Node.js installed
- Python 3.8+
- Gemini API Key

---

## 🔑 How to Get Gemini API Key

1. Go to: https://aistudio.google.com/
2. Sign in with your Google account
3. Click on **"Get API Key"**
4. Create a new API key
5. Copy the API key

---

## 🔐 Add API Key to `.env`

Create a `.env` file inside the `backend/` folder:

```
GEMINI_API_KEY=your_api_key_here
```

---

## 📄 Create `.gitignore`

```
backend/venv/
backend/.env
__pycache__/
frontend/node_modules/
frontend/.env
```

---

## ⚙️ Backend Setup

```bash
mkdir backend
cd backend

python -m venv venv

# Activate virtual environment

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic python-dotenv google-genai
```

---

## ⚛️ Frontend Setup

```bash
# Go back to root folder
cd ..

# Create frontend app
npm create vite@latest frontend -- --template react

# Select:
# ✔ React
# ✔ JavaScript

# Move into frontend
cd frontend

# Install dependencies
npm install
```

---

## ▶️ Running the Application

### Start Backend

```bash
cd backend
uvicorn main:app --reload
```

Backend runs on: http://127.0.0.1:8000

---

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

---

## 📌 Notes

- Ensure your `.env` file is correctly configured before running the backend.
- Do NOT commit `.env` or `venv/` to GitHub.
- You can extend the triage system by adding more medical rules or integrating hospital APIs.

---

## 🚀 Future Improvements

- Voice-to-text integration for real-time doctor dictation
- Integration with government health databases
- Advanced emergency prediction using ML models
- Patient history tracking system

---

## 👨‍💻 Author

Built as a real-world impactful healthcare AI project.