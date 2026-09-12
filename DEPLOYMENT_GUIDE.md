# GeetHub Production Deployment Guide

This guide details how to deploy GeetHub so that **all 174,000+ songs and chords** are available globally with zero missing database errors.

---

## The Root Cause of Previous Deployment Failure

When deploying on **Vercel** or **Netlify**:
1. Next.js API routes run in serverless containers (AWS Lambda).
2. Serverless functions have a **strict 250 MB uncompressed limit**.
3. Large local SQLite files (like the old 1.1 GB database) **cannot be bundled** into Vercel Lambdas.
4. When deployed, the database file was missing in the serverless environment, causing `getDb()` to return `null` and fall back to an empty `songs.json` (`[]`), resulting in **0 songs displayed**.

---

## Solution: Turso (LibSQL Serverless SQLite) — Recommended for Vercel

**Turso** is SQLite engineered specifically for serverless platforms like Vercel. 
- **Free tier**: 9 GB database storage (GeetHub is ~480 MB), 500 databases, and 1 billion row reads per month.
- **Latency**: Sub-10ms queries worldwide.
- **Code integration**: GeetHub is already configured with `@libsql/client` in `src/lib/dbSync.ts`.

---

### Step-by-Step Vercel + Turso Deployment

#### Step 1: Install the Turso CLI
Open your terminal and install the Turso CLI:
```bash
# On macOS via Homebrew:
brew install tursodatabase/tap/turso

# Or via curl:
curl -sSfL https://get.tur.so/install.sh | bash
```

#### Step 2: Sign Up / Log In
```bash
turso auth signup
# or
turso auth login
```

#### Step 3: Create a Turso Database
```bash
turso db create geethub-prod
```

#### Step 4: Upload your GeetHub Database
Dump your local SQLite database and import it into Turso:
```bash
# In the Geethub project root:
npm run db:dump

# Import into your Turso database:
turso db shell geethub-prod < geethub_dump.sql
```

#### Step 5: Get your Database URL & Auth Token
```bash
# Get your database URL:
turso db show geethub-prod --url
# Example output: libsql://geethub-prod-youruser.turso.io

# Create an auth token:
turso db tokens create geethub-prod
# Example output: eyJhbGci...
```

#### Step 6: Add Environment Variables in Vercel
Go to your project dashboard on [Vercel](https://vercel.com) -> **Settings** -> **Environment Variables**:

| Variable Name | Value |
| :--- | :--- |
| `TURSO_DATABASE_URL` | `libsql://geethub-prod-youruser.turso.io` |
| `TURSO_AUTH_TOKEN` | `eyJhbGci... (your generated token)` |

Click **Save** and trigger a **Redeploy** on Vercel.

That's it! When Vercel builds and runs your project, `src/lib/dbSync.ts` will automatically connect to Turso. All 174,000+ songs will be live, fast, and searchable.

---

## Alternative: Persistent Container Deployment (Railway / Render)

If you do not want to use Turso and prefer keeping the raw SQLite file (`geethub_master.db`) on disk without external database services:

### Deploying on Railway:
1. Push your repository to GitHub.
2. Go to [railway.app](https://railway.app) -> **New Project** -> **Deploy from GitHub repo**.
3. Add a **Persistent Volume** in Railway settings mounted to `/app` (so `geethub_master.db` persists across redeploys).
4. Start command: `npm run start`.
5. Railway runs a real Node.js container with persistent disk access, so `node:sqlite` runs locally with zero configuration.

---

## Local Development
For local development, no cloud setup is needed! 
When `TURSO_DATABASE_URL` is omitted, GeetHub automatically connects to your local `geethub_master.db` via high-speed `node:sqlite`.

```bash
npm run dev
```
Runs locally at: `http://localhost:3000`
