# Tasklane local setup

## Requirements

- Node.js 20.9 or newer
- pnpm 12 (the repository uses `pnpm@12.3.4`)
- A PostgreSQL-compatible database. Neon is recommended.

## Install dependencies

From the project root:

```bash
corepack enable
corepack prepare pnpm@12.3.4 --activate
pnpm install
```

## Configure the database

Create `.env.local` in the project root. Do not commit this file.

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

The database must contain the board table. Run this SQL once using your PostgreSQL/Neon SQL tool:

```sql
CREATE TABLE IF NOT EXISTS tasklane_state (
  id integer PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

`DATABASE_URL` is required. Without it, the app cannot load the board and will show a database setup error instead of staying on an endless loading screen.

## Start development

```bash
pnpm dev
```

Open http://localhost:3000.

## Production-like run

```bash
pnpm build
pnpm start
```

## Troubleshooting

- If the app says it cannot load tasks, verify `.env.local` is in the same directory as `package.json`, the URL is valid, and the table SQL has been run.
- Restart `pnpm dev` after changing `.env.local`; Next.js reads environment variables when the server starts.
- Never commit `.env.local` or database passwords.
- To verify the connection manually, check the app's `/api/board` request in the browser Network panel. It should return HTTP 200.
