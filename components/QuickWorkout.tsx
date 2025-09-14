import React from 'react';
import type { QuickWorkout as QuickWorkoutType, UserProfile } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ExerciseCard from './ExerciseCard';

interface QuickWorkoutProps {
    isOpen: boolean;
    onClose: () => void;
    workout: QuickWorkoutType | null;
    isLoading: boolean;
    error: string | null;
    onRegenerate: () => void;
    userProfile: UserProfile;
}

const QuickWorkout: React.FC<QuickWorkoutProps> = ({ isOpen, onClose, workout, isLoading, error, onRegenerate, userProfile }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-workout-title"
        >
            <div
                className="bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-6 border border-white/10 relative flex flex-col animate-scale-in max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10 p-1 bg-white/5 rounded-full"
                    aria-label="Bezárás"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-4">
                    <h3 id="quick-workout-title" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-secondary-500)] pb-1">
                        Villámedzés
                    </h3>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar -mr-2 pr-2">
                    {isLoading && <LoadingSpinner text="Villámedzés generálása..." />}
                    {error && !isLoading && (
                        <div className="text-center p-4">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button onClick={onRegenerate} className="bg-white/5 hover:bg-white/10 active:scale-95 text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg transform transition-all duration-200">
                                Újrapróbálkozás
                            </button>
                        </div>
                    )}
                    {workout && !isLoading && (
                        <div>
                            <div className="text-center mb-6">
                                <h4 className="text-xl font-bold text-gray-100">{workout.title}</h4>
                                <p className="text-gray-400 mt-1">{workout.description}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workout.exercises.map((ex, index) => (
                                    <ExerciseCard key={index} exercise={ex} fitnessLevel={userProfile.level} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {workout && !isLoading && (
                    <div className="flex-shrink-0 pt-6 text-center">
                        <button
                            onClick={onRegenerate}
                            disabled={isLoading}
                            className="group flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg transform transition-all duration-200 mx-auto active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-[180deg]" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.899 2.186l-1.391.531a5.002 5.002 0 00-7.531-1.234L3 9.801V6a1 1 0 011-1zm10 16a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.899-2.186l1.391-.531a5.002 5.002 0 007.531 1.234L17 10.199V14a1 1 0 01-1 1z" clipRule="evenodd" />
                            </svg>
                            <span>Másikat kérek</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickWorkout;
