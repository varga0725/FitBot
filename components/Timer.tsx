import React, { useState, useEffect, useRef, useCallback } from 'react';

// Data URI for a simple beep sound
const beepSound = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT19PANkO1w3XD9cPAQ8BEwETCRwJHQkdASYBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3ATcBNwE3A==";


interface TimerProps {
  isOpen: boolean;
  onClose: () => void;
}

const Timer: React.FC<TimerProps> = ({ isOpen, onClose }) => {
  const [time, setTime] = useState(0); // time in seconds
  const [isActive, setIsActive] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setTime(prevTime => {
          if (isCountdown) {
            if (prevTime > 1) {
              return prevTime - 1;
            }
            // Countdown finished
            if (audioRef.current) {
                audioRef.current.play();
            }
            setIsActive(false);
            return 0;
          }
          // Stopwatch
          return prevTime + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isCountdown]);
  
   useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleStartStop = () => {
    if (time > 0 || !isCountdown) {
      setIsActive(!isActive);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
    setIsCountdown(false);
  };
  
  const handlePreset = (seconds: number) => {
    handleReset();
    setTime(seconds);
    setIsCountdown(true);
    setIsActive(true);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="timer-title"
    >
        <audio ref={audioRef} src={beepSound} preload="auto" />
        <div 
            className="bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-6 border border-white/10 relative text-center flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
        >
            <h3 id="timer-title" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-secondary-500)] mb-4">
                Edzés Időzítő
            </h3>
            
            <div className="my-6">
                <h1 className="text-7xl font-bold font-mono text-white tracking-wider">
                    {formatTime(time)}
                </h1>
                <p className="text-gray-400 uppercase text-sm tracking-widest">{isCountdown ? "Visszaszámlálás" : "Stopper"}</p>
            </div>
            
            <div className="flex justify-center gap-3 mb-6">
                {[30, 60, 90].map(sec => (
                    <button 
                        key={sec} 
                        onClick={() => handlePreset(sec)}
                        className="w-20 h-10 bg-white/5 border border-white/10 rounded-lg text-gray-300 font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                        {sec}s
                    </button>
                ))}
            </div>

            <div className="flex justify-center gap-4">
                 <button 
                    onClick={handleStartStop}
                    className={`w-28 h-12 text-lg font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white shadow-lg ${
                        isActive 
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-orange-500/40' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-emerald-500/40'
                    }`}
                >
                    {isActive ? 'Stop' : 'Start'}
                </button>
                <button 
                    onClick={handleReset}
                    className="w-28 h-12 bg-white/10 text-gray-300 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 hover:bg-white/20"
                >
                    Reset
                </button>
            </div>
             <button 
                onClick={onClose} 
                className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors z-10 p-1 bg-white/5 rounded-full"
                aria-label="Bezárás"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
  );
};

export default Timer;