import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import RecipeImageUploader from '../RecipeImageUploader/RecipeImageUploader';
import styles from './UserRecipes.module.css';

// Types bien définis
interface Ingredient {
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

interface Step {
  id?: string;
  recipe_id?: string;
  step_number: number;
  description: string;
}

interface Recipe {
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

interface AvailableIngredient {
  id: string;
  name: string;
  category: string;
}

interface RecipeFormData {
  title: string;
  ingredients: Ingredient[];
  steps: Step[];
  isPublic: boolean;
}

// Valeurs initiales pour le formulaire
const initialFormData: RecipeFormData = {
  title: '',
  ingredients: [{ ingredient_id: '', quantity: 0, unit: '' }],
  steps: [{ step_number: 1, description: '' }],
  isPublic: false
};

const UserRecipes: React.FC = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newlyCreatedRecipe, setNewlyCreatedRecipe] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<RecipeFormData>({...initialFormData});
  const [availableIngredients, setAvailableIngredients] = useState<AvailableIngredient[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRecipes();
      fetchAvailableIngredients();
    }
  }, [user]);

  const fetchUserRecipes = async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id,
          user_id,
          title,
          description,
          image_url,
          cooking_time,
          servings,
          created_at,
          updated_at,
          is_public,
          recipe_ingredients (
            id,
            quantity,
            unit,
            ingredient_id,
            ingredients (
              name,
              category
            )
          ),
          recipe_steps (
            id,
            step_number,
            description
          )
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Nettoyage des données pour avoir le bon format avec le bon typage
      const cleanedData: Recipe[] = (data ?? []).map((recipe: any) => {
        // Traiter les ingrédients correctement selon notre interface
        const processedIngredients: Ingredient[] = recipe.recipe_ingredients.map((ri: any) => ({
          id: ri.id,
          recipe_id: ri.recipe_id,
          ingredient_id: ri.ingredient_id,
          quantity: ri.quantity,
          unit: ri.unit,
          ingredients: ri.ingredients ? {
            name: ri.ingredients.name,
            category: ri.ingredients.category
          } : undefined
        }));
        
        // Traiter les étapes correctement selon notre interface
        const processedSteps: Step[] = recipe.recipe_steps.map((rs: any) => ({
          id: rs.id,
          recipe_id: rs.recipe_id,
          step_number: rs.step_number,
          description: rs.description
        }));
        
        // Créer l'objet recette avec typage correct
        return {
          id: recipe.id,
          user_id: recipe.user_id,
          title: recipe.title,
          description: recipe.description,
          image_url: recipe.image_url,
          cooking_time: recipe.cooking_time,
          servings: recipe.servings,
          created_at: recipe.created_at,
          updated_at: recipe.updated_at,
          is_public: recipe.is_public,
          recipe_ingredients: processedIngredients,
          recipe_steps: processedSteps
        };
      });

      setRecipes(cleanedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des recettes :', error);
      setErrorMessage('Impossible de charger vos recettes. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('id, name, category')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setAvailableIngredients(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des ingrédients :', error);
      setErrorMessage('Impossible de charger la liste des ingrédients.');
    }
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

  // Gestion d'image
  const handleImageSuccess = (url: string) => {
    setIsUploadModalOpen(false);
    setNewlyCreatedRecipe(null);
    fetchUserRecipes(); // Rafraîchir pour montrer l'image
  };

  const handleImageError = (error: Error) => {
    console.error("Erreur lors de l'upload de l'image:", error.message);
    setErrorMessage("Échec de l'upload de l'image. Veuillez réessayer.");
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    // Vérifier le titre
    if (!formData.title.trim()) {
      setErrorMessage('Veuillez saisir un titre pour votre recette.');
      return false;
    }

    // Vérifier les ingrédients
    for (const ingredient of formData.ingredients) {
      if (!ingredient.ingredient_id) {
        setErrorMessage('Veuillez sélectionner tous les ingrédients.');
        return false;
      }
      if (ingredient.quantity <= 0) {
        setErrorMessage('Les quantités doivent être supérieures à zéro.');
        return false;
      }
      if (!ingredient.unit.trim()) {
        setErrorMessage('Veuillez spécifier une unité pour chaque ingrédient.');
        return false;
      }
    }

    // Vérifier les étapes
    for (const step of formData.steps) {
      if (!step.description.trim()) {
        setErrorMessage('Veuillez remplir toutes les étapes.');
        return false;
      }
    }

    return true;
  };

  // Soumission du formulaire avec transaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!user) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Commencer une transaction avec Supabase
      // Note: Supabase n'a pas de véritable API de transaction, donc nous devons gérer manuellement
      
      // 1. Insérer la recette
      const now = new Date().toISOString();
      const { data: recipeInsert, error: recipeError } = await supabase
        .from('recipes')
        .insert([
          {
            title: formData.title,
            description: '',  // À améliorer plus tard
            image_url: '',    // Image vide par défaut
            cooking_time: 0,  // À améliorer plus tard
            servings: 0,      // À améliorer plus tard
            user_id: user.user.id,
            created_at: now,
            updated_at: now,
            is_public: formData.isPublic,
          },
        ])
        .select()
        .single();

      if (recipeError || !recipeInsert) {
        throw new Error(`Erreur lors de la création de la recette: ${recipeError?.message || 'Données non retournées'}`);
      }
      
      const recipeId = recipeInsert.id;

      // 2. Insérer les ingrédients
      const ingredientsToInsert = formData.ingredients.map(ingredient => ({
        recipe_id: recipeId,
        ingredient_id: ingredient.ingredient_id,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsToInsert);

      if (ingredientsError) {
        // En cas d'erreur, essayer de supprimer la recette créée précédemment
        await supabase.from('recipes').delete().eq('id', recipeId);
        throw new Error(`Erreur lors de l'ajout des ingrédients: ${ingredientsError.message}`);
      }

      // 3. Insérer les étapes
      const stepsToInsert = formData.steps.map(step => ({
        recipe_id: recipeId,
        step_number: step.step_number,
        description: step.description,
      }));

      const { error: stepsError } = await supabase
        .from('recipe_steps')
        .insert(stepsToInsert);

      if (stepsError) {
        // En cas d'erreur, essayer de nettoyer
        await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
        await supabase.from('recipes').delete().eq('id', recipeId);
        throw new Error(`Erreur lors de l'ajout des étapes: ${stepsError.message}`);
      }

      // Tout s'est bien passé, préparer pour l'upload de l'image
      setNewlyCreatedRecipe(recipeId);
      setIsModalOpen(false);
      setIsUploadModalOpen(true);
      resetForm();
      fetchUserRecipes(); // Rafraîchir la liste des recettes

    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de la recette :', error);
      setErrorMessage(`Échec de l'enregistrement: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({...initialFormData});
    setErrorMessage(null);
  };

  const openNewRecipeModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mes Recettes</h2>

      {errorMessage && (
        <div className={styles.errorMessage}>
          {errorMessage}
          <button onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <p>Chargement des recettes...</p>
        </div>
      ) : recipes.length > 0 ? (
        <div className={styles.recipeGrid}>
          {recipes.map((recipe) => (
            <div key={recipe.id} className={styles.recipeCard}>
              {recipe.image_url ? (
                <div className={styles.recipeImage}>
                  <img src={recipe.image_url} alt={recipe.title} />
                </div>
              ) : (
                <div className={styles.noImage}>
                  <button 
                    className={styles.addImageButton} 
                    onClick={() => {
                      setNewlyCreatedRecipe(recipe.id);
                      setIsUploadModalOpen(true);
                    }}
                  >
                    Ajouter une image
                  </button>
                </div>
              )}
              <h3>{recipe.title}</h3>
              <p>{recipe.recipe_ingredients.length} ingrédient(s)</p>
              <p>{recipe.recipe_steps.length} étape(s)</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Vous n'avez pas encore de recettes.</p>
      )}
      
      <button 
        className={styles.addButton} 
        onClick={openNewRecipeModal}
      >
        Ajouter une recette
      </button>

      {/* Modal de création de recette */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Nouvelle Recette</h2>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="recipe-title">Titre de la recette</label>
                <input
                  id="recipe-title"
                  type="text"
                  placeholder="Titre de la recette"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <h3>Ingrédients</h3>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className={styles.ingredientRow}>
                  <select
                    value={ingredient.ingredient_id}
                    onChange={(e) => handleIngredientChange(index, 'ingredient_id', e.target.value)}
                    required
                  >
                    <option value="">-- Choisir un ingrédient --</option>
                    {availableIngredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.category})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Quantité"
                    value={ingredient.quantity || ''}
                    onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0.1"
                    step="0.1"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Unité"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    required
                  />
                  {formData.ingredients.length > 1 && (
                    <button 
                      type="button" 
                      className={styles.removeButton}
                      onClick={() => handleRemoveIngredient(index)}
                    >
                      –
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                className={styles.secondaryButton}
                onClick={handleAddIngredient}
              >
                + Ingrédient
              </button>

              <h3>Étapes</h3>
              {formData.steps.map((step, index) => (
                <div key={index} className={styles.stepRow}>
                  <div className={styles.stepNumber}>{step.step_number}</div>
                  <textarea
                    placeholder={`Décrivez l'étape ${step.step_number}`}
                    value={step.description}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    required
                  />
                  {formData.steps.length > 1 && (
                    <button 
                      type="button" 
                      className={styles.removeButton}
                      onClick={() => handleRemoveStep(index)}
                    >
                      –
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                className={styles.secondaryButton}
                onClick={handleAddStep}
              >
                + Étape
              </button>

              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                  />
                  Rendre cette recette publique
                </label>
              </div>

              <div className={styles.buttonGroup}>
                <button 
                  type="submit" 
                  className={styles.primaryButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Création en cours...' : 'Créer la recette'}
                </button>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pour l'upload d'image après création */}
      {isUploadModalOpen && newlyCreatedRecipe && (
        <div className={styles.modalOverlay}>
          <div className={styles.imageUploadModal}>
            <h2>Ajouter une image à votre recette</h2>
            <RecipeImageUploader 
              recipeId={newlyCreatedRecipe}
              onSuccess={handleImageSuccess}
              onError={handleImageError}
            />
            <button 
              className={styles.skipButton} 
              onClick={() => {
                setIsUploadModalOpen(false);
                setNewlyCreatedRecipe(null);
                fetchUserRecipes(); // Mettre à jour pour voir la recette sans image
              }}
            >
              Ignorer cette étape
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRecipes;