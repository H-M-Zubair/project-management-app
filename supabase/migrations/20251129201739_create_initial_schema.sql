/*
  # Initial Kanban Board Schema

  ## Overview
  This migration creates the complete database schema for a user-scoped Kanban board application
  with 6 tables implementing proper relationships and security policies.

  ## New Tables

  ### 1. users
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User email for login
  - `password` (text) - Hashed password
  - `name` (text) - User display name
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. projects
  - `id` (uuid, primary key) - Unique project identifier
  - `name` (text) - Project name
  - `description` (text) - Project description
  - `user_id` (uuid, foreign key) - Owner of the project
  - `created_at` (timestamptz) - Project creation timestamp

  ### 3. statuses
  - `id` (uuid, primary key) - Unique status identifier
  - `name` (text) - Display name (To Do, In Progress, Done)
  - `slug` (text, unique) - Machine-readable identifier
  - `order_index` (integer) - Display order

  ### 4. tags
  - `id` (uuid, primary key) - Unique tag identifier
  - `name` (text) - Tag name
  - `color` (text) - Hex color code
  - `user_id` (uuid, foreign key) - Owner of the tag
  - `created_at` (timestamptz) - Tag creation timestamp

  ### 5. tasks
  - `id` (uuid, primary key) - Unique task identifier
  - `title` (text) - Task title
  - `description` (text) - Task description
  - `priority` (text) - Priority level (low, medium, high)
  - `project_id` (uuid, foreign key) - Associated project
  - `status_id` (uuid, foreign key) - Current status
  - `assigned_user_id` (uuid, foreign key) - Assigned user
  - `created_at` (timestamptz) - Task creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. task_tags
  - `id` (uuid, primary key) - Unique identifier
  - `task_id` (uuid, foreign key) - Associated task
  - `tag_id` (uuid, foreign key) - Associated tag
  - `created_at` (timestamptz) - Relationship creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all user-scoped tables
  - Users can only access their own projects, tasks, and tags
  - Statuses are globally readable but not modifiable by users
  - Comprehensive policies for SELECT, INSERT, UPDATE, DELETE operations

  ## Important Notes
  - All foreign keys have CASCADE delete for data integrity
  - Indexes added for performance on frequently queried columns
  - Default statuses (To Do, In Progress, Done) are seeded automatically
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create statuses table (global, predefined statuses)
CREATE TABLE IF NOT EXISTS statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  order_index integer NOT NULL DEFAULT 0
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  priority text NOT NULL DEFAULT 'medium',
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status_id uuid NOT NULL REFERENCES statuses(id),
  assigned_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create task_tags join table
CREATE TABLE IF NOT EXISTS task_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_id ON tasks(status_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user_id ON tasks(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);

-- Insert default statuses
INSERT INTO statuses (name, slug, order_index) VALUES
  ('To Do', 'todo', 1),
  ('In Progress', 'in_progress', 2),
  ('Done', 'done', 3)
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- Users table policies (users can only see themselves)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (current_setting('app.current_user_id', true))::uuid)
  WITH CHECK (id = (current_setting('app.current_user_id', true))::uuid);

-- Projects table policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid)
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- Statuses table policies (readable by all authenticated users)
CREATE POLICY "Statuses are viewable by authenticated users"
  ON statuses FOR SELECT
  TO authenticated
  USING (true);

-- Tags table policies
CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can create own tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid)
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- Tasks table policies (users can only access tasks in their projects)
CREATE POLICY "Users can view tasks in own projects"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.user_id = (current_setting('app.current_user_id', true))::uuid
    )
  );

CREATE POLICY "Users can create tasks in own projects"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.user_id = (current_setting('app.current_user_id', true))::uuid
    )
  );

CREATE POLICY "Users can update tasks in own projects"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.user_id = (current_setting('app.current_user_id', true))::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.user_id = (current_setting('app.current_user_id', true))::uuid
    )
  );

CREATE POLICY "Users can delete tasks in own projects"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.user_id = (current_setting('app.current_user_id', true))::uuid
    )
  );

-- Task tags policies (users can manage tags on their tasks)
CREATE POLICY "Users can view task tags for own tasks"
  ON task_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      WHERE tasks.id = task_tags.task_id
      AND projects.user_id = (current_setting('app.current_user_id', true))::uuid
    )
  );

CREATE POLICY "Users can create task tags for own tasks"
  ON task_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      WHERE tasks.id = task_tags.task_id
      AND projects.user_id = (current_setting('app.current_user_id', true))::uuid
    )
  );

CREATE POLICY "Users can delete task tags for own tasks"
  ON task_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      WHERE tasks.id = task_tags.task_id
      AND projects.user_id = (current_setting('app.current_user_id', true))::uuid
    )
  );