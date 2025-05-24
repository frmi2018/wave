// services/recipeService.ts
import { supabase } from '../services/supabaseClient';
import { Recipe, RecipeFormData, AvailableIngredient } from '../types/recipe';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from './cloudinaryService';

export class RecipeService {
  // Créer une nouvelle recette
  static async createRecipe(formData: RecipeFormData, userId: string): Promise<string | null> {
    try {
      // 1. Créer la recette principale
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          user_id: userId,
          title: formData.title,
          description: '', // Tu peux ajouter description au formulaire si besoin
          cooking_time: 0, // Tu peux ajouter ces champs au formulaire si besoin
          servings: 1,
          is_public: formData.isPublic,
          image_url: null
        })
        .select()
        .single();

      if (recipeError) {
        console.error('Erreur lors de la création de la recette:', recipeError);
        return null;
      }

      const recipeId = recipe.id;

      // 2. Ajouter les ingrédients
      if (formData.ingredients.length > 0) {
        const ingredientsToInsert = formData.ingredients
          .filter(ing => ing.ingredient_id && ing.quantity > 0)
          .map(ing => ({
            recipe_id: recipeId,
            ingredient_id: ing.ingredient_id,
            quantity: ing.quantity,
            unit: ing.unit
          }));

        if (ingredientsToInsert.length > 0) {
          const { error: ingredientsError } = await supabase
            .from('recipe_ingredients')
            .insert(ingredientsToInsert);

          if (ingredientsError) {
            console.error('Erreur lors de l\'ajout des ingrédients:', ingredientsError);
            // Supprimer la recette créée si les ingrédients ont échoué
            await this.deleteRecipe(recipeId);
            return null;
          }
        }
      }

      // 3. Ajouter les étapes
      if (formData.steps.length > 0) {
        const stepsToInsert = formData.steps
          .filter(step => step.description.trim() !== '')
          .map(step => ({
            recipe_id: recipeId,
            step_number: step.step_number,
            description: step.description
          }));

        if (stepsToInsert.length > 0) {
          const { error: stepsError } = await supabase
            .from('recipe_steps')
            .insert(stepsToInsert);

          if (stepsError) {
            console.error('Erreur lors de l\'ajout des étapes:', stepsError);
            // Supprimer la recette créée si les étapes ont échoué
            await this.deleteRecipe(recipeId);
            return null;
          }
        }
      }

      return recipeId;
    } catch (error) {
      console.error('Erreur générale lors de la création:', error);
      return null;
    }
  }

  static async getAvailableIngredients(): Promise<AvailableIngredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('id, name, category')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // Supprimer une recette
  static async deleteRecipe(recipeId: string): Promise<boolean> {
    try {
      // 1. Récupérer les détails de la recette pour obtenir l'URL de l'image
      const { data: recipe, error: fetchError } = await supabase
        .from('recipes')
        .select('image_url')
        .eq('id', recipeId)
        .single();

      if (fetchError) {
        console.error('Erreur lors de la récupération de la recette:', fetchError);
        return false;
      }

      // 2. Supprimer l'image de Cloudinary si elle existe
      if (recipe?.image_url) {
        await deleteImageFromCloudinary(recipe.image_url);
      }

      // 3. Supprimer les ingrédients liés
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId);

      if (ingredientsError) {
        console.error('Erreur lors de la suppression des ingrédients:', ingredientsError);
        return false;
      }

      // 4. Supprimer les étapes liées
      const { error: stepsError } = await supabase
        .from('recipe_steps')
        .delete()
        .eq('recipe_id', recipeId);

      if (stepsError) {
        console.error('Erreur lors de la suppression des étapes:', stepsError);
        return false;
      }

      // 5. Supprimer la recette
      const { error: recipeError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (recipeError) {
        console.error('Erreur lors de la suppression de la recette:', recipeError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur générale lors de la suppression:', error);
      return false;
    }
  }

  // Mettre à jour une recette
  static async updateRecipe(recipeId: string, updates: Partial<Recipe>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', recipeId);

      if (error) {
        console.error('Erreur lors de la mise à jour de la recette:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur générale lors de la mise à jour:', error);
      return false;
    }
  }

  // Mettre à jour l'image d'une recette
  static async updateRecipeImage(recipeId: string, newImageFile: File): Promise<boolean> {
    try {
      // 1. Récupérer l'ancienne image
      const { data: recipe, error: fetchError } = await supabase
        .from('recipes')
        .select('image_url')
        .eq('id', recipeId)
        .single();

      if (fetchError) {
        console.error('Erreur lors de la récupération de la recette:', fetchError);
        return false;
      }

      // 2. Supprimer l'ancienne image de Cloudinary si elle existe
      if (recipe?.image_url) {
        await deleteImageFromCloudinary(recipe.image_url);
      }

      // 3. Uploader la nouvelle image
      const newImageUrl = await uploadImageToCloudinary(newImageFile);
      if (!newImageUrl) {
        return false;
      }

      // 4. Mettre à jour la base de données
      const { error: updateError } = await supabase
        .from('recipes')
        .update({ image_url: newImageUrl })
        .eq('id', recipeId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'image:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur générale lors de la mise à jour de l\'image:', error);
      return false;
    }
  }

  // Récupérer une recette complète par ID
  static async getRecipeById(recipeId: string): Promise<Recipe | null> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            *,
            ingredients (
              name,
              category
            )
          ),
          recipe_steps (*)
        `)
        .eq('id', recipeId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la recette:', error);
        return null;
      }

      return data as Recipe;
    } catch (error) {
      console.error('Erreur générale:', error);
      return null;
    }
  }

// Récupérer ID du user dans une recette
static async getUserRecipes(userId: string): Promise<Recipe[]> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          *
        ),
        recipe_steps (
          *
        )
      `)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    return data || [];
  } catch (error) {
    console.error('Erreur générale:', error);
    return [];
  }
}
}