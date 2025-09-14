import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { FitnessLevel, Goal, Equipment, Gender, ActivityLevel } from '../types';

interface WorkoutSetupProps {
  onSetupComplete: (profile: UserProfile) => void;
  isLoading: boolean;
}

const inputBaseClasses = "w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition duration-200 placeholder-gray-500";
const labelClasses = "block mb-2 text-sm font-medium text-gray-400";

const WorkoutSetup: React.FC<WorkoutSetupProps> = ({ onSetupComplete, isLoading }) => {
  // Personal Info
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [height, setHeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');

  // Fitness Info
  const [level, setLevel] = useState<FitnessLevel>(FitnessLevel.BEGINNER);
  const [goal, setGoal] = useState<Goal>(Goal.WEIGHT_LOSS);
  const [equipment, setEquipment] = useState<Equipment>(Equipment.NONE);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(ActivityLevel.LIGHTLY_ACTIVE);
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = {
      name: name.trim(),
      age: parseInt(age, 10),
      gender,
      height: parseInt(height, 10),
      currentWeight: parseInt(currentWeight, 10),
      targetWeight: parseInt(targetWeight, 10),
      level,
      goal,
      equipment,
      activityLevel,
    };
    
    // Basic validation
    if (!profile.name || !profile.age || !profile.height || !profile.currentWeight || !profile.targetWeight) {
        alert('Kérlek, tölts ki minden mezőt a folytatáshoz!');
        return;
    }

    onSetupComplete(profile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-secondary-500)] pb-2">
            FitBot
          </h1>
          <p className="text-gray-400 mt-1">Személyre szabott edzésterv és motivációs partnered</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Details Section */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-200 border-b border-white/10 pb-2 mb-4">Személyes adatok</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="name" className={labelClasses}>Hogy szólíthatlak?</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputBaseClasses} placeholder="Pl. Gábor" required />
              </div>
              <div>
                <label htmlFor="age" className={labelClasses}>Életkor</label>
                <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} className={inputBaseClasses} placeholder="Pl. 30" required min="12" max="100"/>
              </div>
              <div>
                <label htmlFor="gender" className={labelClasses}>Nem</label>
                <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={inputBaseClasses}>
                  {Object.values(Gender).map((val) => (<option key={val} value={val}>{val}</option>))}
                </select>
              </div>
               <div>
                <label htmlFor="height" className={labelClasses}>Magasság (cm)</label>
                <input type="number" id="height" value={height} onChange={(e) => setHeight(e.target.value)} className={inputBaseClasses} placeholder="Pl. 180" required />
              </div>
              <div>
                <label htmlFor="currentWeight" className={labelClasses}>Jelenlegi testsúly (kg)</label>
                <input type="number" id="currentWeight" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className={inputBaseClasses} placeholder="Pl. 85" required/>
              </div>
              <div>
                <label htmlFor="targetWeight" className={labelClasses}>Cél testsúly (kg)</label>
                <input type="number" id="targetWeight" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className={inputBaseClasses} placeholder="Pl. 80" required/>
              </div>
            </div>
          </fieldset>
          
          {/* Fitness Details Section */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-200 border-b border-white/10 pb-2 mb-4">Fitnesz adatok</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
               <div>
                <label htmlFor="level" className={labelClasses}>Mi a jelenlegi fittségi szinted?</label>
                <select id="level" value={level} onChange={(e) => setLevel(e.target.value as FitnessLevel)} className={inputBaseClasses}>
                  {Object.values(FitnessLevel).map((val) => (<option key={val} value={val}>{val}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="goal" className={labelClasses}>Mi a fő célod az edzéssel?</label>
                <select id="goal" value={goal} onChange={(e) => setGoal(e.target.value as Goal)} className={inputBaseClasses}>
                  {Object.values(Goal).map((val) => (<option key={val} value={val}>{val}</option>))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="equipment" className={labelClasses}>Milyen eszközök állnak rendelkezésedre?</label>
                <select id="equipment" value={equipment} onChange={(e) => setEquipment(e.target.value as Equipment)} className={inputBaseClasses}>
                  {Object.values(Equipment).map((val) => (<option key={val} value={val}>{val}</option>))}
                </select>
              </div>
               <div className="md:col-span-2">
                <label htmlFor="activityLevel" className={labelClasses}>Milyen az általános fizikai aktivitásod?</label>
                <select id="activityLevel" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)} className={inputBaseClasses}>
                  {Object.values(ActivityLevel).map((val) => (<option key={val} value={val}>{val}</option>))}
                </select>
              </div>
            </div>
          </fieldset>


          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-primary-600)] hover:to-[var(--color-secondary-700)] text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-[var(--glow-color)] transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading ? 'Terv generálása...' : 'Edzésterv Létrehozása'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkoutSetup;
