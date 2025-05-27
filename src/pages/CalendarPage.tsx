import { useState } from 'react';
import { Plus, X, ChefHat, Clock } from 'lucide-react';
import styles from './CalendarPage.module.css';
import CalendarHeader from '../components/CalendarHeader';
import CalendarGridHeader from '../components/CalendarGridHeader';
import MealTypeCell from "../components/MealTypeCell";
import PlannedRecipeCard from "../components/PlannedRecipeCard";
import { useMeals } from '../hooks/useMeals';
import { useWeek } from '../hooks/useWeek';
import type { Recipe } from '../types/calendar'

// Composant principal de la page calendrier
const CalendarPage = () => {

  const {
    meals,
    addMeal,
    removeMeal,
    getPlannedMeals,
    addPlannedMeal,
    removePlannedRecipe,
    showRecipeModal,
    selectedDay,
    selectedMeal,
    openRecipeModal,
    setShowRecipeModal,
  } = useMeals();

  const {
    weekDays,
    dayNames,
    navigateWeek,
  } = useWeek();

  // Données d'exemple des recettes de l'utilisateur
  const [userRecipes] = useState<Recipe[]>([
    { id: 1, name: 'Pasta Carbonara', cookTime: 20},
    { id: 2, name: 'Salade César', cookTime: 15},
    { id: 3, name: 'Boeuf Bourguignon', cookTime: 180},
    { id: 4, name: 'Tarte aux Pommes', cookTime: 60},
    { id: 5, name: 'Saumon Grillé', cookTime: 25 },
    { id: 6, name: 'Ratatouille', cookTime: 45 },
    { id: 7, name: 'Coq au Vin', cookTime: 120 },
    { id: 8, name: 'Quiche Lorraine', cookTime: 50 }
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        {/* Header */} 
        <CalendarHeader weekDays={weekDays} navigateWeek={navigateWeek} />

        {/* Calendrier hebdomadaire */}
        <div className={styles.calendar}>
        <CalendarGridHeader weekDays={weekDays} dayNames={dayNames} />
          {meals.map((meal, mealIndex) => (
            <div key={meal} className={styles.mealRow}>
              <MealTypeCell
                meal={meal}
                mealIndex={mealIndex}
                meals={meals}
                addMeal={addMeal}
                removeMeal={removeMeal}
              />
              {weekDays.map((day, dayIndex) => {
                const plannedRecipes = getPlannedMeals(day, meal);
                return (
                  <div 
                    key={dayIndex} 
                    className={dayIndex === 6 ? styles.dayCellLast : styles.dayCell}
                  >
                    {plannedRecipes.map((recipe, recipeIndex) => (
                       <PlannedRecipeCard
                        key={recipeIndex}
                        recipe={recipe}
                        recipeIndex={recipeIndex}
                        day={day}
                        meal={meal}
                        removePlannedRecipe={removePlannedRecipe}
                       />                                 
                    ))}
                    
                    <button
                      onClick={() => openRecipeModal(day, meal)}
                      className={styles.addRecipeButton}
                      style={{
                        minHeight: plannedRecipes.length === 0 ? '80px' : '40px'
                      }}
                    >
                      <div className={styles.addRecipeContent}>
                        <Plus style={{ 
                          height: plannedRecipes.length === 0 ? '32px' : '20px', 
                          width: plannedRecipes.length === 0 ? '32px' : '20px', 
                          color: '#9ca3af'
                        }} />
                        <span className={styles.addRecipeText}>
                          {plannedRecipes.length === 0 ? 'Ajouter une recette' : 'Ajouter +'}
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Modal de sélection de recette */}
        {showRecipeModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <div className={styles.modalHeaderFlex}>
                  <div>
                    <h2 className={styles.modalTitle}>
                      Choisir une recette pour {selectedMeal?.toLowerCase()}
                    </h2>
                    <p className={styles.modalSubtitle}>
                      {selectedDay && selectedDay.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRecipeModal(false)}
                    className={styles.closeButton}
                  >
                    <X style={{ height: '24px', width: '24px' }} />
                  </button>
                </div>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.recipeGrid}>
                  {userRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => addPlannedMeal(recipe.id, userRecipes)}
                      className={styles.recipeButton}
                    >
                      <div className={styles.recipeButtonContent}>
                        <ChefHat style={{ height: '20px', width: '20px', color: '#9ca3af', marginTop: '4px', flexShrink: 0 }} />
                        <div className={styles.recipeButtonDetails}>
                          <h3 className={styles.recipeButtonName}>{recipe.name}</h3>
                          <div className={styles.recipeButtonMeta}>
                            <div className={styles.recipeButtonTime}>
                              <Clock style={{ height: '16px', width: '16px', color: '#9ca3af' }} />
                              <span className={styles.recipeButtonTimeText}>{recipe.cookTime}min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;