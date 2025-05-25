// UserRecipes.tsx (Version refactorisée)
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRecipes } from '../../hooks/useRecipes';
import { useRecipeForm } from '../../hooks/useRecipeForm';
import RecipeCard from './RecipeCard';
import RecipeFormModal from './RecipeFormModal';
import RecipeImageUploader from '../RecipeImageUploader/RecipeImageUploader';
import styles from './UserRecipes.module.css';
import type { Recipe } from '../../types/recipe';
import {RecipeManagementService} from '../../services/recipeManagementService'

const UserRecipes: React.FC = () => {
  const { user } = useAuth();
  const formHook = useRecipeForm();
  
  const {
    recipes,
    availableIngredients,
    isLoading,
    isSubmitting,
    errorMessage,
    createRecipe,
    fetchUserRecipes,
    clearError
  } = useRecipes(user?.id || null);

  // États pour les modales
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newlyCreatedRecipe, setNewlyCreatedRecipe] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Handlers
  const handleCreateRecipe = async () => {
    try {
      const recipeId = await createRecipe(formHook.formData);
      setNewlyCreatedRecipe(recipeId);
      setIsModalOpen(false);
      setIsUploadModalOpen(true);
      formHook.resetForm();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };

const handleEditRecipe = (recipe: Recipe) => {
  // TODO : Modifier une recette
};

const handleDeleteRecipe = (recipeId: string) => {
     RecipeManagementService.deleteRecipe(recipeId);
};


  const handleOpenModal = () => {
    formHook.resetForm();
    clearError();
    setIsModalOpen(true);
  };

  const handleAddImage = (recipeId: string) => {
    setNewlyCreatedRecipe(recipeId);
    setIsUploadModalOpen(true);
  };

  const handleImageSuccess = () => {
    setIsUploadModalOpen(false);
    setNewlyCreatedRecipe(null);
    fetchUserRecipes();
  };

  const handleImageError = (error: Error) => {
    console.error("Erreur lors de l'upload de l'image:", error.message);
  };

  const handleSkipImage = () => {
    setIsUploadModalOpen(false);
    setNewlyCreatedRecipe(null);
    fetchUserRecipes();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mes Recettes</h2>

      {errorMessage && (
        <div className={styles.errorMessage}>
          {errorMessage}
          <button onClick={clearError}>×</button>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <p>Chargement des recettes...</p>
        </div>
      ) : recipes.length > 0 ? (
        <div className={styles.recipeGrid}>
          {recipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onAddImage={handleAddImage}
              onEdit={handleEditRecipe}
              onDelete={handleDeleteRecipe}
            />
          ))}
        </div>
      ) : (
        <p>Vous n'avez pas encore de recettes.</p>
      )}
      
      <button 
        className={styles.addButton} 
        onClick={handleOpenModal}
      >
        Ajouter une recette
      </button>

      {/* Modal de création de recette */}
      <RecipeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRecipe}
        formHook={formHook}
        availableIngredients={availableIngredients}
        isSubmitting={isSubmitting}
      />

      {/* Modal pour l'upload d'image */}
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
              onClick={handleSkipImage}
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