// FIX: Corrected import path from "@google/ai" to "@google/genai"
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { UserProfile, WorkoutPlan, ChatMessage, DietaryProfile, MealPlan, CaloricNeeds, FitnessLevel, QuickWorkout } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const exerciseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'A gyakorlat neve.' },
        sets: { type: Type.STRING, description: 'Sorozatok száma (pl. 3-4).' },
        reps: { type: Type.STRING, description: 'Ismétlések száma vagy időtartam (pl. 8-12 ismétlés, 30 mp).' },
        instructions: { type: Type.STRING, description: 'Rövid útmutató a gyakorlat helyes végrehajtásához.' },
    },
};

const workoutPlanSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.STRING, description: 'A hét napja (pl. Hétfő)' },
      title: { type: Type.STRING, description: 'Az edzésnap címe (pl. Mell & Tricepsz)' },
      description: { type: Type.STRING, description: 'Rövid leírás az edzésnapról.' },
      exercises: {
        type: Type.ARRAY,
        items: exerciseSchema,
      },
    },
  },
};

const quickWorkoutSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'A villámedzés fantázianeve (pl. "Energia Bomba" vagy "Gyors Zsírégető").' },
        description: { type: Type.STRING, description: 'Az edzés rövid, motiváló leírása.' },
        exercises: {
            type: Type.ARRAY,
            items: exerciseSchema,
        }
    }
};

const caloricNeedsSchema = {
    type: Type.OBJECT,
    properties: {
        bmr: { type: Type.NUMBER, description: 'Alapanyagcsere (Basal Metabolic Rate) kcal-ban.'},
        maintenance: { type: Type.NUMBER, description: 'Súlyfenntartáshoz szükséges napi kalória kcal-ban.'},
        target: { type: Type.NUMBER, description: 'A cél eléréséhez javasolt napi kalória kcal-ban.'}
    }
};

const mealPlanSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.STRING, description: 'A hét napja (pl. Hétfő).' },
      dailyTotalCalories: { type: Type.NUMBER, description: 'A napi összesített kalóriabevitel.' },
      breakfast: { 
        type: Type.OBJECT, 
        properties: {
          name: { type: Type.STRING, description: 'A reggeli neve.' },
          description: { type: Type.STRING, description: 'A reggeli rövid leírása, hozzávalókkal.' },
          calories: { type: Type.NUMBER, description: 'A reggeli becsült kalóriatartalma.' }
        }
      },
      lunch: { 
        type: Type.OBJECT, 
        properties: {
          name: { type: Type.STRING, description: 'Az ebéd neve.' },
          description: { type: Type.STRING, description: 'Az ebéd rövid leírása, hozzávalókkal.' },
          calories: { type: Type.NUMBER, description: 'Az ebéd becsült kalóriatartalma.' }
        }
      },
      dinner: { 
        type: Type.OBJECT, 
        properties: {
          name: { type: Type.STRING, description: 'A vacsora neve.' },
          description: { type: Type.STRING, description: 'A vacsora rövid leírása, hozzávalókkal.' },
          calories: { type: Type.NUMBER, description: 'A vacsora becsült kalóriatartalma.' }
        }
      },
      snacks: { 
        type: Type.OBJECT, 
        properties: {
          name: { type: Type.STRING, description: 'A nassolnivalók/köztes étkezések neve.' },
          description: { type: Type.STRING, description: 'A nassolnivalók rövid leírása, hozzávalókkal.' },
          calories: { type: Type.NUMBER, description: 'A nassolnivalók becsült kalóriatartalma.' }
        }
      },
    }
  }
};

export const generateWorkoutPlan = async (profile: UserProfile): Promise<WorkoutPlan> => {
  const prompt = `
    Generálj egy részletes, 7 napos edzéstervet egy felhasználó számára a következő adatok alapján:
    - Név: ${profile.name}
    - Fittségi szint: ${profile.level}
    - Elsődleges cél: ${profile.goal}
    - Rendelkezésre álló eszközök: ${profile.equipment}
    - Kor: ${profile.age}, Nem: ${profile.gender}, Súly: ${profile.currentWeight} kg, Magasság: ${profile.height} cm

    Az edzésterv tartalmazzon bemelegítést és nyújtást is, ahol releváns. Legyen benne legalább 1-2 pihenőnap.
    A válasz kizárólag a megadott JSON séma szerint történjen. A nyelv legyen magyar. Ne adj hozzá semmilyen magyarázó szöveget a JSON-on kívül.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: workoutPlanSchema,
      }
    });
    
    const jsonString = response.text.trim();
    const plan = JSON.parse(jsonString);
    return plan as WorkoutPlan;
  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw new Error("Nem sikerült legenerálni az edzéstervet. Kérlek, próbáld újra később.");
  }
};

export const generateQuickWorkout = async (profile: UserProfile): Promise<QuickWorkout> => {
    const prompt = `
    Generálj egy rövid, 15-20 perces "villámedzést" egy felhasználó számára. Ennek az edzésnek gyorsnak, intenzívnek és hatékonynak kell lennie, minimális bemelegítést igényelve.
    A felhasználó adatai:
    - Fittségi szint: ${profile.level}
    - Elsődleges cél: ${profile.goal}
    - Rendelkezésre álló eszközök: ${profile.equipment}

    Az edzés 3-4 gyakorlatból álljon, amelyek az egész testet megmozgatják, vagy a felhasználó fő céljára fókuszálnak. Az instrukciók legyenek világosak és tömörek.
    Adj az edzésnek egy frappáns címet és egy rövid, motiváló leírást.
    A válasz kizárólag a megadott JSON séma szerint történjen. A nyelv legyen magyar. Ne adj hozzá semmilyen magyarázó szöveget a JSON-on kívül.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quickWorkoutSchema,
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as QuickWorkout;
    } catch (error) {
        console.error("Error generating quick workout:", error);
        throw new Error("Nem sikerült legenerálni a villámedzést.");
    }
};

export const getCaloricNeeds = async (profile: UserProfile): Promise<CaloricNeeds> => {
    const prompt = `
        Viselkedj mint egy táplálkozási tanácsadó kalkulátor. Számítsd ki egy felhasználó napi kalóriaszükségletét a Mifflin-St Jeor egyenlet alapján.
        A felhasználó adatai:
        - Kor: ${profile.age} év
        - Nem: ${profile.gender}
        - Jelenlegi testsúly: ${profile.currentWeight} kg
        - Magasság: ${profile.height} cm
        - Aktivitási szint: ${profile.activityLevel}
        - Cél: ${profile.goal} (pl. Fogyás, Izomépítés)
        - Cél testsúly: ${profile.targetWeight} kg

        A számítás lépései:
        1.  Számítsd ki a BMR-t (Basal Metabolic Rate).
        2.  Számítsd ki a TDEE-t (Total Daily Energy Expenditure) az aktivitási szint szorzójával (Sedentary: 1.2, Lightly active: 1.375, Moderately active: 1.55, Very active: 1.725, Extra active: 1.9). Ez lesz a 'maintenance' (súlyfenntartó) kalória.
        3.  A cél alapján határozd meg a 'target' kalóriát. Ha a cél a "Fogyás", a 'target' legyen a 'maintenance' - 500 kcal. Ha a cél "Izomépítés", a 'target' legyen a 'maintenance' + 300 kcal. Más célok esetén a 'target' legyen egyenlő a 'maintenance' értékkel. A target kalória ne legyen 1200 kcal alatt.

        A válaszod kizárólag a megadott JSON séma szerint add vissza, egész számokra kerekítve. Ne fűzz hozzá semmilyen magyarázatot.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: caloricNeedsSchema,
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as CaloricNeeds;
    } catch (error) {
        console.error("Error calculating caloric needs:", error);
        throw new Error("Nem sikerült kiszámolni a kalóriaszükségletet.");
    }
};

export const generateMealPlan = async (profile: UserProfile, dietaryProfile: DietaryProfile, targetCalories: number): Promise<MealPlan> => {
  const prompt = `
    Viselkedj mint egy profi táplálkozási szakértő. Generálj egy változatos, 7 napos étkezési tervet egy felhasználó számára a következő adatok alapján:
    - Fittségi cél: ${profile.goal}
    - Étrend típusa: ${dietaryProfile.preference}
    - Kerülendő ételek / Allergiák: ${dietaryProfile.allergies || 'Nincs megadva'}
    - Napi kalóriacél: Körülbelül ${targetCalories} kcal. A napi összesített kalóriának nagyon közel kell lennie ehhez az értékhez (+/- 50 kcal eltérés megengedett).

    A terv legyen tápláló, kiegyensúlyozott (megfelelő makrotápanyag-aránnyal) és támogassa a felhasználó fitnesz céljait.
    Minden napra javasolj reggelit, ebédet, vacsorát és valamilyen egészséges nassolnivalót.
    Az ételek legyenek egyszerűen elkészíthetők, hétköznapi hozzávalókból. A leírás tartalmazza a főbb összetevőket.
    Nagyon fontos: Minden egyes étkezéshez ('breakfast', 'lunch', 'dinner', 'snacks') és a nap végösszegéhez ('dailyTotalCalories') is számold ki és add meg a becsült kalóriaértéket!
    A válasz kizárólag a megadott JSON séma szerint történjen. A nyelv legyen magyar. Ne adj hozzá semmilyen magyarázó szöveget a JSON-on kívül.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: mealPlanSchema,
      }
    });
    
    const jsonString = response.text.trim();
    const plan = JSON.parse(jsonString);
    return plan as MealPlan;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new Error("Nem sikerült legenerálni az étkezési tervet. Kérlek, próbáld újra később.");
  }
};


export const createChat = (profile: UserProfile): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `Te egy segítőkész és motiváló fitnesz asszisztens vagy. A neved 'FitBot'. A célod, hogy támogasd a felhasználót, akinek a neve ${profile.name}, az edzési céljai elérésében. A célja: ${profile.goal}. Fittségi szintje: ${profile.level}. Légy bátorító, empatikus, és soha ne ítélkezz. Ha a felhasználó kihagy egy edzést, mutass megértést, és ahelyett, hogy az okokról faggatnád, ajánlj fel proaktívan egy konkrét, könnyebb alternatívát. Például: 'Semmi gond, mindenkinek vannak nehezebb napjai! Mit szólnál egy 15 perces frissítő jógához vagy egy könnyed sétához? A lényeg a mozgás öröme.' Az alternatívák legyenek egyszerűek, rövidek, és eszközigénytelenek, hacsak a felhasználó mást nem kér. A válaszaid legyenek rövidek és lényegretörőek. A nyelv legyen magyar.`,
        },
    });
};

export const generateExerciseImage = async (exerciseName: string): Promise<string> => {
  const prompt = `Create a minimalist, black and white, anatomical line drawing showing the correct form for the "${exerciseName}" exercise. Focus on clear muscle outlines. The background must be solid white. No colors, shadows, or text. Side view.`;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated.");
    }
  } catch (error) {
    console.error(`Error generating image for "${exerciseName}":`, error);
    throw new Error("Nem sikerült képet generálni a gyakorlathoz.");
  }
};

export const generateExerciseVideo = async (exerciseName: string): Promise<any> => {
    const prompt = `Create a high-quality, cinematic 4k video of a professional fitness instructor demonstrating the "${exerciseName}" exercise. The video should have smooth, slow-motion details to emphasize proper form and muscle engagement. Use dynamic camera angles, primarily a clear side-view, to showcase the full range of motion. The setting is a modern, minimalist gym with bright, clean studio lighting and a simple, non-distracting background. The focus must be entirely on the precise, controlled execution of the movement.`;
    try {
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
            }
        });
        return operation;
    } catch (error) {
        console.error(`Error generating video for "${exerciseName}":`, error);
        throw new Error("Nem sikerült elindítani a videógenerálást.");
    }
};

export const generateExerciseGif = async (exerciseName: string): Promise<any> => {
    const prompt = `Create a short, 4-second, seamlessly looping video of a fitness instructor demonstrating the "${exerciseName}" exercise. The video should be silent and focus on a clear, repeatable motion from a side view. The background should be plain and non-distracting, like in a studio.`;
    try {
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
            }
        });
        return operation;
    } catch (error) {
        console.error(`Error generating GIF for "${exerciseName}":`, error);
        throw new Error("Nem sikerült elindítani a GIF generálását.");
    }
};

export const getVideosOperationStatus = async (operation: any): Promise<any> => {
    try {
        const updatedOperation = await ai.operations.getVideosOperation({ operation: operation });
        return updatedOperation;
    } catch (error) {
        console.error("Error polling video operation status:", error);
        throw new Error("Nem sikerült lekérdezni a videó állapotát.");
    }
};

export const getExerciseTips = async (exerciseName: string, fitnessLevel: FitnessLevel): Promise<string> => {
  const prompt = `
    Viselkedj mint egy tapasztalt személyi edző.
    Adj egyetlen, rövid, de nagyon hasznos tippet a "${exerciseName}" nevű gyakorlathoz.
    A tipp legyen kifejezetten egy "${fitnessLevel}" szintű felhasználó számára releváns.
    Például egy kezdőnek a helyes formára, egy haladónak a teljesítményfokozásra fókuszálj.
    A válaszod kizárólag a tipp szövege legyen, mindenféle bevezető vagy extra formázás nélkül. Legyen tömör és könnyen érthető. A nyelv legyen magyar.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const tip = response.text;
    if (!tip) {
        throw new Error("A modell nem adott vissza érvényes tippet.");
    }
    return tip.trim();
  } catch (error) {
    console.error(`Error generating tip for "${exerciseName}":`, error);
    throw new Error("Nem sikerült tippet generálni a gyakorlathoz.");
  }
};