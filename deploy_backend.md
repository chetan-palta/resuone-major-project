# Deploying Backend to Railway

### Prerequisites
- Ensure your code is pushed to a GitHub repository.

### Steps
1. Log in to [Railway](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select this repository.
4. Railway might ask to choose a root directory if you deploy the entire monorepo. Ensure you set the root directory to `/backend` in your project settings so it picks up the `railway.json` and `package.json`.
   - Go to Project Settings -> Environment -> **Root Directory** and set it to `/backend`.
5. Add the necessary Environment Variables in the Variables tab:
   - `PORT` = (Railway sets this automatically, but you can set `5000` just in case)
   - `DB_URL` / `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` = your MySQL credentials (if using Railway's MySQL, add a MySQL plugin and reference its variables)
   - `JWT_SECRET` = your secret key
   - `FRONTEND_URL` = the URL you get from Vercel after deploying the frontend
   - `CLIENT_URL` = optionally use this if you want to allow requests from elsewhere
   - Any Google OAuth variables if you're using them.
6. Trigger a deployment. Railway will automatically build the project using `npm run build` and start it with `npm start` based on the configuration provided in `railway.json` and `package.json`.

**Expected Final URL:** Railway will provide a domain ending in `.up.railway.app`. Use this URL as the `VITE_API_URL` for your frontend environment!
