import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, BookOpen, AlertTriangle } from "lucide-react";

export function MiniChart({ data, color = "blue", label }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <div className={`w-2 h-2 bg-${color}-500 rounded-full`}></div>
      </div>
      <div className="flex items-end gap-1 h-16">
        {data.map((point, index) => {
          const height = ((point.value - minValue) / range) * 100;
          return (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`flex-1 bg-${color}-500 rounded-t`}
              style={{ backgroundColor: `rgb(${color === 'green' ? '34, 197, 94' : color === 'red' ? '239, 68, 68' : '59, 130, 246'})` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function StatCard({ title, value, change, icon: Icon, color = "blue", trend }) {
  const isPositive = trend === 'up';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? 'text-green-400' : 'text-red-400';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span>{change}%</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm text-slate-400">{title}</p>
      </div>
    </motion.div>
  );
}

export function ProgressRing({ value, size = 120, strokeWidth = 8, color = "blue" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`text-${color}-500`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{value}%</span>
      </div>
    </div>
  );
}

export function RiskIndicator({ level, score }) {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  const bgColors = {
    green: 'bg-green-500/20 border-green-500/30',
    yellow: 'bg-yellow-500/20 border-yellow-500/30',
    red: 'bg-red-500/20 border-red-500/30'
  };

  return (
    <div className={`p-4 rounded-lg border ${bgColors[level]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-300">Risk Level</span>
        <div className={`w-3 h-3 ${colors[level]} rounded-full`}></div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`w-16 h-16 ${colors[level]} rounded-full flex items-center justify-center`}>
          <AlertTriangle className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white capitalize">{level}</p>
          <p className="text-sm text-slate-400">Score: {score}</p>
        </div>
      </div>
    </div>
  );
}
