// components/RecipeCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../../types/recipe';
import styles from './UserRecipes.module.css';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
}) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.actions}`)) {
      return;
    }
    navigate(`/recipe/${recipe.id}`);
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
          >
            Ajouter une image
          </button>
        </div>
      )}
      
      <div className={styles.recipeContent}>
        <h3>{recipe.title}</h3>
        <p>{recipe.recipe_ingredients.length} ingrédient(s)</p>
        <p>{recipe.recipe_steps.length} étape(s)</p>
        <p>{recipe.is_public ? "Public" : "Privé"}</p>
      </div>
    </div>
  );
};

export default RecipeCard;
