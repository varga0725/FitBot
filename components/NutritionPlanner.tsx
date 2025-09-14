import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, DietaryProfile, CaloricNeeds, MealPlan } from '../types';
import { DietaryPreference } from '../types';
import { getCaloricNeeds, generateMealPlan } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface NutritionPlannerProps {
  userProfile: UserProfile;
  onPlanGenerated: (plan: MealPlan) => void;
}

const inputBaseClasses = "w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition duration-200 placeholder-gray-500";
const labelClasses = "block mb-2 text-sm font-medium text-gray-400";

const StatCard: React.FC<{ title: string; value: number; description: string; isTarget?: boolean }> = ({ title, value, description, isTarget = false }) => (
  <div className={`p-4 rounded-lg border ${isTarget ? 'bg-gradient-to-br from-[var(--color-primary-700)]/30 to-transparent border-[var(--color-primary-500)]/70' : 'bg-black/20 border-white/10'}`}>
    <p className="text-sm text-gray-400">{title}</p>
    <p className={`text-3xl font-bold ${isTarget ? 'text-[var(--color-primary-400)]' : 'text-gray-100'}`}>{value.toLocaleString('hu-HU')} <span className="text-lg">kcal</span></p>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </div>
);

const NutritionPlanner: React.FC<NutritionPlannerProps> = ({ userProfile, onPlanGenerated }) => {
  const [caloricNeeds, setCaloricNeeds] = useState<CaloricNeeds | null>(null);
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [preference, setPreference] = useState<DietaryPreference>(DietaryPreference.OMNIVORE);
  const [allergies, setAllergies] = useState('');

  const fetchNeeds = useCallback(async () => {
    setIsLoadingNeeds(true);
    setError(null);
    try {
      const needs = await getCaloricNeeds(userProfile);
      setCaloricNeeds(needs);
    } catch (err: any) {
      setError(err.message || 'Hiba a kalóriaszükséglet számítása közben.');
    } finally {
      setIsLoadingNeeds(false);
    }
  }, [userProfile]);

  useEffect(() => {
    fetchNeeds();
  }, [fetchNeeds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caloricNeeds) return;
    
    setIsGeneratingPlan(true);
    setError(null);
    try {
        const dietaryProfile: DietaryProfile = { preference, allergies };
        const plan = await generateMealPlan(userProfile, dietaryProfile, caloricNeeds.target);
        onPlanGenerated(plan);
    } catch (err: any) {
        setError(err.message || 'Hiba az étrend generálása közben.');
    } finally {
        setIsGeneratingPlan(false);
    }
  };
  
  if (isLoadingNeeds) {
    return <div className="h-full flex items-center justify-center"><LoadingSpinner text="Kalóriaszükséglet számítása..." /></div>;
  }
  
  if (isGeneratingPlan) {
    return <div className="h-full flex items-center justify-center"><LoadingSpinner text="Személyre szabott étrended készül..." /></div>;
  }
  
  return (
    <div className="h-full flex items-center justify-center p-4 custom-scrollbar overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto my-auto bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-secondary-500)] pb-1">
            Táplálkozási Tervező
          </h1>
          <p className="text-gray-400 mt-2">A céljaid eléréséhez szükséges kalóriák és a személyes preferenciáid.</p>
        </div>
        
        {error && <p className="text-red-500 text-center p-4 my-4 bg-red-500/10 rounded-lg">{error} <button onClick={fetchNeeds} className="font-bold underline ml-2">Újrapróbálkozás</button></p>}
        
        {caloricNeeds && (
             <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-200 mb-3">Napi kalóriaszükségleted</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard title="Alapanyagcsere (BMR)" value={caloricNeeds.bmr} description="Kalóriaégetés nyugalmi állapotban." />
                    <StatCard title="Súlyfenntartás" value={caloricNeeds.maintenance} description="Napi kalória a jelenlegi súlyodhoz." />
                    <StatCard title="Ajánlott Célbevitel" value={caloricNeeds.target} description={`A(z) '${userProfile.goal}' célod eléréséhez.`} isTarget />
                </div>
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="preference" className={labelClasses}>Milyen típusú étrendet követsz?</label>
            <select id="preference" value={preference} onChange={(e) => setPreference(e.target.value as DietaryPreference)} className={inputBaseClasses}>
              {Object.values(DietaryPreference).map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="allergies" className={labelClasses}>Van bármilyen ételallergia, vagy amit nem szeretnél enni?</label>
            <textarea
              id="allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className={`${inputBaseClasses} h-24`}
              placeholder="Pl. laktózérzékenység, mogyoró allergia, nem szeretem a gombát"
            />
          </div>

          <button
            type="submit"
            disabled={!caloricNeeds || isGeneratingPlan}
            className="w-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-primary-600)] hover:to-[var(--color-secondary-700)] text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-[var(--glow-color)] transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Étrend Létrehozása
          </button>
        </form>
      </div>
    </div>
  );
};

export default NutritionPlanner;
