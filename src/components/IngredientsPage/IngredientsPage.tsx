// IngredientsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X
} from 'lucide-react';
import styles from './IngredientsPage.module.css';
import { supabase } from '../../config/supabaseClient';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  created_at?: string;
  is_public?: boolean;
  created_by?: string; // 👈 à ajouter
}



const IngredientsPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [originalCategory, setOriginalCategory] = useState<string>('');
const [formData, setFormData] = useState({
  name: '',
  category: '',
  is_public: false
});

  const categories = [
    'Legumes',
    'Fruits',
    'Viandes',
    'Poissons',
    'Produits laitiers',
    'Cereales',
    'Legumineuses',
    'Epices',
    'Huiles',
    'Autres'
  ];


const fetchIngredients = React.useCallback(async () => {
    if (!user || !userRole) return;
  try {
    setLoading(true);
    let query = supabase
      .from('ingredients')
      .select('*')
      .order('name');

if (userRole === 'user' && user?.id) {
  query = query.or(`is_public.eq.true,created_by.eq.${user.id}`);
}

    const { data, error } = await query;
    if (error) throw error;
    setIngredients(data || []);
  } catch (error) {
    console.error('Erreur lors du chargement des ingrédients:', error);
  } finally {
    setLoading(false);
  }
}, [userRole, user]);


useEffect(() => {
  if (user && userRole) {
    fetchIngredients();
  }
}, [userRole, user, fetchIngredients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category.trim()) return;

    try {
  const isPublicToSave = userRole === 'admin' ? formData.is_public : false;
if (editingIngredient) {
  // Autoriser uniquement si admin ou créateur
  if (userRole !== 'admin' && editingIngredient.created_by !== user?.id) {
    alert("Vous n'avez pas le droit de modifier cet ingrédient.");
    return;
  }

  const { error } = await supabase
    .from('ingredients')
    .update({
      name: formData.name.trim(),
      category: formData.category,
      is_public: isPublicToSave
    })
    .eq('id', editingIngredient.id);
  if (error) throw error;
} else {
  if (!user) {
  console.error("Utilisateur non authentifié.");
  return;
}
  const { error } = await supabase
    .from('ingredients')
    .insert([{
      name: formData.name.trim(),
      category: formData.category,
      created_by: user.id,
      is_public: isPublicToSave
    }]);
  if (error) throw error;
}



      fetchIngredients();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDeleteClick = (ingredient: Ingredient) => {
    setIngredientToDelete(ingredient);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
if (!ingredientToDelete) return;

if (userRole !== 'admin' && ingredientToDelete.created_by !== user?.id) {
  alert("Vous n'avez pas le droit de supprimer cet ingrédient.");
  return;
}


    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', ingredientToDelete.id);
      if (error) throw error;
      fetchIngredients();
      setShowDeleteModal(false);
      setIngredientToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setIngredientToDelete(null);
  };

  const openModal = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setOriginalCategory(ingredient.category);
setFormData({
  name: ingredient.name,
  category: ingredient.category,
  is_public: (ingredient as any).is_public ?? false // ← Ajouté ici
});
    } else {
      setEditingIngredient(null);
      setOriginalCategory('');
      setFormData({ name: '', category: '', is_public: false }); // ← Ajouté ici aussi
    }
    setShowModal(true);
  };

const closeModal = () => {
  setShowModal(false);
  setEditingIngredient(null);
  setOriginalCategory('');
  setFormData({ name: '', category: '', is_public: false }); // ← ✅ Corrigé
};

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = (ingredient.name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '' || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'Legumes': '#4ade80',
      'Fruits': '#f59e0b',
      'Viandes': '#ef4444',
      'Poissons': '#06b6d4',
      'Produits laitiers': '#f3f4f6',
      'Cereales': '#d97706',
      'Legumineuses': '#84cc16',
      'Epices': '#dc2626',
      'Huiles': '#fbbf24',
      'Autres': '#6b7280'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement des ingrédients...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestion des Ingrédients</h1>
        <button className={styles.addButton} onClick={() => openModal()}>
          <Plus className={styles.icon} />
          Ajouter un ingrédient
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <Search className={styles.icon} />
          <input
            type="text"
            placeholder="Rechercher un ingrédient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={styles.categoryFilter}
        >
          <option value="">Toutes les catégories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.ingredientGrid}>
        {filteredIngredients.map(ingredient => (
          <div key={ingredient.id} className={styles.ingredientCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.ingredientName}>{ingredient.name}</h3>
              {(userRole === "admin" || (user && ingredient.created_by === user.id)) && (
                <div className={styles.actions}>
                  <button
                    onClick={() => openModal(ingredient)}
                    className={styles.editButton}
                    title="Modifier"
                  >
                    <Edit2 className={styles.icon} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(ingredient)}
                    className={styles.deleteButton}
                    title="Supprimer"
                  >
                    <Trash2 className={styles.icon} />
                  </button>
                </div>
              )}
            </div>
            <div
              className={styles.category}
              style={{ backgroundColor: getCategoryColor(ingredient.category) }}
            >
              {ingredient.category}
            </div>
          </div>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <div className={styles.emptyState}>
          <p>Aucun ingrédient trouvé</p>
          <button className={styles.addButton} onClick={() => openModal()}>
            <Plus className={styles.icon} />
            Ajouter le premier ingrédient
          </button>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingIngredient ? 'Modifier l\'ingrédient' : 'Nouvel ingrédient'}</h2>
              <button onClick={closeModal} className={styles.closeButton}>
                <X className={styles.icon} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="name">Nom de l'ingrédient</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Tomate, Basilic..."
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="category">Catégorie</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {!editingIngredient && <option value="">Sélectionner une catégorie</option>}
                  {editingIngredient && formData.category === originalCategory && (
                    <option value={formData.category}>
                      {formData.category} (actuelle)
                    </option>
                  )}
                  {categories
                    .filter(category =>
                      !editingIngredient ||
                      category !== originalCategory ||
                      formData.category !== originalCategory
                    )
                    .map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>
{userRole === 'admin' && (
  <div className={styles.inputGroup}>
    <label htmlFor="is_public">Rendre public</label>
    <input
      type="checkbox"
      id="is_public"
      checked={formData.is_public}
      onChange={(e) =>
        setFormData({ ...formData, is_public: e.target.checked })
      }
    />
  </div>
)}


              <div className={styles.formActions}>
                <button type="button" onClick={closeModal} className={styles.cancelButton}>
                  Annuler
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingIngredient ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && ingredientToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Confirmer la suppression</h2>
              <button onClick={handleDeleteCancel} className={styles.closeButton}>
                <X className={styles.icon} />
              </button>
            </div>
            <div className={styles.deleteModalContent}>
              <p>
                Êtes-vous sûr de vouloir supprimer l'ingrédient{' '}
                <strong>"{ingredientToDelete.name}"</strong> ?
              </p>
              <p className={styles.deleteWarning}>Cette action est irréversible.</p>
              <div className={styles.formActions}>
                <button onClick={handleDeleteCancel} className={styles.cancelButton}>
                  Annuler
                </button>
                <button onClick={handleDeleteConfirm} className={styles.deleteConfirmButton}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientsPage;
