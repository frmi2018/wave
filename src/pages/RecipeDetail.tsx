// pages/RecipeDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Recipe } from '../types/recipe';
import { RecipeService } from '../services/recipeService';
import styles from '../styles/RecipeDetail.module.css';
import { FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { renderIcon } from '../utils/iconUtils';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      
      try {
        const recipeData = await RecipeService.getRecipeById(id);
        setRecipe(recipeData);
      } catch (error) {
        console.error('Erreur lors de la récupération de la recette:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
        <div className={styles.container}>
          <div className={styles.loading}>Chargement...</div>
        </div>
    );
  }

  if (!recipe) {
    return (
        <div className={styles.container}>
          <div className={styles.error}>
            <h1>Recette non trouvée</h1>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              Retour
            </button>
          </div>
        </div>
    );
  }

  const handleEdit = () => {
    // Rediriger vers la page d'édition
    navigate(`/recipe/${recipe.id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await RecipeService.deleteRecipe(recipe.id);
      if (success) {
        navigate('/recipes'); // Rediriger vers la liste des recettes
      } else {
        alert('Erreur lors de la suppression de la recette');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de la recette');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
     <div className={styles.container}>
        <div className={styles.header}>
          <button 
            onClick={() => navigate(-1)} 
            className={styles.backButton}
          >{renderIcon(FiArrowLeft)}
             Retour
          </button>
          
          <div className={styles.actions}>
            <button 
              onClick={handleEdit}
              className={styles.editButton}
              title="Modifier la recette"
            >{renderIcon(FiEdit2)}
               Modifier
            </button>
            <button 
              onClick={handleDelete}
              className={styles.deleteButton}
              title="Supprimer la recette"
              disabled={isDeleting}
            >{renderIcon(FiTrash2)}
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>

        <div className={styles.recipeContent}>
          {recipe.image_url && (
            <div className={styles.imageContainer}>
              <img 
                src={recipe.image_url} 
                alt={recipe.title}
                className={styles.recipeImage}
              />
            </div>
          )}

          <div className={styles.recipeInfo}>
            <h1 className={styles.title}>{recipe.title}</h1>
            
            <div className={styles.section}>
              <h2>{recipe.recipe_ingredients.length} Ingrédient(s)</h2>
              <ul className={styles.ingredientsList}>
                {recipe.recipe_ingredients.map((ingredient, index) => (
                  <li key={index} className={styles.ingredient}>
                    <span className={styles.quantity}>
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                    <span className={styles.name}>
                      {ingredient.ingredients?.name || 'Ingrédient inconnu'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <h2>{recipe.recipe_steps.length} étape(s)</h2>
              <ol className={styles.stepsList}>
                {recipe.recipe_steps
                  .sort((a, b) => a.step_number - b.step_number)
                  .map((step) => (
                    <li key={step.step_number} className={styles.step}>
                      <div className={styles.stepNumber}>{step.step_number}</div>
                      <div className={styles.stepDescription}>
                        {step.description}
                      </div>
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
  );
};

export default RecipeDetailPage;