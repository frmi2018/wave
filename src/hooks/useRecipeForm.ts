// hooks/useRecipeForm.ts
import { useState } from 'react';
import { RecipeFormData, Ingredient, initialFormData } from '../types/recipe';

export interface UseRecipeFormReturn {
  formData: RecipeFormData;
  setFormData: (data: RecipeFormData) => void;
  resetForm: () => void;
  
  // Gestion des ingrédients
  handleAddIngredient: () => void;
  handleIngredientChange: (index: number, field: keyof Ingredient, value: string | number) => void;
  handleRemoveIngredient: (index: number) => void;
  
  // Gestion des étapes
  handleAddStep: () => void;
  handleStepChange: (index: number, description: string) => void;
  handleRemoveStep: (index: number) => void;
}

export const useRecipeForm = (): UseRecipeFormReturn => {
  const [formData, setFormData] = useState<RecipeFormData>({...initialFormData});

  const resetForm = () => {
    setFormData({...initialFormData});
  };

  // Gestion des ingrédients
  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ingredient_id: '', quantity: 0, unit: '' }]
    });
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({
      ...formData,
      ingredients: newIngredients
    });
  };

  const handleRemoveIngredient = (index: number) => {
    if (formData.ingredients.length === 1) return;
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      ingredients: newIngredients
    });
  };

  // Gestion des étapes
  const handleAddStep = () => {
    const nextNumber = formData.steps.length + 1;
    setFormData({
      ...formData,
      steps: [...formData.steps, { step_number: nextNumber, description: '' }]
    });
  };

  const handleStepChange = (index: number, description: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], description };
    setFormData({
      ...formData,
      steps: newSteps
    });
  };

  const handleRemoveStep = (index: number) => {
    if (formData.steps.length === 1) return;
    let newSteps = formData.steps.filter((_, i) => i !== index);
    // Réorganiser les numéros d'étapes
    newSteps = newSteps.map((step, i) => ({ ...step, step_number: i + 1 }));
    setFormData({
      ...formData,
      steps: newSteps
    });
  };

  return {
    formData,
    setFormData,
    resetForm,
    handleAddIngredient,
    handleIngredientChange,
    handleRemoveIngredient,
    handleAddStep,
    handleStepChange,
    handleRemoveStep
  };
};