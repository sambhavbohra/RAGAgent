# NeuralDoc | AI Document Researcher

![NeuralDoc](frontend/public/logo.png)

NeuralDoc is a high-performance **Retrieval-Augmented Generation (RAG)** web application, deeply inspired by Google's NotebookLM. It empowers users to upload PDF or TXT documents and instantly converse with them using advanced LLMs. 

The application strictly grounds its responses in the provided text, ensuring zero hallucinations, and actively cites the exact source filename and page number for every claim it makes.

---

## ✨ Key Features
- **Document Ingestion:** Instantly parse and chunk complex PDF and TXT files.
- **Strict Grounding:** Chatbot responses are generated *strictly* using the context from the uploaded document.
- **Accurate Citations:** Every answer includes precise citations (e.g., `Source: guide.pdf, Page: 12`).
- **Premium UI:** A stunning, responsive, glassmorphic interface powered by Tailwind CSS.
- **State Isolation:** Uploading a new document cleanly resets the vector store and conversation history.

---

## 🏗️ Architecture & Tech Stack

This project is built using a modern, decoupled 2-tier architecture:

### 1. Frontend: React + Vite + Tailwind CSS
- **Framework:** React.js bootstrapped with Vite for lightning-fast HMR.
- **Styling:** Tailwind CSS (v3) utilizing custom glassmorphism utilities, modern typography (Inter), and CSS animations.
- **Icons:** `lucide-react` for crisp, scalable vector icons.

### 2. Backend RAG Engine: Python + FastAPI
- **Framework:** FastAPI for high-performance, async API endpoints.
- **Orchestration:** LangChain for linking document loaders, splitters, vector stores, and LLMs.
- **Embeddings:** HuggingFace `sentence-transformers` (`all-MiniLM-L6-v2`) running locally to convert text chunks into vector representations.
- **Vector Storage:** Qdrant Local (`langchain-qdrant`) for fast, persistent, and serverless vector similarity search.
- **LLM:** Groq API running `llama-3.1-8b-instant` for incredibly fast, open-source inference.

---

## 🛠️ Local Development Setup

To run this project locally, you will need to start both the Python backend and the React frontend.

### 1. Start the Python RAG Engine
Open a terminal and navigate to the `rag_system` directory:
```bash
cd rag_system
```

Create and activate a virtual environment:
```bash
# On Mac/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

Install the required dependencies:
```bash
pip install -r requirements.txt
```

Set up your environment variables by creating a `.env` file inside the `rag_system` folder:
```env
GROQ_API_KEY=your_groq_api_key_here
```

Start the FastAPI server:
```bash
python3 main.py
```
*The backend will now be running on `http://localhost:8000`.*

### 2. Start the React Frontend
Open a **new** terminal and navigate to the `frontend` directory:
```bash
cd frontend
```

Install the Node dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The frontend will now be running on `http://localhost:5173`.*

---

## 💡 Usage Guide
1. Open the frontend URL in your browser.
2. Drag and drop a PDF or TXT file into the upload zone and click **Read Document**.
3. Wait for the file to be parsed, chunked, and embedded into the local Qdrant database.
4. Once the interface transitions to the active document state, use the chat input to ask questions about your file!
5. To analyze a different file, click **Upload New Document** to cleanly reset the workspace.
