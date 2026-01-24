import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.js';

export function Card({ children, className, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'card rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm',
        'p-6 shadow-xl hover:shadow-2xl transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn('mb-4 pb-4 border-b border-white/10', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn('text-xl font-semibold text-white', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p
      className={cn('text-sm text-slate-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn('mt-4 pt-4 border-t border-white/10', className)}
      {...props}
    >
      {children}
    </div>
  );
}
