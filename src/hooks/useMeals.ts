import { useState } from 'react';
import type { Recipe, PlannedMeals, DayMeals } from '../types/calendar'

export const useMeals = () => {
  const [meals, setMeals] = useState(['Repas 1']);
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeals>({});
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string>('');

  const addMeal = () => {
    const newMealNumber = meals.length + 1;
    setMeals([...meals, `Repas ${newMealNumber}`]);
  };

const removeMeal = (mealToRemove: string) => {
  if (meals.length > 1) {
    // Supprimer le repas sélectionné
    const updatedMeals = meals.filter(meal => meal !== mealToRemove);

    // Renuméroter les repas
    const renumberedMeals = updatedMeals.map((_, index) => `Repas ${index + 1}`);

    // Mettre à jour les repas planifiés avec les nouveaux noms
    setPlannedMeals(prev => {
      const newPlanned: PlannedMeals = {};

      for (const [dateKey, dayMeals] of Object.entries(prev)) {
        const updatedDayMeals: DayMeals = {};

        updatedMeals.forEach((oldMeal, index) => {
          if (dayMeals[oldMeal]) {
            updatedDayMeals[`Repas ${index + 1}`] = dayMeals[oldMeal];
          }
        });

        if (Object.keys(updatedDayMeals).length > 0) {
          newPlanned[dateKey] = updatedDayMeals;
        }
      }

      return newPlanned;
    });

    setMeals(renumberedMeals);
  }
};


  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const openRecipeModal = (day: Date, meal: string) => {
    setSelectedDay(day);
    setSelectedMeal(meal);
    setShowRecipeModal(true);
  };

  const addPlannedMeal = (recipeId: number, userRecipes: Recipe[]) => {
    if (!selectedDay) return;
    const dateKey = formatDateKey(selectedDay);
    const recipe = userRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    setPlannedMeals(prev => {
      const existingDayMeals: DayMeals = prev[dateKey] || {};
      const existingMealRecipes = existingDayMeals[selectedMeal] || [];

      return {
        ...prev,
        [dateKey]: {
          ...existingDayMeals,
          [selectedMeal]: [...existingMealRecipes, recipe],
        },
      };
    });

    setShowRecipeModal(false);
    setSelectedDay(null);
    setSelectedMeal('');
  };

  const removePlannedRecipe = (day: Date, meal: string, recipeIndex: number) => {
    const dateKey = formatDateKey(day);
    setPlannedMeals(prev => {
      const newPlanned = { ...prev };
      if (newPlanned[dateKey]?.[meal]) {
        newPlanned[dateKey][meal] = newPlanned[dateKey][meal].filter((_, index) => index !== recipeIndex);
        if (newPlanned[dateKey][meal].length === 0) {
          delete newPlanned[dateKey][meal];
          if (Object.keys(newPlanned[dateKey]).length === 0) {
            delete newPlanned[dateKey];
          }
        }
      }
      return newPlanned;
    });
  };

  const getPlannedMeals = (day: Date, meal: string): Recipe[] => {
    const dateKey = formatDateKey(day);
    return plannedMeals[dateKey]?.[meal] || [];
  };

  return {
    meals,
    addMeal,
    removeMeal,
    plannedMeals,
    getPlannedMeals,
    addPlannedMeal,
    removePlannedRecipe,
    showRecipeModal,
    selectedDay,
    selectedMeal,
    setShowRecipeModal,
    openRecipeModal,
  };
};
