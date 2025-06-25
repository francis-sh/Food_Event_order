import React from "react";

export default function Button({ children, onClick, variant = "primary", className = "" }) {
  const baseStyle = "px-4 py-2 rounded text-white font-semibold";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-gray-500 hover:bg-gray-600",
    outline: "bg-transparent border border-gray-500 text-gray-700 hover:bg-gray-100",
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}