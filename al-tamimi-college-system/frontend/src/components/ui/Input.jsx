import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Button } from './Button.jsx';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50',
        'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 focus:border-brand-300',
        'transition-all duration-300 backdrop-blur-sm',
        className
      )}
      {...props}
    />
  );
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Поиск...', 
  className,
  onClear,
  ...props 
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn('pl-10 pr-10', className)}
        {...props}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

export function Select({ children, className, ...props }) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50',
        'focus:outline-none focus:ring-2 focus:ring-brand-400/60 focus:border-brand-300',
        'transition-all duration-300 backdrop-blur-sm cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50',
        'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 focus:border-brand-300',
        'transition-all duration-300 backdrop-blur-sm resize-none',
        className
      )}
      {...props}
    />
  );
}

export function Checkbox({ checked, onChange, className, ...props }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={cn(
          'w-4 h-4 rounded border border-white/20 bg-white/5 text-brand-500',
          'focus:outline-none focus:ring-2 focus:ring-brand-400/60',
          'transition-all duration-300',
          className
        )}
        {...props}
      />
      <span className="text-sm text-slate-300">{props.children}</span>
    </label>
  );
}

export function FilterDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Фильтр',
  className 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'absolute top-full left-0 right-0 mt-1 z-50',
              'bg-slate-900 border border-white/10 rounded-lg shadow-xl',
              'backdrop-blur-sm max-h-60 overflow-y-auto'
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm text-slate-300',
                  'hover:bg-white/10 transition-colors',
                  value === option.value && 'bg-brand-500/20 text-brand-300'
                )}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
