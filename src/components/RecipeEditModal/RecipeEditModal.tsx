// components/RecipeEditModal.tsx
import React, { useEffect } from 'react';
import { Recipe, AvailableIngredient, RecipeFormData } from '../../types/recipe';
import { useRecipeEdit } from '../../hooks/useRecipeEdit';
import styles from './RecipeEditModal.module.css';
import PlateSpinner from '../Spinner/Spinner';

interface RecipeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: RecipeFormData) => Promise<void>;
  recipe: Recipe | null;
  availableIngredients: AvailableIngredient[];
  isSubmitting: boolean;
}

const RecipeEditModal: React.FC<RecipeEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  recipe,
  availableIngredients,
  isSubmitting
}) => {
  const {
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
  } = useRecipeEdit();

  // Gestion des champs généraux (title, isPublic)
  const handleFormChange = (field: keyof RecipeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (recipe && isOpen) {
      initializeForm(recipe);
    } else if (!isOpen) {
      resetForm();
    }
  }, [recipe, isOpen, initializeForm, resetForm]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !recipe) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Le titre de la recette est requis');
      return;
    }

    if (formData.ingredients.some(ing => !ing.ingredient_id || !ing.unit || ing.quantity <= 0)) {
      alert('Tous les ingrédients doivent être complètement renseignés');
      return;
    }

    if (formData.steps.some(step => !step.description.trim())) {
      alert('Toutes les étapes doivent avoir une description');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Modifier la Recette</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label htmlFor="recipe-title">
                Titre de la recette <span className={styles.required}>*</span>
              </label>
              <input
                id="recipe-title"
                type="text"
                placeholder="Titre de la recette"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
                disabled={isSubmitting}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3>Ingrédients</h3>
              <button
                type="button"
                className={styles.addButton}
                onClick={handleAddIngredient}
                disabled={isSubmitting}
              >
                + Ajouter
              </button>
            </div>

            <div className={styles.ingredientsList}>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className={styles.ingredientRow}>
                  <div className={styles.ingredientNumber}>{index + 1}</div>

                  <select
                    value={ingredient.ingredient_id}
                    onChange={(e) => handleIngredientChange(index, 'ingredient_id', e.target.value)}
                    required
                    disabled={isSubmitting}
                    className={styles.select}
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
                    disabled={isSubmitting}
                    className={styles.quantityInput}
                  />

                  <input
                    type="text"
                    placeholder="Unité (g, ml, pièce...)"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    required
                    disabled={isSubmitting}
                    className={styles.unitInput}
                  />

                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveIngredient(index)}
                      disabled={isSubmitting}
                      aria-label={`Supprimer l'ingrédient ${index + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3>Étapes de préparation</h3>
              <button
                type="button"
                className={styles.addButton}
                onClick={handleAddStep}
                disabled={isSubmitting}
              >
                + Ajouter
              </button>
            </div>

            <div className={styles.stepsList}>
              {formData.steps.map((step, index) => (
                <div key={index} className={styles.stepRow}>
                  <div className={styles.stepNumber}>{index + 1}</div>

                  <textarea
                    placeholder={`Décrivez l'étape ${index + 1}...`}
                    value={step.description}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    required
                    disabled={isSubmitting}
                    className={styles.textarea}
                    rows={3}
                  />

                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveStep(index)}
                      disabled={isSubmitting}
                      aria-label={`Supprimer l'étape ${index + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => handleFormChange('isPublic', e.target.checked)}
                  disabled={isSubmitting}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  Rendre cette recette publique
                </span>
              </label>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <PlateSpinner/>
                  Modification en cours...
                </>
              ) : (
                'Modifier la recette'
              )}
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

export default RecipeEditModal;
