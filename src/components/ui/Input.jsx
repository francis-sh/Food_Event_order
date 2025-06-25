import React from "react";

export default function Input({ type = "text", placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="border rounded px-3 py-2 w-full"
    />
  );
}