// src/components/common/Skeleton.jsx
import React from 'react';

export default function Skeleton({ className = '', height = 'h-4', width = 'w-full' }) {
  return (
    <div
      className={`animate-pulse bg-gray-700 rounded ${height} ${width} ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-4">
      <Skeleton height="h-6" width="w-3/4" />
      <Skeleton height="h-4" width="w-1/2" />
      <Skeleton height="h-16" width="w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton height="h-4" width="w-32" />
              <Skeleton height="h-3" width="w-24" />
            </div>
          </div>
          <Skeleton height="h-4" width="w-20" />
        </div>
      ))}
    </div>
  );
}

export function GameSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-xl h-48 flex items-center justify-center">
        <Skeleton className="w-24 h-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
