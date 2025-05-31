import React from 'react';
import styles from '../../styles/RecipeDetail.module.css';

interface Ingredient {
  quantity: number | string;
  unit?: string | null;
  ingredients?: {
    name: string;
    category?: string;
  } | null;
}

interface RecipeIngredientsListProps {
  ingredients: Ingredient[];
}

const RecipeIngredientsList: React.FC<RecipeIngredientsListProps> = ({ ingredients }) => {
  return (
    <div className={styles.section}>
      <h2>
        <span className={styles.sectionNumber}>{ingredients.length} </span>
        Ingrédient{ingredients.length > 1 ? 's' : ''}
      </h2>
      <ul className={styles.ingredientsList}>
        {ingredients.map((ingredient, index) => (
          <li key={index} className={styles.ingredient}>
            <div className={styles.ingredientContent}>
              <span className={styles.quantity}>
                {ingredient.quantity} {ingredient.unit || ''}
              </span>
              <span className={styles.name}>
                {ingredient.ingredients?.name || 'Ingrédient inconnu'}
              </span>
            </div>
            {ingredient.ingredients?.category && (
              <span className={styles.category}>{ingredient.ingredients.category}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipeIngredientsList;
