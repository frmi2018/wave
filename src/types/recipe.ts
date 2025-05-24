// types/recipe.ts
export interface Ingredient {
  id?: string;
  recipe_id?: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  ingredients?: {
    name: string;
    category: string;
  };
}

export interface Step {
  id?: string;
  recipe_id?: string;
  step_number: number;
  description: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  cooking_time: number;
  servings: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  recipe_ingredients: Ingredient[];
  recipe_steps: Step[];
}

export interface AvailableIngredient {
  id: string;
  name: string;
  category: string;
}

export interface RecipeFormData {
  title: string;
  ingredients: Ingredient[];
  steps: Step[];
  isPublic: boolean;
}

export const initialFormData: RecipeFormData = {
  title: '',
  ingredients: [{ ingredient_id: '', quantity: 0, unit: '' }],
  steps: [{ step_number: 1, description: '' }],
  isPublic: false
};