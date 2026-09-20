# Taklifnoma API

Node >= 22.13 (built-in `node:sqlite`), zero npm dependencies.

## Local
```bash
cd server
cp .env.example .env            # fill ADMIN_PASSWORD_HASH, TOKEN_SECRET, ALLOWED_ORIGIN
node scripts/hash-password.js "your long password"
npm run dev
npm test
```
For local browser testing set `API_BASE = 'http://127.0.0.1:3100'` in `../config.js`
and `ALLOWED_ORIGIN` to the static server origin. Restore the placeholder afterwards.

## Deploy (Hetzner, Debian/Ubuntu)
1. Install Node 22+ and Caddy; `useradd -r taklifnoma`.
2. Copy `server/` to `/opt/taklifnoma/server`, create `.env` (chmod 600, owner taklifnoma).
3. `deploy/taklifnoma.service` -> `/etc/systemd/system/`, `systemctl enable --now taklifnoma`.
4. Append `deploy/Caddyfile.snippet` to `/etc/caddy/Caddyfile` (IP with dashes), `systemctl reload caddy`.
5. Cron `deploy/backup.sh` daily. Firewall: only 22/80/443 open.
6. Put `https://<ip-dashes>.sslip.io` into `../config.js` `API_BASE`, redeploy Vercel.

## Endpoints
| Method | Path | Auth |
|---|---|---|
| GET | /api/invitation | public |
| POST | /api/wishes | public, rate-limited |
| POST | /api/login | rate-limited |
| PUT | /api/invitation | admin |
| DELETE | /api/wishes/:id | admin |
| POST | /api/reset | admin |
