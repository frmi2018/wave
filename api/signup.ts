import { supabase } from "../src/config/supabaseClient.js"

export async function signUpUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return { error };
  }
}
