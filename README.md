# NeuralDoc | AI Document Researcher

NeuralDoc is a high-performance Retrieval-Augmented Generation (RAG) web application, modeled after Google's NotebookLM. It allows users to upload PDF or TXT documents and instantly chat with them using the Llama 3.1 model. The app strictly grounds its answers in the provided document and cites the source and page number for its claims.

## 🚀 Architecture
This project is built using a clean, modern 2-tier architecture:
- **Frontend (`/frontend`)**: A React (Vite) application styled with Tailwind CSS, featuring a premium glassmorphic UI.
- **RAG Engine Backend (`/rag_system`)**: A Python FastAPI server that processes documents using LangChain, chunks them using `RecursiveCharacterTextSplitter`, stores vectors locally using Qdrant, and generates responses using the Groq API (`llama-3.1-8b-instant`).

---

## 🛠️ Local Development Setup

### 1. Python RAG System
```bash
cd rag_system
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file in `/rag_system`:
```env
GROQ_API_KEY=your_groq_api_key_here
```
Run the server:
```bash
python3 main.py
```

### 2. React Frontend
```bash
cd frontend
npm install
```
Run the frontend:
```bash
npm run dev
```

---

## 🌍 Deployment Guide

To put this project live on the internet, you will need to deploy the Frontend on **Vercel** and the Python Backend on **Render**.

### Step 1: Deploy Python Backend (Render)
1. Push your entire repository to GitHub.
2. Go to [Render](https://render.com) and click **New > Web Service**.
3. Connect your GitHub repository.
4. **Configuration:**
   - **Name:** `neuraldoc-backend`
   - **Root Directory:** `rag_system`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables:**
   - Add `GROQ_API_KEY` with your Groq API key.
6. Click **Deploy**. Once finished, copy the provided `.onrender.com` URL (e.g., `https://neuraldoc-backend.onrender.com`).

### Step 2: Deploy Frontend (Vercel)
1. Open `frontend/src/App.jsx`.
2. Find `const API_URL = "http://localhost:8000";` near the top of the file.
3. Change it to your new Python backend URL: 
   `const API_URL = "https://neuraldoc-backend.onrender.com";`
4. Commit and push this change to GitHub.
5. Go to [Vercel](https://vercel.com) and click **Add New > Project**.
6. Import your GitHub repository.
7. **Configuration:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
8. Click **Deploy**.

🎉 **Congratulations! Your AI Document Researcher is now live.**
