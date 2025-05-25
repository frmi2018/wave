// hooks/useRecipeEdit.ts
import { useState, useCallback } from 'react';
import { RecipeFormData, Recipe } from '../types/recipe';

export interface UseRecipeEditReturn {
  formData: RecipeFormData;
  setFormData: React.Dispatch<React.SetStateAction<RecipeFormData>>;
  handleAddIngredient: () => void;
  handleIngredientChange: (index: number, field: string, value: any) => void;
  handleRemoveIngredient: (index: number) => void;
  handleAddStep: () => void;
  handleStepChange: (index: number, description: string) => void;
  handleRemoveStep: (index: number) => void;
  initializeForm: (recipe: Recipe) => void;
  resetForm: () => void;
}

const initialFormData: RecipeFormData = {
  title: '',
  ingredients: [{ ingredient_id: '', quantity: 0, unit: '' }],
  steps: [{ step_number: 1, description: '' }],
  isPublic: false
};

export const useRecipeEdit = (): UseRecipeEditReturn => {
  const [formData, setFormData] = useState<RecipeFormData>(initialFormData);

  const initializeForm = useCallback((recipe: Recipe) => {
    setFormData({
      title: recipe.title,
      ingredients: recipe.recipe_ingredients.map(ri => ({
        ingredient_id: ri.ingredient_id,
        quantity: ri.quantity,
        unit: ri.unit
      })),
      steps: recipe.recipe_steps
        .sort((a, b) => a.step_number - b.step_number)
        .map(step => ({
          step_number: step.step_number,
          description: step.description
        })),
      isPublic: recipe.is_public || false
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const handleAddIngredient = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredient_id: '', quantity: 0, unit: '' }]
    }));
  }, []);

  const handleIngredientChange = useCallback((index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => {
        if (i === index) {
          return { ...ingredient, [field]: value };
        }
        return ingredient;
      })
    }));
  }, []);

  const handleRemoveIngredient = useCallback((index: number) => {
    setFormData(prev => {
      if (prev.ingredients.length > 1) {
        return {
          ...prev,
          ingredients: prev.ingredients.filter((_, i) => i !== index)
        };
      }
      return prev;
    });
  }, []);

  const handleAddStep = useCallback(() => {
    setFormData(prev => {
      const newStepNumber = Math.max(...prev.steps.map(s => s.step_number)) + 1;
      return {
        ...prev,
        steps: [...prev.steps, { step_number: newStepNumber, description: '' }]
      };
    });
  }, []);

  const handleStepChange = useCallback((index: number, description: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => {
        if (i === index) {
          return { ...step, description };
        }
        return step;
      })
    }));
  }, []);

  const handleRemoveStep = useCallback((index: number) => {
    setFormData(prev => {
      if (prev.steps.length > 1) {
        const updatedSteps = prev.steps
          .filter((_, i) => i !== index)
          .map((step, i) => ({ ...step, step_number: i + 1 }));
        return {
          ...prev,
          steps: updatedSteps
        };
      }
      return prev;
    });
  }, []);

  return {
    formData,
    setFormData,
    handleAddIngredient,
    handleIngredientChange,
    handleRemoveIngredient,
    handleAddStep,
    handleStepChange,
    handleRemoveStep,
    initializeForm,
    resetForm
  };
};