import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { demo, demoMode } from "../demoStore.js";

export const socialRouter = Router();

// Get all posts
socialRouter.get("/posts", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) {
      // Demo posts
      const posts = [
        {
          id: 1,
          author: { 
            id: 3, 
            name: "Алиса Иванова", 
            role: "student", 
            avatar: "👩‍🎓",
            fullName: "Алиса Иванова"
          },
          content: "Только что сдала экзамен по математике! Спасибо преподавателю за отличную подготовку 🎉",
          likes: [1, 2, 4], // Array of user IDs who liked
          comments: [
            { id: 1, author: "Проф. Петров", content: "Отлично!", timestamp: "2 часа назад" },
            { id: 2, author: "Боб Смит", content: "Поздравляю!", timestamp: "1 час назад" }
          ],
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          club: null
        },
        {
          id: 2,
          author: { 
            id: 2, 
            name: "Проф. Петров", 
            role: "teacher", 
            avatar: "👨‍🏫",
            fullName: "Проф. Петров"
          },
          content: "Дополнительное занятие по программированию завтра в 15:00. Жду всех желающих!",
          likes: [1, 3],
          comments: [
            { id: 3, author: "Алиса Иванова", content: "Буду там!", timestamp: "3 часа назад" }
          ],
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          club: "programming"
        },
        {
          id: 3,
          author: { 
            id: 5, 
            name: "Клуб дебатов", 
            role: "club", 
            avatar: "🎭",
            fullName: "Клуб дебатов"
          },
          content: "Следующая встреча клуба дебатов в пятницу! Тема: \"ИИ в образовании\". Приходите!",
          likes: [1, 2, 3, 4],
          comments: [
            { id: 4, author: "Боб Смит", content: "Интересная тема!", timestamp: "1 день назад" }
          ],
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          club: "debate"
        }
      ];
      
      return res.json(posts);
    }
    
    // Real implementation would fetch from database
    res.json([]);
  } catch (e) {
    next(e);
  }
});

// Create new post
socialRouter.post("/posts", requireAuth, async (req, res, next) => {
  try {
    const body = z.object({
      content: z.string().min(1).max(1000),
      club: z.string().optional()
    }).parse(req.body);

    if (demoMode()) {
      const newPost = {
        id: Date.now(),
        author: {
          id: req.user.sub,
          name: req.user.fullName,
          role: req.user.role,
          avatar: req.user.role === "student" ? "👩‍🎓" : req.user.role === "teacher" ? "👨‍🏫" : "👤",
          fullName: req.user.fullName
        },
        content: body.content,
        likes: [],
        comments: [],
        timestamp: new Date().toISOString(),
        club: body.club || null
      };
      
      return res.json(newPost);
    }
    
    // Real implementation would save to database
    res.json({ id: Date.now(), ...body });
  } catch (e) {
    next(e);
  }
});

// Like/unlike post
socialRouter.post("/posts/:postId/like", requireAuth, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.sub;
    
    if (demoMode()) {
      // In demo mode, just return success
      return res.json({ liked: true, likesCount: Math.floor(Math.random() * 20) + 1 });
    }
    
    // Real implementation would toggle like in database
    res.json({ liked: true, likesCount: 1 });
  } catch (e) {
    next(e);
  }
});

// Get clubs
socialRouter.get("/clubs", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) {
      const clubs = [
        { id: 1, name: "Программирование", code: "programming", icon: "💻", members: 45, description: "Клуб для любителей кода" },
        { id: 2, name: "Дебаты", code: "debate", icon: "🎭", members: 28, description: "Развиваем ораторское искусство" },
        { id: 3, name: "Спорт", code: "sports", icon: "⚽", members: 67, description: "Спортивные мероприятия и тренировки" },
        { id: 4, name: "Искусство", code: "art", icon: "🎨", members: 34, description: "Творчество и самовыражение" }
      ];
      
      return res.json(clubs);
    }
    
    res.json([]);
  } catch (e) {
    next(e);
  }
});

// Join/leave club
socialRouter.post("/clubs/:clubId/join", requireAuth, async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.sub;
    
    if (demoMode()) {
      return res.json({ joined: true });
    }
    
    res.json({ joined: true });
  } catch (e) {
    next(e);
  }
});

// Get trending topics
socialRouter.get("/trending", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) {
      const trends = [
        { tag: "#экзамены", count: 24 },
        { tag: "#программирование", count: 18 },
        { tag: "#спорт", count: 15 },
        { tag: "#дебаты", count: 12 },
        { tag: "#искусство", count: 8 }
      ];
      
      return res.json(trends);
    }
    
    res.json([]);
  } catch (e) {
    next(e);
  }
});

// Get events
socialRouter.get("/events", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) {
      const events = [
        {
          id: 1,
          title: "Встреча клуба дебатов",
          description: "Тема: \"ИИ в образовании\"",
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Аудитория 201",
          club: "debate"
        },
        {
          id: 2,
          title: "Спортивные соревнования",
          description: "Футбольный матч между группами",
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Спортзал",
          club: "sports"
        }
      ];
      
      return res.json(events);
    }
    
    res.json([]);
  } catch (e) {
    next(e);
  }
});
