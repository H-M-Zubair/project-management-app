import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
}

export interface Status {
  id: string;
  name: string;
  slug: string;
  order_index: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  project_id: string;
  status_id: string;
  assigned_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskTag {
  id: string;
  task_id: string;
  tag_id: string;
  created_at: string;
}

export interface TaskWithRelations extends Task {
  status: Status;
  tags: Tag[];
  assigned_user: User;
}
