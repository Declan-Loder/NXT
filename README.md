# NXT — Creator Community Website

Static multi-page site ready for Netlify + GitHub.

## Pages
- `index.html` — Home
- `tournaments.html` — TEAZERS FC 26 group standings, upcoming events, registration
- `creators.html` — Roster + founder photo
- `collab.html` — Collab board + form
- `shop.html` — Merch + checkout (Netlify Forms)
- `sponsors.html` — Sponsorship packages + enquiry form

## Important files
- `data.js` — **Edit this** to update FC 26 group standings and events
- `styles.css` — Design system
- `app.js` — Cart + tournament rendering
- `nxt-founder.webp` — Founder photo

## How to update tournament stats
1. Open `data.js`
2. Change the player stats in the `groups` object (A, B, C, D)
3. Commit & push to GitHub
4. Netlify auto-deploys in ~1 minute

## Netlify Forms
These forms send submissions to your Netlify dashboard:
- Shop orders → `nxt-order`
- Tournament registration → `nxt-tournament-reg`
- Collab posts → `nxt-collab`
- Sponsor enquiries → `nxt-sponsor`

After first deploy, go to Netlify → Forms and enable email notifications.

## Discord
All community buttons: https://discord.gg/Bxsw3Aam2

## Deploy
1. Upload everything in this folder to a GitHub repo
2. Connect the repo to Netlify
3. Publish directory = root (leave blank)
4. No build command needed
