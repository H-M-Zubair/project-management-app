# Quick Start Guide

Get your Kanban Board application running in just 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is perfect)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait ~2 minutes for your database to be ready
3. Navigate to **Project Settings** → **API**
4. Copy your **Project URL** and **anon key**

### 3. Configure Environment

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret_here
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 4. Verify Database Schema

The database schema is already applied! Verify by:

1. Open your Supabase project dashboard
2. Go to **Table Editor**
3. You should see 6 tables: `users`, `projects`, `statuses`, `tags`, `tasks`, `task_tags`

### 5. Start the Development Server

```bash
npm run dev
```

### 6. Seed the Database

Visit in your browser:
```
http://localhost:3000/api/seed
```

This creates 10 demo users with sample projects and tasks.

### 7. Login and Explore

Navigate to `http://localhost:3000`

**Login with:**
- Email: `john@example.com`
- Password: `password123`

## What's Included

After seeding, each user has:
- 3 projects
- 7 tasks per project
- 6 colorful tags
- Tasks distributed across To Do, In Progress, and Done columns

## Demo Users

All users have password: `password123`

- john@example.com
- jane@example.com
- bob@example.com
- alice@example.com
- charlie@example.com
- diana@example.com
- eve@example.com
- frank@example.com
- grace@example.com
- henry@example.com

## Need Help?

Check the main [README.md](./README.md) for detailed documentation and troubleshooting.

---

**You're all set! Start managing your projects with style!**
