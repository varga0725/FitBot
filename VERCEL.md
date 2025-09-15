# Deploying FitBot to Vercel

Vercel is an excellent platform for deploying modern frontend applications like FitBot. It offers a seamless Git-based workflow, automatic builds, and easy management of environment variables.

## Prerequisites

*   A [Vercel](https://vercel.com/signup) account.
*   A GitHub, GitLab, or Bitbucket account.
*   Your FitBot project code pushed to a repository on one of the above Git providers.
*   A **Google Gemini API Key** obtained from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Step-by-Step Deployment

### Step 1: Push Your Project to a Git Repository

If you haven't already, make sure your local FitBot project is pushed to a remote repository on GitHub, GitLab, or Bitbucket.

### Step 2: Import Project on Vercel

1.  Log in to your Vercel dashboard.
2.  Click the **"Add New..."** button and select **"Project"**.
3.  In the "Import Git Repository" section, find your FitBot repository and click **"Import"**. If you don't see it, you may need to configure the Vercel app on your Git provider to grant access to that repository.

### Step 3: Configure Your Project

Vercel will automatically analyze your project. You need to configure the environment variable for the Gemini API.

1.  **Framework Preset:** Vercel will likely detect this as a **Vite** project, which is a suitable configuration. You can leave this as is.

2.  **Build and Output Settings:** The default settings should work correctly as Vercel's static site hosting is robust. The project doesn't have a build step, so you can leave these settings as their defaults.

3.  **Environment Variables (Crucial Step):**
    This is the most important step. You must provide your Google Gemini API key here to make it securely available to the application.

    *   Expand the **"Environment Variables"** section.
    *   Add a new variable with the following details:
        *   **Name:** `API_KEY`
        *   **Value:** Paste your Google Gemini API key here (it usually starts with `AIza...`).

    Ensure the name is exactly `API_KEY` as this is what the application code expects (`process.env.API_KEY`). Vercel automatically makes these variables available under `process.env`.

### Step 4: Deploy

Once the environment variable is set, click the **"Deploy"** button.

Vercel will now start the deployment process. It will clone your repository, apply the environment variable, and deploy your site to its global CDN.

### Step 5: All Done!

After a minute or two, the deployment will complete. Vercel will provide you with a unique URL (e.g., `fitbot-your-account.vercel.app`) where your live application is running. Congratulations, you've successfully deployed FitBot!
