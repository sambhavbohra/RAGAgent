import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, Send, BookOpen, Loader2, Sparkles, User, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documentIndexed, setDocumentIndexed] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetDocument = () => {
    setFile(null);
    setDocumentIndexed(false);
    setUploadMessage("");
    setMessages([]);
    setQuery("");
  };

  const uploadFile = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadMessage("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setDocumentIndexed(true);
      setUploadMessage(`Ready! I've read your document.`);
      setMessages([{ role: "ai", content: `I've successfully read "${file.name}". What would you like to know about it?`, sources: [] }]);
    } catch (err) {
      console.error(err);
      setUploadMessage("Failed to upload and index document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || !documentIndexed) return;

    const userQuery = query.trim();
    setMessages(prev => [...prev, { role: "user", content: userQuery }]);
    setQuery("");
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { query: userQuery });
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: res.data.answer,
        sources: res.data.sources
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "Sorry, I encountered an error while trying to process your request." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6 max-w-[1600px] mx-auto animate-fade-in">
      
      {/* Sidebar Panel */}
      <aside className="glass-panel w-full md:w-80 lg:w-96 rounded-3xl p-6 flex flex-col shadow-blue-900/20 shrink-0 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/5 opacity-50 pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <img src="/logo.png" alt="NeuralDoc Logo" className="w-12 h-12 rounded-xl shadow-lg shadow-blue-500/30 object-cover" />
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Neural<span className="text-gradient">Doc</span></h1>
        </div>

        <div className="flex-1 flex flex-col gap-6 relative z-10">
          {!documentIndexed ? (
            <>
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group/drop
                  ${dragActive ? "border-primary bg-primary/10" : "border-slate-600 hover:border-primary/50 hover:bg-slate-800/50"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload").click()}
              >
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300
                  ${dragActive ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" : "bg-slate-800 text-primary group-hover/drop:bg-primary/20"}`}>
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Upload Document</h3>
                <p className="text-sm text-slate-400">Drag & drop your PDF or click to browse files.</p>
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                />
              </div>

              {file && (
                <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/5 animate-slide-up shadow-inner">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FileText size={20} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full relative overflow-hidden rounded-xl font-semibold text-white py-3 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group/btn
                      bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/25 active:scale-[0.98]"
                    onClick={uploadFile}
                    disabled={isUploading}
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {isUploading ? (
                        <><Loader2 className="animate-spin" size={18} /> Reading document...</>
                      ) : "Read Document"}
                    </div>
                  </button>
                  
                  {uploadMessage && (
                    <div className="mt-4 p-3 rounded-lg text-sm flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      {uploadMessage}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/5 animate-slide-up shadow-inner flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-emerald-400" />
              </div>
              <h3 className="font-medium text-slate-200 mb-1 truncate w-full px-2">{file?.name}</h3>
              <p className="text-xs text-emerald-400 mb-6 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Document
              </p>
              
              <button 
                onClick={resetDocument}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Upload New Document
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="glass-panel flex-1 rounded-3xl flex flex-col overflow-hidden shadow-purple-900/20 border-white/5">
        
        <header className="px-6 py-4 border-b border-white/10 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-200">AI Assistant</h2>
            <p className="text-xs text-slate-400">Your AI Reading Assistant</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${documentIndexed ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${documentIndexed ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {documentIndexed ? 'Ready' : 'Waiting for document'}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-900/20 scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto animate-fade-in opacity-80">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/5">
                <Sparkles className="text-blue-400 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-200 mb-3">Your Research Partner</h2>
              <p className="text-slate-400 leading-relaxed">
                Upload a document on the left to start. I will read through it entirely and answer any questions strictly based on the text provided.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 max-w-[85%] animate-slide-up ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg
                  ${msg.role === 'ai' ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {msg.role === 'ai' ? <Sparkles size={20} /> : <User size={20} />}
                </div>
                
                <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-[0.95rem] leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'bg-slate-800/80 text-slate-200 rounded-tl-sm border border-white/5'}`}>
                    {msg.content}
                  </div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.sources.map((src, i) => (
                        <div key={i} className="px-3 py-1.5 bg-slate-800/60 border border-slate-700 rounded-lg text-xs text-slate-300 flex items-center gap-1.5 shadow-sm">
                          <FileText size={12} className="text-purple-400" />
                          {src}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex gap-4 max-w-[85%] animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg text-white">
                <Sparkles size={20} />
              </div>
              <div className="bg-slate-800/80 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex items-center gap-2">
                <Loader2 className="animate-spin text-primary" size={18} />
                <span className="text-sm text-slate-400 font-medium">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-md border-t border-white/10">
          <form 
            onSubmit={handleSend}
            className="flex items-center gap-3 bg-slate-800/50 border border-slate-600 rounded-xl p-2 transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-slate-800"
          >
            <input 
              type="text" 
              className="flex-1 bg-transparent border-none text-slate-200 px-4 py-2 outline-none placeholder:text-slate-500"
              placeholder={documentIndexed ? "Ask something about the document..." : "Upload a document to start..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!documentIndexed || isTyping}
            />
            <button 
              type="submit" 
              className="w-12 h-12 flex items-center justify-center bg-primary hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-400 shrink-0"
              disabled={!documentIndexed || !query.trim() || isTyping}
            >
              <Send size={20} className={query.trim() && documentIndexed && !isTyping ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-500 mt-3">
            I only answer using the information found in your document.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
