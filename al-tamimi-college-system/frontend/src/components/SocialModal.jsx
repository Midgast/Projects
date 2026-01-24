import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, Users, Hash, Calendar, TrendingUp, Send, Sparkles, Flame, Clock, X } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

export function SocialModal({ isOpen, onClose }) {
  const { token, user } = useAuth();
  const { t } = useI18n();
  
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadPosts();
      loadClubs();
      loadTrends();
      loadEvents();
    }
  }, [isOpen]);

  const loadPosts = async () => {
    try {
      const data = await apiFetch("/api/social/posts", { token });
      setPosts(data || []);
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  };

  const loadClubs = async () => {
    try {
      const data = await apiFetch("/api/social/clubs", { token });
      setClubs(data || []);
    } catch (error) {
      console.error("Failed to load clubs:", error);
    }
  };

  const loadTrends = async () => {
    try {
      const data = await apiFetch("/api/social/trending", { token });
      setTrends(data || []);
    } catch (error) {
      console.error("Failed to load trends:", error);
    }
  };

  const loadEvents = async () => {
    try {
      const data = await apiFetch("/api/social/events", { token });
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;
    
    setLoading(true);
    try {
      const post = await apiFetch("/api/social/posts", {
        token,
        method: "POST",
        body: { 
          content: newPost,
          club: selectedClub || null
        }
      });
      
      setPosts([post, ...posts]);
      setNewPost("");
      setSelectedClub("");
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await apiFetch(`/api/social/posts/${postId}/like`, {
        token,
        method: "POST"
      });
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: response.liked 
                ? [...post.likes, user.sub]
                : post.likes.filter(id => id !== user.sub),
              likesCount: response.likesCount
            } 
          : post
      ));
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const joinClub = async (clubId) => {
    try {
      await apiFetch(`/api/social/clubs/${clubId}/join`, {
        token,
        method: "POST"
      });
      
      setClubs(clubs.map(club => 
        club.id === clubId 
          ? { ...club, members: club.members + 1, isMember: true }
          : club
      ));
    } catch (error) {
      console.error("Failed to join club:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "только что";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    return `${Math.floor(diff / 86400000)} д назад`;
  };

  const getPostAnimation = (index) => ({
    animation: `slideInUp 0.4s ease-out ${Math.min(index * 0.05, 0.3)}s both`,
    transform: 'translateZ(0)',
    willChange: 'opacity, transform',
  });

  const getClubAnimation = (index) => ({
    animation: `fadeInScale 0.3s ease-out ${Math.min(index * 0.04, 0.2)}s both`,
    transform: 'translateZ(0)',
    willChange: 'opacity, transform',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-brand-400 animate-pulse" />
              <h2 className="text-xl font-bold text-white">{t("social_network")}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-2 hover:bg-red-500/20 hover:text-red-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-80px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-4">
                {/* Create Post */}
                <div className="card group relative overflow-hidden border-gradient-to-r from-brand-500/20 to-purple-500/20 p-4 transition-all duration-200">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="relative">
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-xl shadow-lg">
                          {user?.role === "student" ? "👩‍🎓" : user?.role === "teacher" ? "👨‍🏫" : "👤"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-slate-900" />
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          placeholder={t("what_s_new")}
                          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-slate-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-all duration-200"
                          rows={2}
                        />
                        
                        <div className="mt-2 flex items-center gap-2">
                          <select 
                            value={selectedClub} 
                            onChange={(e) => setSelectedClub(e.target.value)}
                            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                          >
                            <option value="">Все</option>
                            {clubs.map(club => (
                              <option key={club.code} value={club.code}>
                                {club.icon} {club.name}
                              </option>
                            ))}
                          </select>
                          
                          <button
                            onClick={createPost}
                            disabled={loading || !newPost.trim()}
                            className="btn-primary text-xs"
                          >
                            {loading ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                              <>
                                <Send size={14} />
                                {t("publish")}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-3 max-h-[calc(90vh-300px)] overflow-y-auto">
                  {posts.map((post, index) => (
                    <div 
                      key={post.id} 
                      className="card group relative overflow-hidden border-gradient-to-r from-white/10 to-white/5 p-3 transition-all duration-200"
                      style={getPostAnimation(index)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      
                      <div className="relative">
                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 text-sm">
                            {post.author.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-white">{post.author.name}</span>
                              {post.club && (
                                <span className="rounded-full bg-gradient-to-r from-brand-500/20 to-purple-500/20 px-2 py-0.5 text-xs text-brand-300">
                                  {clubs.find(c => c.code === post.club)?.icon} {clubs.find(c => c.code === post.club)?.name}
                                </span>
                              )}
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock size={8} />
                                {formatTimestamp(post.timestamp)}
                              </div>
                            </div>
                            
                            <p className="mt-2 text-sm leading-relaxed text-slate-200">{post.content}</p>
                            
                            <div className="mt-3 flex items-center gap-4">
                              <button 
                                onClick={() => likePost(post.id)}
                                className={`group relative flex items-center gap-1 text-xs transition-all duration-200 ${
                                  post.likes.includes(user?.sub) 
                                    ? "text-red-400" 
                                    : "text-slate-400 hover:text-brand-400"
                                }`}
                              >
                                <Heart 
                                  size={14} 
                                  fill={post.likes.includes(user?.sub) ? "currentColor" : "none"}
                                  className="transition-all duration-200 group-hover:scale-110"
                                />
                                <span className="font-medium">{post.likes.length}</span>
                              </button>
                              <button className="group flex items-center gap-1 text-xs text-slate-400 transition-all duration-200 hover:text-brand-400">
                                <MessageCircle size={14} className="transition-transform duration-200 group-hover:scale-110" />
                                <span>{post.comments?.length || 0}</span>
                              </button>
                              <button className="group flex items-center gap-1 text-xs text-slate-400 transition-all duration-200 hover:text-brand-400">
                                <Share2 size={14} className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {posts.length === 0 && (
                    <div className="card border-dashed border-white/20 p-6 text-center">
                      <div className="text-slate-400">Пока нет постов. Будьте первым! ✨</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Clubs */}
                <div className="card border-gradient-to-r from-brand-500/20 to-purple-500/20 p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Users size={16} className="text-brand-400" />
                    {t("clubs")}
                    <div className="ml-auto h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div className="mt-3 space-y-2">
                    {clubs.map((club, index) => (
                      <div 
                        key={club.id} 
                        className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-200"
                        style={getClubAnimation(index)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{club.icon}</span>
                            <div>
                              <div className="text-sm font-medium text-white">{club.name}</div>
                              <div className="text-xs text-slate-400">
                                {club.members} {t("participants")}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => joinClub(club.id)}
                            disabled={club.isMember}
                            className={`btn-ghost text-xs ${
                              club.isMember ? "opacity-50" : ""
                            }`}
                          >
                            {club.isMember ? "В клубе" : t("join")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trending Topics */}
                <div className="card border-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Hash size={16} className="text-purple-400" />
                    {t("trending")}
                    <div className="ml-auto h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                  </div>
                  <div className="mt-3 space-y-1">
                    {trends.map((trend, index) => (
                      <div 
                        key={index}
                        className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-1 transition-all duration-200"
                        style={{ animationDelay: `${Math.min(index * 0.03, 0.15)}s` }}
                      >
                        <span className="text-xs font-medium text-white group-hover:text-purple-400 transition-colors duration-200 cursor-pointer">
                          {trend.tag}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Flame size={8} className="text-orange-400" />
                          {trend.count} {t("posts")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="card border-gradient-to-r from-blue-500/20 to-cyan-500/20 p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Calendar size={16} className="text-blue-400" />
                    {t("events")}
                    <div className="ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                  <div className="mt-3 space-y-2">
                    {events.map((event, index) => (
                      <div 
                        key={event.id}
                        className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-200"
                        style={{ animationDelay: `${Math.min(index * 0.05, 0.2)}s` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        <div className="relative">
                          <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors duration-200">
                            {event.title}
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={8} />
                            {new Date(event.date).toLocaleDateString('ru-RU', { 
                              weekday: 'short', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
