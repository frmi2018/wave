// components/calendar/MealTypeCell.tsx
import React from "react";
import styles from "./MealTypeCell.module.css";

type MealTypeCellProps = {
  meal: string;
  mealIndex: number;
  meals: string[];
  addMeal: () => void;
  removeMeal: (meal: string) => void;
};

const MealTypeCell: React.FC<MealTypeCellProps> = ({
  meal,
  mealIndex,
  meals,
  addMeal,
  removeMeal,
}) => {
  return (
    <div className={styles.mealTypeCell}>
      <span>{meal}</span>
      <div className={styles.mealControls}>
        {meals.length > 1 && (
          <button
            onClick={() => removeMeal(meal)}
            className={`${styles.controlButton} ${styles.removeButton}`}
            title="Supprimer ce repas"
          >
            ×
          </button>
        )}
        {mealIndex === meals.length - 1 && (
          <button
            onClick={addMeal}
            className={`${styles.controlButton} ${styles.addButton}`}
            title="Ajouter un repas"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
};

export default MealTypeCell;
