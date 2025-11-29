# Kanban Board - Full-Stack Project Management Application

A modern, full-featured Kanban board application built with Next.js 14, PostgreSQL (Supabase), and NextAuth.js. This application provides a complete project and task management solution with an intuitive drag-and-drop interface, user authentication, and beautiful UI/UX.

![Kanban Board](https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200)

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | React framework with server/client components |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Beautiful, accessible component library |
| **Backend/Database** | PostgreSQL (Supabase) | Managed PostgreSQL with real-time capabilities |
| **Authentication** | NextAuth.js | Secure authentication with JWT sessions |
| **Drag & Drop** | @dnd-kit | Modern drag-and-drop library |
| **Type Safety** | TypeScript | Static type checking |

## Features

- **User Authentication**: Secure login/logout with NextAuth.js
- **Project Management**: Create, view, and organize multiple projects
- **Kanban Board**: Visual task management with drag-and-drop
- **Task CRUD**: Create, read, update, and delete tasks
- **Task Properties**:
  - Title and description
  - Priority levels (low, medium, high)
  - Status columns (To Do, In Progress, Done)
  - Color-coded tags for categorization
- **User Scoping**: All data is strictly scoped to authenticated users
- **Responsive Design**: Works beautifully on desktop and mobile
- **Beautiful UI/UX**: Modern, clean interface with smooth animations

## Database Schema

The application uses 6 tables with proper relationships:

### 1. **users**
- `id` (uuid) - Primary key
- `email` (text) - Unique user email
- `password` (text) - Hashed password
- `name` (text) - User display name
- `created_at` (timestamptz) - Account creation date

### 2. **projects**
- `id` (uuid) - Primary key
- `name` (text) - Project name
- `description` (text) - Project description
- `user_id` (uuid) - Foreign key to users
- `created_at` (timestamptz) - Project creation date

### 3. **statuses**
- `id` (uuid) - Primary key
- `name` (text) - Status name (To Do, In Progress, Done)
- `slug` (text) - Unique identifier
- `order_index` (integer) - Display order

### 4. **tags**
- `id` (uuid) - Primary key
- `name` (text) - Tag name
- `color` (text) - Hex color code
- `user_id` (uuid) - Foreign key to users
- `created_at` (timestamptz) - Tag creation date

### 5. **tasks**
- `id` (uuid) - Primary key
- `title` (text) - Task title
- `description` (text) - Task description
- `priority` (text) - Priority level (low/medium/high)
- `project_id` (uuid) - Foreign key to projects
- `status_id` (uuid) - Foreign key to statuses
- `assigned_user_id` (uuid) - Foreign key to users
- `created_at` (timestamptz) - Task creation date
- `updated_at` (timestamptz) - Last update date

### 6. **task_tags** (Join Table)
- `id` (uuid) - Primary key
- `task_id` (uuid) - Foreign key to tasks
- `tag_id` (uuid) - Foreign key to tags
- `created_at` (timestamptz) - Relationship creation date

## Setup Instructions (0-100)

Follow these steps to get the application running on your local machine.

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works perfectly)
- Git installed

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd project
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for your database to be provisioned (takes ~2 minutes)
3. Once ready, go to **Project Settings** → **API**
4. Copy your **Project URL** and **anon/public key**

### Step 4: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here

# Application Configuration
NODE_ENV=development
```

**To generate a secure NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

Or use any random string generator online.

### Step 5: Database Migrations

The database schema has already been applied through Supabase! The migration includes:

- All 6 tables with proper relationships
- Row Level Security (RLS) policies for data protection
- Indexes for optimal performance
- Default status values (To Do, In Progress, Done)

**To verify your database setup:**

1. Go to your Supabase project
2. Click on **Table Editor** in the sidebar
3. You should see: `users`, `projects`, `statuses`, `tags`, `tasks`, and `task_tags` tables

### Step 6: Seed the Database

The application includes a seeding API endpoint that populates your database with sample data.

**Run the seeder:**

```bash
curl -X POST http://localhost:3000/api/seed
```

Or simply navigate to this URL in your browser after starting the dev server (Step 7):
```
http://localhost:3000/api/seed
```

**What gets seeded:**

- 10 demo users with hashed passwords
- 3 projects per user (30 total projects)
- 6 tags per user with different colors
- 7 tasks per project (210 total tasks)
- Random tag associations for each task
- Tasks distributed across all status columns

**Seeding output:**

You should see a JSON response like:

```json
{
  "success": true,
  "message": "Database seeded successfully",
  "stats": {
    "users": 10,
    "projects": 30,
    "tags": 60,
    "tasks": 210,
    "taskTags": 420
  }
}
```

### Step 7: Run the Development Server

```bash
npm run dev
```

The application will start at **http://localhost:3000**

### Step 8: Login and Explore

Navigate to **http://localhost:3000** (you'll be redirected to the login page).

**Demo Credentials (any of these work):**

| Email | Password | Name |
|-------|----------|------|
| john@example.com | password123 | John Doe |
| jane@example.com | password123 | Jane Smith |
| bob@example.com | password123 | Bob Johnson |
| alice@example.com | password123 | Alice Williams |
| charlie@example.com | password123 | Charlie Brown |
| diana@example.com | password123 | Diana Prince |
| eve@example.com | password123 | Eve Davis |
| frank@example.com | password123 | Frank Miller |
| grace@example.com | password123 | Grace Lee |
| henry@example.com | password123 | Henry Wilson |

**All users have the same password:** `password123`

## Usage Guide

### Dashboard

After logging in, you'll see your dashboard with all your projects:

- Click **"New Project"** to create a project
- Click on any project card to open its Kanban board

### Kanban Board

Each project has a Kanban board with three columns:

- **To Do**: Tasks that haven't been started
- **In Progress**: Tasks currently being worked on
- **Done**: Completed tasks

**Working with Tasks:**

1. **Create a Task**: Click "New Task" button
   - Fill in title (required)
   - Add description (optional)
   - Select status
   - Choose priority level
   - Add tags by clicking on them

2. **Move Tasks**: Drag and drop tasks between columns to change their status

3. **Edit a Task**: Click on any task card to open the edit dialog
   - Update any field
   - Add/remove tags
   - Delete the task

4. **Priority Levels**:
   - 🔴 High (red badge)
   - 🟡 Medium (amber badge)
   - 🟢 Low (green badge)

### Creating Tags

Tags are automatically created during seeding, but you can create your own:

- Tags are user-specific (only you can see your tags)
- Each tag has a unique color
- Tags can be applied to multiple tasks

## Project Structure

```
project/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth authentication
│   │   ├── projects/             # Project CRUD endpoints
│   │   ├── tasks/                # Task CRUD endpoints
│   │   ├── tags/                 # Tag endpoints
│   │   ├── statuses/             # Status endpoints
│   │   └── seed/                 # Database seeding
│   ├── dashboard/                # Dashboard page
│   ├── projects/[id]/            # Dynamic project/Kanban page
│   ├── login/                    # Login page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home/redirect page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── navbar.tsx                # Navigation bar
│   ├── kanban-board.tsx          # Kanban board container
│   ├── kanban-column.tsx         # Individual columns
│   ├── task-card.tsx             # Task card component
│   ├── create-task-dialog.tsx    # Task creation modal
│   ├── edit-task-dialog.tsx      # Task editing modal
│   └── providers.tsx             # NextAuth provider
├── lib/                          # Utility functions
│   ├── supabase.ts               # Supabase client & types
│   ├── auth.ts                   # Authentication helpers
│   ├── db-helpers.ts             # Database utilities
│   └── utils.ts                  # General utilities
├── types/                        # TypeScript type definitions
│   └── next-auth.d.ts            # NextAuth type extensions
├── .env.local.example            # Environment variables template
└── README.md                     # This file
```

## API Endpoints

All API endpoints require authentication (except seeding for demo purposes).

### Projects

- `GET /api/projects` - Get all user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get specific project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks

- `GET /api/tasks?projectId={id}` - Get all tasks for a project
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get specific task
- `PUT /api/tasks/[id]` - Update task (including status for drag-drop)
- `DELETE /api/tasks/[id]` - Delete task

### Tags

- `GET /api/tags` - Get all user's tags
- `POST /api/tags` - Create new tag

### Statuses

- `GET /api/statuses` - Get all statuses (globally available)

### Utilities

- `POST /api/seed` - Seed database with sample data

## Security Features

- **Row Level Security (RLS)**: All tables use PostgreSQL RLS policies
- **User Scoping**: Users can only access their own data
- **Password Hashing**: Bcrypt with 10 rounds
- **JWT Sessions**: Secure, stateless authentication
- **Protected API Routes**: All endpoints verify authentication
- **No SQL Injection**: Using Supabase's query builder

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

To run the production build:

```bash
npm run start
```

## Troubleshooting

### Database Connection Issues

If you can't connect to Supabase:

1. Verify your `.env.local` file has correct credentials
2. Check your Supabase project is active (not paused)
3. Ensure your API keys are copied correctly (no extra spaces)

### Seeding Issues

If seeding fails:

1. Make sure the dev server is running (`npm run dev`)
2. Check that all tables exist in your Supabase dashboard
3. Try accessing the seed endpoint directly: `http://localhost:3000/api/seed`

### Authentication Issues

If login doesn't work:

1. Verify `NEXTAUTH_SECRET` is set in `.env.local`
2. Make sure `NEXTAUTH_URL` matches your dev server URL
3. Clear browser cookies and try again
4. Run the seeder to ensure test users exist

### Build Errors

If the build fails:

1. Delete `.next` folder and `node_modules`
2. Run `npm install` again
3. Ensure all TypeScript errors are resolved
4. Check that all environment variables are set

## Development Tips

- **Hot Reload**: Changes to code automatically refresh the browser
- **Database Changes**: Use Supabase Table Editor for quick schema changes
- **Debugging**: Check browser console and terminal for error messages
- **Type Safety**: TypeScript will catch errors before runtime

## Performance Optimizations

- **Database Indexes**: Indexes on frequently queried columns
- **Optimistic Updates**: UI updates before server confirms (drag-drop)
- **Lazy Loading**: Components load only when needed
- **Image Optimization**: Next.js automatic image optimization
- **Static Generation**: Pages generated at build time when possible

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for learning or as a base for your own applications.

## Credits

- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Database**: [Supabase](https://supabase.com/)
- **Framework**: [Next.js](https://nextjs.org/)

## Support

For issues or questions:

1. Check this README thoroughly
2. Review the troubleshooting section
3. Check Supabase documentation for database issues
4. Review Next.js documentation for framework questions

---

**Built with ❤️ using Next.js, Supabase, and modern web technologies**
#   p r o j e c t - m a n a g e m e n t - a p p  
 