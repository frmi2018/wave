import React from 'react';
import styles from '../../styles/RecipeDetail.module.css';

// Icons lucide-react
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

interface RecipeDetailHeaderProps {
  canModify: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDeleteConfirm: () => void;
}

const RecipeDetailHeader: React.FC<RecipeDetailHeaderProps> = ({
  canModify,
  isDeleting,
  isSubmitting,
  onBack,
  onEdit,
  onDeleteConfirm,
}) => {
  return (
    <div className={styles.header}>
      <button onClick={onBack} className={styles.backButton} disabled={isDeleting}>
        <ArrowLeft size={16} />
        Retour
      </button>

      {canModify && (
        <div className={styles.actions}>
          <button
            onClick={onEdit}
            className={styles.editButton}
            title="Modifier la recette"
            disabled={isDeleting || isSubmitting}
          >
            <Pencil size={16} />
            Modifier
          </button>
          <button
            onClick={onDeleteConfirm}
            className={styles.deleteButton}
            title="Supprimer la recette"
            disabled={isDeleting || isSubmitting}
          >
            <Trash2 size={16} />
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeDetailHeader;
