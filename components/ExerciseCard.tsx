import React, { useState } from 'react';
import type { Exercise, FitnessLevel } from '../types';
import ExerciseVisualizer from './ExerciseVisualizer';

export type VisualizerStatus = 'idle' | 'generating' | 'polling' | 'success' | 'error';

interface ExerciseCardProps {
    exercise: Exercise;
    fitnessLevel: FitnessLevel;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, fitnessLevel }) => {
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [visualizerStatus, setVisualizerStatus] = useState<VisualizerStatus>('idle');

  const handleVisualizerClose = () => {
    setIsVisualizerOpen(false);
    // If generation was in progress but not finished, reset the status.
    if (visualizerStatus === 'generating' || visualizerStatus === 'polling') {
      setVisualizerStatus('idle');
    }
  };

  const getStatusContent = () => {
    switch (visualizerStatus) {
      case 'generating':
        return <span className="text-xs text-gray-400">Videó generálása...</span>;
      case 'polling':
        return <span className="text-xs text-yellow-400">Feldolgozás...</span>;
      case 'success':
        return <span className="text-xs text-green-400">Videó sikeresen legenerálva!</span>;
      case 'error':
        return (
          <button onClick={() => { setVisualizerStatus('idle'); setIsVisualizerOpen(true); }} className="text-xs text-red-400 hover:underline">
            Hiba történt. Újrapróbálkozás?
          </button>
        );
      case 'idle':
      default:
        return (
          <button
            onClick={() => setIsVisualizerOpen(true)}
            className="w-full text-sm text-center bg-white/5 hover:bg-white/10 active:bg-white/15 active:scale-95 text-[var(--color-primary-400)] font-semibold py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
            aria-label={`Gyakorlat megtekintése: ${exercise.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>Gyakorlat megtekintése</span>
          </button>
        );
    }
  };


  return (
    <>
      <div className="bg-black/20 p-4 rounded-lg border border-white/10 hover:border-[var(--color-primary-500)]/50 transition-all duration-200 flex flex-col justify-between">
        <div>
          <h4 className="text-lg font-bold text-[var(--color-primary-400)]">{exercise.name}</h4>
          <p className="text-gray-400"><span className="font-semibold text-gray-300">Sorozat:</span> {exercise.sets}</p>
          <p className="text-gray-400"><span className="font-semibold text-gray-300">Ismétlés:</span> {exercise.reps}</p>
          <p className="mt-2 text-sm text-gray-300">{exercise.instructions}</p>
        </div>
        <div className="mt-4 text-center h-9 flex items-center justify-center">
            {getStatusContent()}
        </div>
      </div>
      {isVisualizerOpen && (
        <ExerciseVisualizer 
          exercise={exercise} 
          onClose={handleVisualizerClose}
          onStatusUpdate={setVisualizerStatus}
          fitnessLevel={fitnessLevel}
        />
      )}
    </>
  );
};

export default ExerciseCard;
