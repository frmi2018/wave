# Hooks personnalisés

## 📋 Sommaire

- [✅] [useMeals](#usemeals)
- [✅] [useRecipeDetails](#userecipedetails)
- [✅] [useRecipeEdit](#userecipeedit)
- [✅] [useRecipeForm](#userecipeform)
- [✅] [useRecipes](#userecipes)
- [✅] [useWeek](#useweek)
<!-- Ajoute ici tous tes hooks -->

#userecipedetails

## 🔍 useRecipeDetails

**Fichier** :  
 `hooks/useRecipeDetails.ts`

**Utilisé dans** :  
 `pages/RecipeDetailPage.tsx`

### Description

Ce hook permet de récupérer les détails d’une recette à partir de son id ainsi que la liste des ingrédients disponibles.

### Fonctionnalités principales :

- L’état de chargement (`loading`)

- L’état d’erreur (`error`)

- La permission de modification (`canModify`) pour l’utilisateur connecté (`userId`)

- Une fonction `refetch` pour recharger les données

**Signature** :

```ts
interface UseRecipeDetailsResult {
  recipe: Recipe | null;
  availableIngredients: AvailableIngredient[];
  loading: boolean;
  error: string | null;
  canModify: boolean;
  refetch: () => void;
}

function useRecipeDetails(
  id: string | undefined,
  userId: string | null,
): UseRecipeDetailsResult;
```

Utilisation typique :

```ts
const { recipe, availableIngredients, loading, error, canModify, refetch } =
  useRecipeDetails(recipeId, userId);
```

### Fonctionnement interne

- Utilise `useState` pour stocker la recette, les ingrédients, les états `loading`, `error`, et `canModify`.

- La fonction `fetchData` (avec `useCallback`) récupère les données via `RecipeManagementService` et `RecipeCreationService`.

- `fetchData` est appelée au montage et à chaque changement de `id` ou `userId` grâce à `useEffect`.

- Permet de rafraîchir les données via `refetch`.

#usemeals

## 🔍 useMeals

**Fichier** :  
 `hooks/useMeals.ts`

**Utilisé dans** :  
 `pages/CalendarPage.tsx`

### Description

Ce hook gère la liste des repas, la planification des recettes par jour et repas, ainsi que l’ouverture d’un modal pour sélectionner des recettes.

### Fonctionnalités principales :

- Gestion dynamique de la liste des repas (meals) avec ajout et suppression.

- Stockage des repas planifiés dans plannedMeals (par date et repas).

- Ouverture/fermeture du modal de sélection de recette (showRecipeModal).

- Ajout ou suppression de recettes planifiées pour un jour et un repas donné.

- Récupération des recettes planifiées pour un jour et un repas spécifiques.

Signature :

```ts
function useMeals(): {
  meals: string[];
  addMeal: () => void;
  removeMeal: (mealToRemove: string) => void;
  plannedMeals: PlannedMeals;
  getPlannedMeals: (day: Date, meal: string) => Recipe[];
  addPlannedMeal: (recipeId: number, userRecipes: Recipe[]) => void;
  removePlannedRecipe: (day: Date, meal: string, recipeIndex: number) => void;
  showRecipeModal: boolean;
  selectedDay: Date | null;
  selectedMeal: string;
  setShowRecipeModal: React.Dispatch<React.SetStateAction<boolean>>;
  openRecipeModal: (day: Date, meal: string) => void;
};
```

Utilisation typique :

```ts
const {
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
} = useMeals();
```

#userecipeedit

## 🔍 useRecipeEdit

**Fichier** : `src/hooks/useRecipeEdit.ts`  
**Utilisé dans** : `src\components\RecipeEditModal\RecipeEditModal.tsx`

### Description

Ce hook gère l’état et les interactions du formulaire d’édition d’une recette. Il permet de :

### Fonctionnalités principales :

- Stocker et modifier les données du formulaire (`formData`)

- Initialiser le formulaire à partir d’une recette existante

- Réinitialiser le formulaire à ses valeurs par défaut

- Ajouter, modifier ou supprimer des ingrédients

- Ajouter, modifier ou supprimer des étapes de préparation

Signature :

```ts
interface UseRecipeEditReturn {
  formData: RecipeFormData;
  setFormData: React.Dispatch<React.SetStateAction<RecipeFormData>>;
  handleAddIngredient: () => void;
  handleIngredientChange: (index: number, field: string, value: any) => void;
  handleRemoveIngredient: (index: number) => void;
  handleAddStep: () => void;
  handleStepChange: (index: number, description: string) => void;
  handleRemoveStep: (index: number) => void;
  initializeForm: (recipe: Recipe) => void;
  resetForm: () => void;
}

function useRecipeEdit(): UseRecipeEditReturn;
```

Utilisation typique :

```ts
const {
  formData,
  setFormData,
  handleAddIngredient,
  handleIngredientChange,
  handleRemoveIngredient,
  handleAddStep,
  handleStepChange,
  handleRemoveStep,
  initializeForm,
  resetForm,
} = useRecipeEdit();
```

### Fonctionnement interne

- `formData` contient le titre, la liste des ingrédients, les étapes, et le statut public.

- `initializeForm(recipe)` remplit le formulaire à partir d’une recette existante.

- `resetForm()` remet le formulaire à ses valeurs initiales vides.

- `handleAddIngredient` ajoute une ligne d’ingrédient vide.

- `handleIngredientChange` modifie un champ d’un ingrédient donné.

- `handleRemoveIngredient` supprime un ingrédient sauf si c’est le dernier.

- `handleAddStep` ajoute une nouvelle étape numérotée.

- `handleStepChange` modifie la description d’une étape.

- `handleRemoveStep` supprime une étape et renumérote les suivantes.

#userecipeform

## 🔍 useRecipeForm

**Fichier** :  
 `src/hooks/useRecipeForm.ts`

**Utilisé dans** :  
 `src\components\UserRecipes\RecipeFormModal.tsx` `src\components\UserRecipes\UserRecipes.tsx`

### Description

Hook pour gérer l’état et la manipulation du formulaire de recette, notamment la gestion des ingrédients et des étapes. Permet de :

### Fonctionnalités principales :

- Stocker les données du formulaire (formData)

- Réinitialiser le formulaire

- Ajouter, modifier et supprimer des ingrédients

- Ajouter, modifier et supprimer des étapes, avec renumérotation automatique des étapes

Signature :

```ts
interface UseRecipeFormReturn {
  formData: RecipeFormData;
  setFormData: (data: RecipeFormData) => void;
  resetForm: () => void;

  // Gestion des ingrédients
  handleAddIngredient: () => void;
  handleIngredientChange: (
    index: number,
    field: keyof Ingredient,
    value: string | number,
  ) => void;
  handleRemoveIngredient: (index: number) => void;

  // Gestion des étapes
  handleAddStep: () => void;
  handleStepChange: (index: number, description: string) => void;
  handleRemoveStep: (index: number) => void;
}

function useRecipeForm(): UseRecipeFormReturn;
```

Utilisation typique :

```ts
const {
  formData,
  setFormData,
  resetForm,
  handleAddIngredient,
  handleIngredientChange,
  handleRemoveIngredient,
  handleAddStep,
  handleStepChange,
  handleRemoveStep,
} = useRecipeForm();
```

### Fonctionnement interne

- `resetForm()` : réinitialise le formulaire avec les valeurs initiales.

- `handleAddIngredient()` : ajoute un nouvel ingrédient vide à la liste.

- `handleIngredientChange(index, field, value)` : modifie le champ spécifié d’un ingrédient à l’index donné.

- `handleRemoveIngredient(index)` : supprime un ingrédient sauf si c’est le dernier.

- `handleAddStep()` : ajoute une nouvelle étape avec numéro automatique.

- `handleStepChange(index, description)` : modifie la description d’une étape.

- `handleRemoveStep(index)` : supprime une étape et renumérote les étapes restantes.

#userecipes

## 🔍 useRecipes

**Fichier** :  
 `src/hooks/useRecipes.ts`

**Utilisé dans** :  
 `src\components\UserRecipes\UserRecipes.tsx`

### Description

Gérer la récupération et la création des recettes d’un utilisateur, ainsi que la liste des ingrédients disponibles.

### Fonctionnalités principales :

- Récupérer les recettes de l’utilisateur avec fetchUserRecipes.

- Récupérer les ingrédients disponibles pour les recettes.

- Valider et créer une recette avec createRecipe.

- Gestion des états isLoading, isSubmitting et des erreurs.

### Retour (interface UseRecipesReturn)

| Propriété / méthode    | Type                                          | Description                                        |
| ---------------------- | --------------------------------------------- | -------------------------------------------------- | ----------------------------------- |
| recipes                | Recipe[]                                      | Liste des recettes récupérées pour l’utilisateur   |
| availableIngredients   | AvailableIngredient[]                         | Liste des ingrédients disponibles                  |
| isLoading              | boolean                                       | Indique si les données sont en cours de chargement |
| isSubmitting           | boolean                                       | Indique si une recette est en cours de création    |
| errorMessage           | string                                        | null                                               | Message d’erreur en cas de problème |
| fetchUserRecipes()     | () => Promise<void>                           | Fonction pour forcer la récupération des recettes  |
| createRecipe(formData) | (formData: RecipeFormData) => Promise<string> | Crée une recette, retourne son ID                  |
| clearError()           | () => void                                    | Vide le message d’erreur                           |

### Signature :

```ts
interface UseRecipesReturn {
  recipes: Recipe[];
  availableIngredients: AvailableIngredient[];
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  fetchUserRecipes: () => Promise<void>;
  createRecipe: (formData: RecipeFormData) => Promise<string>;
  clearError: () => void;
}

function useRecipes(userId: string | null): UseRecipesReturn;
```

### Utilisation typique :

```ts
const {
  recipes,
  availableIngredients,
  isLoading,
  isSubmitting,
  errorMessage,
  fetchUserRecipes,
  createRecipe,
  clearError,
} = useRecipes(userId);

useEffect(() => {
  fetchUserRecipes();
}, []);
```

### Fonctionnement interne

- La validation des données est réalisée via `RecipeValidator.validateForm`.

- La création et récupération des recettes utilisent les services `RecipeCreationService` et `RecipeManagementService`.

- Le hook gère les erreurs en mettant à jour `errorMessage`.

- Lors de la création d’une recette réussie, la liste des recettes est automatiquement rafraîchie.

#useweek

## 🔍 useWeek

**Fichier** :  
 `src/hooks/useWeek.ts`

**Utilisé dans** :  
 `src\pages\CalendarPage.tsx`

### Description

Gérer la semaine en cours, récupérer les jours de la semaine et naviguer entre les semaines.

### Fonctionnalités principales :

- Obtenir les jours de la semaine en cours (weekDays).

- Naviguer vers la semaine précédente ou suivante avec navigateWeek.

- Fournir les noms des jours en français.

### Retour (interface UseWeekReturn)

| Propriété    | méthode Type                | Description                                                                                                   |
| ------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| currentWeek  | Date                        | Date représentant le jour courant dans la semaine affichée                                                    |
| weekDays     | Date[]                      | Tableau des 7 dates correspondant à la semaine courante                                                       |
| dayNames     | string[]                    | Noms des jours de la semaine en français, du lundi au dimanche                                                |
| navigateWeek | (direction: number) => void | Fonction pour changer la semaine affichée. direction est +1 pour semaine suivante, -1 pour semaine précédente |

### Signature :

```ts
interface UseWeekReturn {
  currentWeek: Date;
  weekDays: Date[];
  dayNames: string[];
  navigateWeek: (direction: number) => void;
}

function useWeek(): UseWeekReturn;
```

### Utilisation typique :

```ts
const { currentWeek, weekDays, dayNames, navigateWeek } = useWeek();

// Exemple : naviguer à la semaine suivante
navigateWeek(1);
```

### Fonctionnement interne

- Calcule le début de la semaine (lundi) à partir de la date `currentWeek`.

- Génère un tableau des 7 jours consécutifs de la semaine.

- Permet de changer la semaine en ajoutant ou soustrayant 7 jours à la date courante.

- Fournit les noms des jours en français dans l’ordre du lundi au dimanche.
