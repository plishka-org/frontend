# Plishka

Full-featured e-commerce frontend for a custom wood products workshop, built with React and TypeScript and integrated with a REST API.

Live application: [https://plishka.up.railway.app](https://plishka.up.railway.app)

## Overview

Plishka is a team-built e-commerce application for presenting and selling custom wood products. The frontend consumes a backend REST API and supports both a customer-facing storefront and role-protected administration functionality.

The storefront covers product discovery, account management, favorites, cart and order flows, while the administration area provides tools for managing products, categories, content, reviews, clients, orders, callback requests, and shop settings.

## Key Features

- Registration with email verification, login and logout, access-token refresh, password recovery, and email-change verification.
- User account management for profile data, email, password, account deletion, order history, and callback-request history.
- Product catalog backed by the REST API, with category filtering, A–Z/Z–A and price sorting, pagination, URL/session filter persistence, and local fallback content.
- Product detail pages with image and video media, fullscreen navigation, related products, and recently viewed products.
- Authenticated favorites with optimistic UI updates, loading/error states, pagination, and a login prompt for guests.
- Shopping cart with quantity limits, totals, guest persistence in `localStorage`, server-side state for authenticated users, and guest-cart merging after authentication.
- Multi-step checkout with authentication, validated recipient details, idempotent order creation, cart cleanup, and success feedback.
- Read-only public reviews with image/video galleries and fallback content when the API is unavailable.
- Authenticated callback request form with validation and submission feedback.
- Role-protected administration area for:
  - product and media CRUD, homepage selection/reordering, bulk deletion, price updates, and category reassignment;
  - category CRUD and product-aware deletion strategies;
  - review CRUD, media uploads, primary-media selection, and featured-review management;
  - client search plus individual/bulk ban and unban actions;
  - order search, sorting, pagination, and detail views;
  - callback-request search, sorting, and pagination;
  - About/Contacts content, social links, notification email, and shop-mode settings.
- Responsive layouts for desktop, tablet, and mobile, with skeletons, empty states, retry actions, validation messages, toasts, and API error handling.

## Tech Stack

### Frontend

- React 19.2
- React DOM 19.2
- TypeScript 5.9
- Vite 8
- SCSS / Sass 1.98
- React IMask 7.6

### API

- REST API
- Native Fetch API through a typed request wrapper
- Bearer access and refresh tokens
- Presigned media upload/download URLs

### Infrastructure

- Multi-stage Docker build
- Caddy 2 static file server with SPA fallback and gzip compression
- GitHub Actions and GitHub Pages
- Railway-compatible container runtime

### Development

- Node.js 22.22.2
- npm with a committed lockfile
- ESLint 9 with TypeScript, React Hooks, and React Refresh rules
- TypeScript project references and strict type checking

## Architecture

The application uses feature-oriented UI composition with React Context providers for cross-cutting state and a dedicated typed API layer:

```text
App routing and providers
          ↓
Pages, layouts, sections, and UI components
          ↓
Feature hooks and context state
          ↓
Store selectors, storage adapters, and utilities
          ↓
Typed services/api modules
          ↓
REST backend
```

Routing is handled in `App.tsx` using the browser location and hash paths. `AuthProvider`, `ShopProvider`, `RecentlyViewedProvider`, and `ToastProvider` own shared application state. API-specific DTO mapping and request behavior remain in `src/services/api` rather than in UI components.

## Project Structure

```text
src/
├── assets/             # Product, brand, gallery, and interface media
├── components/
│   ├── layout/         # Storefront and administration layouts
│   ├── pages/          # Customer and administration screens
│   ├── sections/       # Reusable storefront sections
│   └── icons/          # React icon components
├── config/             # Role configuration
├── data/               # Local fallback content
├── hooks/              # Auth, shop, reviews, recently viewed, and toast state
├── services/api/       # REST client, DTO mapping, and feature API modules
├── store/              # Cart selectors and browser-storage adapters
├── styles/             # Shared SCSS organized by layout, section, and component
├── types/              # Shared domain types
├── ui/                 # Shared modals and toast components
└── utils/              # URL, pricing, and site-variant helpers
```

## API Integration

The shared API client is located in `src/services/api/client.ts`, while domain modules in `src/services/api/` cover authentication, products, favorites, cart, orders, reviews, content, media, and administration endpoints.

`VITE_API_URL` supplies the backend origin at build time. API modules append their own `/api/...` paths, so the value must not end with `/api`. The client:

- serializes plain-object request bodies as JSON;
- attaches bearer access tokens to authenticated requests;
- uses a stable device ID for authentication requests;
- coordinates refresh-token requests and retries one unauthorized request;
- clears local authentication state when refresh fails;
- normalizes API errors through `ApiError`.

Access and refresh tokens are currently stored in browser `localStorage`. No credentials or production secrets are committed to the repository.

## Local Development

Prerequisites:

- Node.js `22.22.2` (see `.nvmrc` and `package.json`)
- npm
- a running compatible backend API

```bash
git clone https://github.com/plishka-org/frontend.git
cd frontend
git switch develop
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

Additional local checks:

```bash
npm run lint
npm run build
npm run preview
```

`npm run build` runs `tsc -b` before creating the production bundle, so it also performs the configured strict TypeScript check.

## Environment Variables

| Variable | Purpose | Default / example |
| --- | --- | --- |
| `VITE_API_URL` | Backend origin used by the REST client. Use the origin only, without `/api`. | `http://localhost:8080` in `.env.example` |
| `VITE_BASE_PATH` | Optional Vite base path for subdirectory deployments. | `/`; GitHub Pages uses `/frontend/` |
| `VITE_ADMIN_DEMO_MODE` | Enables local admin demo data when set to `true` in development mode. | Disabled |
| `PORT` | Runtime port read by Caddy in the production container. | `8080` |

Only variables prefixed with `VITE_` are embedded into the browser bundle. Do not place secrets in them.

## Docker

The Dockerfile installs locked dependencies, builds the Vite application, and copies `dist/` into a Caddy 2 image. `VITE_API_URL` is required as a build argument because Vite embeds it into the client bundle.

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  -t plishka-frontend .

docker run --rm -p 8080:8080 -e PORT=8080 plishka-frontend
```

The Caddy configuration serves static assets, enables gzip compression, and redirects unknown paths to `index.html` for client-side routing.

## CI/CD

`.github/workflows/deploy.yml` runs on pushes to `develop` and through manual dispatch. The workflow:

1. checks out the repository;
2. configures Node.js 22.22.2 with npm caching;
3. installs dependencies with `npm ci`;
4. runs `npm run lint`;
5. runs `npm run build` with the backend URL and GitHub Pages base path;
6. creates `dist/404.html` as an SPA fallback;
7. uploads and deploys the build artifact to GitHub Pages.

The build step includes TypeScript checking. The repository does not currently define an automated test suite.

## Deployment

The live application is available at [https://plishka.up.railway.app](https://plishka.up.railway.app).

The production Docker image serves the compiled application through Caddy and reads the platform-provided `PORT`, which supports the Railway runtime. The repository does not contain a Railway-specific manifest or GitHub Actions deployment job, so Railway project connection and deployment triggers are configured on the platform rather than in this codebase.

Separately, pushes to `develop` are built and deployed to GitHub Pages by the repository workflow described above.

## My Contribution

Git history maps GitHub user [`ProKesha`](https://github.com/ProKesha) to commits authored by Dmytro Popov. The areas below are limited to work supported by those commits:

- Built and refined major storefront UI flows, including the catalog filters and pagination, product cards/details, reviews, About and contact sections, responsive states, and navigation/error pages.
- Implemented the cart state and modal checkout experience, order submission workflow, guest persistence, authentication prompts, and subsequent cart/favorites integration fixes.
- Delivered account management flows for profile validation, email/password changes, account deletion, and authenticated callback requests.
- Prepared and expanded the REST API integration across public content, authentication-aware shop state, favorites, recently viewed products, media, and administrative modules.
- Implemented substantial administration functionality for content/settings, products, categories, reviews, clients, orders, and callback requests, then aligned those screens with evolving API contracts.
- Configured the GitHub Pages deployment workflow and Vite base-path/API settings, and added Railway runtime compatibility fixes.

## Engineering Highlights

- A typed Fetch-based REST client centralizes JSON handling, structured API errors, device identity, bearer authentication, coordinated token refresh, and one-time request retry.
- Cart state supports two persistence models: browser storage for guests and backend state for authenticated users, including automatic guest-cart merging after login.
- Checkout uses server cart data, client-side validation, guarded submission state, an idempotency key, and post-order state cleanup.
- Catalog state combines backend filtering/pagination with client-side price sorting, URL/session persistence, loading skeletons, and local fallback content.
- Product and review media use cached presigned download URLs, while administration uploads media through presigned requests and supports primary-media selection.
- Protected admin routing combines JWT-derived roles with feature-specific API modules for CRUD, search, pagination, bulk actions, and content settings.
- Production delivery includes strict TypeScript builds, a Docker/Caddy SPA image, and an automated GitHub Pages build-and-deploy workflow.

## Screenshots

<!-- TODO: Add real application captures under docs/screenshots/ before linking them here. -->

Recommended captures:

- Home page and product catalog
- Product detail page with media gallery
- Cart and checkout flow
- Administration panel
