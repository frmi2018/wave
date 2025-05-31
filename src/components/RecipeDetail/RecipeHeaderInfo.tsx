import React from 'react';
import styles from '../../styles/RecipeDetail.module.css';
import { Clock, Users } from 'lucide-react';

interface RecipeHeaderInfoProps {
  title: string;
  imageUrl?: string;
  cookingTime?: number | null;
  servings?: number | null;
  isPublic: boolean;
}

const RecipeHeaderInfo: React.FC<RecipeHeaderInfoProps> = ({
  title,
  imageUrl,
  cookingTime,
  servings,
  isPublic,
}) => {
  return (
    <>
      {imageUrl && (
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={title} className={styles.recipeImage} loading="lazy" />
        </div>
      )}

      <div className={styles.recipeInfo}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.metadata}>
            {cookingTime && (
              <div className={styles.metaItem}>
                <Clock size={16} />
                <span>{cookingTime} min</span>
              </div>
            )}
            {servings && (
              <div className={styles.metaItem}>
                <Users size={16} />
                <span>{servings} pers.</span>
              </div>
            )}
            <div className={styles.visibility}>
              {isPublic ? (
                <span className={styles.publicBadge}>Public</span>
              ) : (
                <span className={styles.privateBadge}>Privé</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeHeaderInfo;
