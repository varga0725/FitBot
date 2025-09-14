import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Exercise, FitnessLevel } from '../types';
import { generateExerciseImage, generateExerciseVideo, getVideosOperationStatus, getExerciseTips, generateExerciseGif } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

type VisualizerStatus = 'idle' | 'generating' | 'polling' | 'success' | 'error';

interface ExerciseVisualizerProps {
  exercise: Exercise;
  onClose: () => void;
  onStatusUpdate: (status: VisualizerStatus) => void;
  fitnessLevel: FitnessLevel;
}

type ActiveTab = 'image' | 'video' | 'gif' | 'instructions' | 'tips';

const POLLING_MESSAGES = [
    'A generálás folyamatban...',
    'A mesterséges intelligencia alkot...',
    'Ez néhány percet is igénybe vehet...',
    'Finomítjuk a mozdulatokat...',
    'Már majdnem kész, kis türelmet!'
];

const ExerciseVisualizer: React.FC<ExerciseVisualizerProps> = ({ exercise, onClose, onStatusUpdate, fitnessLevel }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('image');
  
  const [videoGenerationState, setVideoGenerationState] = useState<VisualizerStatus>('idle');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [pollingMessage, setPollingMessage] = useState(POLLING_MESSAGES[0]);
  const operationRef = useRef<any | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const pollingMessageIntervalRef = useRef<number | null>(null);
  
  const [gifGenerationState, setGifGenerationState] = useState<VisualizerStatus>('idle');
  const [generatedGifUrl, setGeneratedGifUrl] = useState<string | null>(null);
  const [gifError, setGifError] = useState<string | null>(null);
  const gifOperationRef = useRef<any | null>(null);
  const gifPollingIntervalRef = useRef<number | null>(null);
  const gifPollingMessageIntervalRef = useRef<number | null>(null);

  const [tip, setTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [tipError, setTipError] = useState<string | null>(null);
  
  const canShare = !!navigator.share;

  useEffect(() => {
    onStatusUpdate(videoGenerationState);
  }, [videoGenerationState, onStatusUpdate]);

  const fetchImage = useCallback(async () => {
    setImageUrl(null);
    setImageError(null);
    setIsLoadingImage(true);
    try {
      const url = await generateExerciseImage(exercise.name);
      setImageUrl(url);
    } catch (err: any) {
      setImageError(err.message || 'Hiba a kép betöltése közben.');
    } finally {
      setIsLoadingImage(false);
    }
  }, [exercise.name]);
  
  const fetchTip = useCallback(async () => {
    setTip(null);
    setTipError(null);
    setIsLoadingTip(true);
    try {
      const generatedTip = await getExerciseTips(exercise.name, fitnessLevel);
      setTip(generatedTip);
    } catch (err: any) {
      setTipError(err.message || 'Hiba a tipp betöltése közben.');
    } finally {
      setIsLoadingTip(false);
    }
  }, [exercise.name, fitnessLevel]);

  useEffect(() => {
    if (activeTab === 'image' && !imageUrl && !isLoadingImage) {
        fetchImage();
    }
    if (activeTab === 'tips' && !tip && !isLoadingTip) {
        fetchTip();
    }
  }, [activeTab, fetchImage, imageUrl, isLoadingImage, fetchTip, tip, isLoadingTip]);

   const cleanupPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
    }
    if (pollingMessageIntervalRef.current) {
        clearInterval(pollingMessageIntervalRef.current);
        pollingMessageIntervalRef.current = null;
    }
   }, []);

   const cleanupGifPolling = useCallback(() => {
    if (gifPollingIntervalRef.current) {
        clearInterval(gifPollingIntervalRef.current);
        gifPollingIntervalRef.current = null;
    }
    if (gifPollingMessageIntervalRef.current) {
        clearInterval(gifPollingMessageIntervalRef.current);
        gifPollingMessageIntervalRef.current = null;
    }
   }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cleanupPolling();
      cleanupGifPolling();
      if (generatedVideoUrl) {
          URL.revokeObjectURL(generatedVideoUrl);
      }
      if (generatedGifUrl) {
          URL.revokeObjectURL(generatedGifUrl);
      }
    };
  }, [onClose, cleanupPolling, generatedVideoUrl, cleanupGifPolling, generatedGifUrl]);
  
  const handleGenerateVideo = async () => {
    setVideoGenerationState('generating');
    setVideoError(null);
    try {
        const operation = await generateExerciseVideo(exercise.name);
        operationRef.current = operation;
        setVideoGenerationState('polling');
        
        let messageIndex = 0;
        pollingMessageIntervalRef.current = window.setInterval(() => {
            messageIndex = (messageIndex + 1) % POLLING_MESSAGES.length;
            setPollingMessage(POLLING_MESSAGES[messageIndex]);
        }, 4000);

        pollingIntervalRef.current = window.setInterval(async () => {
            if (!operationRef.current) {
                cleanupPolling();
                return;
            }
            try {
                const updatedOperation = await getVideosOperationStatus(operationRef.current);
                operationRef.current = updatedOperation;

                if (updatedOperation.done) {
                    cleanupPolling();
                    if (updatedOperation.error) {
                        console.error("Video generation error:", updatedOperation.error);
                        setVideoError("A videó generálása során hiba történt.");
                        setVideoGenerationState('error');
                    } else {
                        const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                        if (downloadLink) {
                            const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                            if (!response.ok) throw new Error(`Nem sikerült letölteni a videót: ${response.statusText}`);
                            const videoBlob = await response.blob();
                            const videoUrl = URL.createObjectURL(videoBlob);
                            setGeneratedVideoUrl(videoUrl);
                            setVideoGenerationState('success');
                        } else {
                            throw new Error("A generált videó linkje hiányzik.");
                        }
                    }
                }
            } catch (err: any) {
                console.error("Polling error:", err);
                setVideoError(err.message || "Hiba a videó állapotának lekérdezése közben.");
                setVideoGenerationState('error');
                cleanupPolling();
            }
        }, 10000);

    } catch (err: any) {
        setVideoError(err.message || "Hiba a videógenerálás indítása közben.");
        setVideoGenerationState('error');
        cleanupPolling();
    }
  };
  
  const handleGenerateGif = async () => {
    setGifGenerationState('generating');
    setGifError(null);
    try {
        const operation = await generateExerciseGif(exercise.name);
        gifOperationRef.current = operation;
        setGifGenerationState('polling');
        
        let messageIndex = 0;
        gifPollingMessageIntervalRef.current = window.setInterval(() => {
            messageIndex = (messageIndex + 1) % POLLING_MESSAGES.length;
            setPollingMessage(POLLING_MESSAGES[messageIndex]);
        }, 4000);

        gifPollingIntervalRef.current = window.setInterval(async () => {
            if (!gifOperationRef.current) {
                cleanupGifPolling();
                return;
            }
            try {
                const updatedOperation = await getVideosOperationStatus(gifOperationRef.current);
                gifOperationRef.current = updatedOperation;

                if (updatedOperation.done) {
                    cleanupGifPolling();
                    if (updatedOperation.error) {
                        console.error("GIF generation error:", updatedOperation.error);
                        setGifError("A GIF generálása során hiba történt.");
                        setGifGenerationState('error');
                    } else {
                        const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                        if (downloadLink) {
                            const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                            if (!response.ok) throw new Error(`Nem sikerült letölteni a GIF-et: ${response.statusText}`);
                            const videoBlob = await response.blob();
                            const videoUrl = URL.createObjectURL(videoBlob);
                            setGeneratedGifUrl(videoUrl);
                            setGifGenerationState('success');
                        } else {
                            throw new Error("A generált GIF linkje hiányzik.");
                        }
                    }
                }
            } catch (err: any) {
                console.error("Polling error:", err);
                setGifError(err.message || "Hiba a GIF állapotának lekérdezése közben.");
                setGifGenerationState('error');
                cleanupGifPolling();
            }
        }, 10000);

    } catch (err: any) {
        setGifError(err.message || "Hiba a GIF generálás indítása közben.");
        setGifGenerationState('error');
        cleanupGifPolling();
    }
  };

  const handleRetryVideo = () => {
      if (generatedVideoUrl) URL.revokeObjectURL(generatedVideoUrl);
      setGeneratedVideoUrl(null);
      setVideoError(null);
      setVideoGenerationState('idle');
      operationRef.current = null;
      handleGenerateVideo();
  };
  
  const handleRetryGif = () => {
      if (generatedGifUrl) URL.revokeObjectURL(generatedGifUrl);
      setGeneratedGifUrl(null);
      setGifError(null);
      setGifGenerationState('idle');
      gifOperationRef.current = null;
      handleGenerateGif();
  };

   const handleShare = async () => {
    if (!canShare) return;
    
    let fileToShare: File | null = null;
    const title = `FitBot - ${exercise.name} gyakorlat`;
    const text = `Nézd meg, hogyan kell helyesen végezni a(z) ${exercise.name} gyakorlatot!`;

    try {
      if (activeTab === 'image' && imageUrl) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        fileToShare = new File([blob], `${exercise.name.replace(/\s/g, '_')}.png`, { type: 'image/png' });
      } else if ((activeTab === 'video' || activeTab === 'gif') && (generatedVideoUrl || generatedGifUrl)) {
        const urlToFetch = activeTab === 'video' ? generatedVideoUrl : generatedGifUrl;
        if (!urlToFetch) return;
        const response = await fetch(urlToFetch);
        const blob = await response.blob();
        fileToShare = new File([blob], `${exercise.name.replace(/\s/g, '_')}.mp4`, { type: 'video/mp4' });
      }

      if (navigator.canShare && fileToShare && navigator.canShare({ files: [fileToShare] })) {
         await navigator.share({ title, text, files: [fileToShare] });
      } else {
         await navigator.share({ title, text });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback for when file sharing fails but text sharing might work
      try { await navigator.share({ title, text }); } catch (e) { console.error('Text-only sharing also failed:', e); }
    }
  };
  
  const handleShareTip = async () => {
    if (!canShare || !tip) return;
    try {
        await navigator.share({
            title: `Tipp a(z) ${exercise.name} gyakorlathoz`,
            text: tip,
        });
    } catch (error) {
        console.error('Hiba a tipp megosztása közben:', error);
    }
  };

  const TabButton: React.FC<{ tabId: ActiveTab; children: React.ReactNode }> = ({ tabId, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors duration-200 focus:outline-none ${
        activeTab === tabId
          ? 'text-[var(--color-primary-400)] border-[var(--color-primary-500)]'
          : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-500'
      }`}
    >
      {children}
    </button>
  );

  const renderGeneratedVideoContent = () => {
    switch (videoGenerationState) {
        case 'idle':
            return (
                <div className="text-center">
                    <p className="mb-4 text-gray-400">Generálj egy részletes videót a gyakorlat helyes végrehajtásáról.</p>
                    <button onClick={handleGenerateVideo} className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-600)] hover:shadow-lg hover:shadow-[var(--glow-color)] text-white font-bold py-2 px-6 rounded-lg transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out">
                        Videó Generálása
                    </button>
                </div>
            );
        case 'generating':
            return <LoadingSpinner text="Generálás indítása..." />;
        case 'polling':
            return <LoadingSpinner text={pollingMessage} />;
        case 'success':
            return generatedVideoUrl ? (
                <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full object-contain rounded-lg" />
            ) : <p className="text-center text-gray-400">Videó betöltése...</p>;
        case 'error':
            return (
                <div className="text-center">
                    <p className="mb-4 text-red-400">{videoError || "Ismeretlen hiba történt."}</p>
                    <button onClick={handleRetryVideo} className="bg-white/5 hover:bg-white/10 text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg">
                        Újrapróbálkozás
                    </button>
                </div>
            );
    }
  };
  
  const renderGeneratedGifContent = () => {
    switch (gifGenerationState) {
        case 'idle':
            return (
                <div className="text-center">
                    <p className="mb-4 text-gray-400">Generálj egy rövid, ismétlődő animációt a mozdulatsorról.</p>
                    <button onClick={handleGenerateGif} className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-600)] hover:shadow-lg hover:shadow-[var(--glow-color)] text-white font-bold py-2 px-6 rounded-lg transform hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out">
                        GIF Generálása
                    </button>
                </div>
            );
        case 'generating':
            return <LoadingSpinner text="Generálás indítása..." />;
        case 'polling':
            return <LoadingSpinner text={pollingMessage} />;
        case 'success':
            return generatedGifUrl ? (
                <video src={generatedGifUrl} autoPlay loop muted playsInline className="w-full h-full object-contain rounded-lg" />
            ) : <p className="text-center text-gray-400">GIF betöltése...</p>;
        case 'error':
            return (
                <div className="text-center">
                    <p className="mb-4 text-red-400">{gifError || "Ismeretlen hiba történt."}</p>
                    <button onClick={handleRetryGif} className="bg-white/5 hover:bg-white/10 text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg">
                        Újrapróbálkozás
                    </button>
                </div>
            );
    }
  };

  const renderTabContent = () => {
      switch(activeTab) {
          case 'image':
              return isLoadingImage ? <LoadingSpinner text="Kép generálása..."/> : imageError ? <p className="text-red-500 text-center">{imageError}</p> : <img src={imageUrl || ''} alt={`${exercise.name} illusztráció`} className="w-full h-full object-contain rounded-lg"/>;
          case 'video':
              return renderGeneratedVideoContent();
          case 'gif':
              return renderGeneratedGifContent();
          case 'instructions':
              return <div className="text-gray-300 p-4 space-y-2 leading-relaxed"><h4 className="font-bold text-lg text-gray-100">Végrehajtás:</h4><p>{exercise.instructions}</p><div className="pt-2"><h4 className="font-bold text-lg text-gray-100">Szettek és ismétlések:</h4><p>{exercise.sets} sorozat, {exercise.reps} ismétlés</p></div></div>;
          case 'tips':
               return isLoadingTip ? <LoadingSpinner text="Tippek betöltése..."/> : tipError ? <p className="text-red-500 text-center">{tipError}</p> : (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="text-gray-200 p-4 text-center italic text-lg leading-relaxed">„{tip}”</div>
                        {canShare && tip && (
                            <button onClick={handleShareTip} className="bg-white/5 hover:bg-white/10 text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg flex items-center gap-2 group transition-all duration-200 active:scale-95">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                   <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                <span>Tipp megosztása</span>
                            </button>
                        )}
                    </div>
                );
          default:
              return null;
      }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="visualizer-title"
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
        <h3 id="visualizer-title" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-secondary-500)] mb-4 pb-1 text-center">
          {exercise.name}
        </h3>
        
        <div className="border-b border-white/10 flex justify-center flex-wrap gap-2">
            <TabButton tabId="image">Kép</TabButton>
            <TabButton tabId="video">Videó</TabButton>
            <TabButton tabId="gif">GIF</TabButton>
            <TabButton tabId="instructions">Leírás</TabButton>
            <TabButton tabId="tips">Tippek</TabButton>
        </div>

        <div className="flex-grow my-4 flex items-center justify-center min-h-[300px]">
           {renderTabContent()}
        </div>

        <div className="flex-shrink-0 pt-4 border-t border-white/10 flex justify-center items-center gap-4">
            <div className="flex justify-center gap-4">
                 {(activeTab === 'image' && !isLoadingImage && imageUrl) && (
                    <button onClick={fetchImage} className="bg-white/5 hover:bg-white/10 text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg flex items-center gap-2 group transition-all duration-200 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.899 2.186l-1.391.531a5.002 5.002 0 00-7.531-1.234L3 9.801V6a1 1 0 011-1zm10 16a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.899-2.186l1.391-.531a5.002 5.002 0 007.531 1.234L17 10.199V14a1 1 0 01-1 1z" clipRule="evenodd" /></svg>
                        <span>Új kép</span>
                    </button>
                 )}
                 {canShare && ((activeTab === 'image' && imageUrl) || (activeTab === 'video' && generatedVideoUrl) || (activeTab === 'gif' && generatedGifUrl)) ? (
                    <button onClick={handleShare} className="bg-white/5 hover:bg-white/10 text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg flex items-center gap-2 group transition-all duration-200 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        <span>Megosztás</span>
                    </button>
                 ) : null}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ExerciseVisualizer;