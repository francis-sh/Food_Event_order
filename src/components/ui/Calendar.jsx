import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function Calendar({ selected, onSelect, mode = "single" }) {
  return (
    <div className="rounded border p-2 bg-white shadow">
      <DayPicker
        mode={mode}
        selected={selected}
        onSelect={onSelect}
        className="text-sm"
      />
    </div>
  );
}