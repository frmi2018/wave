// src/hooks/useRecipeDetails.ts
import { useCallback, useState, useEffect } from 'react';
import { Recipe, AvailableIngredient } from '../types/recipe';
import { RecipeManagementService } from '../services/recipeManagementService';
import { RecipeCreationService } from '../services/recipesCreationService';

interface UseRecipeDetailsResult {
  recipe: Recipe | null;
  availableIngredients: AvailableIngredient[];
  loading: boolean;
  error: string | null;
  canModify: boolean;
  refetch: () => void;
}

export function useRecipeDetails(id: string | undefined, userId: string | null): UseRecipeDetailsResult {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<AvailableIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canModify, setCanModify] = useState(false);

const fetchData = useCallback(async () => {
  if (!id) {
    setError('ID de recette manquant');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const [recipeData, ingredientsData] = await Promise.all([
      RecipeManagementService.getRecipeById(id),
      RecipeCreationService.getAvailableIngredients(),
    ]);

    setRecipe(recipeData);
    setAvailableIngredients(ingredientsData);

    if (userId && recipeData) {
      const canUserModify = await RecipeManagementService.canUserModifyRecipe(id, userId);
      setCanModify(canUserModify);
    } else {
      setCanModify(false);
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des données:', err);
    setError('Impossible de charger la recette');
  } finally {
    setLoading(false);
  }
}, [id, userId]);

useEffect(() => {
  fetchData();
}, [fetchData]);

  return {
    recipe,
    availableIngredients,
    loading,
    error,
    canModify,
    refetch: fetchData,
  };
}
