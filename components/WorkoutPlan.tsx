import React, { useState } from 'react';
import type { WorkoutPlan, DailyWorkout, WorkoutLogEntry, FitnessLevel } from '../types';
import ExerciseCard from './ExerciseCard';
import Timer from './Timer';

interface WorkoutPlanProps {
  plan: WorkoutPlan;
  onLogWorkout: (workout: DailyWorkout) => void;
  logs: WorkoutLogEntry[];
  onGetWorkoutTips: (workout: DailyWorkout) => void;
  fitnessLevel: FitnessLevel;
}

interface DailyWorkoutCardProps {
  workout: DailyWorkout;
  onLogWorkout: (workout: DailyWorkout) => void;
  logs: WorkoutLogEntry[];
  onGetWorkoutTips: (workout: DailyWorkout) => void;
  fitnessLevel: FitnessLevel;
}

const DailyWorkoutCard: React.FC<DailyWorkoutCardProps> = ({ workout, onLogWorkout, logs, onGetWorkoutTips, fitnessLevel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isLoggedToday = logs.some(log =>
      log.workoutDay === workout.day && log.date.startsWith(today)
  );

  return (
    <>
    <div className="bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-5 flex justify-between items-center hover:bg-white/5 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <div>
          <p className="text-sm font-semibold text-[var(--color-primary-500)]">{workout.day}</p>
          <h3 className="text-xl font-bold text-gray-100">{workout.title}</h3>
          <p className="text-sm text-gray-400">{workout.description}</p>
        </div>
        <svg
          className={`w-6 h-6 text-gray-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="p-5 bg-black/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workout.exercises.map((ex, index) => (
              <ExerciseCard key={index} exercise={ex} fitnessLevel={fitnessLevel} />
            ))}
          </div>
           <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onLogWorkout(workout)}
                disabled={isLoggedToday}
                className="w-full sm:w-auto bg-green-600/80 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-green-500/30 transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out"
              >
                {isLoggedToday ? (
                  <>
                    Mai napra naplózva <span className="inline-block animate-pop-in">✓</span>
                  </>
                ) : 'Edzés befejezve'}
              </button>
              <button
                  onClick={() => setIsTimerOpen(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-600)] hover:shadow-lg hover:shadow-[var(--glow-color)] text-white font-bold py-2 px-6 rounded-lg transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:rotate-[20deg]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Időzítő</span>
              </button>
              <button
                onClick={() => onGetWorkoutTips(workout)}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-[var(--color-primary-400)] font-bold py-2 px-6 rounded-lg transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 group"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Tippek</span>
              </button>
            </div>
        </div>
      )}
    </div>
    {isTimerOpen && <Timer isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />}
    </>
  );
};

const WorkoutPlan: React.FC<WorkoutPlanProps> = ({ plan, onLogWorkout, logs, onGetWorkoutTips, fitnessLevel }) => {
  return (
    <div className="p-4 md:p-6 space-y-4 h-full overflow-y-auto custom-scrollbar">
       <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 mb-6">Heti Edzésterved</h2>
       {plan.map((dailyWorkout, index) => (
         <DailyWorkoutCard key={index} workout={dailyWorkout} onLogWorkout={onLogWorkout} logs={logs} onGetWorkoutTips={onGetWorkoutTips} fitnessLevel={fitnessLevel} />
       ))}
    </div>
  );
};

export default WorkoutPlan;