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
      text: "CYBERPREDICT OBSIDIAN AI COPILOT initialized. Ask any empirical question about live cybercrime risk, regional anomalies, active threat clusters, or forecasts.",
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
    <div className="fixed inset-0 z-50 bg-[#090909]/80 backdrop-blur-sm flex justify-end font-mono">
      <div className="w-full max-w-lg bg-[#0D0D0F] border-l border-[#242428] p-5 h-full flex flex-col justify-between shadow-2xl glass-obsidian-violet">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F1F23] pb-3 mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/40">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#F5F2EA] tracking-wide uppercase">AI COPILOT</h2>
              <p className="text-[10px] text-[#8B5CF6] font-mono">OBSIDIAN DATABASE RAG INTELLIGENCE</p>
            </div>
          </div>

          <button onClick={onClose} className="text-[#A6A19A] hover:text-[#F5F2EA] p-1 rounded-lg">
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
                  ? "bg-[#8B5CF6]/20 text-[#F5F2EA] border border-[#8B5CF6]/40 ml-auto"
                  : "bg-[#121214] text-[#F5F2EA] border border-[#242428] mr-auto"
              }`}
            >
              <div className="flex items-center justify-between mb-1 text-[10px] font-mono text-[#A6A19A]">
                <span className="font-bold">{m.sender}</span>
                {m.sender === "COPILOT" && <span className="text-[#8B5CF6] font-bold">100% FACTUAL</span>}
              </div>

              <p>{m.text}</p>

              {m.drill_down_actions && m.drill_down_actions.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#242428] flex flex-wrap gap-1.5">
                  {m.drill_down_actions.map((act: any, aIdx: number) => (
                    <span
                      key={aIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 cursor-pointer"
                    >
                      {act.label} →
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="bg-[#121214] p-3 rounded-xl text-xs text-[#8B5CF6] font-mono flex items-center space-x-2">
              <Sparkles className="w-4 h-4 animate-spin text-[#8B5CF6]" />
              <span>Querying database metrics & running ML engines...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="mb-3 space-y-1">
          <p className="text-[10px] font-mono text-[#A6A19A] uppercase">SUGGESTED QUESTIONS:</p>
          <div className="flex flex-wrap gap-1">
            {sampleQuestions.map((q, qIdx) => (
              <button
                key={qIdx}
                onClick={() => setInputQuery(q)}
                className="px-2 py-1 bg-[#121214] hover:bg-[#171719] text-[10px] text-[#A6A19A] rounded border border-[#242428]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center space-x-2 pt-2 border-t border-[#1F1F23]">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Copilot about risk, threats, or forecasts..."
            className="flex-1 bg-[#090909] text-xs text-[#F5F2EA] px-3 py-2 rounded-lg border border-[#242428] focus:outline-none focus:border-[#8B5CF6]"
          />
          <button
            onClick={handleSend}
            className="p-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#090909] font-bold rounded-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
