import React from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from '../styles/RecipeDetail.module.css';

type ErrorBlockProps = {
  title: string;
  message: string;
  onBack: () => void;
};

const ErrorBlock: React.FC<ErrorBlockProps> = ({ title, message, onBack }) => {
  return (
    <div className={styles.container}>
      <div className={styles.error}>
        <h1>{title}</h1>
        <p>{message}</p>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>
    </div>
  );
};

export default ErrorBlock;
