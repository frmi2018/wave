import React from 'react';
import styles from '../../styles/RecipeDetail.module.css';

interface RecipeStep {
  step_number: number;
  description: string;
}

interface RecipeStepsListProps {
  steps: RecipeStep[];
}

const RecipeStepsList: React.FC<RecipeStepsListProps> = ({ steps }) => {
  return (
    <div className={styles.section}>
      <h2>
        <span className={styles.sectionNumber}>{steps.length} </span>
        Étape{steps.length > 1 ? 's' : ''}
      </h2>
      <div className={styles.stepsList}>
        {steps
          .sort((a, b) => a.step_number - b.step_number)
          .map((step) => (
            <div key={step.step_number} className={styles.step}>
              <div className={styles.stepNumber}>{step.step_number}</div>
              <div className={styles.stepContent}>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RecipeStepsList;
