// components/RecipeFormModal.tsx  
import React from 'react';
import { AvailableIngredient, RecipeFormData } from '../../types/recipe';
import { UseRecipeFormReturn } from '../../hooks/useRecipeForm';
import styles from './UserRecipes.module.css';

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: RecipeFormData) => Promise<void>;
  formHook: UseRecipeFormReturn;
  availableIngredients: AvailableIngredient[];
  isSubmitting: boolean;
}

const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formHook,
  availableIngredients,
  isSubmitting
}) => {
  if (!isOpen) return null;

  const {
    formData,
    setFormData,
    handleAddIngredient,
    handleIngredientChange,
    handleRemoveIngredient,
    handleAddStep,
    handleStepChange,
    handleRemoveStep
  } = formHook;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
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
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeFormModal;