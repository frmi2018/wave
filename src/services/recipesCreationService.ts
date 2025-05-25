// services/recipeCreationService.ts
import { supabase } from '../config/supabaseClient';
import { RecipeFormData, AvailableIngredient } from '../types/recipe';

export class RecipeCreationService {
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
            await this.rollbackRecipeCreation(recipeId);
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
            await this.rollbackRecipeCreation(recipeId);
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

  // Récupérer la liste des ingrédients disponibles
  static async getAvailableIngredients(): Promise<AvailableIngredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('id, name, category')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // Annuler la création d'une recette en cas d'erreur
  private static async rollbackRecipeCreation(recipeId: string): Promise<void> {
    try {
      // Supprimer les ingrédients liés s'ils existent
      await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId);

      // Supprimer les étapes liées s'elles existent
      await supabase
        .from('recipe_steps')
        .delete()
        .eq('recipe_id', recipeId);

      // Supprimer la recette
      await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

    } catch (error) {
      console.error('Erreur lors du rollback de la création:', error);
    }
  }
}