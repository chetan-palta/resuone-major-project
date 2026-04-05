# Deploying Frontend to Vercel

### Prerequisites
- Deploy the backend first so you have your Railway URL!
- Ensure your code is pushed to a GitHub repository.

### Steps
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
   - Expand **Framework Preset** and ensure it accurately detects **Vite**.
   - Expand **Root Directory** and type **`frontend`** (if your repo contains both folders). If Vercel correctly sets the root to the `frontend` folder, it will find `package.json` and the built-in `vercel.json`.
5. Expand **Environment Variables** and add the following:
   - Name: `VITE_API_URL`
   - Value: `https://your-railway-app-url.up.railway.app` (replace with your ACTUAL Railway URL)
6. Click **Deploy**.

Vercel will build your frontend using `npm run build` and output it to the `dist/` directory.

**Expected Final URL:** Vercel will provide a URL ending in `.vercel.app`. Add this exact URL to your Railway backend's `FRONTEND_URL` variable so CORS is successfully permitted!
