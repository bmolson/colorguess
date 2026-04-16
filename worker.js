// ColorGuess Leaderboard Worker
// Deploy at: workers.cloudflare.com
// Add your GitHub token as a secret named GITHUB_TOKEN (see README)

const GH_OWNER = 'YOUR_GITHUB_USERNAME';  // e.g. 'jsmith'
const GH_REPO  = 'YOUR_REPO_NAME';        // e.g. 'colorguess'
const GH_FILE  = 'scores.json';

const GH_API = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_FILE}`;

export default {
  async fetch(request, env) {

    // Allow the game page to call this worker from any origin
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const ghHeaders = {
      'Authorization': `token ${env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ColorGuess-Worker',
    };

    // GET — return all scores
    if (request.method === 'GET') {
      const res = await fetch(GH_API, { headers: ghHeaders });
      if (!res.ok) return new Response('[]', { headers: { ...cors, 'Content-Type': 'application/json' } });
      const data = await res.json();
      const scores = JSON.parse(atob(data.content.replace(/\n/g, '')));
      return new Response(JSON.stringify(scores), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // POST — append a new score
    if (request.method === 'POST') {
      const entry = await request.json();

      // Validate — must have name, room, score
      if (!entry.name || !entry.room || typeof entry.score !== 'number') {
        return new Response('Invalid entry', { status: 400, headers: cors });
      }
      // Clamp score to valid range
      entry.score = Math.max(0, Math.min(300, Math.round(entry.score)));
      entry.ts = Date.now();

      // Read current scores
      const readRes = await fetch(GH_API, { headers: ghHeaders });
      if (!readRes.ok) return new Response('Read failed', { status: 502, headers: cors });
      const fileData = await readRes.json();
      const scores = JSON.parse(atob(fileData.content.replace(/\n/g, '')));

      // Append, sort, trim to 500
      scores.push(entry);
      scores.sort((a, b) => b.score - a.score);
      const trimmed = scores.slice(0, 500);

      // Write back
      const writeBody = {
        message: `Score: ${entry.name} ${entry.score}`,
        content: btoa(JSON.stringify(trimmed)),
        sha: fileData.sha,
      };
      const writeRes = await fetch(GH_API, {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify(writeBody),
      });

      if (!writeRes.ok) return new Response('Write failed', { status: 502, headers: cors });
      return new Response('OK', { headers: cors });
    }

    return new Response('Method not allowed', { status: 405, headers: cors });
  },
};
