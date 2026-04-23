# Project Guidelines

## Code Style
- Frontend is a Next.js App Router app under `src/app`.
- Prefer existing patterns in pages like `src/app/(Admin)/Admin/page.jsx` and components in `src/components`.
- Use TypeScript where the file is already `.ts`/`.tsx` (e.g. `src/app/(Admin)/Admin/tasks/page.tsx`, `src/components/navbar.tsx`), otherwise keep the existing JS/JSX.
- Follow the current Tailwind + app/globals.css setup; do not introduce new styling systems.

## Architecture
- Frontend: Next.js 16 App Router in `src/app`, with route groups `(Admin)`, `(Head)`, `(Intern)` and API routes in `src/app/api`.
- State: Redux Toolkit with persistence; follow patterns in `src/redux` and the example store snippet in README rather than creating new state libraries.
- Backend AI service: FastAPI app in `InternHUB/app.py` exposing `/api/v0/*` endpoints for the InternHub text-to-SQL chatbot.
- Data/infra: Hasura GraphQL Engine and Superset/Postgres via `docker-compose.yml` and `Dockerfile`.

## Build and Test
- Install JS deps with `npm install` in the workspace root.
- Run the Next.js dev server with `npm run dev`.
- To run frontend and the FastAPI chatbot together, use `npm run all` (runs Next dev and `python InternHUB/app.py` concurrently).
- Build the Next.js app with `npm run build` and start with `npm start`.
- For Hasura/Postgres/Superset stack, use `docker compose up -d` after ensuring `docker-compose.yml` is present (see README for the curl command that retrieves Hasura's compose file).
- There are no explicit test scripts configured; if adding tests, keep commands under `npm test` or `npm run lint`-style scripts.

## Conventions
- For new API routes under `src/app/api`, mirror existing route patterns and error handling from nearby files (e.g. auth, tasks, attendance routes).
- Keep environment configuration in `.env` files and use `process.env.*` in Next.js and `os.getenv` in the FastAPI app; avoid hard-coding secrets or URLs.
- When updating Redux auth or persistence behavior, align with patterns in `src/redux/authSclice.js` and the README's `redux-persist` store example.
- When integrating with the AI chatbot from the Next.js app, treat `InternHUB/app.py` as an external service reachable over HTTP; do not import Python code into the Node/Next side.
- Prefer linking to external Next.js or Hasura docs in comments/README updates instead of duplicating large how-to sections.