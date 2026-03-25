# Workspace

## Overview

Fullstack TypeScript starter using a pnpm monorepo. React + Vite + Tailwind CSS on the frontend, Node.js + Express + TypeScript with MySQL on the backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9

### Frontend (`artifacts/client`)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **State/data fetching**: TanStack Query
- **Routing**: Wouter
- **UI components**: Radix UI primitives + custom components

### Backend (`artifacts/api-server`)
- **Framework**: Express 5
- **Runtime**: Node.js (TypeScript via esbuild)
- **Database**: MySQL via `mysql2`
- **Logging**: Pino (structured JSON) + pino-pretty (dev)
- **Validation**: Zod

## Structure

```text
/
├── artifacts/
│   ├── client/               # React + Vite + Tailwind frontend
│   │   └── src/
│   │       ├── components/   # Reusable UI components (shadcn)
│   │       ├── pages/        # Page-level components
│   │       ├── hooks/        # Custom React hooks
│   │       └── lib/          # Utilities & helpers
│   └── api-server/           # Node.js + Express backend
│       └── src/
│           ├── config/       # DB connection (MySQL pool)
│           ├── middlewares/  # Error handler, 404
│           ├── routes/       # API route handlers
│           ├── lib/          # Logger
│           ├── app.ts        # Express app setup
│           └── index.ts      # Entry point
├── lib/
│   ├── api-spec/             # OpenAPI spec + Orval codegen config
│   ├── api-client-react/     # Generated React Query hooks
│   ├── api-zod/              # Generated Zod schemas from OpenAPI
│   └── db/                   # (PostgreSQL Drizzle — not used, MySQL preferred)
├── scripts/                  # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── .env.example              # MySQL env vars template
```

## Environment Variables

Copy `.env.example` and set your MySQL credentials:

```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=app_db
```

## MySQL Database Connection

The MySQL pool is initialized in `artifacts/api-server/src/config/db.ts`. It reads from environment variables. Import `pool` or `testConnection` from that module in your routes.

## Adding Routes

1. Create a new file in `artifacts/api-server/src/routes/`
2. Register it in `artifacts/api-server/src/routes/index.ts`
3. If adding an endpoint to the OpenAPI spec, update `lib/api-spec/openapi.yaml` and run codegen:
   ```
   pnpm --filter @workspace/api-spec run codegen
   ```

## TypeScript & Composite Projects

- `lib/*` packages are composite and emit declarations via `tsc --build`
- `artifacts/*` are leaf workspace packages — typechecked with `tsc --noEmit`
- Always typecheck from root: `pnpm run typecheck`

## Root Scripts

- `pnpm run build` — typecheck then build all packages
- `pnpm run typecheck` — full typecheck using project references

## Packages

### `artifacts/client` (`@workspace/client`)
React + Vite frontend. Dev: `pnpm --filter @workspace/client run dev`

### `artifacts/api-server` (`@workspace/api-server`)
Express API server. Dev: `pnpm --filter @workspace/api-server run dev`
Routes live in `src/routes/`, MySQL pool in `src/config/db.ts`.

### `lib/api-spec` (`@workspace/api-spec`)
OpenAPI 3.1 spec and Orval codegen. Run: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)
Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)
Generated React Query hooks from the OpenAPI spec.
