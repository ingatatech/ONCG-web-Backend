ONCG BN API

Overview

ONCG BN is a TypeScript/Node.js REST API built with Express and TypeORM. It powers content such as services, industries, insights, experts, case studies, testimonials, and more. It includes email utilities and a simple email subscription feature for insights notifications.

Tech Stack

- Node.js + Express
- TypeScript
- TypeORM (PostgreSQL)
- Multer (file uploads)
- Nodemailer (email)
- Redis (optional cache)

Getting Started

Prerequisites

- Node.js LTS (>=18)
- PostgreSQL database
- Optional: Redis server

Installation

1. Clone and install
   - git clone <repo>
   - cd oncg-bn
   - npm install

2. Environment variables
   Create a .env file in the project root:

   - DATABASE_URL=postgres://user:password@host:port/db
   - EMAIL_USER=your@gmail.com
   - EMAIL_PASSWORD=your-app-password
   - FRONTEND_URL=https://oncg.com
   - REDIS_URL=redis://localhost:6379
   - JWT_SECRET=replace_me

3. Build and run
   - npm run build
   - npm start

   Or with live reload (dev):
   - npm run dev

Project Structure

- src/
  - controllers/ Express route handlers
  - entities/ TypeORM entities
  - routes/ Express routers
  - utils/ Helpers (email, uploads, logger, etc.)
  - middlewares/ Auth and validation
  - validators/ express-validator schemas
  - index.ts App entrypoint

Key Endpoints

Base path: /api

- Users: /users
- Services: /services
  - CRUD services; supports experts assignment and case studies creation on service create
- Industries: /industries
  - CRUD industries; supports experts assignment and case studies creation on create
- Insights: /insights
  - CRUD insights; notifies all active subscribers on creation
- Subscribers: /subscribers
  - POST /subscribe { email }
  - POST /unsubscribe { email }

File Uploads

- Image upload in insights uses multipart/form-data with field name image.

Email

- The email service uses Gmail by default. Set EMAIL_USER and EMAIL_PASSWORD (App Password) in .env.
- On createInsight, all active subscribers receive a notification with title, preview, and link.

Development Scripts

- npm run dev Run with nodemon (TypeScript)
- npm run build Compile TypeScript
- npm start Run compiled JavaScript

Database

- TypeORM DataSource reads from DATABASE_URL. Ensure the database exists and entities are synchronized/migrations applied as configured in data-source.

Notes

- The insights router is mounted at /api/insigts (typo preserved to match existing routes). Update src/index.ts if you want /api/insights instead.
- Join tables: Services↔Experts and Industries↔Experts use ManyToMany with default join table names.

License

ISC


