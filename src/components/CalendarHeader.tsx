// components/calendar/CalendarHeader.tsx
import React from "react";
import { Calendar } from "lucide-react"; // ou autre icône si tu utilises un autre paquet
import styles from "./CalendarHeader.module.css"; // à adapter selon où tu mets le CSS

type CalendarHeaderProps = {
  weekDays: Date[];
  navigateWeek: (direction: number) => void;
};

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ weekDays, navigateWeek }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerFlex}>
        {/* Titre */}
        <div className={styles.titleSection}>
          <Calendar style={{ height: '32px', width: '32px', color: '#2563eb' }} />
          <div>
            <h1 className={styles.title}>Calendrier des Repas</h1>
            <p className={styles.subtitle}>Planifiez vos recettes pour la semaine</p>
          </div>
        </div>

        {/* Navigation semaine */}
        <div className={styles.navigation}>
          <button
            onClick={() => navigateWeek(-1)}
            className={styles.navButton}
          >
            ← Semaine précédente
          </button>
          <span className={styles.weekInfo}>
            {weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} -{" "}
            {weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => navigateWeek(1)}
            className={styles.navButton}
          >
            Semaine suivante →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
