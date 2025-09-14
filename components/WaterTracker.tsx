import React from 'react';

interface WaterTrackerProps {
  currentIntake: number; // in ml
  onLogWater: (amount: number) => void;
}

const WATER_GOAL = 2000; // 2L daily goal
const INCREMENT = 250; // One glass

const WaterTracker: React.FC<WaterTrackerProps> = ({ currentIntake, onLogWater }) => {
  const progressPercentage = Math.min((currentIntake / WATER_GOAL) * 100, 100);

  const handleAdd = () => onLogWater(INCREMENT);
  const handleRemove = () => onLogWater(-INCREMENT);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-100 mb-2">Napi Vízfogyasztás</h3>
      <p className="text-gray-400 text-sm mb-4">A megfelelő hidratáltság kulcsfontosságú a teljesítményhez és a regenerációhoz.</p>
      
      <div className="flex-grow flex items-center justify-center gap-8 my-4">
        {/* Visualizer */}
        <div className="relative w-24 h-40 bg-white/5 rounded-t-xl rounded-b-md border-2 border-b-4 border-white/10 flex items-end">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--color-primary-600)] to-[var(--color-primary-400)] rounded-t-lg transition-all duration-500 ease-out"
            style={{ height: `${progressPercentage}%` }}
          ></div>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
            <p className="font-bold text-white text-2xl drop-shadow-md">{Math.round(progressPercentage)}%</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={handleAdd}
            className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-full text-white shadow-lg shadow-[var(--glow-color)] flex items-center justify-center transform hover:scale-110 active:scale-100 transition-all duration-200"
            aria-label="Add 250ml water"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-100">{currentIntake.toLocaleString('hu-HU')} ml</p>
            <p className="text-sm text-gray-400">/ {WATER_GOAL.toLocaleString('hu-HU')} ml</p>
          </div>

          <button 
            onClick={handleRemove}
            disabled={currentIntake === 0}
            className="w-14 h-14 bg-white/10 rounded-full text-gray-300 flex items-center justify-center transform hover:scale-110 active:scale-100 transition-all duration-200 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
            aria-label="Remove 250ml water"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;