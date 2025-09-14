

export enum FitnessLevel {
  BEGINNER = 'Kezdő',
  INTERMEDIATE = 'Középhaladó',
  ADVANCED = 'Haladó',
}

export enum Goal {
  WEIGHT_LOSS = 'Fogyás',
  MUSCLE_GAIN = 'Izomépítés',
  ENDURANCE = 'Állóképesség javítása',
  GENERAL_FITNESS = 'Általános fittség',
}

export enum Equipment {
  NONE = 'Saját testsúly',
  DUMBBELLS = 'Kézisúlyzók',
  FULL_GYM = 'Teljes edzőterem',
}

export enum Gender {
    MALE = 'Férfi',
    FEMALE = 'Nő',
}

export enum ActivityLevel {
    SEDENTARY = 'Ülőmunka (kevés vagy semmi testmozgás)',
    LIGHTLY_ACTIVE = 'Enyhén aktív (könnyű testmozgás/sport heti 1-3 nap)',
    MODERATELY_ACTIVE = 'Mérsékelten aktív (mérsékelt testmozgás/sport heti 3-5 nap)',
    VERY_ACTIVE = 'Nagyon aktív (nehéz testmozgás/sport heti 6-7 nap)',
    EXTRA_ACTIVE = 'Extra aktív (nagyon nehéz testmozgás/sport és fizikai munka)',
}

export interface UserProfile {
  name: string;
  level: FitnessLevel;
  goal: Goal;
  equipment: Equipment;
  // New fields for nutrition
  age: number;
  gender: Gender;
  height: number; // in cm
  currentWeight: number; // in kg
  targetWeight: number; // in kg
  activityLevel: ActivityLevel;
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  instructions: string;
}

export interface DailyWorkout {
  day: string;
  title: string;
  description: string;
  exercises: Exercise[];
}

export type WorkoutPlan = DailyWorkout[];

export interface QuickWorkout {
  title: string;
  description: string;
  exercises: Exercise[];
}

export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  sender: MessageSender;
  text: string;
}

export interface WorkoutLogEntry {
  date: string; // ISO string for the date of completion
  workoutDay: string; // e.g., 'Hétfő'
  workoutTitle: string; // e.g., 'Mell & Tricepsz'
}

export interface WaterLogEntry {
  date: string; // 'YYYY-MM-DD'
  amount: number; // in ml
}

export interface WorkoutGoal {
  type: 'weekly' | 'monthly';
  target: number;
  startDate: string; // ISO string
}

// --- Meal Plan Types ---

export enum DietaryPreference {
  OMNIVORE = 'Mindenevő',
  VEGETARIAN = 'Vegetáriánus',
  VEGAN = 'Vegán',
}

export interface DietaryProfile {
  preference: DietaryPreference;
  allergies: string; // Comma-separated list or free text
}

export interface Meal {
  name: string;
  description: string; // Can include ingredients and simple preparation steps
  calories: number;
}

export interface DailyMealPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal;
  dailyTotalCalories: number;
}

export type MealPlan = DailyMealPlan[];

export interface CaloricNeeds {
    bmr: number;
    maintenance: number;
    target: number;
}

// --- Gamification Types ---

export enum AchievementId {
  FIRST_WORKOUT = 'FIRST_WORKOUT',
  STREAK_7_DAYS = 'STREAK_7_DAYS',
  WORKOUT_25 = 'WORKOUT_25',
  WORKOUT_100 = 'WORKOUT_100',
  GOAL_MASTER = 'GOAL_MASTER',
}

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string; // Emoji
}

export interface ProgressData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null; // ISO string 'YYYY-MM-DD'
  unlockedAchievements: AchievementId[];
  totalWorkouts: number;
}