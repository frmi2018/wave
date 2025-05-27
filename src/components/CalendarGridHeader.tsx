// components/calendar/CalendarGridHeader.tsx
import React from "react";
import styles from "./CalendarGridHeader.module.css";

type CalendarGridHeaderProps = {
  weekDays: Date[];
  dayNames: string[];
};

const CalendarGridHeader: React.FC<CalendarGridHeaderProps> = ({ weekDays, dayNames }) => {
  return (
      <div className={styles.calendarHeader}>
        <div className={styles.headerCellFirst}>Repas</div>
        {weekDays.map((day, index) => (
          <div key={index} className={styles.headerCell}>
            <div className={styles.dayHeader}>{dayNames[index]}</div>
            <div className={styles.dayDate}>
              {day.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
            </div>
          </div>
        ))}
      </div>
  );
};

export default CalendarGridHeader;
