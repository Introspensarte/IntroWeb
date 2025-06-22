import { 
  users, 
  activities, 
  news, 
  announcements, 
  activitiesToDo,
  type User, 
  type InsertUser, 
  type Activity,
  type InsertActivity,
  type News,
  type InsertNews,
  type Announcement,
  type InsertAnnouncement,
  type ActivityToDo,
  type InsertActivityToDo
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserBySignature(signature: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Activity methods
  createActivity(activity: InsertActivity & { userId: number; trazos: number }): Promise<Activity>;
  getUserActivities(userId: number, limit?: number): Promise<Activity[]>;
  updateUserStats(userId: number): Promise<void>;
  
  // Rankings
  getUsersByTrazos(limit?: number): Promise<User[]>;
  getUsersByWords(limit?: number): Promise<User[]>;
  
  // Content methods
  getNews(limit?: number): Promise<News[]>;
  createNews(news: InsertNews & { authorId: number }): Promise<News>;
  getAnnouncements(limit?: number): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement & { authorId: number }): Promise<Announcement>;
  getActivitiesToDo(limit?: number): Promise<ActivityToDo[]>;
  createActivityToDo(activityToDo: InsertActivityToDo & { authorId: number }): Promise<ActivityToDo>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserBySignature(signature: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.signature, signature));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        // Set admin role if signature is #INELUDIBLE  
        role: insertUser.signature === '#INELUDIBLE' ? 'admin' : 'user'
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createActivity(activityData: InsertActivity & { userId: number; trazos: number }): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(activityData)
      .returning();
    
    // Update user stats
    await this.updateUserStats(activityData.userId);
    
    return activity;
  }

  async getUserActivities(userId: number, limit = 50): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async updateUserStats(userId: number): Promise<void> {
    const userActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId));

    const totalTrazos = userActivities.reduce((sum, activity) => sum + activity.trazos, 0);
    const totalWords = userActivities.reduce((sum, activity) => sum + activity.words, 0);
    const totalActivities = userActivities.length;

    await db
      .update(users)
      .set({
        totalTrazos,
        totalWords,
        totalActivities
      })
      .where(eq(users.id, userId));
  }

  async getUsersByTrazos(limit = 20): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.totalTrazos))
      .limit(limit);
  }

  async getUsersByWords(limit = 20): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.totalWords))
      .limit(limit);
  }

  async getNews(limit = 10): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .orderBy(desc(news.createdAt))
      .limit(limit);
  }

  async createNews(newsData: InsertNews & { authorId: number }): Promise<News> {
    const [newsItem] = await db
      .insert(news)
      .values(newsData)
      .returning();
    return newsItem;
  }

  async getAnnouncements(limit = 10): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt))
      .limit(limit);
  }

  async createAnnouncement(announcementData: InsertAnnouncement & { authorId: number }): Promise<Announcement> {
    const [announcement] = await db
      .insert(announcements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActivitiesToDo(limit = 20): Promise<ActivityToDo[]> {
    return await db
      .select()
      .from(activitiesToDo)
      .orderBy(desc(activitiesToDo.createdAt))
      .limit(limit);
  }

  async createActivityToDo(activityToDoData: InsertActivityToDo & { authorId: number }): Promise<ActivityToDo> {
    const [activityToDo] = await db
      .insert(activitiesToDo)
      .values(activityToDoData)
      .returning();
    return activityToDo;
  }
}

export const storage = new DatabaseStorage();
