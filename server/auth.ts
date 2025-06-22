import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const loginSchema = z.object({
  signature: z.string().min(1, "Signature is required").startsWith("#", "Signature must start with #"),
});

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'introspens-arte-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Use signature as username in LocalStrategy
  passport.use(
    new LocalStrategy(
      { usernameField: 'signature', passwordField: 'signature' },
      async (signature, password, done) => {
        try {
          const user = await storage.getUserBySignature(signature);
          if (!user) {
            return done(null, false, { message: 'Signature not found' });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if signature already exists
      const existingUser = await storage.getUserBySignature(validatedData.signature);
      if (existingUser) {
        return res.status(400).json({ message: "Esta firma ya está registrada" });
      }

      const user = await storage.createUser(validatedData);

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      const { signature } = loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: info?.message || "Firma no encontrada" });
        }
        
        req.login(user, (err) => {
          if (err) return next(err);
          res.status(200).json(user);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
