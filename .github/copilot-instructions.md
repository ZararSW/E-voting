# Copilot instructions for this repo

Purpose: Help an AI coding assistant be immediately productive in the University Clubs E-Voting project.

Key files and big-picture
- Frontend: `frontend/` — React app built with react-scripts. Uses Static Web Apps authentication endpoints (`/.auth/login/*`, `/.auth/me`) and calls backend at `/api/*`. See `frontend/src/App.js` and `frontend/src/api.js`.
- Backend: `backend/` — Azure Functions (Node.js). Each function is in `backend/api/<name>/index.js` with `function.json` bindings. Cosmos DB helper is at `backend/cosmosClient.js`.
- Database: Cosmos DB (SQL/Core API via `@azure/cosmos`) — containers: `elections`, `votes`. Connection string env var: `COSMOS_CONNECTION_STRING`. See `backend/local.settings.json`, `.env.example`.
- Deployment: GitHub Actions workflow: `.github/workflows/deploy-to-azure.yml` — uses `Azure/static-web-apps-deploy` to deploy frontend and `backend/api` as functions. Optional steps provision Cosmos DB via `az` CLI when `AZURE_CREDENTIALS` secret is provided.

Service boundaries and dataflow
- Auth: Static Web Apps performs OAuth and injects authenticated principal in requests via header `x-ms-client-principal` (base64 JSON). Backend functions check this header for user identity. See `backend/api/vote/index.js`.
- Elections data: Stored as documents in `elections` container. Each election doc contains `id`, `title`, `candidates: [{id,name}]`.
- Votes data: Stored in `votes` container partitioned by `electionId`. Each vote document contains `id` (combined electionId_userId), `electionId`, `candidateId`, `userId`.
- Enforcement: One vote per user per election is enforced by querying `votes` for existing records before inserting. See `backend/api/vote/index.js`.

Developer workflows (what works here)
- Local backend: Use Azure Functions Core Tools (not included) and `local.settings.json`; set `COSMOS_CONNECTION_STRING` in `local.settings.json` or environment. Run `func start` in `backend` to run functions locally.
- Frontend local: `cd frontend && npm ci && npm start` to run React dev server.
- Seeding sample data: `node backend/seed.js` (requires COSMOS connection env).
- Deploy: Push to `main` branch. Configure repo secrets:
  - `AZURE_STATIC_WEB_APPS_API_TOKEN` (if deploying to an existing Static Web App),
  - `AZURE_CREDENTIALS` (optional, for provisioning Cosmos DB via CLI — service principal JSON),
  - `SWA_NAME` (optional, name used to set app settings)
  The workflow will build and deploy the frontend and functions and can set app settings for Cosmos DB.

Project-specific conventions and patterns
- Functions location: place functions under `backend/api/<name>/` so the Static Web Apps deploy action picks them up.
- Auth handling: backend relies on Static Web Apps header `x-ms-client-principal` (base64 JSON). When running locally, `x-user-id` or `x-user-email` headers can be used for testing.
- Partition keys: elections use `/id`, votes use `/electionId`. See `backend/cosmosClient.js`.
- Admins: simple email-based admin list via `ADMIN_EMAILS` environment variable (comma-separated). Admin checks are done in-function by reading the authenticated user's email.

What to change carefully
- If you change container names or partition keys, update `backend/cosmosClient.js`, `local.settings.json`, `.env.example` and the GitHub workflow.
- Changing auth model: If you move off Static Web Apps auth, update how user identity is extracted in `backend/api/vote/index.js` and other functions.

Examples (call patterns)
- Get elections: GET /api/elections
- Create election (admin): POST /api/elections { title: "...", candidates: [{id:'c1',name:'A'}] }
- Vote: POST /api/vote { electionId: '...', candidateId: 'c1' }
- Results: GET /api/results/{electionId}

Quick debugging tips
- Missing identity in functions: inspect request headers for `x-ms-client-principal`; base64 decode to inspect structure.
- Cosmos DB errors: ensure `COSMOS_CONNECTION_STRING` is set in app settings for Static Web App (workflow uses az CLI to set it if `AZURE_CREDENTIALS` is provided).
- Local dev: use `local.settings.json` to set env values and run `func start` in `backend`.

Files to inspect first
- `frontend/src/App.js` — auth + UI examples
- `frontend/src/api.js` — client-side API wrappers
- `backend/cosmosClient.js` — DB wiring and container names
- `backend/api/vote/index.js` — vote logic and auth extraction
- `.github/workflows/deploy-to-azure.yml` — CI/CD + provisioning steps

If anything here is unclear or you'd like me to expand any section (for example: add explicit admin authorization logic, add email-based admin UI, upgrade polling to server-sent events, or create an ARM template that fully provisions the Static Web App and Cosmos DB), tell me which area to expand and I will iterate.
