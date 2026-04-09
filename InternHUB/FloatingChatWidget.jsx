"use client";

import { useState, useRef, useEffect } from "react";

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your InternHub AI. Ask me about interns, departments, or tasks!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Connects directly to the Vanna Python backend (app.py)
      const res = await fetch("http://localhost:8000/api/v0/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      
      let aiContent = "";
      // Formats the response if the backend returned results
      if (data.results && data.results.length > 0) {
        aiContent = "Here are the results:";
      } else {
        aiContent = data.sql ? "Query executed, but no results found." : "I couldn't find any results for that.";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: aiContent, data: data.results, columns: data.columns, sql: data.sql }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please make sure the Vanna AI python backend is running on port 8000." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (msg) => {
    if (msg.role === "user") return <p>{msg.content}</p>;
    
    return (
      <div className="flex flex-col gap-3 w-full">
        <p className="whitespace-pre-wrap">{msg.content}</p>
        
        {/* Render SQL toggle if SQL returned */}
        {msg.sql && (
          <details className="mt-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
            <summary className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">View SQL Code</summary>
            <pre className="mt-2 p-2 bg-black/30 rounded text-xs text-indigo-200 overflow-x-auto border border-white/10">
              {msg.sql}
            </pre>
          </details>
        )}

        {/* Render Result Table if data exists */}
        {msg.data && msg.columns && msg.data.length > 0 && (
          <div className="mt-2 overflow-x-auto rounded border border-slate-700 max-w-full bg-slate-900/50">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  {msg.columns.map((col) => (
                    <th key={col} className="px-2 py-1.5 font-semibold border-b border-slate-700 whitespace-nowrap">
                      {col.replace(/_/g, ' ').toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {msg.data.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/80 text-slate-200 transition-colors">
                    {msg.columns.map(col => (
                      <td key={col} className="px-2 py-1.5 whitespace-nowrap">
                        {row[col] !== null ? String(row[col]) : <span className="text-slate-500 italic">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {msg.data.length > 10 && (
              <div className="bg-slate-800 px-2 py-1 border-t border-slate-700 text-[10px] text-slate-400 font-medium">
                Showing 10 of {msg.data.length} records
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[360px] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all">
          
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-[1.1rem] leading-tight flex items-center gap-2">
                  InternHub AI
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                </h3>
                <p className="text-[11px] text-indigo-100 font-medium tracking-wide opacity-80 uppercase">Vanna SQL Agent Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-indigo-200 p-1 hover:bg-white/10 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-900 scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] rounded-2xl p-3.5 text-[0.9rem] ${
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-br-sm shadow-md" 
                    : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm shadow-sm"
                }`}>
                  {renderMessageContent(msg)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start w-full">
                <div className="bg-slate-800 border border-slate-700 text-slate-400 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="text-xs font-medium mr-1 uppercase tracking-widest text-slate-500">Generating</span>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your data anything..."
                className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-4 pr-12 text-[0.9rem] text-white placeholder-slate-400 outline-none transition-all shadow-inner"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-all flex items-center justify-center shadow-md active:scale-95 disabled:active:scale-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 -rotate-90">
                  <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Chat"
        className={`${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 delay-150'} transition-all duration-300 ease-spring absolute bottom-0 right-0 bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white rounded-full p-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)] shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 ring-4 ring-slate-900 border border-white/10 group flex items-center justify-center`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-[28px] w-[28px] group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    </div>
  );
}
