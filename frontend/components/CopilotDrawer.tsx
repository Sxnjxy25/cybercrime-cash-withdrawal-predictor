"use client";

import React, { useState } from "react";
import { Bot, Send, X, ShieldAlert, Sparkles, Database } from "lucide-react";
import { api } from "@/lib/api";

interface CopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CopilotDrawer: React.FC<CopilotProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      sender: "COPILOT",
      text: "CYBERPREDICT AI COPILOT initialized. Ask any empirical question about live cybercrime risk, regional anomalies, active threat clusters, or forecasts.",
      evidence: [],
      metrics: { status: "ONLINE" }
    }
  ]);

  const handleSend = async () => {
    if (!inputQuery.trim()) return;
    const userQ = inputQuery;
    setInputQuery("");
    
    setMessages((prev) => [...prev, { sender: "USER", text: userQ }]);
    setLoading(true);

    try {
      const res = await api.queryCopilot(userQ);
      if (res) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "COPILOT",
            text: res.answer,
            evidence: res.evidence,
            metrics: res.metrics,
            drill_down_actions: res.drill_down_actions
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "COPILOT",
            text: "Insufficient evidence in current database context.",
            evidence: []
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Why is Chennai high risk?",
    "Which districts show abnormal growth?",
    "Show emerging UPI fraud clusters.",
    "Which threats are forecast to increase?"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end font-sans">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 p-5 h-full flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase font-mono">AI COPILOT</h2>
              <p className="text-[10px] text-purple-700 font-mono">DATABASE RAG INTELLIGENCE</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 my-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl text-xs max-w-[90%] leading-relaxed ${
                m.sender === "USER"
                  ? "bg-[#005A9C] text-white ml-auto"
                  : "bg-slate-50 text-slate-800 border border-slate-200 mr-auto"
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1 text-[10px] font-mono">
                <span className={m.sender === "USER" ? "text-blue-100 font-bold" : "text-[#005A9C] font-bold"}>
                  {m.sender === "USER" ? "COMMAND OFFICER" : "AI INTELLIGENCE CORE"}
                </span>
              </div>
              <p className="whitespace-pre-line">{m.text}</p>

              {/* Evidence citations */}
              {m.evidence && m.evidence.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] font-mono">
                  <span className="text-slate-500 font-bold block mb-1">EMPIRICAL EVIDENCE RETRIEVED:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {m.evidence.map((ev: string, i: number) => (
                      <li key={i} className="truncate">{ev}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center space-x-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
              <span>Synthesizing intelligence telemetry...</span>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-mono text-slate-500">QUICK INTELLIGENCE QUERIES:</span>
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputQuery(q);
                }}
                className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md transition-all cursor-pointer font-mono"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Copilot about trends, risks, anomalies..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#005A9C] focus:bg-white font-mono"
            />
            <button
              onClick={handleSend}
              disabled={loading || !inputQuery.trim()}
              className="p-2 rounded-lg bg-[#005A9C] hover:bg-[#00487D] text-white disabled:opacity-40 transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
