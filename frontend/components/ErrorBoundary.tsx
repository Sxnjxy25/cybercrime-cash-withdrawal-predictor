"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  moduleName?: string;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error(`[ErrorBoundary - ${this.props.moduleName || "App"}] Render Error:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const moduleName = this.props.moduleName || "Command Center Module";

      return (
        <div className="bg-white border-2 border-red-200 rounded-xl p-6 sm:p-8 shadow-sm font-sans space-y-4 my-4 max-w-2xl mx-auto text-left">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 tracking-wide">
                  {moduleName} Encountered a Rendering Error
                </h4>
                <span className="text-[10px] font-mono font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                  SYSTEM_EXCEPTION
                </span>
              </div>
              <p className="text-xs text-slate-600">
                A non-fatal rendering exception occurred while processing incoming data streams. Other modules in the portal remain operational.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <button
              onClick={this.handleReset}
              className="flex items-center space-x-2 bg-[#005A9C] hover:bg-[#00487D] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload {moduleName}</span>
            </button>

            <button
              onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>{this.state.showDetails ? "Hide Error Trace" : "View Error Trace"}</span>
              {this.state.showDetails ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Collapsible Error Trace */}
          {this.state.showDetails && (
            <div className="mt-3 bg-slate-900 text-slate-200 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48">
              <div className="text-red-400 font-bold mb-1">
                {this.state.error?.name}: {this.state.error?.message}
              </div>
              <pre className="text-slate-400 text-[10px] whitespace-pre-wrap">
                {this.state.errorInfo?.componentStack || this.state.error?.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
