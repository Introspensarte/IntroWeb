import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertActivitySchema, 
  insertNewsSchema, 
  insertAnnouncementSchema, 
  insertActivityToDoSchema,
  ALBUM_OPTIONS 
} from "@shared/schema";
import { z } from "zod";

// Trazos calculation function
function calculateTrazos(type: string, words: number, responses: number = 0): number {
  switch (type) {
    case 'narrativa':
      if (words >= 300 && words <= 499) return 300;
      if (words >= 500 && words <= 999) return 400;
      if (words >= 1000 && words <= 1499) return 500;
      if (words >= 1500 && words <= 1999) return 600;
      return 300;
    case 'microcuento': return 100;
    case 'drabble':
      if (words < 150) return 150;
      if (words < 200) return 200;
      return 200;
    case 'hilo':
      if (responses < 5) return 100;
      if (responses < 10) return 150;
      return 150;
    case 'rol':
      if (responses < 5) return 250;
      if (responses < 10) return 400;
      if (responses < 15) return 550;
      if (responses < 20) return 700;
      return 700;
    case 'encuesta': return 100;
    case 'collage': return 150;
    case 'poemas': return 150;
    case 'pinturas': return 200;
    case 'interpretacion': return 200;
    default: return 100;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Profile endpoints
  app.get("/api/profile/:id", requireAuth, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/profile", requireAuth, async (req, res, next) => {
    try {
      const allowedFields = ['fullName', 'age', 'birthday', 'facebookLink'];
      const updates: any = {};

      if (!req.user || req.user.role !== 'admin') {
        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
          }
        }
      } else {
        Object.assign(updates, req.body);
      }

      const updatedUser = await storage.updateUser(req.user!.id, updates);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  // Activities
  app.post("/api/activities", requireAuth, async (req, res, next) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const trazos = calculateTrazos(validatedData.type, validatedData.words, validatedData.responses || 0);
      const activity = await storage.createActivity({
        ...validatedData,
        userId: req.user!.id,
        trazos
      });
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
      next(error);
    }
  });

  app.get("/api/activities/user/:id", requireAuth, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getUserActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      next(error);
    }
  });

  // Rankings
  app.get("/api/rankings/trazos", requireAuth, async (req, res, next) => {
    try {
      const users = await storage.getUsersByTrazos();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/rankings/words", requireAuth, async (req, res, next) => {
    try {
      const users = await storage.getUsersByWords();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  // News
  app.get("/api/news", requireAuth, async (req, res, next) => {
    try {
      const news = await storage.getNews();
      res.json(news);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/news", requireAdmin, async (req, res, next) => {
    try {
      const validatedData = insertNewsSchema.parse(req.body);
      const news = await storage.createNews({ ...validatedData, authorId: req.user!.id });
      res.status(201).json(news);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
      next(error);
    }
  });

  // Announcements
  app.get("/api/announcements", requireAuth, async (req, res, next) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/announcements", requireAdmin, async (req, res, next) => {
    try {
      const validatedData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement({
        ...validatedData,
        authorId: req.user!.id
      });
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
      next(error);
    }
  });

  // Activities to do
  app.get("/api/activities-to-do", requireAuth, async (req, res, next) => {
    try {
      const activitiesToDo = await storage.getActivitiesToDo();
      res.json(activitiesToDo);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/activities-to-do", requireAdmin, async (req, res, next) => {
    try {
      const validatedData = insertActivityToDoSchema.parse(req.body);
      const activityToDo = await storage.createActivityToDo({
        ...validatedData,
        authorId: req.user!.id
      });
      res.status(201).json(activityToDo);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
      next(error);
    }
  });

  // Album options
  app.get("/api/albums/:arista", requireAuth, (req, res) => {
    const arista = req.params.arista as keyof typeof ALBUM_OPTIONS;
    const albums = ALBUM_OPTIONS[arista] || [];
    res.json(albums);
  });

  // Calculate trazos
  app.post("/api/calculate-trazos", requireAuth, (req, res) => {
    try {
      const { type, words, responses } = z.object({
        type: z.string(),
        words: z.number(),
        responses: z.number().optional()
      }).parse(req.body);

      const trazos = calculateTrazos(type, words, responses);
      res.json({ trazos });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error calculating trazos" });
    }
  });

  // 🔒 Admin: Update user role
  app.post("/api/admin/update-role", requireAdmin, async (req, res, next) => {
    try {
      const { username, role } = z.object({
        username: z.string(),
        role: z.string()
      }).parse(req.body);

      const cleanedUsername = username.replace(/^#/, "");
      const updated = await storage.updateUserRoleByUsername(cleanedUsername, role);

      if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json({ message: `Rol actualizado a ${role} para ${username}` });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
      next(error);
    }
  });

  // 🔒 Admin: Assign trazos manually
  app.post("/api/admin/assign-trazos", requireAdmin, async (req, res, next) => {
    try {
      const { username, trazos } = z.object({
        username: z.string(),
        trazos: z.number().int().positive()
      }).parse(req.body);

      const cleanedUsername = username.replace(/^#/, "");
      const updated = await storage.incrementUserTrazosByUsername(cleanedUsername, trazos);

      if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json({ message: `${trazos} trazos asignados a ${username}` });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}