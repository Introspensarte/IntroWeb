import { pgTable, text, serial, integer, boolean, timestamp, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum('role', ['user', 'admin']);
export const rankEnum = pgEnum('rank', ['alma_en_transito', 'voz_en_boceto', 'narrador_de_atmosferas', 'escritor_de_introspecciones', 'arquitecto_del_alma']);
export const activityTypeEnum = pgEnum('activity_type', ['narrativa', 'microcuento', 'drabble', 'hilo', 'rol', 'encuesta', 'collage', 'poemas', 'pinturas', 'interpretacion', 'otro']);
export const aristaEnum = pgEnum('arista', ['inventario_de_la_vida', 'mapa_del_inconsciente', 'ecos_del_corazon', 'reflejos_en_el_tiempo', 'galeria_del_alma']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  birthday: text("birthday").notNull(), // dd/mm format
  faceClaim: text("face_claim").notNull(),
  signature: text("signature").notNull().unique(), // with # prefix
  facebookLink: text("facebook_link").notNull(),
  motivation: text("motivation").notNull(),
  role: roleEnum("role").default('user').notNull(),
  rank: rankEnum("rank").default('alma_en_transito').notNull(),
  totalTrazos: integer("total_trazos").default(0).notNull(),
  totalWords: integer("total_words").default(0).notNull(),
  totalActivities: integer("total_activities").default(0).notNull(),
  registrationDate: timestamp("registration_date").defaultNow().notNull(),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  date: date("date").notNull(),
  words: integer("words").notNull(),
  type: activityTypeEnum("type").notNull(),
  responses: integer("responses").default(0),
  link: text("link"),
  description: text("description"),
  arista: aristaEnum("arista").notNull(),
  album: text("album").notNull(),
  trazos: integer("trazos").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// News table
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activities to do table
export const activitiesToDo = pgTable("activities_to_do", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  arista: aristaEnum("arista").notNull(),
  album: text("album").notNull(),
  dueDate: date("due_date"),
  authorId: integer("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
  news: many(news),
  announcements: many(announcements),
  activitiesToDo: many(activitiesToDo),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const newsRelations = relations(news, ({ one }) => ({
  author: one(users, {
    fields: [news.authorId],
    references: [users.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(users, {
    fields: [announcements.authorId],
    references: [users.id],
  }),
}));

export const activitiesToDoRelations = relations(activitiesToDo, ({ one }) => ({
  author: one(users, {
    fields: [activitiesToDo.authorId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  role: true,
  rank: true,
  totalTrazos: true,
  totalWords: true,
  totalActivities: true,
  registrationDate: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  userId: true,
  trazos: true,
  createdAt: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  authorId: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  authorId: true,
  createdAt: true,
});

export const insertActivityToDoSchema = createInsertSchema(activitiesToDo).omit({
  id: true,
  authorId: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type ActivityToDo = typeof activitiesToDo.$inferSelect;
export type InsertActivityToDo = z.infer<typeof insertActivityToDoSchema>;

// Album definitions
export const ALBUM_OPTIONS = {
  inventario_de_la_vida: [
    'Inventario de Sentidos',
    'Compras y Dilemas',
    'Cartas desde la rutina',
    'Chequeos y descuidos'
  ],
  mapa_del_inconsciente: [
    'Conversaciones en el tiempo',
    'Diario de los sueños',
    'Habitaciones sin salidas'
  ],
  ecos_del_corazon: [
    'Cicatrices invisibles',
    'Melodías en el aire',
    'Ternuras y traiciones'
  ],
  reflejos_en_el_tiempo: [
    'Susurros de otras vidas',
    'Ecos del alma',
    'Conexión espiritual'
  ],
  galeria_del_alma: [
    'Vestigios de la Moda',
    'Obras del Ser',
    'El reflejo de las palabras'
  ]
};

// Rank medals
export const RANK_MEDALS = {
  alma_en_transito: null,
  voz_en_boceto: 'Susurros que germinan',
  narrador_de_atmosferas: 'Excelente narrador',
  escritor_de_introspecciones: 'Lector de huellas',
  arquitecto_del_alma: 'Arquitecto de personajes'
};
