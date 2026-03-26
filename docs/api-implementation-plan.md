# Goal Description
The objective is to structure the API server (`apps/api`) into a professional standard development architecture and set up a smart `axios` configuration with interceptors for robust external API calls.

## Proposed Changes

### Configuration & Setup
- Add `axios` dependency and `@types/axios` (if needed) to `apps/api/package.json`.

---
### API Server Structure Core

#### [NEW] `apps/api/src/app.ts`
- Create the Express application instance here.
- Add global middlewares like `cors()`, `express.json()`, and `express.urlencoded()`.
- Mount the main API routes from `src/routes/index.ts`.
- Add a global error handling middleware.

#### [MODIFY] `apps/api/src/server.ts`
- Refactor the existing `server.ts` to import `app` from `app.ts`.
- Focus solely on starting the server (e.g., `app.listen(port)`) and graceful shutdown logic.

---
### Smart Axios Setup

#### [NEW] `apps/api/src/config/axios.ts`
- Create an exported `axiosInstance`.
- Add **Request Interceptors**: automatically attach standard headers, log outgoing requests, and start timers for profiling.
- Add **Response Interceptors**: handle successful responses seamlessly, intercept errors (like 401s, 403s), and standardize API error parsing (logging detailed info for debugging).

---
### Directory Scaffolding

#### [NEW] `apps/api/src/routes/index.ts`
- Central hub for all route definitions (e.g., `/api/v1/...`).

#### [NEW] `apps/api/src/controllers/`
- Folder to hold HTTP handlers. (Example: `user.controller.ts`, `campaign.controller.ts`).

#### [NEW] `apps/api/src/services/`
- Folder to hold business logic and database interactions. (Example: `facebook.service.ts`).

#### [NEW] `apps/api/src/middlewares/`
- Folder for custom Express middlewares. (Example: `error.middleware.ts`, `auth.middleware.ts`).

#### [NEW] `apps/api/src/utils/`
- Folder for helper functions and common utilities.

## Verification Plan

### Automated Tests
- No automated tests currently exist for the full express app.
- We will verify the build using `pnpm build` in the `apps/api` folder.

### Manual Verification
- Start the server using `pnpm dev` in `apps/api`.
- Ping the root `/` or `/health` endpoint to ensure the server starts properly and accepts requests.
- Verify that standard logging and axios instantiation does not fail on startup.
