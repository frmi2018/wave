import styles from './Spinner.module.css';

export default function PlateSpinner() {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.loader}></div>
      <div className={styles.text}>chargement en cours...</div>
    </div>
  );
}
