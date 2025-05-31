// components/calendar/PlannedRecipeCard.tsx
import React from "react";
import { ChefHat, Clock } from "lucide-react";
import styles from "./PlannedRecipeCard.module.css";

type Recipe = {
  name: string;
  cookTime: number;
};

type PlannedRecipeCardProps = {
  recipe: Recipe;
  recipeIndex: number;
  day: Date;
  meal: string;
  removePlannedRecipe: (day: Date, meal: string, recipeIndex: number) => void;
};

const PlannedRecipeCard: React.FC<PlannedRecipeCardProps> = ({
  recipe,
  recipeIndex,
  day,
  meal,
  removePlannedRecipe,
}) => {
  return (
    <div className={styles.recipeCard}>
      <button
        onClick={() => removePlannedRecipe(day, meal, recipeIndex)}
        className={styles.recipeRemoveBtn}
      >
        ×
      </button>
      <div className={styles.recipeContent}>
        <ChefHat
          style={{
            height: "16px",
            width: "16px",
            color: "#2563eb",
            marginTop: "4px",
            flexShrink: 0,
          }}
        />
        <div className={styles.recipeDetails}>
          <h4 className={styles.recipeName}>{recipe.name}</h4>
          <div className={styles.recipeTime}>
            <Clock
              style={{ height: "12px", width: "12px", color: "#2563eb" }}
            />
            <span className={styles.timeText}>{recipe.cookTime}min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannedRecipeCard;
