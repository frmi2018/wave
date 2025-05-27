// types/calendar.ts

export interface Recipe {
  id: number;
  name: string;
  cookTime: number;
};

export interface DayMeals {
  [meal: string]: Recipe[];
};

export interface PlannedMeals {
  [dateKey: string]: {
    [meal: string]: Recipe[];
  };
};;