// pages/RecipeDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Recipe, AvailableIngredient } from '../types/recipe';
import { RecipeManagementService } from '../services/recipeManagementService';
import { RecipeCreationService } from '../services/recipesCreationService';
import RecipeEditModal from '../components/RecipeEditModal/RecipeEditModal';
import ConfirmationModal from '../components/ConfirmationModal/ConfirmationModal';
// import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast} from '../components/Toast/ToastContext'
import styles from '../styles/RecipeDetail.module.css';
import { FiEdit2, FiTrash2, FiArrowLeft, FiClock, FiUsers } from 'react-icons/fi';
import {renderIcon} from '../utils/iconUtils'

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // États principaux
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les actions
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // États pour le modal d'édition
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState<AvailableIngredient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État pour vérifier les permissions
  const [canModify, setCanModify] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID de recette manquant');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        // Récupérer la recette et les ingrédients en parallèle
        const [recipeData, ingredientsData] = await Promise.all([
          RecipeManagementService.getRecipeById(id),
          RecipeCreationService.getAvailableIngredients()
        ]);

        setRecipe(recipeData);
        setAvailableIngredients(ingredientsData);

        // Vérifier les permissions si l'utilisateur est connecté
        if (user && recipeData) {
          const canUserModify = await RecipeManagementService.canUserModifyRecipe(id, user.id);
          setCanModify(canUserModify);
        }

      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError('Impossible de charger la recette');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleEdit = () => {
    if (!canModify) {
            showToast('Vous n\'avez pas les permissions pour modifier cette recette', "error", 3000);
      return;
    }
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (formData: any) => {
    if (!recipe || !canModify) return;

    setIsSubmitting(true);
    try {
      const result = await RecipeManagementService.updateRecipe(recipe.id, formData);
      
      if (result.success && result.recipe) {
        
          setRecipe(result.recipe);
          setIsEditModalOpen(false);
          showToast(result.message, "success", 3000);
        

      } else {
        showToast(result.message, "error", 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      showToast('Une erreur inattendue s\'est produite', "error", 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!canModify) {
      showToast('Vous n\'avez pas les permissions pour supprimer cette recette', "error", 3000);
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!recipe || !canModify) return;

    setIsDeleting(true);
    setShowDeleteConfirm(false);
    
    try {
      const result = await RecipeManagementService.deleteRecipe(recipe.id);
      
      if (result.success) {
        showToast(result.message, "success", 3000);
        navigate('/recipes', { replace: true });
      } else {
        showToast(result.message, "error", 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showToast('Une erreur inattendue s\'est produite', "error", 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        {/* <LoadingSpinner /> */}
        chargement en cours...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Erreur</h1>
          <p>{error}</p>
          <button onClick={handleBack} className={styles.backButton}>
            {renderIcon(FiArrowLeft)}
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Recette non trouvée</h1>
          <p>La recette que vous recherchez n'existe pas ou n'est plus disponible.</p>
          <button onClick={handleBack} className={styles.backButton}>
            {renderIcon(FiArrowLeft)}
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={handleBack} 
          className={styles.backButton}
          disabled={isDeleting}
        >
          {renderIcon(FiArrowLeft)}
          Retour
        </button>
        
        {canModify && (
          <div className={styles.actions}>
            <button 
              onClick={handleEdit}
              className={styles.editButton}
              title="Modifier la recette"
              disabled={isDeleting || isSubmitting}
            >
              {renderIcon(FiEdit2)}
              Modifier
            </button>
            <button 
              onClick={handleDeleteConfirm}
              className={styles.deleteButton}
              title="Supprimer la recette"
              disabled={isDeleting || isSubmitting}
            >
              {renderIcon(FiTrash2)}
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        )}
      </div>

      <div className={styles.recipeContent}>
        {recipe.image_url && (
          <div className={styles.imageContainer}>
            <img 
              src={recipe.image_url} 
              alt={recipe.title}
              className={styles.recipeImage}
              loading="lazy"
            />
          </div>
        )}

        <div className={styles.recipeInfo}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{recipe.title}</h1>
            
            <div className={styles.metadata}>
              {recipe.cooking_time && (
                <div className={styles.metaItem}>
                  {renderIcon(FiClock)}
                  <span>{recipe.cooking_time} min</span>
                </div>
              )}
              {recipe.servings && (
                <div className={styles.metaItem}>
                  {renderIcon(FiUsers)}
                  <span>{recipe.servings} pers.</span>
                </div>
              )}
              <div className={styles.visibility}>
                {recipe.is_public ? (
                  <span className={styles.publicBadge}>Public</span>
                ) : (
                  <span className={styles.privateBadge}>Privé</span>
                )}
              </div>
            </div>
          </div>
          
          <div className={styles.section}>
            <h2>
              <span className={styles.sectionNumber}>
                {recipe.recipe_ingredients.length}{" "}
              </span>
              Ingrédient{recipe.recipe_ingredients.length > 1 ? 's' : ''}
            </h2>
            
            <ul className={styles.ingredientsList}>
              {recipe.recipe_ingredients.map((ingredient, index) => (
                <li key={index} className={styles.ingredient}>
                  <div className={styles.ingredientContent}>
                    <span className={styles.quantity}>
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                    <span className={styles.name}>
                      {ingredient.ingredients?.name || 'Ingrédient inconnu'}
                    </span>
                  </div>
                  {ingredient.ingredients?.category && (
                    <span className={styles.category}>
                      {ingredient.ingredients.category}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <h2>
              <span className={styles.sectionNumber}>
                {recipe.recipe_steps.length}{" "}
              </span>
              Étape{recipe.recipe_steps.length > 1 ? 's' : ''}
            </h2>
            
            <div className={styles.stepsList}>
              {recipe.recipe_steps
                .sort((a, b) => a.step_number - b.step_number)
                .map((step) => (
                  <div key={step.step_number} className={styles.step}>
                    <div className={styles.stepNumber}>{step.step_number}</div>
                    <div className={styles.stepContent}>
                      <p className={styles.stepDescription}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {recipe.description && (
            <div className={styles.section}>
              <h2>Notes</h2>
              <div className={styles.notes}>
                <p>{recipe.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition */}
      {canModify && (
        <RecipeEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          recipe={recipe}
          availableIngredients={availableIngredients}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Modal de confirmation de suppression */}
      {canModify && (
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Supprimer la recette"
          message={`Êtes-vous sûr de vouloir supprimer définitivement la recette "${recipe.title}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
        />
      )}
    </div>
  );
};

export default RecipeDetailPage;