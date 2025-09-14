import React, { useState } from 'react';
import type { MealPlan, DailyMealPlan, Meal } from '../types';

interface MealCardProps {
  title: string;
  meal: Meal;
  icon: JSX.Element;
}

const MealCard: React.FC<MealCardProps> = ({ title, meal, icon }) => {
  return (
    <div className="bg-black/20 p-4 rounded-lg border border-white/10 flex items-start gap-4">
      <div className="flex-shrink-0 text-[var(--color-primary-400)] mt-1">{icon}</div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="text-lg font-bold text-gray-200">{title}</h4>
                <p className="font-semibold text-[var(--color-primary-400)]">{meal.name}</p>
            </div>
            <p className="text-sm font-semibold text-gray-300 bg-white/5 px-2 py-1 rounded-md">{`~${meal.calories} kcal`}</p>
        </div>
        <p className="mt-2 text-sm text-gray-300 leading-relaxed">{meal.description}</p>
      </div>
    </div>
  );
};

const Icons = {
    Breakfast: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Lunch: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Dinner: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
    Snacks: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l1.09 2.18L15 6l-2.18 1.09L11 9.27l-1.09-2.18L8.73 6l2.18-1.09L12 3zM3 21l1.09-2.18L6 18l-2.18-1.09L2.73 15l-1.09 2.18L1 18l2.18 1.09L4.27 21z" /></svg>,
};


const DailyMealPlanCard: React.FC<{ dailyPlan: DailyMealPlan }> = ({ dailyPlan }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-5 flex justify-between items-center hover:bg-white/5 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <div>
          <h3 className="text-xl font-bold text-gray-100">{dailyPlan.day}</h3>
           <p className="text-sm font-semibold text-[var(--color-primary-500)]">{`Összesen: ~${dailyPlan.dailyTotalCalories} kcal`}</p>
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
            <MealCard title="Reggeli" meal={dailyPlan.breakfast} icon={Icons.Breakfast} />
            <MealCard title="Ebéd" meal={dailyPlan.lunch} icon={Icons.Lunch} />
            <MealCard title="Vacsora" meal={dailyPlan.dinner} icon={Icons.Dinner} />
            <MealCard title="Nassolnivalók" meal={dailyPlan.snacks} icon={Icons.Snacks} />
          </div>
        </div>
      )}
    </div>
  );
};

interface MealPlanProps {
    plan: MealPlan;
}

const MealPlanComponent: React.FC<MealPlanProps> = ({ plan }) => {
  return (
    <div className="p-4 md:p-6 space-y-4 h-full overflow-y-auto custom-scrollbar">
       <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 mb-6">Heti Étkezési Terved</h2>
       {plan.map((dailyPlan, index) => (
         <DailyMealPlanCard key={index} dailyPlan={dailyPlan} />
       ))}
    </div>
  );
};

export default MealPlanComponent;
