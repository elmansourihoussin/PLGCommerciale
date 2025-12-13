<!-- Copilot / AI Agent instructions for the PLGCommerciale Angular app -->
# PLGCommerciale — AI Assistant Instructions

Purpose: quick, actionable guidance so an AI coding agent can be immediately productive in this repository.

- **Big picture:** This is a small Angular 20 single-page app organized by feature (standalone components). Routing is defined in `src/app/app.routes.ts` and the app uses `provideRouter(routes)` in `src/app/app.config.ts`.
- **State & persistence:** Services under `src/app/core/services` use Angular `signal` for state and persist data to `localStorage` (e.g. `AuthService` uses `localStorage.getItem('currentUser')`, `ClientService` uses `localStorage` for `clients`). There is no backend integration in the codebase—services provide mocked data and local persistence.
- **Auth & protection:** The `authGuard` (in `src/app/core/guards/auth.guard.ts`) uses `inject()` to get `AuthService` and redirects unauthenticated users to `/auth/login`.
- **Lazy-loading / layout:** Routes use `loadComponent()` to lazy-load standalone components. The root layout is `src/app/shared/components/layout.component` (loaded at the root route) and individual feature components live in `src/app/features/*`.

Key developer workflows
- Start dev server: `npm start` (runs `ng serve`) — see `package.json` `scripts.start`.
- Build for production: `npm run build` (runs `ng build`).
- There are no automated tests in the repo; if you add tests, follow Angular CLI conventions and update `package.json`.

Conventions & patterns to follow
- Standalone components: Most components are `standalone: true` and import `CommonModule`, `FormsModule`, etc. Prefer adding new UI as standalone components where appropriate (see `src/app/features/*`).
- Signals for state: Services expose `signal`-backed state as readonly properties (e.g., `this.clientsSignal.asReadonly()`); update state via `update` or `set` on the local signal, then persist to `localStorage` if the service does so.
- Local persistence: Expect mock data in services and `localStorage` as the canonical local store. When changing a service's storage key or shape, update all callers and example mock data in the same file.
- Router usage: Routes are defined with `loadComponent` (no modules); guards are simple `CanActivateFn` functions using `inject`.
- Date handling: services convert stored date strings back to `Date` objects when loading (see `ClientService` / `InvoiceService`). Keep that pattern when adding new persisted types.

Integration points & dependencies
- Angular 20 (see `package.json`) — use Angular CLI (`ng`) for generation and builds.
- Tailwind CSS is configured (`tailwind.config.js`), and components use Tailwind utility classes and a small set of app-specific CSS classes in `src/global_styles.css`.
- No external backend or API URLs are present — adding backend integration should introduce a dedicated HTTP service and a clear migration of localStorage-backed mocks to remote calls.

Examples (copy/paste friendly)
- Router example (lazy load):
  - `src/app/app.routes.ts` uses `loadComponent(() => import('./features/invoices/invoice-list.component').then(m => m.InvoiceListComponent))`.
- Signal + localStorage pattern:
  - `src/app/core/services/client.service.ts`: loads `clients` from storage, maps date fields to `Date`, sets `clientsSignal`, and writes back with `localStorage.setItem('clients', JSON.stringify(...))`.
- Auth example:
  - `src/app/core/services/auth.service.ts` stores `currentUser` in `localStorage` and exposes `isAuthenticated()` and `currentUser` readonly signal.

When editing code, prefer small, focused changes. Document any data-shape changes where services persist to `localStorage` (update mock data and conversion logic together).

If anything in this file is unclear or you want more specifics (tests, CI, or an example HTTP integration), tell me which area to expand and I will update this document.
