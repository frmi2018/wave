// services/profileService.ts
import { supabase } from '../config/supabaseClient';

export async function fetchUserProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .neq('role', 'admin')
    .order('username', { ascending: true });

  if (error) throw error;
  return data;
}
