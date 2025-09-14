

import React, { useState, useEffect, useCallback } from 'react';
import type { Chat } from '@google/ai';
import WorkoutSetup from './components/WorkoutSetup';
import WorkoutPlan from './components/WorkoutPlan';
import Chatbot from './components/Chatbot';
import LoadingSpinner from './components/LoadingSpinner';
import ProgressView from './components/ProgressView';
import ThemeSelector from './components/ThemeSelector';
import NutritionPlanner from './components/NutritionPlanner';
import MealPlan from './components/MealPlan';
import QuickWorkout from './components/QuickWorkout';
import AchievementUnlockedModal from './components/AchievementUnlockedModal';
import { generateWorkoutPlan, createChat, generateMealPlan, generateQuickWorkout } from './services/geminiService';
import { MessageSender } from './types';
import type { UserProfile, WorkoutPlan as WorkoutPlanType, ChatMessage, DailyWorkout, WorkoutLogEntry, WorkoutGoal, MealPlan as MealPlanType, DietaryProfile, QuickWorkout as QuickWorkoutType, ProgressData, Achievement, WaterLogEntry } from './types';
import { ALL_ACHIEVEMENTS } from './components/ProgressView'; // Import achievements definition


const getInitialChatMessages = (): ChatMessage[] => {
  try {
    const saved = localStorage.getItem('fitbot_chatMessages');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load chat messages from localStorage:", error);
    localStorage.removeItem('fitbot_chatMessages');
    return [];
  }
};

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanType | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlanType | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLogEntry[]>([]);
  const [activeGoal, setActiveGoal] = useState<WorkoutGoal | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'plan' | 'progress' | 'meal'>('plan');
  
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(getInitialChatMessages);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);

  // Gamification State
  const [progressData, setProgressData] = useState<ProgressData>({
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    unlockedAchievements: [],
    totalWorkouts: 0,
  });
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  const [isQuickWorkoutModalOpen, setIsQuickWorkoutModalOpen] = useState<boolean>(false);
  const [quickWorkout, setQuickWorkout] = useState<QuickWorkoutType | null>(null);
  const [isGeneratingQuickWorkout, setIsGeneratingQuickWorkout] = useState<boolean>(false);
  const [quickWorkoutError, setQuickWorkoutError] = useState<string | null>(null);

  
  const [theme, setTheme] = useState<string>('orange');
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState<boolean>(false);
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [notificationSentDate, setNotificationSentDate] = useState<string | null>(
    () => localStorage.getItem('fitbot_notificationSentDate')
  );

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(window.Notification.permission);
    }
  }, []);

  useEffect(() => {
    const REMINDER_HOUR = 20;
    if (notificationPermission !== 'granted' || !userProfile) return;
    const intervalId = setInterval(() => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      if (notificationSentDate === todayStr) return;
      if (now.getHours() >= REMINDER_HOUR) {
        const hasLoggedToday = workoutLogs.some(log => log.date.startsWith(todayStr));
        if (!hasLoggedToday) {
          new window.Notification('FitBot Edzés Emlékeztető', {
            body: `Szia ${userProfile.name}! Látom, ma még nem naplóztál edzést. Még van időd bepótolni!`,
            icon: '/vite.svg',
          });
          setNotificationSentDate(todayStr);
          localStorage.setItem('fitbot_notificationSentDate', todayStr);
        }
      }
    }, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [notificationPermission, workoutLogs, userProfile, notificationSentDate]);


  useEffect(() => {
    const savedTheme = localStorage.getItem('fitbot_theme') || 'orange';
    handleThemeChange(savedTheme, false);
  }, []);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('fitbot_userProfile');
      const savedWorkoutPlan = localStorage.getItem('fitbot_workoutPlan');
      const savedMealPlan = localStorage.getItem('fitbot_mealPlan');
      const savedLogs = localStorage.getItem('fitbot_workoutLogs');
      const savedWaterLogs = localStorage.getItem('fitbot_waterLogs');
      const savedGoal = localStorage.getItem('fitbot_activeGoal');
      const savedProgress = localStorage.getItem('fitbot_progressData');

      if (savedProfile && savedWorkoutPlan) {
        setUserProfile(JSON.parse(savedProfile));
        setWorkoutPlan(JSON.parse(savedWorkoutPlan));
        if (savedMealPlan) setMealPlan(JSON.parse(savedMealPlan));
        if (savedLogs) setWorkoutLogs(JSON.parse(savedLogs));
        if (savedWaterLogs) setWaterLogs(JSON.parse(savedWaterLogs));
        if (savedGoal) setActiveGoal(JSON.parse(savedGoal));
        if (savedProgress) setProgressData(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      localStorage.clear();
    }
  }, []);

  useEffect(() => {
    if (userProfile && !chatInstance) {
      const chat = createChat(userProfile);
      setChatInstance(chat);
      if (chatMessages.length === 0) {
        setChatMessages([{
          sender: MessageSender.BOT,
          text: `Szia ${userProfile.name}! Én FitBot vagyok, a személyi motivációs partnered. Elkészítettem neked egy edzéstervet. Ha bármi kérdésed van, vagy csak egy kis bátorításra van szükséged, szólj bátran!`
        }]);
      }
    }
  }, [userProfile, chatInstance, chatMessages.length]);

  useEffect(() => {
    if (userProfile) {
        localStorage.setItem('fitbot_chatMessages', JSON.stringify(chatMessages));
    }
  }, [chatMessages, userProfile]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsChatModalOpen(false);
        setIsQuickWorkoutModalOpen(false);
        setUnlockedAchievement(null); // Close achievement modal too
      }
    };
    if (isChatModalOpen || isQuickWorkoutModalOpen || unlockedAchievement) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChatModalOpen, isQuickWorkoutModalOpen, unlockedAchievement]);

  const handleThemeChange = (newTheme: string, closeSelector: boolean = true) => {
    setTheme(newTheme);
    localStorage.setItem('fitbot_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (closeSelector) {
      setIsThemeSelectorOpen(false);
    }
  };

  const handleSetupComplete = useCallback(async (profile: UserProfile) => {
    setIsGeneratingPlan(true);
    setError(null);
    try {
      const plan = await generateWorkoutPlan(profile);
      setWorkoutPlan(plan);
      setUserProfile(profile);
      // Reset all user progress
      setWorkoutLogs([]);
      setWaterLogs([]);
      setActiveGoal(null);
      setMealPlan(null);
      setChatMessages([]);
      setProgressData({
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null,
        unlockedAchievements: [],
        totalWorkouts: 0,
      });
      
      localStorage.setItem('fitbot_userProfile', JSON.stringify(profile));
      localStorage.setItem('fitbot_workoutPlan', JSON.stringify(plan));
      localStorage.removeItem('fitbot_workoutLogs');
      localStorage.removeItem('fitbot_waterLogs');
      localStorage.removeItem('fitbot_activeGoal');
      localStorage.removeItem('fitbot_mealPlan');
      localStorage.removeItem('fitbot_chatMessages');
      localStorage.removeItem('fitbot_progressData');

    } catch (err: any) {
      setError(err.message || 'Ismeretlen hiba történt.');
    } finally {
      setIsGeneratingPlan(false);
    }
  }, []);
  
  const handleMealPlanGenerated = useCallback((plan: MealPlanType) => {
      setMealPlan(plan);
      localStorage.setItem('fitbot_mealPlan', JSON.stringify(plan));
  }, []);


  const handleSendMessage = useCallback(async (message: string) => {
    if (!chatInstance) return;

    setChatMessages(prev => [...prev, { sender: MessageSender.USER, text: message }]);
    setIsBotTyping(true);

    try {
      const response = await chatInstance.sendMessage({ message });
      setChatMessages(prev => [...prev, { sender: MessageSender.BOT, text: response.text }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages(prev => [...prev, { sender: MessageSender.BOT, text: "Bocsi, valami hiba történt. Próbáld újra később." }]);
    } finally {
      setIsBotTyping(false);
    }
  }, [chatInstance]);
  
  const handleGetWorkoutTips = useCallback(async (workout: DailyWorkout) => {
    if (!chatInstance || !userProfile) return;
    
    setIsChatModalOpen(true);
    const userMessage = `Tudnál adni pár tippet a mai (${workout.day}) '${workout.title}' edzésemhez?`;
    const botPrompt = `A felhasználó tippeket kér a mai edzéséhez. A felhasználó fittségi szintje: ${userProfile.level}. Adj neki 2-3 rövid, hasznos, motiváló tippet magyarul, ami ehhez a szinthez igazodik. A mai edzés: '${workout.title}'. A leírása: '${workout.description}'. A gyakorlatok: ${workout.exercises.map(e => e.name).join(', ')}. A tippek fókuszáljanak például a helyes formára, a légzésre, a tempóra, vagy mentális felkészülésre. Fontos, hogy a tippek relevánsak legyenek a megadott fittségi szinthez. Például egy 'Kezdő' számára a biztonságos alapokra, míg egy 'Haladó' számára a teljesítményfokozásra helyezd a hangsúlyt.`;
    
    setChatMessages(prev => [...prev, { sender: MessageSender.USER, text: userMessage }]);
    setIsBotTyping(true);
    
    try {
      const response = await chatInstance.sendMessage({ message: botPrompt });
      setChatMessages(prev => [...prev, { sender: MessageSender.BOT, text: response.text }]);
    } catch (err) {
      console.error("Chat error on getting tips:", err);
      setChatMessages(prev => [...prev, { sender: MessageSender.BOT, text: "Bocsi, valami hiba történt a tippek kérése közben. Próbáld újra később." }]);
    } finally {
      setIsBotTyping(false);
    }
  }, [chatInstance, userProfile]);

  const handleLogWorkout = useCallback((workoutToLog: DailyWorkout) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Update Logs
    const newLog: WorkoutLogEntry = { date: today.toISOString(), workoutDay: workoutToLog.day, workoutTitle: workoutToLog.title };
    const updatedLogs = [...workoutLogs, newLog];
    setWorkoutLogs(updatedLogs);
    localStorage.setItem('fitbot_workoutLogs', JSON.stringify(updatedLogs));

    // Update Progress Data (Streaks & Achievements)
    setProgressData(prevData => {
      const lastWorkoutDate = prevData.lastWorkoutDate ? new Date(prevData.lastWorkoutDate) : null;
      let currentStreak = prevData.currentStreak;

      if (lastWorkoutDate) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        if (lastWorkoutDate.toDateString() === yesterday.toDateString()) {
          currentStreak += 1; // Continue streak
        } else if (lastWorkoutDate.toDateString() !== today.toDateString()) {
          currentStreak = 1; // Reset streak if not yesterday or today
        }
      } else {
        currentStreak = 1; // First workout
      }

      const newTotalWorkouts = prevData.totalWorkouts + 1;
      const longestStreak = Math.max(prevData.longestStreak, currentStreak);
      
      const newProgress: ProgressData = {
        ...prevData,
        currentStreak,
        longestStreak,
        lastWorkoutDate: todayStr,
        totalWorkouts: newTotalWorkouts,
      };

      // Check for new achievements
      const newlyUnlocked = ALL_ACHIEVEMENTS.find(ach => 
        !prevData.unlockedAchievements.includes(ach.id) && ach.unlockCondition(newProgress, updatedLogs, activeGoal)
      );
      
      if (newlyUnlocked) {
        newProgress.unlockedAchievements.push(newlyUnlocked.id);
        setTimeout(() => setUnlockedAchievement(newlyUnlocked), 500); // Show modal after a short delay
      }

      localStorage.setItem('fitbot_progressData', JSON.stringify(newProgress));
      return newProgress;
    });
  }, [workoutLogs, activeGoal]);

  const handleWaterLog = useCallback((increment: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setWaterLogs(prevLogs => {
        const todayLogIndex = prevLogs.findIndex(log => log.date === todayStr);
        let newLogs = [...prevLogs];

        if (todayLogIndex > -1) {
            // Update existing log for today
            const newAmount = Math.max(0, newLogs[todayLogIndex].amount + increment);
            newLogs[todayLogIndex] = { ...newLogs[todayLogIndex], amount: newAmount };
        } else {
            // Create new log for today
            const newAmount = Math.max(0, increment);
            newLogs.push({ date: todayStr, amount: newAmount });
        }
        localStorage.setItem('fitbot_waterLogs', JSON.stringify(newLogs));
        return newLogs;
    });
  }, []);

  const handleTriggerMotivation = useCallback(() => {
    const motivationPrompt = "Figyelj, ma sajnos nem volt időm/erőm edzeni. Mit javasolsz?";
    handleSendMessage(motivationPrompt);
  }, [handleSendMessage]);

  const handleGenerateQuickWorkout = useCallback(async () => {
    if (!userProfile) return;
    
    setIsQuickWorkoutModalOpen(true);
    setIsGeneratingQuickWorkout(true);
    setQuickWorkout(null);
    setQuickWorkoutError(null);

    try {
      const workout = await generateQuickWorkout(userProfile);
      setQuickWorkout(workout);
    } catch (err: any) {
      setQuickWorkoutError(err.message || 'Ismeretlen hiba történt a villámedzés generálása közben.');
    } finally {
      setIsGeneratingQuickWorkout(false);
    }
  }, [userProfile]);

  const handleSetGoal = useCallback((goal: WorkoutGoal) => {
    setActiveGoal(goal);
    localStorage.setItem('fitbot_activeGoal', JSON.stringify(goal));
  }, []);

  const handleClearGoal = useCallback(() => {
    setActiveGoal(null);
    localStorage.removeItem('fitbot_activeGoal');
  }, []);
  
  const handleRequestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('Ez a böngésző nem támogatja az asztali értesítéseket.');
      return;
    }
    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);
  }, []);


  const handleReset = () => {
    if (window.confirm("Biztosan új tervet szeretnél generálni? A jelenlegi terved és a haladásod törlődni fog.")) {
      localStorage.clear();
      setUserProfile(null);
      setWorkoutPlan(null);
      setMealPlan(null);
      setChatInstance(null);
      setChatMessages([]);
      setWorkoutLogs([]);
      setWaterLogs([]);
      setActiveGoal(null);
      setError(null);
      setActiveView('plan');
      setProgressData({ currentStreak: 0, longestStreak: 0, lastWorkoutDate: null, unlockedAchievements: [], totalWorkouts: 0 });
      handleThemeChange('orange', false);
    }
  };

  if (!userProfile || !workoutPlan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {isGeneratingPlan ? (
          <LoadingSpinner text="Személyre szabott edzésterved készül..." />
        ) : (
          <WorkoutSetup onSetupComplete={handleSetupComplete} isLoading={isGeneratingPlan} />
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  const PlanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2-2H7a2 2 0 01-2-2V4zm1 9a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1zm-1 4a1 1 0 100 2h10a1 1 0 100-2H5z" /></svg>;
  const MealIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 6.293a1 1 0 00-1.414 1.414L8.586 9H7a1 1 0 000 2h1.586l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 11H13a1 1 0 100-2h-1.586l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 6.293z" clipRule="evenodd" /></svg>;
  const ProgressIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>;

  const TabButton: React.FC<{
    viewName: 'plan' | 'progress' | 'meal';
    currentView: 'plan' | 'progress' | 'meal';
    onClick: (view: 'plan' | 'progress' | 'meal') => void;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ viewName, currentView, onClick, icon, children }) => {
    const isActive = viewName === currentView;
    return (
      <button 
        onClick={() => onClick(viewName)} 
        className={`relative group px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 flex items-center gap-2
          ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
      >
        <span className="transition-transform duration-200 ease-in-out group-hover:scale-110">{icon}</span>
        {children}
        <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-[var(--color-primary-500)] rounded-full transition-transform duration-300 ease-out
          ${isActive ? 'scale-x-100' : 'scale-x-0'}`}>
        </span>
      </button>
    );
  };

  return (
    <div className="h-screen w-screen p-2 sm:p-4 flex flex-col items-center">
        <div className="w-full max-w-7xl h-full bg-black/30 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
            <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-white/10">
                <div className="flex items-center space-x-1">
                    <TabButton viewName="plan" currentView={activeView} onClick={setActiveView} icon={<PlanIcon/>}>Edzésterv</TabButton>
                    <TabButton viewName="meal" currentView={activeView} onClick={setActiveView} icon={<MealIcon/>}>Étrend</TabButton>
                    <TabButton viewName="progress" currentView={activeView} onClick={setActiveView} icon={<ProgressIcon/>}>Haladás</TabButton>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                   <div className="relative">
                      <button
                        onClick={() => setIsThemeSelectorOpen(prev => !prev)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                        title="Téma választása"
                        aria-label="Téma választása"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                         </svg>
                      </button>
                      {isThemeSelectorOpen && <ThemeSelector currentTheme={theme} onThemeChange={handleThemeChange} />}
                   </div>
                   <button
                    onClick={handleGenerateQuickWorkout}
                    className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-600)] hover:shadow-lg hover:shadow-[var(--glow-color)] text-white font-bold py-2 px-3 sm:px-4 rounded-lg transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out text-sm flex items-center gap-2"
                    title="Gyors edzés generálása"
                    aria-label="Villámedzés generálása"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Villámedzés</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg shadow-lg hover:shadow-red-500/30 transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out text-sm"
                    title="Új terv készítése"
                    aria-label="Új edzésterv készítése"
                  >
                    Új Terv
                  </button>
                </div>
            </header>

            <main className="flex-grow overflow-hidden">
              {activeView === 'plan' && <WorkoutPlan plan={workoutPlan} onLogWorkout={handleLogWorkout} logs={workoutLogs} onGetWorkoutTips={handleGetWorkoutTips} fitnessLevel={userProfile.level} />}
              {activeView === 'progress' && <ProgressView theme={theme} logs={workoutLogs} goal={activeGoal} onSetGoal={handleSetGoal} onClearGoal={handleClearGoal} notificationPermission={notificationPermission} onRequestNotificationPermission={handleRequestNotificationPermission} progressData={progressData} waterLogs={waterLogs} onLogWater={handleWaterLog} />}
              {activeView === 'meal' && (
                <div className="h-full">
                  {mealPlan 
                    ? <MealPlan plan={mealPlan} /> 
                    : <NutritionPlanner userProfile={userProfile} onPlanGenerated={handleMealPlanGenerated} />
                  }
                </div>
              )}
            </main>
        </div>
        
        <button
          onClick={() => setIsChatModalOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] text-white p-4 rounded-full shadow-lg shadow-[var(--glow-color)] hover:scale-110 active:scale-100 transition-transform duration-200 z-40"
          aria-label="FitBot csevegés megnyitása"
          title="FitBot csevegés"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
          </svg>
        </button>
        
        {isQuickWorkoutModalOpen && (
          <QuickWorkout
            userProfile={userProfile}
            isOpen={isQuickWorkoutModalOpen}
            onClose={() => setIsQuickWorkoutModalOpen(false)}
            workout={quickWorkout}
            isLoading={isGeneratingQuickWorkout}
            error={quickWorkoutError}
            onRegenerate={handleGenerateQuickWorkout}
          />
        )}

        {unlockedAchievement && (
          <AchievementUnlockedModal 
            achievement={unlockedAchievement}
            onClose={() => setUnlockedAchievement(null)}
          />
        )}

        {isChatModalOpen && (
           <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={() => setIsChatModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chatbot-title"
          >
            <div
              className="w-full max-w-lg h-[90vh] max-h-[700px] flex flex-col animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <Chatbot 
                messages={chatMessages} 
                onSendMessage={handleSendMessage} 
                onTriggerMotivation={handleTriggerMotivation}
                isLoading={isBotTyping} 
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default App;