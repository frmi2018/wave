// components/IngredientsPage/IngredientsPage.tsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import styles from './IngredientsPage.module.css';
import { supabase } from '../../services/supabaseClient';
import { renderIcon } from '../../utils/iconUtils';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  created_at?: string;
}

const IngredientsPage: React.FC = () => {
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
    category: ''
  });

  // Categories prédéfinies
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

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;
      setIngredients(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des ingrédients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category.trim()) return;

    try {
      if (editingIngredient) {
        // Mise à jour
        const { error } = await supabase
          .from('ingredients')
          .update({
            name: formData.name.trim(),
            category: formData.category
          })
          .eq('id', editingIngredient.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from('ingredients')
          .insert([{
            name: formData.name.trim(),
            category: formData.category
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
        category: ingredient.category
      });
    } else {
      setEditingIngredient(null);
      setOriginalCategory('');
      setFormData({ name: '', category: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingIngredient(null);
    setOriginalCategory('');
    setFormData({ name: '', category: '' });
  };

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
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
        <button 
          className={styles.addButton}
          onClick={() => openModal()}
        >
          {renderIcon(FiPlus)}
          Ajouter un ingrédient
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          {renderIcon(FiSearch)}
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
              <div className={styles.actions}>
                <button
                  onClick={() => openModal(ingredient)}
                  className={styles.editButton}
                  title="Modifier"
                >
                  {renderIcon(FiEdit2)}
                </button>
                <button
                  onClick={() => handleDeleteClick(ingredient)}
                  className={styles.deleteButton}
                  title="Supprimer"
                >
                  {renderIcon(FiTrash2)}
                </button>
              </div>
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
          <button 
            className={styles.addButton}
            onClick={() => openModal()}
          >
            {renderIcon(FiPlus)}
            Ajouter le premier ingrédient
          </button>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingIngredient ? 'Modifier l\'ingrédient' : 'Nouvel ingrédient'}</h2>
              <button
                onClick={closeModal}
                className={styles.closeButton}
              >
                {renderIcon(FiX)}
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
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={styles.cancelButton}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  {editingIngredient ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && ingredientToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Confirmer la suppression</h2>
              <button
                onClick={handleDeleteCancel}
                className={styles.closeButton}
              >
                {renderIcon(FiX)}
              </button>
            </div>
            <div className={styles.deleteModalContent}>
              <p>
                Êtes-vous sûr de vouloir supprimer l'ingrédient{' '}
                <strong>"{ingredientToDelete.name}"</strong> ?
              </p>
              <p className={styles.deleteWarning}>
                Cette action est irréversible.
              </p>
              <div className={styles.formActions}>
                <button
                  onClick={handleDeleteCancel}
                  className={styles.cancelButton}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className={styles.deleteConfirmButton}
                >
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