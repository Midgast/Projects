import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.js';

const buttonVariants = {
  primary: 'btn-primary bg-gradient-to-r from-brand-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:shadow-brand-500/25',
  secondary: 'btn-ghost border border-white/10 bg-white/5 text-slate-300 hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-300',
  outline: 'border border-white/20 bg-transparent text-slate-300 hover:bg-white/10 hover:text-white',
  ghost: 'text-slate-400 hover:text-white hover:bg-white/10',
  destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl hover:shadow-red-500/25',
  success: 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl hover:shadow-green-500/25',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-xl hover:shadow-yellow-500/25',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2',
};

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4" />
      )}
      
      {children}
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4" />
      )}
    </motion.button>
  );
}

export function IconButton({
  icon: Icon,
  className,
  variant = 'ghost',
  size = 'icon',
  ...props
}) {
  return (
    <Button
      className={cn('p-2', className)}
      variant={variant}
      size={size}
      {...props}
    >
      <Icon className="w-4 h-4" />
    </Button>
  );
}
