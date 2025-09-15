# Deploying FitBot to Vercel

Vercel is an excellent platform for deploying modern frontend applications like FitBot. With the new `vercel.json` configuration file in this project, deployment is now simpler than ever.

## Prerequisites

*   A [Vercel](https://vercel.com/signup) account.
*   A GitHub, GitLab, or Bitbucket account.
*   Your FitBot project code pushed to a repository on one of the above Git providers.
*   A **Google Gemini API Key** obtained from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Step-by-Step Deployment

### Step 1: Push Your Project to a Git Repository

Ensure all the latest project files, including `vercel.json` and `vercel-build.sh`, are pushed to your remote Git repository.

### Step 2: Import Project on Vercel

1.  Log in to your Vercel dashboard.
2.  Click the **"Add New..."** button and select **"Project"**.
3.  Import your FitBot Git repository.

### Step 3: Configure Environment Variable (Crucial Step)

Vercel will automatically detect the build settings from your `vercel.json` file. The only manual configuration you need to do is to provide your API key.

*   Expand the **"Environment Variables"** section.
*   Add a new variable with the following details:
    *   **Name:** `API_KEY`
    *   **Value:** Paste your Google Gemini API key here (it usually starts with `AIza...`).

**That's it!** You do not need to override the Build Command or Output Directory in the Vercel UI anymore. The `vercel.json` file handles this for you.

### Step 4: Deploy

Click the **"Deploy"** button.

Vercel will now use the instructions from `vercel.json` to run the `vercel-build.sh` script. This script creates a `public` directory, places the generated `env.js` file inside it along with all other application files, and Vercel serves this `public` directory as your live site.

After a minute or two, the deployment will complete, and your FitBot application will be live!
