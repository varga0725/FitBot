# FitBot: Personalized Workout & Motivation Partner

FitBot is an intelligent web application designed to be your all-in-one fitness companion. It leverages the power of the Google Gemini API to generate highly personalized workout and meal plans, provides AI-driven motivation, and helps you visualize and track your progress in a gamified and engaging way.

![FitBot Screenshot](https://storage.googleapis.com/aistudio-o-prd-public/gallery/55905141c2c34c568ac35f617d91350a/thumbnail.gif)

## ✨ Core Features

*   **Personalized Workout Plans:** Generates a complete 7-day workout schedule based on your fitness level, goals, available equipment, and personal biometrics.
*   **Quick Workouts:** Creates intense, 15-20 minute "flash workouts" for when you're short on time but still want to be active.
*   **AI-Generated Meal Plans:** Calculates your daily caloric needs and creates a full 7-day meal plan tailored to your dietary preferences and fitness goals.
*   **Motivational AI Chatbot:** Chat with 'FitBot', your supportive AI partner. Get encouragement, ask fitness-related questions, and receive proactive suggestions if you miss a workout.
*   **Dynamic Exercise Visualizer:**
    *   **Images:** Generates minimalist anatomical drawings for any exercise to demonstrate proper form (`imagen-4.0-generate-001`).
    *   **Videos & GIFs:** Creates high-quality video demonstrations or seamlessly looping GIFs for exercises on demand (`veo-2.0-generate-001`).
    *   **Pro Tips:** Get a concise, level-appropriate tip for any exercise from an AI "personal trainer".
*   **Comprehensive Progress Tracking:**
    *   **Workout Calendar:** Visually track your completed workout days.
    *   **Insightful Charts:** Analyze your workout frequency, weekly distribution, and overall progress over time.
    *   **Goal Setting:** Set weekly or monthly workout goals to stay motivated.
*   **Gamification & Achievements:**
    *   **Streaks:** Build and maintain workout streaks for consistency.
    *   **Badges:** Unlock achievements for milestones like your first workout, completing 25 workouts, or hitting a 7-day streak.
*   **Hydration Tracking:** Easily log your daily water intake with a simple, visual tracker.
*   **Customizable Themes:** Personalize the app's appearance with multiple color themes.
*   **Optional Reminders:** Enable browser notifications to get a friendly reminder on days you haven't logged a workout.

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **AI Engine:** Google Gemini API
    *   **Text & Logic:** `gemini-2.5-flash`
    *   **Image Generation:** `imagen-4.0-generate-001`
    *   **Video Generation:** `veo-2.0-generate-001`
*   **Data Visualization:** Chart.js with `react-chartjs-2`
*   **Client-Side Storage:** Browser `localStorage` for session persistence.
*   **No Backend:** This is a fully client-side application.

## 🚀 Getting Started

To run FitBot locally, follow these steps:

### Prerequisites

*   A modern web browser.
*   A code editor like VS Code with a live server extension (e.g., "Live Server").
*   A **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Running

This project is configured as a static site and does not require a traditional `npm install` or build step to run.

1.  **Clone or download the repository:**
    ```bash
    git clone https://github.com/your-username/fitbot.git
    cd fitbot
    ```

2.  **Set up your API Key:**
    The application is designed to be deployed on a platform where environment variables can be set. To run it locally, you must manually create a configuration file.

    *   Create a new file named `env.js` in the root of the project.
    *   Add the following content to `env.js`, replacing `YOUR_GOOGLE_GEMINI_API_KEY` with your actual key:
        ```javascript
        window.process = {
          env: {
            API_KEY: 'YOUR_GOOGLE_GEMINI_API_KEY'
          }
        };
        ```
    *   Add a script tag to your `index.html` file to include this new file. Add it **before** the main `index.tsx` script:
        ```html
        <!-- index.html -->
        </head>
        <body class="bg-gray-900 text-gray-200">
          <div id="aurora-background"></div>
          <div id="root"></div>
          <script src="/env.js"></script> <!-- Add this line -->
          <script type="module" src="/index.tsx"></script>
        </body>
        </html>
        ```

3.  **Start a local server:**
    *   Using the "Live Server" extension in VS Code, right-click on `index.html` and select "Open with Live Server".
    *   Alternatively, use a simple command-line server:
        ```bash
        npx serve .
        ```

## ⚙️ How It Works

1.  **Onboarding:** The user is first greeted with a setup form where they input their name, biometrics (age, gender, weight, height), fitness level, primary goal, and available equipment.
2.  **Plan Generation:** This profile is sent to the Gemini API, which generates a personalized 7-day JSON-structured workout plan.
3.  **Dashboard:** The user is then taken to the main dashboard, which defaults to the 'Workout Plan' view.
4.  **Interaction:** From here, the user can:
    *   View daily workouts and see exercise details.
    *   Log completed workouts, which updates their progress, streaks, and achievements.
    *   Switch to the 'Meal' tab to generate a nutrition plan.
    *   Switch to the 'Progress' tab to view their stats, calendar, and set goals.
    *   Chat with the FitBot AI for motivation or questions.
5.  **Persistence:** All user data, including the profile, plans, and logs, is stored in the browser's `localStorage`. This means the user's session is saved, and they can pick up where they left off without needing a backend or user accounts.

## 📄 License

This project is licensed under the MIT License.
