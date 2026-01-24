import React from "react";
import { BarChart3, X } from "lucide-react";

import { useI18n } from "../app/i18n/I18nContext.jsx";
import { EnhancedAnalytics } from "./EnhancedAnalytics.jsx";

export function AnalyticsModal({ isOpen, onClose }) {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white">Enhanced Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-160px)] overflow-y-auto p-4">
          <EnhancedAnalytics />
        </div>
      </div>
    </div>
  );
}
