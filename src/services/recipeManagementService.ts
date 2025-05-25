// services/recipeManagementService.ts
import { supabase } from '../config/supabaseClient';
import { Recipe } from '../types/recipe';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from './cloudinaryService';

export class RecipeManagementService {
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

  // Récupérer toutes les recettes d'un utilisateur
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

// services/recipeManagementService.ts

static async updateRecipe(
  recipeId: string,
  updates: Partial<Recipe> & { ingredients?: any[]; steps?: any[] } // typage plus permissif pour ingredients/steps
): Promise<{ success: boolean; message: string; recipe?: Recipe }> {

  console.log("Données reçu par updateRecipe:", updates);

  // 🔹 Normaliser les clés pour correspondre aux colonnes en base
  const updatesNormalized = {
    ...updates,
    recipe_ingredients: updates.ingredients,
    recipe_steps: updates.steps,
  };
  delete updatesNormalized.ingredients;
  delete updatesNormalized.steps;

  try {
    // 🔹 Étape 1 : filtrer les champs valides pour la table "recipes"
    const recipeColumns = [
      'title',
      'description',
      'image_url',
      'cooking_time',
      'servings',
      'is_public',
      'updated_at'
    ];

    const filteredUpdates = Object.fromEntries(
      Object.entries(updatesNormalized).filter(([key]) => recipeColumns.includes(key))
    );

    console.log("Recette filtrée:", filteredUpdates);

    // 🔹 Étape 2 : mettre à jour la table "recipes"
    if (Object.keys(filteredUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('recipes')
        .update(filteredUpdates)
        .eq('id', recipeId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour de la recette:', updateError);
        return { success: false, message: "Échec de la mise à jour de la recette." };
      }
    }

    // 🔹 Étape 3 : mise à jour des ingrédients
    if (updatesNormalized.recipe_ingredients) {
      console.log("Mise à jour des ingrédients:", updatesNormalized.recipe_ingredients);

      const { error: deleteIngredientsError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId);

      if (deleteIngredientsError) {
        console.error('Erreur lors de la suppression des anciens ingrédients:', deleteIngredientsError);
        return { success: false, message: "Échec de la mise à jour des ingrédients." };
      }

      const formattedIngredients = updatesNormalized.recipe_ingredients.map(ingredient => ({
        recipe_id: recipeId,
        ingredient_id: ingredient.ingredient_id,
        quantity: ingredient.quantity,
        unit: ingredient.unit
      }));

      const { error: insertIngredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(formattedIngredients);

      if (insertIngredientsError) {
        console.error('Erreur lors de l\'ajout des nouveaux ingrédients:', insertIngredientsError);
        return { success: false, message: "Échec de l'ajout des nouveaux ingrédients." };
      }
    }

    // 🔹 Étape 4 : mise à jour des étapes
    if (updatesNormalized.recipe_steps) {
      console.log("Mise à jour des étapes:", updatesNormalized.recipe_steps);

      const { error: deleteStepsError } = await supabase
        .from('recipe_steps')
        .delete()
        .eq('recipe_id', recipeId);

      if (deleteStepsError) {
        console.error('Erreur lors de la suppression des anciennes étapes:', deleteStepsError);
        return { success: false, message: "Échec de la mise à jour des étapes." };
      }

      const formattedSteps = updatesNormalized.recipe_steps.map(step => ({
        recipe_id: recipeId,
        step_number: step.step_number,
        description: step.description
      }));

      const { error: insertStepsError } = await supabase
        .from('recipe_steps')
        .insert(formattedSteps);

      if (insertStepsError) {
        console.error('Erreur lors de l\'ajout des nouvelles étapes:', insertStepsError);
        return { success: false, message: "Échec de l'ajout des nouvelles étapes." };
      }
    }

    // 🔹 Étape 5 : récupérer la recette mise à jour
    const { data: updatedRecipe, error: fetchError } = await supabase
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

    if (fetchError || !updatedRecipe) {
      console.warn('Recette mise à jour mais récupération impossible:', fetchError);
      return { success: true, message: "Recette mise à jour, mais récupération impossible." };
    }

    return {
      success: true,
      message: "Recette mise à jour avec succès.",
      recipe: updatedRecipe as Recipe,
    };

  } catch (error) {
    console.error('Erreur générale lors de la mise à jour:', error);
    return {
      success: false,
      message: "Une erreur inattendue est survenue lors de la mise à jour.",
    };
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

  // Supprimer une recette
static async deleteRecipe(recipeId: string): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Récupérer l'image
    const { data: recipe, error: fetchError } = await supabase
      .from('recipes')
      .select('image_url')
      .eq('id', recipeId)
      .single();

    if (fetchError) {
      console.error('Erreur lors de la récupération de la recette:', fetchError);
      return { success: false, message: 'Échec de la récupération de la recette.' };
    }

    // 2. Supprimer l'image Cloudinary
    if (recipe?.image_url) {
      await deleteImageFromCloudinary(recipe.image_url);
    }

    // 3. Supprimer les ingrédients
    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', recipeId);

    if (ingredientsError) {
      console.error('Erreur lors de la suppression des ingrédients:', ingredientsError);
      return { success: false, message: 'Échec de la suppression des ingrédients.' };
    }

    // 4. Supprimer les étapes
    const { error: stepsError } = await supabase
      .from('recipe_steps')
      .delete()
      .eq('recipe_id', recipeId);

    if (stepsError) {
      console.error('Erreur lors de la suppression des étapes:', stepsError);
      return { success: false, message: 'Échec de la suppression des étapes.' };
    }

    // 5. Supprimer la recette
    const { error: recipeError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId);

    if (recipeError) {
      console.error('Erreur lors de la suppression de la recette:', recipeError);
      return { success: false, message: 'Échec de la suppression de la recette.' };
    }

    return { success: true, message: 'Recette supprimée avec succès !' };
  } catch (error) {
    console.error('Erreur générale lors de la suppression:', error);
    return { success: false, message: 'Une erreur inattendue est survenue.' };
  }
}

 // Vérifier si l’utilisateur connecté est le créateur de la recette.
static async canUserModifyRecipe(recipeId: string, userId: string): Promise<boolean> {
  try {
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', recipeId)
      .single();

    if (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }

    return recipe?.user_id === userId;
  } catch (error) {
    console.error('Erreur générale lors de la vérification des permissions:', error);
    return false;
  }
}

}