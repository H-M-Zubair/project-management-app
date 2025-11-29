import { supabase } from './supabase';

export async function setUserContext(userId: string) {
  await supabase.rpc('set_config', {
    setting: 'app.current_user_id',
    value: userId,
  });
}

export async function executeWithUserContext<T>(
  userId: string,
  operation: () => Promise<T>
): Promise<T> {
  await supabase.rpc('set_config', {
    setting: 'app.current_user_id',
    value: userId,
  });

  return operation();
}
