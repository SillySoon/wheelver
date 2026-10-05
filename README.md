# Wheelver

A collection website for Hot Wheels collectors. Log in with Discord, create collections and track every car you own, one entry per physical copy.

## Stack

- **Backend:** Node 24, TypeScript, Express 5, Mongoose 9 (MongoDB)
- **Auth:** Discord OAuth via Passport, sessions stored in MongoDB
- **Views:** EJS templates with plain JavaScript in `public/`
- **Validation:** zod
- **Tests:** vitest + supertest against an in-memory MongoDB

## Getting started

```bash
cp .env.example .env   # fill in the values
npm install
npm run dev            # http://localhost:3000
```

Or with Docker:

```bash
docker compose up -d --build
```

### Environment variables

| Variable               | Description                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| `PORT`                 | Port of the dev server (Docker always uses 3000 internally)             |
| `MONGODB_URI`          | MongoDB connection string                                               |
| `DISCORD_CLIENT_ID`    | Discord application client ID                                           |
| `DISCORD_SECRET`       | Discord application client secret                                       |
| `DISCORD_CALLBACK_URL` | Must match the redirect URL in the Discord application                  |
| `SESSION_SECRET`       | Secret for signing session cookies (required in production)             |
| `ADMIN_DISCORD_IDS`    | Comma-separated Discord IDs allowed to edit the hotwheel/series catalog |
| `NODE_ENV`             | `production` enables secure cookies and stricter env checks             |

## Scripts

| Script                                    | Description                 |
| ----------------------------------------- | --------------------------- |
| `npm run dev`                             | Start with auto-reload      |
| `npm run build` / `npm start`             | Compile to `dist/` and run  |
| `npm test` / `npm run test:watch`         | Run the test suite          |
| `npm run lint`                            | ESLint                      |
| `npm run format` / `npm run format:check` | Prettier                    |
| `npm run typecheck`                       | TypeScript without emitting |

CI runs lint, format check, typecheck, tests, build and a Docker build on every push to `main` and on pull requests.

## Architecture

```
src/
├── config/        env, database, passport (Discord login + profile sync)
├── routes/        URL → middleware → controller
├── controllers/   parse input (zod), call services, send response
├── services/      database access and business rules
├── models/        Mongoose schemas
├── middleware/    auth, CSRF, error handling, request logging
├── validation/    zod schemas for params, queries and bodies
├── errors/        HttpError helpers (badRequest, notFound, ...)
└── views/         EJS templates
```

- Controllers throw `HttpError`s; `middleware/errorHandler.ts` turns every error into a JSON response (`/api`) or an error page. Internal error messages are never sent to clients.
- Every write checks permissions on the server: catalog changes are admin-only, collections and items only for their owner, and authenticated writes need a CSRF token.

### Data model

- **User:** `discordId`, `handle` (Discord username, used in `/u/<handle>`), `displayName`, `previousHandles` (old URLs redirect)
- **Collection:** `name`, `owner`
- **CollectionItem:** one document per physical copy with `collectionId`, `hotwheel`, `owner`, `acquiredAt`, optional `condition` and `notes`
- **Hotwheel / Series:** the shared catalog

### API

All list endpoints are paginated with `?page=` and `?limit=` (max. 100) and return `{ data, pagination }`.

| Method                  | Path                                            | Access         |
| ----------------------- | ----------------------------------------------- | -------------- |
| `GET`                   | `/api/hotwheel?search=`                         | public         |
| `POST`, `PUT`, `DELETE` | `/api/hotwheel[/:id]`, `/api/series[/:id]`      | admin          |
| `GET`                   | `/api/user?search=`, `/api/user/:id`            | public         |
| `GET`                   | `/api/user/me`                                  | logged in      |
| `DELETE`                | `/api/user/:id`                                 | owner or admin |
| `GET`                   | `/api/collection?owner=`, `/api/collection/:id` | public         |
| `POST`                  | `/api/collection`                               | logged in      |
| `PUT`, `DELETE`         | `/api/collection/:id`                           | owner          |
| `GET`                   | `/api/collection/:id/items`                     | public         |
| `POST`                  | `/api/collection/:id/items`                     | owner          |
| `DELETE`                | `/api/collection/:id/items/:itemId`             | owner          |
| `GET`                   | `/healthz`                                      | public         |

## Migrations

Scripts in `scripts/` change existing data. Always run them with `--dry-run` first and keep a backup:

```bash
npx tsx scripts/migrateToCollectionItems.ts --dry-run
```

## License

MIT
