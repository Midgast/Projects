import React from "react";

const styles = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-50 text-amber-800 border-amber-200",
  red: "bg-rose-50 text-rose-700 border-rose-200",
};

export function RiskPill({ level, score }) {
  const cls = styles[level] || styles.yellow;
  const label = level === "green" ? "Low risk" : level === "yellow" ? "Medium risk" : "High risk";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${cls}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      <span>{label}</span>
      {typeof score === "number" && <span className="opacity-80">{score}</span>}
    </span>
  );
}
