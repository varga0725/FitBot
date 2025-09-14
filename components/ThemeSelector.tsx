import React from 'react';

const themes = [
  { name: 'orange', color: '#f97316' },
  { name: 'blue', color: '#3b82f6' },
  { name: 'green', color: '#22c55e' },
  { name: 'purple', color: '#a855f7' },
];

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="absolute top-full right-0 mt-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg p-2 flex space-x-2 z-50">
      {themes.map(theme => (
        <button
          key={theme.name}
          onClick={() => onThemeChange(theme.name)}
          className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 focus:outline-none ${currentTheme === theme.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
          style={{ backgroundColor: theme.color }}
          aria-label={`Válassz ${theme.name} témát`}
          title={theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
        />
      ))}
    </div>
  );
};

export default ThemeSelector;