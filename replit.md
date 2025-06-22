# replit.md

## Overview

This is a full-stack Node.js and Express web application called "Introspens/arte/" - an artistic community platform with a dark, elegant, and minimalist design. The application features a creative writing community where users can register, share activities, earn "trazos" (points), and participate in various artistic challenges organized by "aristas" (artistic dimensions) and albums.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy using unique signatures
- **UI Framework**: shadcn/ui components with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management
- **Deployment**: Replit environment with autoscale deployment

### Directory Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── auth.ts            # Authentication setup
│   ├── storage.ts         # Database operations
│   └── db.ts              # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and validation
└── migrations/            # Database migrations
```

## Key Components

### Frontend Architecture
- **React Router**: Using Wouter for client-side routing
- **Authentication Flow**: Protected routes with auth context provider
- **Form Management**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui component library with dark theme
- **Styling**: Tailwind CSS with custom CSS variables for theming

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **Authentication**: Session-based auth with signature-only login system
- **Database Layer**: Drizzle ORM with type-safe queries
- **Session Management**: PostgreSQL session store for persistence

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: Core user information with unique signatures, roles, and stats
- **Activities**: User-submitted creative activities with point calculations
- **News**: Admin-posted news articles
- **Announcements**: Admin-posted announcements
- **ActivitiesToDo**: Admin-created activity prompts organized by aristas and albums

### Authentication System
- **Unique Signature Login**: Users log in using only their signature (starting with #)
- **Role-Based Access**: User and admin roles with different permissions
- **Session Management**: Persistent sessions using PostgreSQL store

## Data Flow

### User Registration
1. User fills registration form with personal details and unique signature
2. Form validation using Zod schemas
3. Data stored in PostgreSQL users table
4. User automatically logged in upon successful registration

### Activity Submission
1. User submits activity with type, word count, and other details
2. System calculates "trazos" (points) based on activity type and metrics
3. Activity stored in database with automatic timestamp
4. User's total stats updated (total trazos, words, activities)

### Content Management
1. Admin users can create news, announcements, and activities to do
2. Content organized by aristas (artistic dimensions) and albums
3. All users can view content, but only admins can create/edit

### Ranking System
1. Global rankings calculated from user totals (trazos and words)
2. Real-time position calculation and display
3. User profile previews accessible from rankings

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon database
- **drizzle-orm**: Type-safe ORM for database operations
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **wouter**: Lightweight React router
- **date-fns**: Date manipulation utilities

### UI Dependencies
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reload**: Vite dev server with HMR for frontend development
- **TypeScript**: Full TypeScript support across frontend and backend
- **Database**: Neon PostgreSQL database with connection pooling

### Production Build
- **Frontend Build**: Vite builds React app to static files
- **Backend Build**: esbuild bundles Node.js server code
- **Deployment**: Autoscale deployment on Replit infrastructure
- **Port Configuration**: Server runs on port 5000, mapped to external port 80

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Session Secret**: Configurable secret for session security
- **Node Environment**: Development/production mode switching

## Changelog

Changelog:
- June 22, 2025. Initial setup
- June 22, 2025. Complete redesign with dark graphite background, purple gradient titles, elegant navigation, and improved mobile responsiveness. #INELUDIBLE set as admin supremo.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: Dark graphite background, purple/lavender highlights, elegant and dynamic design, professional appearance.
Button text: Registration button should say "Ingresa al Proyecto" with magical glow effects.