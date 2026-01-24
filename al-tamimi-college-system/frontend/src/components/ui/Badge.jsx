import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.js';

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className,
  ...props 
}) {
  const variants = {
    default: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
    success: 'bg-green-500/20 text-green-300 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    outline: 'bg-transparent text-slate-300 border-white/20'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-medium',
        'backdrop-blur-sm transition-all duration-300',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.span>
  );
}

export function StatusBadge({ 
  status, 
  children, 
  className,
  ...props 
}) {
  const statusConfig = {
    active: { variant: 'success', label: 'Активен' },
    inactive: { variant: 'default', label: 'Неактивен' },
    pending: { variant: 'warning', label: 'Ожидание' },
    error: { variant: 'error', label: 'Ошибка' },
    online: { variant: 'success', label: 'Онлайн' },
    offline: { variant: 'default', label: 'Офлайн' }
  };

  const config = statusConfig[status] || statusConfig.default;

  return (
    <Badge 
      variant={config.variant} 
      className={cn('gap-1', className)}
      {...props}
    >
      <div className={cn(
        'w-2 h-2 rounded-full',
        status === 'active' || status === 'online' ? 'bg-green-400' :
        status === 'error' ? 'bg-red-400' :
        status === 'pending' ? 'bg-yellow-400' :
        'bg-slate-400'
      )} />
      {children || config.label}
    </Badge>
  );
}

export function RoleBadge({ role, className, ...props }) {
  const roleConfig = {
    admin: { variant: 'error', label: 'Админ' },
    teacher: { variant: 'default', label: 'Учитель' },
    student: { variant: 'success', label: 'Студент' },
    parent: { variant: 'warning', label: 'Родитель' }
  };

  const config = roleConfig[role] || roleConfig.student;

  return (
    <Badge 
      variant={config.variant} 
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
}
