// services/supabaseProfileService.ts
import { supabase } from './supabaseClient';

/**
 * Met à jour l'avatar d'un utilisateur dans Supabase.
 * @param userId - ID de l'utilisateur
 * @param avatarUrl - URL de l'image à enregistrer
 */
export const updateUserAvatar = async (userId: string, avatarUrl: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) {
    throw new Error(`Erreur Supabase: ${error.message}`);
  }
};
