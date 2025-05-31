import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRecipeDetails } from '../hooks/useRecipeDetails';
import { useToast } from '../components/Toast/ToastContext';

import { RecipeManagementService } from '../services/recipeManagementService';

import RecipeEditModal from '../components/RecipeEditModal/RecipeEditModal';
import ConfirmationModal from '../components/ConfirmationModal/ConfirmationModal';
import PlateSpinner from '../components/Spinner/Spinner';
import RecipeDetailHeader from '../components/RecipeDetail/RecipeDetailHeader';
import RecipeHeaderInfo from '../components/RecipeDetail/RecipeHeaderInfo';
import RecipeIngredientsList from '../components/RecipeDetail/RecipeIngredientsList';
import RecipeStepsList from '../components/RecipeDetail/RecipeStepsList';
import ErrorBlock from '../components/ErrorBlock';

import styles from '../styles/RecipeDetail.module.css';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const { recipe, availableIngredients, loading, error, canModify, refetch } = useRecipeDetails(id, user?.id ?? null);

  const [modals, setModals] = useState({ edit: false, deleteConfirm: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => navigate(-1);

  const checkPermission = (action: string) => {
    if (!canModify) {
      showToast(`Vous n'avez pas les permissions pour ${action} cette recette`, 'error', 3000);
      return false;
    }
    return true;
  };

  const handleEditSubmit = async (formData: any) => {
    if (!recipe || !checkPermission('modifier')) return;

    setIsSubmitting(true);
    try {
      const result = await RecipeManagementService.updateRecipe(recipe.id, formData);
if (result.success) {
  showToast(result.message, 'success', 3000);
  setModals({ ...modals, edit: false });
  refetch();
} else {
  showToast(result.message, 'error', 3000);
}
    } catch (error) {
      showToast("Une erreur inattendue s'est produite", 'error', 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!recipe || !checkPermission('supprimer')) return;

    setIsDeleting(true);
    setModals({ ...modals, deleteConfirm: false });

    try {
      const result = await RecipeManagementService.deleteRecipe(recipe.id);
if (result.success) {
  showToast(result.message, 'success', 3000);
  navigate('/', { replace: true });
} else {
  showToast(result.message, 'error', 3000);
}

    } catch {
      showToast("Une erreur inattendue s'est produite", 'error', 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <PlateSpinner />;

if (error) {
  return <ErrorBlock title="Erreur" message={error ?? 'Une erreur inconnue est survenue.'} onBack={handleBack} />

}

  if (!recipe) {
return <ErrorBlock title="Erreur" message={error ?? 'Une erreur inconnue est survenue.'} onBack={handleBack} />

  }

  return (
    <div className={styles.container}>
      <RecipeDetailHeader
        canModify={canModify}
        isDeleting={isDeleting}
        isSubmitting={isSubmitting}
        onBack={handleBack}
        onEdit={() => checkPermission('modifier') && setModals({ ...modals, edit: true })}
        onDeleteConfirm={() => checkPermission('supprimer') && setModals({ ...modals, deleteConfirm: true })}
      />

      <div className={styles.recipeContent}>
        <div className={styles.recipeInfo}>
          <div className={styles.titleSection}>
            <RecipeHeaderInfo
              title={recipe.title}
              imageUrl={recipe.image_url}
              cookingTime={recipe.cooking_time}
              servings={recipe.servings}
              isPublic={recipe.is_public}
            />
          </div>

          {recipe.description && (
            <div className={styles.section}>
              <h2>Notes</h2>
              <div className={styles.notes}>
                <p>{recipe.description}</p>
              </div>
            </div>
          )}

          <RecipeIngredientsList ingredients={recipe.recipe_ingredients} />
          <RecipeStepsList steps={recipe.recipe_steps} />
        </div>
      </div>

      {canModify && (
        <>
          <RecipeEditModal
            isOpen={modals.edit}
            onClose={() => setModals({ ...modals, edit: false })}
            onSubmit={handleEditSubmit}
            recipe={recipe}
            availableIngredients={availableIngredients}
            isSubmitting={isSubmitting}
          />
          <ConfirmationModal
            isOpen={modals.deleteConfirm}
            onClose={() => setModals({ ...modals, deleteConfirm: false })}
            onConfirm={handleDelete}
            title="Supprimer la recette"
            message={`Êtes-vous sûr de vouloir supprimer la recette "${recipe.title}" ?`}
            confirmText="Supprimer"
            cancelText="Annuler"
            type="danger"
          />
        </>
      )}
    </div>
  );
};

export default RecipeDetailPage;
