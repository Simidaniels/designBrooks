# Architectural Studio Website & Client Document Portal
## MVP Scope and Product Requirements

**Status:** Ready to feed into an AI coding assistant or development workflow  
**Product type:** Single-business architectural studio website with private project-document delivery  
**Architecture:** One full-stack application with three connected experiences

---

## 1. Product overview

Build a professional architectural studio website with:

1. **Public website** — presents the studio, services, portfolio and contact/inquiry options.
2. **Admin dashboard** — lets the architect manage clients, projects, documents, per-document access settings and private project links.
3. **Client project viewer** — lets a client open a private project link without creating an account and view the documents released to that project.

The core feature is controlled delivery of architectural drawings. When uploading each document, the administrator selects one of two internal access settings:

- **Client has NOT paid:** client receives a restricted, watermarked preview. The original file cannot be downloaded through the portal and printing controls are not offered.
- **Client has PAID:** client receives full authorized viewing and can download the released document.

**Payment status is strictly internal.** Clients must never see paid/unpaid labels, payment status, balances, payment prompts or payment-related messages. The client only sees the documents and actions made available to them.

The MVP does not process or verify payments. The architect confirms payment outside the platform and chooses the appropriate access setting during upload or later editing.

## 2. Goals

- Create a credible, premium online presence for the architectural practice.
- Present services and completed projects.
- Capture and manage project inquiries.
- Manage clients, projects and documents in one admin dashboard.
- Set viewing/download permissions separately for every document.
- Generate one private shareable access link per project.
- Let clients view project documents without registering.
- Protect original drawings with private storage and server-side authorization.
- Work well on desktop, tablet and mobile.

## 3. Out of scope for the first MVP

Do not build:
- Client registration, passwords or conventional client accounts.
- Online payment gateway or automatic payment verification.
- Accounting, invoicing or bookkeeping.
- Full project collaboration/task management.
- In-browser CAD editing.
- Guaranteed native DWG/DXF browser rendering.
- Multi-company or multi-tenant SaaS functionality.
- Guaranteed screenshot/screen-recording prevention.
- Complex real-time chat.

These may be considered after the core MVP is stable.

## 4. User roles

### Administrator / Architect
Can sign in/out; manage clients and projects; upload, replace, organize and archive documents; select and change each document's access setting; generate/copy/share/revoke/regenerate project links; view activity; manage public portfolio content if included; manage basic settings.

All admin pages and operations must be protected by server-validated authentication.

### Client / Link holder
No account creation is required. A client can open a valid project link, view project information and released documents, view restricted watermarked previews, and download documents with full access.

A client must not see internal payment labels, balances, admin notes, other clients or other projects. A client cannot access a project after its link expires or is revoked.

Optional: email OTP verification before opening a project. Keep this configurable; do not let it delay the core MVP unless explicitly chosen as a launch requirement.

## 5. Application areas and routes

Use one Next.js application with separate layouts and route groups.

### Public website
- `/` — Home
- `/about`
- `/services`
- `/portfolio`
- `/portfolio/[slug]`
- `/contact`
- `/request-consultation`

Requirements:
- Premium, editorial, photography-led architecture-studio design.
- Responsive navigation and footer.
- Clear calls to action.
- SEO metadata, semantic HTML and accessible controls.
- Inquiry form with client- and server-side validation, success/error states and spam protection/rate limiting.
- Portfolio content should be structured for future admin management. Seed content is acceptable initially if a portfolio CMS is deferred.

The existing landing page was built with HTML and CSS. Preserve and reuse useful branding, assets, imagery, content and design decisions if its source is provided. Do not assume the source code is available or discard existing work without review.

### Admin dashboard
- `/admin/login`
- `/admin/dashboard`
- `/admin/clients`
- `/admin/clients/new`
- `/admin/clients/[id]`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/[id]`
- `/admin/documents`
- `/admin/documents/upload`
- `/admin/access-links`
- `/admin/activity`
- `/admin/settings`

Dashboard overview:
- Total clients and projects.
- Active and completed projects.
- Total uploaded documents.
- Recent projects, uploads and link activity.
- Do not invent revenue or payment metrics; the MVP does not process payments.

### Client project viewer
- `/client/project/[token]`

The client page should be simple, premium, responsive and branded. Display project name/details, released documents, document categories, a viewer and download controls only where authorized.

## 6. Client management

Admin can create, list, search, filter, edit and archive clients, and view each client's projects.

Client fields:
- Full name (required)
- Email (optional, recommended)
- Phone (optional)
- Company/organization (optional)
- Address/location (optional)
- Internal notes (admin-only)
- Created/updated dates

Validate email/phone when supplied. Warn about likely duplicates rather than silently creating duplicate records.

A client can have multiple projects. Each project belongs to one client.

## 7. Project management

Admin can create, view, search, filter, edit and archive projects and manage each project's documents and access link.

Project fields:
- Client (required)
- Project name (required)
- Project reference/code (optional; unique if supplied)
- Project type: residential, commercial, interior design, renovation, other
- Location (optional)
- Description (optional)
- Cover image (optional)
- Status: `DRAFT`, `ACTIVE`, `COMPLETED`, `ARCHIVED`
- Created/updated dates

## 8. Document management — core feature

### Upload workflow

The upload form must follow this sequence:

1. Select client.
2. Select that client's project.
3. Enter document name.
4. Choose a file (file picker and drag/drop).
5. Select the access setting.
6. Upload/save the document.
7. Show success or clear validation/error state.
8. Offer project-link generation if none exists, or copying the existing project link.

The form should visibly include:
- Client selector
- Project selector
- Document name
- File picker / drag-and-drop area
- Accepted file types and size guidance
- Access setting
- Upload/save button

### Access setting A — Client has NOT paid

This label is visible to the administrator only.

- Store the original file privately.
- Generate/use a separate restricted preview asset.
- Apply a visible watermark during server-side preview generation. It may include client name, project reference and/or studio branding.
- Allow preview viewing only.
- Do not expose the original file URL, object key or download endpoint to the client.
- Do not offer download or print controls in the restricted viewer.
- Best-effort deterrents such as disabling context menu and common print shortcuts may be used, but are not security guarantees.

### Access setting B — Client has PAID

This label is visible to the administrator only.

- Store the original file privately.
- Allow full authorized viewing for supported file types.
- Enable download of the original file after server-side permission checks.
- Printing can be a separate future/configurable permission. Do not promise browser printing can be fully controlled.

### Permissions are per document

Example:

| Document | Admin-only setting | Client experience |
|---|---|---|
| Architectural Floor Plan | NOT PAID | Watermarked restricted preview |
| Front Elevation | PAID | Full viewing and download |
| 3D Visualization | PAID | Full viewing and download |
| Structural Drawing | NOT PAID | Watermarked restricted preview |

### Document metadata

Store:
- Project ID
- Document name and category
- Original file name
- Private storage object key
- MIME type, extension and file size
- Access mode: `RESTRICTED_PREVIEW` or `FULL_ACCESS`
- Preview generation status and preview object key(s)
- Uploaded-by admin ID
- Created/updated dates
- Optional version/revision label

Categories may include architectural, structural, electrical, plumbing, 3D render and other.

Admin actions:
- List documents by project; search/filter.
- Edit document name/category.
- Change access setting without re-uploading.
- Replace document with a new version.
- Archive/delete document.
- See upload and preview-processing status.

Changing to full access must authorize future viewing/download without re-uploading. Changing back to restricted must block future full-access requests and use short-lived URLs so old links expire quickly. Do not claim that a file already downloaded can be remotely deleted.

## 9. Private project link — core feature

### Link model

Generate **one private link per project**, not one link per document. Additional documents added to the project appear through the same link and retain their individual permissions.

Example URL:
`https://studio-domain.com/client/project/[random-token]`

Token requirements:
- Cryptographically secure random token with sufficient entropy.
- Store only a hash of the token in the database.
- Scope token to exactly one project.
- Support revocation and optional expiry.
- Rate-limit token validation and access attempts.
- Never use sequential IDs or guessable tokens.

### Generate-link workflow

After saving a document:
- If no active project link exists, show **Generate Client Link**.
- If one exists, show **Copy Client Link** and link-management actions rather than creating duplicate active links.
- Expiry options: never (until revoked), 7 days, 30 days or 90 days.
- Show the raw link to the admin once so it can be copied/shared.
- Provide Copy Link.
- Provide WhatsApp sharing using an encoded share URL/message.
- Provide email sharing or copy-ready email text. Actual email delivery can use Resend if configured.

### Link management
- Show active/expired/revoked status.
- Copy/share active link.
- Revoke immediately.
- Regenerate, invalidating the old token.
- Set expiry where supported.
- Show last access and activity.

Revocation must block future access immediately. Regeneration must invalidate the old token.

## 10. Client document viewer

The client viewer must:
- Validate the token server-side on every page/data request.
- Confirm token status and expiry.
- Resolve only the project linked to that token.
- List only non-archived documents released to the project.
- Never return internal access labels, payment status, admin notes or other clients' data.

### Restricted documents
- Serve a separate server-generated watermarked preview.
- Do not expose original file URL/object key.
- Do not show download or print controls.
- Serve preview pages/tiles through protected endpoints.
- Do not rely on a CSS-only watermark.
- Apply reasonable capture deterrents only as best effort.

### Full-access documents
- Provide a suitable viewer for supported types.
- PDF: page navigation and zoom.
- Images: fit/zoom viewing.
- Provide authorized download.
- Generate short-lived download URLs only after checking the project token and document permission.
- Never expose permanent public storage URLs.

### File format expectations
- PDF: browser viewing.
- JPG/JPEG/PNG/WebP: image viewing.
- DWG/DXF: retain original privately and allow download only with full access. Browser preview may be deferred or produced by a conversion service.
- ZIP: optionally allow authorized download; no archive preview required.

A normal website cannot guarantee screenshot or screen-recording prevention. Users can photograph a screen with another device. Real protection comes from private storage, server-side authorization, restricted watermarked previews and not exposing original files.

## 11. Storage and file processing

Use private object storage such as Cloudflare R2.

Requirements:
- Bucket is private, not public.
- Original files and preview assets use separate, non-guessable object keys.
- Backend authorizes all uploads, previews and downloads.
- Validate extension, MIME type and file signature where possible.
- Enforce configurable file-size limits.
- Reject executable and unsupported file types.
- Sanitize display names; never trust client-supplied paths.
- Consider malware scanning before production.
- Use short-lived signed URLs only after authorization.
- Log upload, replacement, deletion and download events.
- Never expose storage credentials in frontend code.

Suggested libraries: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `file-type`, `sharp`, `pdfjs-dist`, plus a reliable server-side PDF processing library/service for rendering and watermarking.

## 12. Inquiry and contact management

Public inquiry fields:
- Name
- Email
- Phone (optional)
- Service/project type
- Project location (optional)
- Brief description
- Preferred contact method (optional)

Requirements:
- Validate on client and server.
- Store in database.
- Notify admin by email if configured.
- Show success/error states.
- Apply spam protection/rate limiting.
- Admin can list inquiries and mark new, contacted, converted or archived if included in the first release.

## 13. Notifications

Email notifications are optional when provider credentials are not configured.

Potential events:
- New inquiry received (admin).
- New documents available (client).
- Link generated (admin; optionally client).
- Link revoked (admin confirmation).

Client-facing messages must not disclose payment status. Say documents are available; do not say the client has or has not paid.

WhatsApp sharing can use click-to-chat/share links. Automated WhatsApp Business API messaging is out of scope.

## 14. Activity logs

Record:
- Admin login/logout where practical.
- Client/project create and update.
- Document upload, replacement, deletion and access-setting changes.
- Project link generated, revoked and regenerated.
- Client project link opened.
- Document preview accessed.
- Download authorized/completed where measurable.

Store timestamp, action, related IDs, actor/link identifier and limited request metadata. Avoid unnecessary personal data.

## 15. Recommended technology stack

Use one full-stack application and current stable, compatible versions.

### Languages
- HTML5
- CSS3
- TypeScript
- SQL (PostgreSQL)

### Frontend
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Hook Form
- Zod
- TanStack Table where useful
- PDF.js for PDF viewing

### Backend
- Node.js runtime
- Next.js Route Handlers and Server Actions where appropriate
- TypeScript
- Prisma ORM
- Zod server-side validation
- Auth.js or another maintained solution for admin authentication
- Node.js crypto APIs for secure token generation

### Data and infrastructure
- PostgreSQL
- Prisma
- Cloudflare R2 private bucket (S3-compatible)

### Supporting services
- Resend for email
- Vercel for application hosting
- Neon or another managed PostgreSQL provider
- GitHub for version control

Avoid unnecessary dependencies. Do not create a separate Express backend for this MVP unless a concrete requirement emerges.

## 16. Suggested database model

Implement relational tables/entities:

### Admin
- id
- name
- email (unique)
- password hash or Auth.js identity fields
- createdAt
- updatedAt

### Client
- id
- fullName
- email (nullable)
- phone (nullable)
- company (nullable)
- location/address (nullable)
- internalNotes (nullable, admin only)
- createdAt
- updatedAt
- archivedAt (nullable)

### Project
- id
- clientId
- name
- reference (nullable, unique if supplied)
- type
- location (nullable)
- description (nullable)
- coverImageKey (nullable)
- status
- createdAt
- updatedAt
- archivedAt (nullable)

### Document
- id
- projectId
- name
- category
- originalFileName
- objectKey
- mimeType
- fileSize
- accessMode (`RESTRICTED_PREVIEW` or `FULL_ACCESS`)
- previewStatus
- previewObjectKey(s)
- createdAt
- updatedAt
- archivedAt (nullable)

### DocumentVersion (recommended)
- id
- documentId
- objectKey
- originalFileName
- mimeType
- fileSize
- versionLabel
- createdAt

### ProjectAccessLink
- id
- projectId
- tokenHash (unique)
- status (`ACTIVE`, `REVOKED`, `EXPIRED`)
- expiresAt (nullable)
- createdAt
- revokedAt (nullable)
- lastAccessedAt (nullable)

### Inquiry
- id
- name
- email
- phone (nullable)
- serviceType
- projectLocation (nullable)
- description
- status
- createdAt
- updatedAt

### ActivityLog
- id
- actorType
- adminId (nullable)
- projectId (nullable)
- documentId (nullable)
- accessLinkId (nullable)
- action
- limited metadata JSON
- createdAt

### Notification (optional)
- id
- recipient
- type
- status
- relatedProjectId (nullable)
- createdAt
- sentAt (nullable)

Add indexes, foreign keys and appropriate uniqueness constraints. Use transactions for multi-step operations.

## 17. API / server operations

Equivalent endpoints may be organized as Route Handlers or Server Actions.

Authentication:
- Admin sign-in/out
- Session validation

Clients:
- Create, list/search, get, update, archive

Projects:
- Create, list/search/filter, get, update, archive

Documents:
- Upload
- List by project
- Get metadata
- Update name/category
- Change access mode
- Replace/version
- Archive/delete
- Get authorized preview
- Get authorized download

Links:
- Generate project link
- Validate token
- Revoke
- Regenerate
- View activity

Inquiries:
- Submit public inquiry
- List for admin
- Update inquiry status

Every admin operation requires a valid admin session. Every client operation validates token, project scope, status and expiry. Every document request verifies that the document belongs to the project associated with the validated token and enforces that document's access mode.

## 18. Security requirements

Security is a launch requirement.

- Server-side authentication for all admin pages and APIs.
- Secure password hashing if password authentication is used.
- Secure HTTP-only, same-site session cookies.
- CSRF protections where applicable.
- Server-side validation of all input.
- Rate limiting for login, token access and inquiry endpoints.
- Cryptographically random project tokens; store only token hashes.
- Project-scoped links; revoke old tokens immediately on regeneration.
- Check document permissions on every preview and download request.
- Never trust frontend access flags or hidden buttons as security.
- Private R2 bucket.
- Never expose secrets in browser bundles or `NEXT_PUBLIC_` variables.
- Short-lived signed URLs only after authorization.
- No permanent public document URLs.
- Safe file validation and size limits.
- Avoid leaking whether another project's token or document exists.
- Use generic errors for invalid/revoked/expired links.
- Add security tests for cross-project access and permission bypass.

## 19. Suggested project structure

```text
architectural-studio/
├── public/
│   ├── images/
│   ├── portfolio/
│   ├── logos/
│   └── icons/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (website)/
│   │   │   ├── page.tsx
│   │   │   ├── about/
│   │   │   ├── services/
│   │   │   ├── portfolio/
│   │   │   └── contact/
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── clients/
│   │   │   ├── projects/
│   │   │   ├── documents/
│   │   │   ├── access-links/
│   │   │   ├── activity/
│   │   │   └── settings/
│   │   ├── client/
│   │   │   └── project/[token]/
│   │   └── api/
│   │       ├── auth/
│   │       ├── admin/
│   │       └── client/
│   ├── components/
│   │   ├── ui/
│   │   ├── website/
│   │   ├── admin/
│   │   ├── client/
│   │   └── documents/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── storage.ts
│   │   ├── permissions.ts
│   │   ├── tokens.ts
│   │   ├── validation.ts
│   │   └── email.ts
│   ├── services/
│   │   ├── client.service.ts
│   │   ├── project.service.ts
│   │   ├── document.service.ts
│   │   ├── access-link.service.ts
│   │   └── notification.service.ts
│   ├── types/
│   └── styles/
├── tests/
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 20. Environment variables

Provide `.env.example` with placeholders only:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL=

AUTH_SECRET=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=

RESEND_API_KEY=
EMAIL_FROM=
```

Optional rate-limiting variables may be added if a Redis provider is selected.

Keep real secrets in `.env.local` during development and in the hosting provider's secret environment settings in production. Never commit real credentials.

## 21. Development phases

Build in dependency order:

1. **Foundation:** project setup, linting, formatting, environment validation, database and reusable UI foundation.
2. **Public website:** responsive landing page, about, services, portfolio, contact and inquiry form.
3. **Admin authentication:** secure administrator login and protected layouts/routes.
4. **Client management:** CRUD, search and archive.
5. **Project management:** CRUD, status and client relationships.
6. **Private storage:** R2 integration, upload validation and document metadata.
7. **Document access permissions:** per-document restricted/full setting and server-side enforcement.
8. **Preview processing:** watermarked restricted PDF/image previews.
9. **Project links:** generate, copy/share, expire, revoke and regenerate.
10. **Client viewer:** token-protected project page, preview and authorized downloads.
11. **Notifications and activity:** email integration and audit trail.
12. **Hardening and deployment:** security tests, responsive QA, accessibility, backups, production configuration and deployment.

Do not begin the client viewer before token validation and document authorization are implemented.

## 22. Acceptance criteria

The MVP is not complete until all of the following work:

### Public website
- Visitors can navigate the public pages on desktop and mobile.
- Portfolio items display correctly.
- Inquiry form validates, saves submissions and shows success/error feedback.
- Public form endpoints are rate-limited or otherwise protected from basic abuse.

### Admin
- Unauthorized users cannot access admin pages or APIs.
- Admin can create and edit clients.
- Admin can create multiple projects for a client.
- Admin can upload documents to the correct project.
- Admin can see and change each document's access setting.
- Admin can generate one active link per project, copy it and revoke/regenerate it.
- Admin can see recent activity.

### Restricted document
- Client opens a valid project link without registration.
- Client can see the restricted watermarked preview.
- Client cannot obtain the original file through page source, network responses or API manipulation.
- No download/print control is offered for restricted documents.
- Client sees no payment status or payment-related language.

### Full-access document
- Client can view the released document.
- Download action works only after server-side authorization.
- Download URL is short-lived and not publicly reusable indefinitely.

### Link security
- Invalid, expired and revoked links are denied.
- Regenerating a link invalidates the old link.
- A token for one project cannot access another project's data.
- Changing IDs in requests cannot bypass project ownership checks.

### Permission changes
- Changing restricted to full access works without re-uploading.
- Changing full access to restricted blocks future full-access requests.
- Previously downloaded files cannot be remotely recalled; document this limitation.

### Security and reliability
- Secrets are not exposed in frontend bundles or committed files.
- File size/type validation is enforced server-side.
- Database relationships and indexes are correct.
- Core authorization flows have automated tests.
- Production error messages do not expose secrets or internal stack traces.

## 23. Implementation instructions for the coding assistant

Treat this document as the authoritative MVP scope.

Before coding:
1. Inspect the repository and report the existing framework, structure, current landing page implementation and reusable assets.
2. Do not overwrite or remove existing work without explaining why.
3. Identify assumptions, missing credentials and decisions that genuinely block implementation.
4. Propose a phased implementation plan mapped to this scope.
5. Confirm the database schema and security model before implementing document access.

During implementation:
- Build working functionality, not just static screens.
- Keep the public site, admin dashboard and client viewer visually consistent but suited to their different tasks.
- Use realistic seed/demo data only in development.
- Keep admin-only payment/access labels out of all client-facing APIs, page props, notifications and UI.
- Enforce authorization in server-side services and endpoints.
- Do not expose original files for restricted documents.
- Do not claim screenshot blocking is guaranteed.
- Add loading, empty, success and error states.
- Make layouts responsive and accessible.
- Write tests for token validation, project isolation and document permission enforcement.
- Keep dependencies and architecture as simple as possible while meeting the requirements.

At the end of each phase:
- Summarize files/features changed.
- List commands run and test results.
- Identify outstanding issues and required environment variables.
- Do not claim a feature is complete unless it has been implemented and verified.

**Definition of done:** A working, secure, responsive architectural studio website with an administrator dashboard, client/project/document management, per-document access settings, one private link per project, and a client document viewer that never reveals internal payment status.
