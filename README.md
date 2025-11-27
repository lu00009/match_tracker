# Match Tracker

A simple live football score tracker with:
- Node/Express SSE server
- React + Vite client
- Admin panel to create/edit/delete matches
- User view to select a match and see live score

## Project structure
- `server/` Express server exposing REST and SSE endpoints
- `client/` React app (admin and user modes)

## Requirements
- Node.js 18+
- pnpm (recommended) or npm

## Run server
```sh
pnpm -C server install
pnpm -C server run dev
```
Server runs at http://localhost:5000

## Run client
Admin UI (port auto or 5173):
```sh
VITE_ROLE=admin VITE_SERVER_URL=http://localhost:5000 pnpm -C client install
VITE_ROLE=admin VITE_SERVER_URL=http://localhost:5000 pnpm -C client dev
```
User UI (choose another port):
```sh
VITE_ROLE=user VITE_SERVER_URL=http://localhost:5000 VITE_PORT=5174 pnpm -C client dev
```
Open:
- Admin: http://localhost:5173
- User: http://localhost:5174

## API
- `GET /matches` → list matches
- `POST /matches` { team1, team2 } → create match (default score `0 : 0`)
- `PUT /matches/:id` { team1?, team2?, score? } → update; score must be `number : number` (e.g. `2 : 1`)
- `DELETE /matches/:id` → remove match
- `GET /events` → Server-Sent Events (SSE) stream of the full matches array

## Notes
- CORS enabled for development
- SSE reconnect handled by browser; a "LIVE" badge shows when connected
- To secure admin actions, set and validate an `x-admin-token` header (optional)

## Scripts
- Server: `dev`, `build`, `start`
- Client: `dev`, `build`, `preview`

## License
MIT
