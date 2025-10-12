// app/components/ui/button.tsx
"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "default";
  children: React.ReactNode;
  className?: string;
}

export function Button({ variant = "default", children, className = "", ...props }: ButtonProps) {
  const baseStyle =
    "px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition";
  const variantStyle =
    variant === "outline"
      ? "border border-orange-300 text-orange-600 hover:bg-orange-50"
      : "bg-orange-500 text-white hover:bg-orange-600";

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
}
