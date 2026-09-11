"use client";

import React from "react";
import { FolderSearch, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderSearch,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ""
}) => {
  return (
    <div
      className={`bg-white p-8 sm:p-12 rounded-xl border border-slate-200 text-center space-y-4 shadow-sm font-sans max-w-lg mx-auto my-6 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-[#005A9C] shadow-xs">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-black text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="bg-[#005A9C] hover:bg-[#00487D] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {actionLabel}
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-all cursor-pointer border border-slate-200"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
