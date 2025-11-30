import { supabase, getSupabaseAdmin } from './supabase';
import bcrypt from 'bcryptjs';

const supabaseAdmin = getSupabaseAdmin();
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getUserById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
