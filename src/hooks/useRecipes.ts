import { useState, useEffect, useCallback } from 'react';
import { Recipe, AvailableIngredient, RecipeFormData } from '../types/recipe';
import { RecipeCreationService } from '../services/recipesCreationService';
import { RecipeManagementService } from '../services/recipeManagementService';
import { RecipeValidator } from '../utils/recipeValidation';

interface UseRecipesReturn {
  recipes: Recipe[];
  availableIngredients: AvailableIngredient[];
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  fetchUserRecipes: () => Promise<void>;
  createRecipe: (formData: RecipeFormData) => Promise<string>;
  clearError: () => void;
}

export const useRecipes = (userId: string | null): UseRecipesReturn => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<AvailableIngredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchUserRecipes = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await RecipeManagementService.getUserRecipes(userId);
      setRecipes(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des recettes :', error);
      setErrorMessage('Impossible de charger vos recettes. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchAvailableIngredients = useCallback(async () => {
    try {
      const data = await RecipeCreationService.getAvailableIngredients();
      setAvailableIngredients(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des ingrédients :', error);
      setErrorMessage('Impossible de charger la liste des ingrédients.');
    }
  }, []);

  const createRecipe = useCallback(async (formData: RecipeFormData): Promise<string> => {
    if (!userId) throw new Error('Utilisateur non connecté');

    setErrorMessage(null);

    const validation = RecipeValidator.validateForm(formData);
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || 'Données invalides');
      throw new Error(validation.errorMessage);
    }

    setIsSubmitting(true);

    try {
      const recipeId = await RecipeCreationService.createRecipe(formData, userId);
      if (!recipeId) throw new Error("La création de la recette a échoué, ID manquant");
      await fetchUserRecipes();
      return recipeId;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de la recette :', error);
      setErrorMessage(`Échec de l'enregistrement: ${error.message}`);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, fetchUserRecipes]);

  const clearError = () => {
    setErrorMessage(null);
  };

  useEffect(() => {
    if (userId) {
      fetchUserRecipes();
      fetchAvailableIngredients();
    }
  }, [userId, fetchUserRecipes, fetchAvailableIngredients]);

  return {
    recipes,
    availableIngredients,
    isLoading,
    isSubmitting,
    errorMessage,
    fetchUserRecipes,
    createRecipe,
    clearError
  };
};
