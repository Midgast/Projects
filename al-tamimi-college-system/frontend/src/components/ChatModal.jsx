import React, { useEffect, useState, useRef } from "react";
import { Send, MessageCircle, Users, Search, X, Paperclip, Smile, MoreVertical, Phone, Video, Info, Check, CheckCheck } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

export function ChatModal({ isOpen, onClose }) {
  const { token, user } = useAuth();
  const { t } = useI18n();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadChats();
      if (selectedChat) {
        loadMessages(selectedChat.id);
      }
    }
  }, [isOpen, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async () => {
    try {
      const data = await apiFetch("/api/chat/chats", { token });
      setChats(data || []);
      if (!selectedChat && data?.length > 0) {
        setSelectedChat(data[0]);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  const loadMessages = async (chatId) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/chat/chats/${chatId}/messages`, { token });
      setMessages(data || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    
    // Optimistic update
    const tempMessage = {
      id: Date.now(),
      content: messageContent,
      sender: user,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    try {
      const message = await apiFetch(`/api/chat/chats/${selectedChat.id}/messages`, {
        token,
        method: "POST",
        body: { content: messageContent }
      });
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? { ...message, status: 'sent' } : msg
      ));
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await apiFetch(`/api/chat/messages/${messageId}/read`, {
        token,
        method: "POST"
      });
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "только что";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="text-brand-400" size={24} />
            <h2 className="text-xl font-bold text-white">{t("chat")}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-ghost p-2 hover:bg-red-500/20 hover:text-red-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Chat List Sidebar */}
          <div className="w-80 border-r border-white/10 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t("search_chats")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-slate-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex items-center gap-3 p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                    selectedChat?.id === chat.id ? 'bg-brand-500/10 border-l-2 border-l-brand-500' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-xl">
                      {chat.type === 'group' ? <Users size={20} /> : chat.participants[0]?.avatar || '👤'}
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white truncate">
                        {chat.name || chat.participants[0]?.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatTimestamp(chat.lastMessage?.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-slate-400 truncate">
                        {chat.lastMessage?.content}
                      </p>
                      {chat.lastMessage?.sender?.id === user?.id && (
                        chat.lastMessage?.read ? (
                          <CheckCheck size={14} className="text-blue-400" />
                        ) : (
                          <Check size={14} className="text-slate-400" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500">
                      {selectedChat.type === 'group' ? <Users size={18} /> : selectedChat.participants[0]?.avatar || '👤'}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {selectedChat.name || selectedChat.participants[0]?.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {selectedChat.participants.length > 1 ? `${selectedChat.participants.length} ${t("participants")}` : t("online")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-ghost p-2 hover:bg-white/10">
                      <Phone size={16} />
                    </button>
                    <button className="btn-ghost p-2 hover:bg-white/10">
                      <Video size={16} />
                    </button>
                    <button className="btn-ghost p-2 hover:bg-white/10">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle size={48} className="mx-auto text-slate-400 mb-2" />
                        <div className="text-slate-400">{t("no_messages")}</div>
                      </div>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender?.id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                          message.sender?.id === user?.id 
                            ? 'bg-gradient-to-r from-brand-500 to-purple-500 text-white' 
                            : 'bg-white/10 text-slate-200'
                        } rounded-2xl px-4 py-2`}>
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-between mt-1 text-xs ${
                            message.sender?.id === user?.id ? 'text-brand-200' : 'text-slate-400'
                          }`}>
                            <span>{formatTimestamp(message.timestamp)}</span>
                            {message.sender?.id === user?.id && (
                              <span className="ml-2">
                                {message.status === 'sending' && <Clock size={12} />}
                                {message.status === 'sent' && <Check size={12} />}
                                {message.status === 'delivered' && <CheckCheck size={12} />}
                                {message.status === 'read' && <CheckCheck size={12} className="text-blue-300" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 rounded-2xl px-4 py-2">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-white/10 p-4">
                  <div className="flex items-center gap-2">
                    <button className="btn-ghost p-2 hover:bg-white/10">
                      <Paperclip size={18} />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={t("type_message")}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm placeholder:text-slate-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                    />
                    <button className="btn-ghost p-2 hover:bg-white/10">
                      <Smile size={18} />
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="btn-primary p-2 rounded-full"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle size={48} className="mx-auto text-slate-400 mb-2" />
                  <div className="text-slate-400">{t("select_chat")}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
