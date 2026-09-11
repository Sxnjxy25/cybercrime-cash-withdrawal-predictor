"use client";

import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      {...props}
    />
  );
};

export const KpiCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 6,
  cols = 6
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Table Header Skeleton */}
      <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex items-center justify-between gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`th-${i}`} className="h-3.5 flex-1 max-w-[140px]" />
        ))}
      </div>
      {/* Table Rows Skeleton */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`tr-${r}`} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 flex-1 max-w-[160px]">
              <Skeleton className="w-4 h-4 rounded" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
            <div className="flex-1 space-y-1 max-w-[180px]">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-4 w-20 flex-1 max-w-[100px]" />
            <div className="flex-1 space-y-1 max-w-[140px]">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full flex-1 max-w-[80px]" />
            <Skeleton className="h-8 w-24 rounded-lg flex-1 max-w-[100px] ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: string; title?: string }> = ({
  height = "h-64",
  title
}) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      )}
      <div className={`w-full ${height} flex items-end justify-between gap-2 pt-6 px-2`}>
        {Array.from({ length: 8 }).map((_, i) => {
          const heights = ["h-2/5", "h-3/5", "h-4/5", "h-1/2", "h-3/4", "h-2/3", "h-5/6", "h-3/5"];
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <Skeleton className={`w-full ${heights[i % heights.length]} rounded-t`} />
              <Skeleton className="h-2.5 w-8" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DossierSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
      {/* Officer Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* ATM Hotspot Cards */}
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3.5 border border-slate-200 rounded-lg space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-12 rounded" />
              </div>
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-7 w-full rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
