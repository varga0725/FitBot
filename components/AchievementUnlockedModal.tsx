
import React from 'react';
import type { Achievement } from '../types';

interface AchievementUnlockedModalProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementUnlockedModal: React.FC<AchievementUnlockedModalProps> = ({ achievement, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-title"
    >
      <div
        className="bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-8 border border-[var(--color-primary-500)]/50 relative text-center flex flex-col items-center animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-7xl mb-4 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] w-28 h-28 rounded-full flex items-center justify-center shadow-lg shadow-[var(--glow-color)]">
          {achievement.icon}
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary-400)]">
          Jelvény feloldva!
        </h2>
        <h3 id="achievement-title" className="text-3xl font-bold text-white mt-1">
          {achievement.name}
        </h3>
        <p className="text-gray-300 mt-3 mb-6">
          {achievement.description}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-primary-600)] hover:to-[var(--color-secondary-700)] text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out"
        >
          Szuper!
        </button>
      </div>
    </div>
  );
};

export default AchievementUnlockedModal;
