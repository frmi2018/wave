import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import styles from './UserRecipes.module.css';

interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string;
  instructions: string;
  image_url: string;
  cooking_time: number;
  servings: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  recipe_ingredients: Ingredient[];
  recipe_steps: Step[];
}

interface Ingredient {
  id?: string;
  recipe_id?: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  ingredients?: {
    name: string;
    category: string;
  }; // <--- ici était le souci !
}

interface Step {
  id?: string;
  recipe_id?: string;
  step_number: number;
  description: string;
}

const UserRecipes: React.FC = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // États formulaire
  const [title, setTitle] = useState<string>('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { ingredient_id: '', quantity: 0, unit: '' },
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { step_number: 1, description: '' },
  ]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(false);

  // Nouvel état pour ingrédients disponibles
  const [availableIngredients, setAvailableIngredients] = useState<{ id: string; name: string; category: string }[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserRecipes();
      fetchAvailableIngredients();
    }
  }, [user]);

  const fetchUserRecipes = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id,
          user_id,
          title,
          description,
          instructions,
          image_url,
          cooking_time,
          servings,
          created_at,
          updated_at,
          is_public,
          recipe_ingredients (
            id,
            quantity,
            unit,
            ingredient_id,
            ingredients (
              name,
              category
            )
          ),
          recipe_steps (
            id,
            step_number,
            description
          )
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Nettoyage : on passe de ingredients: [{...}] à ingredients: {...}
    const cleanedData = (data ?? []).map((recipe) => ({
      ...recipe,
      recipe_ingredients: recipe.recipe_ingredients.map((ri) => ({
        ...ri,
        ingredients: ri.ingredients?.[0], // on extrait l’objet unique
      })),
    }));

    setRecipes(cleanedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des recettes :', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Nouvelle fonction pour récupérer ingrédients dispo
  const fetchAvailableIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('id, name, category')
        .order('name', { ascending: true });
      if (error) throw error;
      setAvailableIngredients(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des ingrédients :', error);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { ingredient_id: '', quantity: 0, unit: '' }]);
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleAddStep = () => {
    const nextNumber = steps.length + 1;
    setSteps([...steps, { step_number: nextNumber, description: '' }]);
  };

  const handleStepChange = (index: number, description: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], description };
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length === 1) return;
    let newSteps = steps.filter((_, i) => i !== index);
    newSteps = newSteps.map((step, i) => ({ ...step, step_number: i + 1 }));
    setSteps(newSteps);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `recipe-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image :', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Upload image
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImage(image) || '';
      }

      // Insert recette
      const now = new Date().toISOString();
      const { data: recipeInsert, error: recipeError } = await supabase
        .from('recipes')
        .insert([
          {
            title,
            description: '',
            image_url: imageUrl,
            cooking_time: 0,
            servings: 0,
            user_id: user.user.id,
            created_at: now,
            updated_at: now,
            is_public: isPublic,
          },
        ])
        .select()
        .single();

      if (recipeError || !recipeInsert) throw recipeError;
      const recipeId = recipeInsert.id;

      // Lier ingrédients existants uniquement
      for (const ingredient of ingredients) {
        if (!ingredient.ingredient_id) {
          throw new Error("Veuillez sélectionner un ingrédient.");
        }
        const { error: linkError } = await supabase
          .from('recipe_ingredients')
          .insert([
            {
              recipe_id: recipeId,
              ingredient_id: ingredient.ingredient_id,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            },
          ]);
        if (linkError) throw linkError;
      }

      // Insérer les étapes
      const { error: stepError } = await supabase
        .from('recipe_steps')
        .insert(
          steps.map((step) => ({
            recipe_id: recipeId,
            step_number: step.step_number,
            description: step.description,
          }))
        );

      if (stepError) throw stepError;

      resetForm();
      setIsModalOpen(false);
      fetchUserRecipes();

    } catch (error) {
      console.error('Erreur lors de l\'ajout de la recette :', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setIngredients([{ ingredient_id: '', quantity: 0, unit: '' }]);
    setSteps([{ step_number: 1, description: '' }]);
    setImage(null);
    setImagePreview(null);
    setIsPublic(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mes Recettes</h2>

      {isLoading ? (
        <p>Chargement des recettes...</p>
      ) : recipes.length > 0 ? (
        <div className={styles.recipeGrid}>
          {recipes.map((recipe) => (
            <div key={recipe.id} className={styles.recipeCard}>
              {recipe.image_url && (
                <div className={styles.recipeImage}>
                  <img src={recipe.image_url} alt={recipe.title} />
</div>
)}
<h3>{recipe.title}</h3>
<p>{recipe.recipe_ingredients.length} ingrédient(s)</p>
<p>{recipe.recipe_steps.length} étape(s)</p>
</div>
))}
</div>
) : (
<p>Vous n'avez pas encore de recettes.</p>
)}
  <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
    Ajouter une recette
  </button>

  {isModalOpen && (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Nouvelle Recette</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Titre de la recette"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <h3>Ingrédients</h3>
          {ingredients.map((ingredient, index) => (
            <div key={index} className={styles.ingredientRow}>
              <select
                value={ingredient.ingredient_id}
                onChange={(e) => handleIngredientChange(index, 'ingredient_id', e.target.value)}
                required
              >
                <option value="">-- Choisir un ingrédient --</option>
                {availableIngredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantité"
                value={ingredient.quantity}
                onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))}
                required
              />
              <input
                type="text"
                placeholder="Unité"
                value={ingredient.unit}
                onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                required
              />
              {ingredients.length > 1 && (
                <button type="button" onClick={() => handleRemoveIngredient(index)}>–</button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddIngredient}>+ Ingrédient</button>

          <h3>Étapes</h3>
          {steps.map((step, index) => (
            <div key={index} className={styles.stepRow}>
              <textarea
                placeholder={`Étape ${step.step_number}`}
                value={step.description}
                onChange={(e) => handleStepChange(index, e.target.value)}
                required
              />
              {steps.length > 1 && (
                <button type="button" onClick={() => handleRemoveStep(index)}>–</button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddStep}>+ Étape</button>

          <h3>Image</h3>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && <img src={imagePreview} alt="Aperçu" className={styles.imagePreview} />}

          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Rendre publique
          </label>

          <div className={styles.buttonGroup}>
            <button type="submit">Créer la recette</button>
            <button type="button" onClick={() => setIsModalOpen(false)}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>);
};

export default UserRecipes;
