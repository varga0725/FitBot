import React, { useState, useMemo } from 'react';
import type { WorkoutLogEntry, WorkoutGoal, ProgressData, Achievement, WaterLogEntry } from '../types';
import { AchievementId } from '../types';
import WorkoutCalendar from './WorkoutCalendar';
import WorkoutFrequencyChart from './WorkoutFrequencyChart';
import WorkoutDistributionChart from './WorkoutDistributionChart';
import WorkoutProgressChart from './WorkoutProgressChart';
import WaterTracker from './WaterTracker';

// --- Achievements Definition ---
export const ALL_ACHIEVEMENTS: (Achievement & { unlockCondition: (progress: ProgressData, logs: WorkoutLogEntry[], goal: WorkoutGoal | null) => boolean })[] = [
    {
        id: AchievementId.FIRST_WORKOUT,
        name: "Első lépések",
        description: "Teljesítsd az első edzésedet!",
        icon: "🚀",
        unlockCondition: (progress) => progress.totalWorkouts >= 1,
    },
    {
        id: AchievementId.STREAK_7_DAYS,
        name: "Kitartás Királya",
        description: "Tarts fenn egy 7 napos edzési sorozatot!",
        icon: "🔥",
        unlockCondition: (progress) => progress.currentStreak >= 7,
    },
    {
        id: AchievementId.WORKOUT_25,
        name: "Vasember",
        description: "Teljesíts 25 edzést!",
        icon: "🏋️",
        unlockCondition: (progress) => progress.totalWorkouts >= 25,
    },
    {
        id: AchievementId.WORKOUT_100,
        name: "Fitnesz Legenda",
        description: "Teljesíts 100 edzést!",
        icon: "🏆",
        unlockCondition: (progress) => progress.totalWorkouts >= 100,
    },
    {
        id: AchievementId.GOAL_MASTER,
        name: "Cél Mester",
        description: "Teljesíts egy heti vagy havi célt!",
        icon: "🎯",
        unlockCondition: (progress, logs, goal) => {
            if (!goal) return false;
            
            const goalStartDate = new Date(goal.startDate);
            const goalEndDate = new Date(goal.startDate);
            if (goal.type === 'monthly') goalEndDate.setMonth(goalEndDate.getMonth() + 1);
            else goalEndDate.setDate(goalEndDate.getDate() + 7);

            const completedCount = logs.filter(log => {
                const logDate = new Date(log.date);
                return logDate >= goalStartDate && logDate < goalEndDate;
            }).length;

            return completedCount >= goal.target;
        },
    },
];


interface ProgressViewProps {
  logs: WorkoutLogEntry[];
  goal: WorkoutGoal | null;
  onSetGoal: (goal: WorkoutGoal) => void;
  onClearGoal: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
  theme: string;
  progressData: ProgressData;
  waterLogs: WaterLogEntry[];
  onLogWater: (amount: number) => void;
}

const GlassCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-black/20 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg ${className}`}>
    {children}
  </div>
);

const NotificationSetup: React.FC<{
  permission: NotificationPermission;
  onRequest: () => void;
}> = ({ permission, onRequest }) => {
  let content;
  switch (permission) {
    case 'granted':
      content = <div className="flex items-center gap-2 text-green-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><span>Az emlékeztetők aktívak.</span></div>;
      break;
    case 'denied':
      content = <div className="flex flex-col gap-2 text-red-400 text-sm"><div className="flex items-center gap-2 font-semibold"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg><span>Az értesítések le vannak tiltva.</span></div><p className="text-gray-400 pl-7">Az emlékeztetők engedélyezéséhez módosítanod kell a böngésződ beállításait ehhez az oldalhoz.</p></div>;
      break;
    default:
      content = <><p className="text-gray-400 mb-4">Szeretnél emlékeztetőt kapni este 8-kor, ha aznap még nem edzettél? Engedélyezd az értesítéseket!</p><button onClick={onRequest} className="group w-full sm:w-auto bg-white/5 hover:bg-white/10 text-[var(--color-primary-400)] font-bold py-2 px-6 rounded-lg shadow-lg transform hover:scale-105 active:scale-95 transition duration-300 ease-in-out flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:rotate-12" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15v1a1 1 0 001 1h12a1 1 0 001-1v-1a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg><span>Értesítések engedélyezése</span></button></>;
  }
  return <div><h3 className="text-xl font-bold text-gray-100 mb-2">Napi emlékeztetők</h3>{content}</div>;
};

const AchievementsCard: React.FC<{ progressData: ProgressData }> = ({ progressData }) => {
  return (
    <div>
        <h3 className="text-xl font-bold text-gray-100 mb-4">Sorozatok és Jelvények</h3>
        <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
                <div className="text-5xl animate-pop-in">🔥</div>
                <p className="font-bold text-2xl text-[var(--color-primary-400)] mt-1">{progressData.currentStreak}</p>
                <p className="text-xs text-gray-400">Jelenlegi sorozat</p>
            </div>
            <div className="text-center">
                <p className="font-bold text-xl text-gray-200">{progressData.longestStreak}</p>
                <p className="text-xs text-gray-400">Leghosszabb sorozat</p>
                <p className="font-bold text-xl text-gray-200 mt-2">{progressData.totalWorkouts}</p>
                <p className="text-xs text-gray-400">Összes edzés</p>
            </div>
        </div>
        <h4 className="text-md font-semibold text-gray-300 mb-3">Jelvényeid</h4>
        <div className="flex flex-wrap gap-3">
            {ALL_ACHIEVEMENTS.map(ach => {
                const isUnlocked = progressData.unlockedAchievements.includes(ach.id);
                return (
                    <div key={ach.id} className="relative group" title={isUnlocked ? `${ach.name}: ${ach.description}` : ach.description}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${isUnlocked ? 'bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] shadow-lg shadow-[var(--glow-color)]' : 'bg-black/30 grayscale opacity-50'}`}>
                            {ach.icon}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

const GoalSetupForm: React.FC<{ onSetGoal: (goal: WorkoutGoal) => void }> = ({ onSetGoal }) => {
  const [target, setTarget] = useState('10');
  const [type, setType] = useState<'weekly' | 'monthly'>('monthly');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseInt(target, 10);
    if (isNaN(targetNum) || targetNum <= 0) return;
    onSetGoal({ type, target: targetNum, startDate: new Date().toISOString() });
  };
  const inputBaseClasses = "w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition duration-200 placeholder-gray-500";
  const labelClasses = "block mb-2 text-sm font-medium text-gray-400";
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-100 mb-4">Tűzz ki egy célt!</h3>
      <p className="text-gray-400 mb-6">A célok segítenek fenntartani a motivációt. Adj meg egy heti vagy havi célt az elvégzett edzések számára.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label htmlFor="goal-target" className={labelClasses}>Edzések száma</label><input type="number" id="goal-target" value={target} onChange={(e) => setTarget(e.target.value)} className={inputBaseClasses} placeholder="Pl. 12" min="1" required /></div>
          <div><label htmlFor="goal-type" className={labelClasses}>Időtáv</label><select id="goal-type" value={type} onChange={(e) => setType(e.target.value as 'weekly' | 'monthly')} className={inputBaseClasses}><option value="monthly">Havi</option><option value="weekly">Heti</option></select></div>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-primary-600)] hover:to-[var(--color-secondary-700)] text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-[var(--glow-color)] transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out">Cél beállítása</button>
      </form>
    </div>
  );
};

const GoalProgressDisplay: React.FC<{ goal: WorkoutGoal; logs: WorkoutLogEntry[]; onClearGoal: () => void }> = ({ goal, logs, onClearGoal }) => {
  const { completed, percentage } = useMemo(() => {
    const goalStartDate = new Date(goal.startDate);
    const goalEndDate = new Date(goal.startDate);
    if (goal.type === 'monthly') goalEndDate.setMonth(goalEndDate.getMonth() + 1);
    else goalEndDate.setDate(goalEndDate.getDate() + 7);
    const completedCount = logs.filter(log => new Date(log.date) >= goalStartDate && new Date(log.date) < goalEndDate).length;
    const progressPercentage = Math.min((completedCount / goal.target) * 100, 100);
    return { completed: completedCount, percentage: progressPercentage };
  }, [goal, logs]);
  const isCompleted = completed >= goal.target;
  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <div><h3 className="text-xl font-bold text-gray-100">{goal.type === 'monthly' ? 'Havi célod' : 'Heti célod'}</h3><p className="text-gray-400">Kitartás, már nem sok van hátra!</p></div>
        <button onClick={onClearGoal} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Cél törlése</button>
      </div>
      <div className="flex items-center justify-between text-lg font-bold my-4"><span className={`${isCompleted ? 'text-green-400' : 'text-[var(--color-primary-400)]'}`}>{completed}</span><span className="text-gray-400">/</span><span className="text-gray-200">{goal.target} edzés</span></div>
      <div className="w-full bg-white/10 rounded-full h-4 relative overflow-hidden"><div className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] h-4 rounded-full transition-all duration-500 ease-out" style={{ width: `${percentage}%` }}></div>{isCompleted && <span className="absolute inset-0 text-center text-xs font-bold text-white flex items-center justify-center">Cél teljesítve! 🎉</span>}</div>
    </div>
  );
};

const ProgressView: React.FC<ProgressViewProps> = ({ logs, goal, onSetGoal, onClearGoal, notificationPermission, onRequestNotificationPermission, theme, progressData, waterLogs, onLogWater }) => {
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysWaterLog = waterLogs.find(log => log.date === todayStr);
  const currentWaterIntake = todaysWaterLog ? todaysWaterLog.amount : 0;
  
  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 mb-6">Haladásod</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-6">
        <GlassCard>{goal ? <GoalProgressDisplay goal={goal} logs={logs} onClearGoal={onClearGoal} /> : <GoalSetupForm onSetGoal={onSetGoal} />}</GlassCard>
        <GlassCard><AchievementsCard progressData={progressData} /></GlassCard>
        <GlassCard><WaterTracker currentIntake={currentWaterIntake} onLogWater={onLogWater} /></GlassCard>
        <GlassCard><NotificationSetup permission={notificationPermission} onRequest={onRequestNotificationPermission} /></GlassCard>
      </div>
      {logs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6 max-w-6xl mx-auto">
            <WorkoutCalendar logs={logs} />
            <WorkoutFrequencyChart logs={logs} theme={theme} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-6">
            <WorkoutDistributionChart logs={logs} theme={theme} />
            <WorkoutProgressChart logs={logs} theme={theme} />
          </div>
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-100 mb-4 text-center sm:text-left">Részletes napló</h3>
            <div className="space-y-3">
              {sortedLogs.map((log, index) => (
                <div key={index} className="bg-black/20 p-4 rounded-lg border border-white/10 flex justify-between items-center transition-all duration-200 hover:bg-white/5 hover:border-[var(--color-primary-500)]/50">
                  <div><p className="font-bold text-[var(--color-primary-400)]">{log.workoutTitle}</p><p className="text-sm text-gray-400">{log.workoutDay}</p></div>
                  <p className="text-sm font-semibold text-gray-300">{new Date(log.date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400 mt-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            <h3 className="text-xl font-bold text-gray-200 mt-4">A naplód még üres</h3>
            <p className="mt-2 max-w-sm">Teljesíts egy edzést a tervedből, hogy lásd a haladásodat!</p>
        </div>
      )}
    </div>
  );
};

export default ProgressView;