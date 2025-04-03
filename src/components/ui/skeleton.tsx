// src/components/ui/skeleton.tsx
import React from "react";

export const Skeleton: React.FC<{ className: string }> = ({ className }) => (
  <div className={`bg-gray-300 animate-pulse ${className}`} />
);
