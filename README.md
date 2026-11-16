# Design Brooks — Architectural Studio Website, Admin Console & Client Document Portal

Production Next.js application for the Design Brooks architectural studio. Migrated from the original static HTML/CSS site (preserved in [`legacy/`](legacy/)) and upgraded from a UI prototype to a fully functional application — real database, real authentication, persistent storage and enforced document permissions.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn-style UI primitives · Lucide · React Hook Form + Zod · **PostgreSQL + Prisma 6 ORM** · **Session-cookie auth (scrypt)** · **Cloudflare R2 (S3-compatible, private bucket) in production / local private disk for dev** · pdf.js (in-browser PDF viewer) · pdf-lib + sharp (server-side watermarking)

## Local development

### 1. Database (Docker)

```bash
docker run -d --name designbrooks-postgres \
  -e POSTGRES_USER=designbrooks \
  -e POSTGRES_PASSWORD=<pick-a-strong-password> \
  -e POSTGRES_DB=designbrooks \
  -p 5434:5432 postgres:16-alpine
```

Or point `DATABASE_URL` at any PostgreSQL 14+ instance (e.g. Neon).

### 2. Environment

```bash
cp .env.example .env
# Fill in DATABASE_URL
```

### 3. Install, migrate, seed, run

```bash
npm install          # also runs prisma generate + copies the pdf.js worker
npm run db:migrate   # creates the schema (prisma migrate dev)
npm run seed:admin   # creates the SINGLE admin account and prints a temporary password ONCE
npm run dev          # http://localhost:3000
```

### 4. First sign-in

Open `http://localhost:3000/admin/login`. Use the email and temporary password printed by `npm run seed:admin`. Then go to **Admin → Settings → Change password** immediately. The temporary password is not stored anywhere except scrypt-hashed in the database.

### Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | Strict TypeScript check |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:studio` | Prisma Studio (DB browser) |
| `npm run seed:admin` | One-time admin creation (idempotent) |

## Map of the app

### Public website (`/`)
`/` · `/about` · `/services` · `/portfolio` · `/portfolio/[slug]` · `/insights` · `/insights/[slug]` · `/contact` · `/request-consultation` · `/client-access`

### Admin console (`/admin`) — session-protected
`/admin/login` · `/admin/dashboard` · `/admin/clients` (+`/new`, `/[id]`) · `/admin/projects` (+`/new`, `/[id]`) · `/admin/documents` · `/admin/documents/upload` · `/admin/access-links` · `/admin/inquiries` · `/admin/activity` · `/admin/settings`

### Client portal (`/client/project/[token]`)
No accounts — the private link is the credential. The token is stored **hashed** (SHA-256) and validated server-side on every request: existence, ACTIVE status, and expiry. One link per project; documents added later appear through the same link.

## Document access model

Every document carries an **admin-only** access setting, enforced on the server per request:

| Setting | Client experience |
|---|---|
| `RESTRICTED_PREVIEW` ("Client has not paid") | Server-generated **watermarked preview** (pdf-lib / sharp). Original never leaves the server. No download, no print controls. |
| `FULL_ACCESS` ("Client has paid") | Full in-browser viewing (pdf.js / image viewer) + authorized download through a token-checked route handler. |

Payment status is never exposed to the client — only the resulting permissions.

## Project cover images

Creating or editing a project accepts a **cover photo upload** (JPG/PNG/WebP, ≤ 10 MB, validated by magic bytes server-side, EXIF-rotated and resized to WebP ≤ 2000 px). Files live in private storage and are served only to signed-in admins at `/api/covers/<hash>.webp` (session required, `Cache-Control: private, no-store`). Note: deleting a project removes its documents and files, but an uploaded cover file may remain orphaned on disk until a periodic sweep removes it (tracked as a known minor issue).

## Security model

- **Single administrator.** No registration, no second account, no staff roles. `AdminUser` is seeded once via `npm run seed:admin`.
- **Passwords** hashed with scrypt (`N=16384, r=8, p=1`) + timing-safe comparison.
- **Sessions:** 256-bit random cookie token, stored as SHA-256 hash in `Session` table; httpOnly, SameSite=Lax, Secure in production; 7-day rolling expiry; logout deletes the row. Role checks run server-side in layouts, actions and route handlers — never from the UI.
- **Middleware → `src/proxy.ts`** (Next 16 successor of `middleware.ts`): UX-level redirect for `/admin/*`; the authoritative guard is `requireAdmin()` in the console layout + `requireAdminOrThrow()` in every action/route handler.
- **Documents:** private keys (UUID paths) — originals are never public URLs. Download/preview streams authorized per request against the token + project scope + access mode. Preview and download both re-check authorization server-side. Downloads are blocked for restricted documents at the handler level.
- **Token storage:** SHA-256 hash only — raw token shown once at generation time. Revocation/regeneration invalidate immediately. Expiry validated per request; expired links transition lazily to `EXPIRED`.
- **Uploads:** allowlist (PDF/JPG/PNG/WebP/DWG/DXF/ZIP), 25 MB cap, extension + magic-byte sniffing, sanitized filenames, `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`.
- **Inquiries:** Zod validation, honeypot field, in-memory throttle (dev-grade — use edge rate limiting in production).
- **Admin sessions:** all `/admin/*` pages are `force-dynamic` and re-check the session on every render; route handlers and actions independently re-verify.
- **No screenshot prevention is claimed** — restricted previews are watermarked deterrents, the original is never served.
- **Known limits (documented honestly):** local disk storage is single-node — production uses R2 (see below) and **fails closed without it**: the server refuses to boot and every storage operation errors out instead of silently writing to ephemeral disk. Storage is required — set `R2_*` before going live. Session cookie auth is custom but hardened (scrypt, hashed tokens, rolling expiry, per-request validation).

## Environment variables

See [.env.example](.env.example). Required for production: `DATABASE_URL` (Neon **pooled**), `DIRECT_URL` (Neon **direct**, for migrations), `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`, `NEXT_PUBLIC_APP_URL`. Without valid R2 settings the production server refuses to start (validated at boot in `instrumentation.ts` and again per storage operation) — there is no silent disk fallback. Local dev needs only `DATABASE_URL` + `DIRECT_URL` (defaults to disk storage, see `.env.example`).

Passwords are scrypt-hashed with per-user salts; sessions are random opaque tokens stored as SHA-256 hashes — **no application signing secret is required**.

## Production deployment (Vercel + Neon + Cloudflare R2)

> **Status:** code is production-ready; nothing has been deployed yet. The R2/Neon paths are implemented but have **not** been run against real infrastructure — verify with the smoke tests below after first deploy.

### 1. Neon (production database)

1. Create a project at https://neon.tech → copy the **pooled** connection string (contains `-pooler`) → this is `DATABASE_URL`.
2. Copy the **direct** connection string (same credentials, no `-pooler`) → this is `DIRECT_URL`.
3. Run migrations from your machine (or CI) against Neon:
   ```bash
   DATABASE_URL="<neon-pooled>" DIRECT_URL="<neon-direct>" npm run db:deploy
   ```

### 2. Cloudflare R2 (private file storage)

1. Create an R2 bucket (e.g. `designbrooks-files`), leave it **private** (no public development URL).
2. R2 → Manage API Tokens → **Create Token** → Object Read & Write for the bucket → copy credentials.
3. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`.
4. Fail-closed check: after setting the vars, redeploy and confirm the boot log prints `[storage] R2 object storage configured.` — the server exits with an error naming the missing/invalid variables if not.
5. No CORS rules are needed — the browser never talks to R2; everything is proxied through the authorized route handlers.

### 3. Vercel (hosting)

1. Push the repo to GitHub, then Vercel → New Project → import it.
2. Framework preset **Next.js** (auto-detected). Build command `npm run build`, output `.next` — no changes.
   `postinstall` runs `prisma generate` + copies the pdf.js worker automatically.
3. Settings → Environment Variables (Production): all values from `.env.example` in the **Production** scope.
   `NEXT_PUBLIC_APP_URL=https://<your-domain>`
4. Deploy.

### 4. Seed the production administrator (one time)

```bash
DATABASE_URL="<neon-pooled>" npm run seed:admin
# or with an explicit password:
DATABASE_URL="<neon-pooled>" ADMIN_PASSWORD="<strong-temp-password>" npm run seed:admin
# or a specific email:
DATABASE_URL="<neon-pooled>" ADMIN_EMAIL=you@studio.com npm run seed:admin
```

The temporary password prints **once** to the console — store it, then change it at `https://<your-domain>/admin/settings` → Change password.

### 5. Smoke test after first deploy

- [ ] `/` loads; admin sign-in works with the seeded credentials
- [ ] Admin → Settings → Change password succeeds (sessions rotate)
- [ ] Upload a PDF to a project (restricted) → client link opens watermarked preview, original never downloads
- [ ] Switch document to FULL_ACCESS → client download starts (HTTP 200, `attachment`) and stops (403) after switching back
- [ ] Cover image upload → renders in project card (admin-only URL)
- [ ] `https://<domain>/api/client/documents/<id>/download?token=…` → 403 for restricted documents (proves server-side enforcement)
- [ ] Inspector → Network: originals never URL-referenced anywhere

### 6. Rollback

- Database: `prisma migrate deploy` is additive; never edit/drop tables already applied. Take a Neon snapshot before production migrations.
- Files: delete the R2 bucket only after confirming no live links point to it — rows in `Document`/`ProjectAccessLink` reference keys in R2.
- Vercel: instant rollback to the previous deployment from the project dashboard.

### 7. Optional hardening (post-deploy)

- Edge rate limiting for `/admin/login`, `/api/client/*`, `/api/admin/*` (Vercel WAF or Upstash Ratelimit).
- Neon read replicas / branching for staging; CI pipeline running `prisma migrate deploy` against a staging branch then production.
- Resend email wired into `submitInquiryAction` and link lifecycle (preference UI already built).
- Nightly backup: Neon point-in-time restore + R2 object lifecycle rules.

## Layout

```
src/
  app/            route groups: (public) website, /admin (auth)/(console), /client portal, /api route handlers
  components/     ui/ primitives · public/ · admin/ · client/ (pdf.js viewer & portal)
  lib/            types.ts · utils.ts · validation.ts (shared zod) · site-content.ts (public copy)
  lib/server/     db · auth · storage · watermark · activity · queries · client-links · mime · settings-store
  lib/actions/    server actions: auth, clients, projects, documents, links, inquiries, settings
  proxy.ts        Next 16 middleware — /admin gate (UX layer)
prisma/           schema + migrations
scripts/          seed-admin.mjs · asset tooling
legacy/           original static site, preserved for reference
```
