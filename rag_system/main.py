import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains.retrieval import create_retrieval_chain

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_store = None
retriever = None

class ChatRequest(BaseModel):
    query: str

@app.get("/")
async def root():
    return {"status": "RAG System is Up and Running", "engine": "FastAPI + Qdrant + Groq"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    global vector_store, retriever
    try:
        # Save uploaded file temporarily
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Load document
        print(f"--- Loading document: {file.filename} ---")
        if file.filename.endswith(".pdf"):
            loader = PyPDFLoader(temp_file_path)
        else:
            loader = TextLoader(temp_file_path)
            
        docs = loader.load()
        print(f"Successfully loaded {len(docs)} pages")
        
        # Chunking strategy
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        splits = text_splitter.split_documents(docs)
        print(f"Split into {len(splits)} chunks")
        
        # Embedding and Storage
        print("Starting embedding (this might take a moment)...")
        
        vector_store = QdrantVectorStore.from_documents(
            splits,
            embeddings,
            location=":memory:",
            collection_name="notebooklm_docs"
        )
        retriever = vector_store.as_retriever(search_kwargs={"k": 4})
        print("Indexing completed successfully!")
        
        # Clean up temp file
        os.remove(temp_file_path)
        
        return {"message": "Document uploaded and indexed successfully.", "chunks": len(splits)}
    except Exception as e:
        import traceback
        print("\n" + "="*50)
        print(f"CRITICAL ERROR DURING UPLOAD: {e}")
        traceback.print_exc()
        print("="*50 + "\n")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_document(request: ChatRequest):
    global retriever
    if not retriever:
        raise HTTPException(status_code=400, detail="No document uploaded yet.")
    try:
        # Initialize LLM
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set.")
            
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0,
            groq_api_key=groq_api_key
        )
        
        # Define prompt template
        system_prompt = (
            "You are an AI assistant designed to answer questions based ONLY on the provided context. "
            "If the answer cannot be found in the context, you must truthfully say 'I don't know based on the provided document'. "
            "Do not use outside knowledge. Provide citations or refer to the context when possible.\n\n"
            "Context: {context}"
        )
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        # Create retrieval chain
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        
        response = rag_chain.invoke({"input": request.query})
        
        # Format sources
        sources = []
        for doc in response["context"]:
            source = doc.metadata.get("source", "Unknown")
            page = doc.metadata.get("page", "Unknown")
            
            if isinstance(source, str):
                source_name = os.path.basename(source)
                if source_name.startswith("temp_"):
                    source_name = source_name[5:]
                sources.append(f"Source: {source_name}, Page: {page}")
            else:
                sources.append(f"Source: {source}, Page: {page}")
            
        return {
            "answer": response["answer"],
            "sources": list(set(sources))
        }
    except Exception as e:
        import traceback
        print("\n" + "!"*50)
        print(f"ERROR DURING CHAT: {e}")
        traceback.print_exc()
        print("!"*50 + "\n")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
