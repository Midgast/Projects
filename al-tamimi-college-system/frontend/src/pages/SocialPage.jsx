import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, Users, Hash, Calendar, TrendingUp, Send, Sparkles, Flame, Clock } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

export function SocialPage() {
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
    loadPosts();
    loadClubs();
    loadTrends();
    loadEvents();
  }, []);

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

  return (
    <div>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-brand-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-3xl" />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-brand-400 animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              {t("social_network")}
            </h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-400">Общайтесь, делитесь, учитесь вместе ✨</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Create Post */}
          <div className="card group relative overflow-hidden border-gradient-to-r from-brand-500/20 to-purple-500/20 p-4 transition-all duration-200 hover:shadow-xl hover:shadow-brand-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="relative">
              <div className="flex gap-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-xl shadow-lg">
                    {user?.role === "student" ? "👩‍🎓" : user?.role === "teacher" ? "👨‍🏫" : "👤"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-slate-900" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder={t("what_s_new")}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-all duration-200"
                    rows={3}
                  />
                  
                  {/* Club Selection */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="relative">
                      <select 
                        value={selectedClub} 
                        onChange={(e) => setSelectedClub(e.target.value)}
                        className="appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-8 text-sm focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-all duration-200"
                      >
                        <option value="">Все</option>
                        {clubs.map(club => (
                          <option key={club.code} value={club.code}>
                            {club.icon} {club.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    <button
                      onClick={createPost}
                      disabled={loading || !newPost.trim()}
                      className="btn-primary relative overflow-hidden transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <>
                          <Send size={16} className="mr-2 transition-transform duration-200 group-hover:translate-x-1" />
                          <span>{t("publish")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          {posts.map((post, index) => (
            <div 
              key={post.id} 
              className="card group relative overflow-hidden border-gradient-to-r from-white/10 to-white/5 p-4 transition-all duration-200 hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-500/20"
              style={getPostAnimation(index)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              <div className="relative">
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 text-xl backdrop-blur-sm">
                      {post.author.avatar}
                    </div>
                    {post.author.role === "student" && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-slate-900" />
                    )}
                    {post.author.role === "teacher" && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-slate-900" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{post.author.name}</span>
                      {post.club && (
                        <span className="rounded-full bg-gradient-to-r from-brand-500/20 to-purple-500/20 px-2 py-1 text-xs text-brand-300 backdrop-blur-sm">
                          {clubs.find(c => c.code === post.club)?.icon} {clubs.find(c => c.code === post.club)?.name}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={10} />
                        {formatTimestamp(post.timestamp)}
                      </div>
                    </div>
                    
                    <p className="mt-3 text-sm leading-relaxed text-slate-200">{post.content}</p>
                    
                    <div className="mt-4 flex items-center gap-6">
                      <button 
                        onClick={() => likePost(post.id)}
                        className={`group relative flex items-center gap-2 text-xs transition-all duration-200 ${
                          post.likes.includes(user?.sub) 
                            ? "text-red-400 hover:text-red-300" 
                            : "text-slate-400 hover:text-brand-400"
                        }`}
                      >
                        <div className="relative">
                          <Heart 
                            size={16} 
                            fill={post.likes.includes(user?.sub) ? "currentColor" : "none"}
                            className="transition-all duration-200 group-hover:scale-110"
                          />
                          {post.likes.includes(user?.sub) && (
                            <div className="absolute inset-0 animate-ping">
                              <Heart size={16} fill="currentColor" className="opacity-30" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{post.likes.length}</span>
                      </button>
                      <button className="group flex items-center gap-2 text-xs text-slate-400 transition-all duration-200 hover:text-brand-400">
                        <MessageCircle size={16} className="transition-transform duration-200 group-hover:scale-110" />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                      <button className="group flex items-center gap-2 text-xs text-slate-400 transition-all duration-200 hover:text-brand-400">
                        <Share2 size={16} className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="card border-dashed border-white/20 p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 p-4">
                  <MessageCircle size={24} className="text-brand-400" />
                </div>
                <div className="text-slate-400">Пока нет постов. Будьте первым! ✨</div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Clubs */}
          <div className="card border-gradient-to-r from-brand-500/20 to-purple-500/20 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Users size={18} className="text-brand-400" />
              {t("clubs")}
              <div className="ml-auto h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="mt-4 space-y-3">
              {clubs.map((club, index) => (
                <div 
                  key={club.id} 
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-200 hover:border-brand-500/30 hover:bg-white/10"
                  style={getClubAnimation(index)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="text-2xl">{club.icon}</span>
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{club.name}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Users size={10} />
                          {club.members} {t("participants")}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => joinClub(club.id)}
                      disabled={club.isMember}
                      className={`btn-ghost relative overflow-hidden text-xs transition-all duration-200 ${
                        club.isMember 
                          ? "opacity-50 cursor-not-allowed" 
                          : "hover:scale-105 hover:border-brand-500/50"
                      }`}
                    >
                      {club.isMember ? (
                        <span className="flex items-center gap-1">
                          <Flame size={12} className="text-green-400" />
                          В клубе
                        </span>
                      ) : (
                        <>
                          {t("join")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="card border-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Hash size={18} className="text-purple-400" />
              {t("trending")}
              <div className="ml-auto h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            </div>
            <div className="mt-4 space-y-2">
              {trends.map((trend, index) => (
                <div 
                  key={index}
                  className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-200 hover:border-purple-500/30 hover:bg-white/10"
                  style={{ animationDelay: `${Math.min(index * 0.03, 0.15)}s` }}
                >
                  <span className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors duration-200 cursor-pointer">
                    {trend.tag}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Flame size={10} className="text-orange-400" />
                    {trend.count} {t("posts")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card border-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Calendar size={18} className="text-blue-400" />
              {t("events")}
              <div className="ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <div className="mt-4 space-y-3">
              {events.map((event, index) => (
                <div 
                  key={event.id}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-200 hover:border-blue-500/30 hover:bg-white/10"
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.2)}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="relative">
                    <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors duration-200">
                      {event.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={10} />
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

      {/* Performance optimization: Remove unused styles */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
