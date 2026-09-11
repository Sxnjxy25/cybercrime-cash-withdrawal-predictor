"use client";

import React, { useState } from "react";
import { AlertTriangle, RefreshCw, AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  errorCode?: string;
  onRetry?: () => Promise<void> | void;
  retryLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Telemetry Stream Unavailable",
  message = "Failed to establish a secure connection to the data endpoint. The service might be temporarily unavailable or delayed by network latency.",
  errorCode,
  onRetry,
  retryLabel = "Retry Request",
  secondaryAction,
  compact = false
}) => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-red-50/90 border border-red-200 text-red-800 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs shadow-sm font-sans">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <div className="truncate">
            <span className="font-bold text-red-900">{title}: </span>
            <span className="text-red-700">{message}</span>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="flex items-center space-x-1.5 bg-white hover:bg-red-50 text-red-700 font-bold px-3 py-1.5 rounded-lg border border-red-200 shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin text-red-600" : ""}`} />
            <span>{retrying ? "Retrying..." : retryLabel}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-8 sm:p-10 rounded-xl border border-red-200 text-center space-y-4 shadow-sm font-sans max-w-xl mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-red-100/80 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-xs">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-center space-x-2">
          <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
          {errorCode && (
            <span className="text-[10px] font-mono font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">
              {errorCode}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          {message}
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="flex items-center space-x-2 bg-[#005A9C] hover:bg-[#00487D] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin text-yellow-300" : ""}`} />
            <span>{retrying ? "Reconnecting..." : retryLabel}</span>
          </button>
        )}

        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-lg transition-all cursor-pointer border border-slate-200"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
};
