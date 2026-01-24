import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3, TrendingUp, Users, AlertTriangle, BookOpen, Calendar, Download, Filter } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { useI18n } from "../app/i18n/I18nContext.jsx";
import { EnhancedAnalytics } from "./EnhancedAnalytics.jsx";
import { Button } from "./ui/Button.jsx";
import { Card } from "./ui/Card.jsx";

export function EnhancedAnalyticsModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "students", label: "Students", icon: Users },
    { id: "subjects", label: "Subjects", icon: BookOpen },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="w-full max-w-7xl mx-4 max-h-[90vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Enhanced Analytics</h2>
                <p className="text-sm text-slate-400">Comprehensive insights and metrics</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-4 border-b border-white/10 bg-slate-800/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              <EnhancedAnalytics />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Last updated: {new Date().toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live data
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
