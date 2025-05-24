// utils/recipeValidation.ts
import { RecipeFormData } from '../types/recipe';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export class RecipeValidator {
  static validateForm(formData: RecipeFormData): ValidationResult {
    // Vérifier le titre
    if (!formData.title.trim()) {
      return {
        isValid: false,
        errorMessage: 'Veuillez saisir un titre pour votre recette.'
      };
    }

    // Vérifier les ingrédients
    for (const ingredient of formData.ingredients) {
      if (!ingredient.ingredient_id) {
        return {
          isValid: false,
          errorMessage: 'Veuillez sélectionner tous les ingrédients.'
        };
      }
      if (ingredient.quantity <= 0) {
        return {
          isValid: false,
          errorMessage: 'Les quantités doivent être supérieures à zéro.'
        };
      }
      if (!ingredient.unit.trim()) {
        return {
          isValid: false,
          errorMessage: 'Veuillez spécifier une unité pour chaque ingrédient.'
        };
      }
    }

    // Vérifier les étapes
    for (const step of formData.steps) {
      if (!step.description.trim()) {
        return {
          isValid: false,
          errorMessage: 'Veuillez remplir toutes les étapes.'
        };
      }
    }

    return { isValid: true };
  }
}