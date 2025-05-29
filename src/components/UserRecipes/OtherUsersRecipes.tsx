// OtherUsersRecipes.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RecipeCardSimply from './RecipeCardSimply';
import styles from './OtherUsersRecipes.module.css';
import { fetchUserProfiles } from '../../services/profileService';
import { RecipeManagementService } from '../../services/recipeManagementService'; // corrige le chemin

const OtherUsersRecipes: React.FC = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<{ id: string; username: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedProfile = profiles.find(p => p.id === selectedUserId);

  // Charger les profils à l'initialisation
  useEffect(() => {
    async function loadProfiles() {
      try {
        const profilesList = await fetchUserProfiles();
        const others = profilesList.filter(p => p.id !== user?.id); // filtrer l'utilisateur connecté
        setProfiles(others);
      } catch (error) {
        console.error("Erreur chargement profils :", error);
      }
    }

    loadProfiles();
  }, [user?.id]);

  // Charger les recettes du user sélectionné
  useEffect(() => {
    if (!selectedUserId) {
      setRecipes([]);
      return;
    }

    const fetchRecipes = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await RecipeManagementService.getOtherUserRecipes(selectedUserId);
        setRecipes(data);
      } catch (error) {
        setErrorMessage('Erreur lors du chargement des recettes.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [selectedUserId]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {selectedUserId
          ? `Recettes de ${selectedProfile?.username || 'utilisateur inconnu'}`
          : 'Sélectionnez un utilisateur'}
      </h2>

      <label htmlFor="userFilter">Voir les recettes de :</label>
      <select
        id="userFilter"
        value={selectedUserId || ''}
        onChange={(e) => setSelectedUserId(e.target.value || null)}
        className={styles.userSelect}
      >
        <option value="">-- Choisir un utilisateur --</option>
        {profiles.map(profile => (
          <option key={profile.id} value={profile.id}>
            {profile.username}
          </option>
        ))}
      </select>

      {errorMessage && (
        <div className={styles.errorMessage}>
          {errorMessage}
          <button onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingContainer}>
          <p>Chargement des recettes...</p>
        </div>
      ) : recipes.length > 0 ? (
        <div className={styles.recipeGrid}>
          {recipes.map(recipe => (
            <RecipeCardSimply key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : selectedUserId ? (
        <p>Aucune recette trouvée pour cet utilisateur.</p>
      ) : (
        <p>Sélectionnez un utilisateur pour voir ses recettes.</p>
      )}
    </div>
  );
};

export default OtherUsersRecipes;
