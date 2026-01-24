import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Edit, Trash2, Eye, Calendar, Users, Award, TrendingUp, Bell, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../app/auth/AuthContext.jsx';
import { useToast } from './ui/Toast.jsx';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';
import { Input } from './ui/Input.jsx';
import { Badge } from './ui/Badge.jsx';

export function MobileShell({ children }) {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const handleLogout = () => {
    logout();
    success('Вы успешно вышли из системы');
  };

  const menuItems = [
    { icon: TrendingUp, label: 'Главная', href: '/' },
    { icon: Calendar, label: 'Расписание', href: '/schedule' },
    { icon: Users, label: 'Журнал', href: '/journal' },
    { icon: Award, label: 'Бейджи', href: '/badges' },
    { icon: Bell, label: 'Уведомления', href: '/notifications', badge: notifications },
    { icon: Settings, label: 'Настройки', href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-white/10"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-white">Al Tamimi</h1>
              <p className="text-xs text-slate-400">College System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>
            
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 top-0 h-full w-72 bg-slate-900 border-r border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">Меню</h2>
                    <p className="text-sm text-slate-400">{user?.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setIsMenuOpen(false);
                        // Navigate to item.href
                      }}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                      {item.badge && (
                        <Badge variant="error" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Выйти
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-brand-500 to-purple-500"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
