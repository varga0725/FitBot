```bash
#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting Vercel build process..."

# 1. Create the output directory that Vercel will serve.
mkdir public

# 2. Create the env.js file from the Vercel environment variable.
# This securely injects the API key into the client-side code.
echo "window.process = { env: { API_KEY: '${API_KEY}' } };" > public/env.js
echo "env.js created successfully."

# 3. Copy all necessary files and directories into the public directory.
# We list them explicitly to avoid including unnecessary files.
cp index.html public/
cp index.tsx public/
cp App.tsx public/
cp types.ts public/
cp metadata.json public/
cp README.md public/
cp VERCEL.md public/
cp vercel.json public/
# Add any other root-level files here if needed in the future.

# Recursively copy the components and services directories.
cp -r components public/
cp -r services public/

echo "All files and directories copied to /public."

# (Optional) List the contents of the public directory for debugging in Vercel logs.
echo "Contents of /public directory:"
ls -R public

echo "Build finished successfully."
```
