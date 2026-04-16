# ColorGuess 🎨

A multiplayer color-guessing game for art workshops and gallery events.

---

## Setup (about 10 minutes total)

You'll need two things: a Cloudflare Worker (holds your token securely) and a GitHub repo (stores the scores file). Both are free.

---

### Part 1 — GitHub repo

1. Create a **new public** GitHub repository (e.g. `colorguess`)
2. Upload `index.html`, `worker.js`, and `scores.json` (the empty `[]` file)
3. Enable GitHub Pages: **Settings → Pages → Source: main branch → / (root) → Save**

Your game will be at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

---

### Part 2 — Cloudflare Worker

**Step 1: Create a free Cloudflare account**
Go to cloudflare.com and sign up. No credit card needed.

**Step 2: Create a Worker**
- In the dashboard, go to **Workers & Pages → Create → Create Worker**
- Give it a name like `colorguess`
- Click **Deploy** (ignore the default code for now)
- Click **Edit code**, paste the entire contents of `worker.js` into the editor
- At the top of the pasted code, fill in your GitHub username and repo name:
  ```javascript
  const GH_OWNER = 'jsmith';      // your GitHub username
  const GH_REPO  = 'colorguess';  // your repo name
  ```
- Click **Deploy**

**Step 3: Add your GitHub token as a secret**
- Go back to your Worker's settings page
- Click **Settings → Variables → Add variable**
- Name: `GITHUB_TOKEN`
- Value: a GitHub Personal Access Token (see below for how to get one)
- Click **Encrypt** then **Save**

That's it — your token is now stored securely inside Cloudflare, never visible in any file.

**Step 4: Copy your Worker URL**
It looks like `https://colorguess.YOUR-NAME.workers.dev`

---

### Part 3 — Connect the game to the Worker

Open `index.html` and find this near the top of the script section:

```javascript
const WORKER_URL = 'YOUR_WORKER_URL';
```

Replace it with your actual Worker URL:

```javascript
const WORKER_URL = 'https://colorguess.YOUR-NAME.workers.dev';
```

Push the updated `index.html` to GitHub. Done!

---

### Getting a GitHub Personal Access Token

1. github.com → profile photo → **Settings**
2. Scroll down to **Developer settings → Personal access tokens → Tokens (classic)**
3. **Generate new token (classic)**
4. Name it `ColorGuess Worker`, set expiry to 7 days
5. Check **`public_repo`** scope only
6. Generate and copy the token (starts with `ghp_`)

Paste it into Cloudflare as described in Part 2 Step 3. Because it goes into Cloudflare's encrypted secret vault and not into any file, GitHub will never scan it or revoke it.

---

## Running the event

- Announce the **room code** to students (e.g. `ART2025`)
- Share the GitHub Pages URL
- Open the Leaderboard tab on a laptop/TV and hit **Refresh ↻** to show standings live
- Scores are stored in `scores.json` in your repo — you can open that file after the event to export results

## How it works

```
Student's phone  →  Cloudflare Worker  →  scores.json in GitHub
                 ←  (scores back)      ←
```

The Worker is the middleman that holds your GitHub token privately. The game never touches the token directly, so GitHub never sees it in any file.
