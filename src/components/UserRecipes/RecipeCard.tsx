// components/RecipeCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../../types/recipe';
import styles from './UserRecipes.module.css';
import { Pencil, Trash2 } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onAddImage: (recipeId: string) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipeId: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onAddImage, 
  onEdit, 
  onDelete 
}) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.actions}`)) {
      return;
    }
    navigate(`/recipe/${recipe.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(recipe);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      onDelete(recipe.id);
    }
  };

  const handleAddImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddImage(recipe.id);
  };

  return (
    <div 
      className={`${styles.recipeCard} ${styles.clickable}`} 
      onClick={handleCardClick}
    >
      {recipe.image_url ? (
        <div className={styles.recipeImage}>
          <img src={recipe.image_url} alt={recipe.title} />
        </div>
      ) : (
        <div className={styles.noImage}>
          <button 
            className={styles.addImageButton}
            onClick={handleAddImage}
          >
            Ajouter une image
          </button>
        </div>
      )}
      
      <div className={styles.recipeContent}>
        <h3>{recipe.title}</h3>
        <p>{recipe.recipe_ingredients.length} ingrédient(s)</p>
        <p>{recipe.recipe_steps.length} étape(s)</p>
      </div>
      
      <div className={styles.actions}>
        <button
          className={styles.editButton}
          title="Modifier"
          onClick={handleEdit}
        >
          <Pencil size={16} />
        </button>
        <button
          className={styles.deleteButton}
          title="Supprimer"
          onClick={handleDelete}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
