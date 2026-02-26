# Product Requirements Document
## MAP — Mutual Action Plan Web Application

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2026-02-24
**Author:** [Your Name]

---

## Table of Contents

1. [Overview & Vision](#1-overview--vision)
2. [Problem Statement](#2-problem-statement)
3. [Target Users & Personas](#3-target-users--personas)
4. [Goals & Success Metrics](#4-goals--success-metrics)
5. [Phased Scope](#5-phased-scope)
6. [Feature Requirements](#6-feature-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [Database Schema](#8-database-schema)
9. [API Design](#9-api-design)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Authentication & Security](#11-authentication--security)
12. [Notifications](#12-notifications)
13. [HubSpot Integration (Phase 3)](#13-hubspot-integration-phase-3)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Open Questions](#15-open-questions)

---

## 1. Overview & Vision

**MAP** is a collaborative web application that allows service providers to create, manage, and share Mutual Action Plans with their clients. A MAP is a joint roadmap that aligns both parties on the steps, owners, and timelines required to successfully close a deal and begin delivery.

The application serves two distinct audiences from a single platform:

- **Admins (Service Provider)** — Create and manage MAPs for all active deals, monitor progress across their entire pipeline, and use milestone data for financial forecasting.
- **Clients (Champions)** — Access a clean, shared view of their specific MAP via a private link, update their assigned tasks, and stay informed on upcoming deadlines.

**Long-term vision:** Every deal in the provider's CRM (HubSpot) automatically has a MAP associated with it. Progress on the MAP feeds back into CRM deal stages, and the close date from the MAP drives financial forecasting.

---

## 2. Problem Statement

Sales teams managing complex, multi-stakeholder deals struggle with:

1. **Misaligned expectations** — Clients and providers have different assumptions about what happens next and who owns each step.
2. **No shared accountability** — Action items discussed in calls are captured in emails or slide decks that go stale immediately.
3. **Forecasting opacity** — Operations and finance teams have no visibility into where a deal actually stands or what the realistic close date is.
4. **Manual overhead** — AEs are copy-pasting timelines from templates into emails, Notion docs, or slide decks for every deal.
5. **No client urgency** — Without a visible, shared plan with deadlines, client-side tasks slip and deals stall.

---

## 3. Target Users & Personas

### 3.1 Admin — Account Executive (Primary)
- Creates and configures MAPs for each deal
- Invites clients to the MAP via shared link
- Monitors progress and flags at-risk items
- Needs a dashboard view across all active deals

### 3.2 Admin — Operations / Finance
- Read-only or view access to all MAPs
- Consumes the Forecast Summary (milestone dates + weighted deal values)
- Needs a rollup view of upcoming close dates and weighted pipeline

### 3.3 Admin — Manager / Leadership
- Oversight of all deals and team performance
- Can view any MAP
- Monitors at-risk deals

### 3.4 Client — Champion (External User)
- Receives a private link to their specific MAP
- No account creation required (token-based access)
- Views the MAP, updates their owned tasks, adds notes
- Receives reminder notifications for upcoming deadlines

### 3.5 Client — Decision Maker / Stakeholder (Future)
- May receive read-only access to the MAP
- Can be CC'd on notification emails

---

## 4. Goals & Success Metrics

| Goal | Metric | Target |
|---|---|---|
| Reduce deal slippage due to client-side inaction | % of client tasks completed on time | > 70% |
| Improve forecast accuracy | Variance between MAP close date and actual close | < 14 days |
| Reduce AE time creating deal materials | Time to create a MAP from template | < 5 minutes |
| Increase client engagement | % of clients who open shared MAP link | > 80% |
| Improve internal visibility | Ops team adopts MAP forecast view | Used weekly |

---

## 5. Phased Scope

### Phase 1 — MVP (Core MAP)
- Admin authentication and team management
- Manual deal and MAP creation
- Full MAP configuration (phases, tasks, owners, dates, dependencies)
- Shareable client link (token-based, no auth required for client)
- Client-facing MAP view with ability to update their tasks
- Admin dashboard with all deals and MAP progress
- Forecast summary panel per MAP (internal only)

### Phase 2 — Notifications & Polish
- Email reminders to clients for upcoming/overdue tasks
- Email notifications to AE when client updates a task
- Activity log / audit trail per MAP
- MAP templates (create, edit, apply to new deals)
- At-risk flagging (automatic and manual)
- MAP preview mode (see exactly what client sees)
- Duplicate MAP from existing deal

### Phase 3 — HubSpot Integration
- OAuth connection to HubSpot portal
- Sync deals from HubSpot → auto-create MAP
- Map HubSpot deal stages to MAP milestones
- Write MAP milestone completion dates back to HubSpot deal properties
- Sync close date from MAP → HubSpot
- HubSpot webhook listener for deal stage changes
- Per-deal MAP accessible from HubSpot deal sidebar (via HubSpot App Card)

---

## 6. Feature Requirements

### 6.1 Admin Authentication
- Email + password login
- Optional: Google OAuth
- Role-based access: `admin`, `member`, `viewer`
- Org-level multi-tenancy (one organization per service provider company)
- Invite team members by email

### 6.2 Dashboard
- List of all deals with MAP progress indicator
- Columns: Deal Name, Client, Owner (AE), Deal Value, Target Close Date, MAP Progress (%), At-Risk flag, Last Updated
- Filters: Owner, Stage, At-Risk, Date range
- Sort by any column
- Quick-create new deal button
- Summary stats at top: Total Active Deals, Total Pipeline Value, Weighted Forecast Value, Deals Closing This Month

### 6.3 Deal Management
- Create a deal with: Client Name, Deal Name, Deal Value, Target Close Date, AE Owner
- Edit deal metadata at any time
- Archive / close a deal (Closed Won / Closed Lost)
- Associate multiple contacts per deal (with roles: Champion, Economic Buyer, Legal, etc.)

### 6.4 MAP Editor (Admin)
- Initialize MAP from default template or blank
- Phases: create, rename, reorder, delete
- Tasks within each phase:
  - Title (required)
  - Description / notes
  - Owner: `Provider` | `Client` | `Joint`
  - Role / Contact (free text for provider; dropdown from deal contacts for client)
  - Estimated duration (days)
  - Target date (date picker)
  - Completed date (date picker)
  - Status: `Not Started` | `In Progress` | `Complete` | `At Risk` | `Blocked`
  - Dependencies (multi-select from other tasks in the MAP)
  - Success Criteria (text)
  - Client-Visible toggle (default: on)
  - Forecast Milestone toggle (default: off)
  - Forecast Probability % (only if Forecast Milestone = on)
  - Internal notes (never shown to client)
- Inline editing on task rows
- Drag-and-drop reordering within a phase
- Bulk status update
- Add comment / note to any task (with timestamp and author)
- "TBD with client" flag on tasks that require client input to set dates

### 6.5 Forecast Panel (Admin Only)
- Collapsible sidebar/panel on MAP view
- Displays all tasks with `Forecast Milestone = true`
- Shows: Milestone Name, Target Date, Actual Date, Stage, Probability %, Weighted Value
- Deal Value input field (if not set on deal)
- Calculated: Weighted Forecast Value = Deal Value × Probability
- Days to Close = Target Close Date (Contract Signed task) − today
- At-Risk indicator if milestone target dates have slipped > 7 days from original
- Export forecast data as CSV

### 6.6 Share Link Management
- Generate a secure share token per MAP
- Share link format: `https://app.domain.com/map/[token]`
- Options when generating:
  - Expiry date (optional)
  - Allow client to update their own tasks (on/off)
  - Allow client to add notes to tasks (on/off)
- Revoke / regenerate link at any time
- Track: last accessed timestamp, total views
- Copy-to-clipboard button
- Email-the-link button (pre-fills email to champion)
- Admin can preview exact client view before sharing

### 6.7 Client MAP View (No Login Required)
- Accessed via share token URL
- Branded with provider company name/logo
- Shows only tasks marked `Client-Visible = true`
- Progress bar at top showing overall MAP completion
- Tasks grouped by phase
- Each task shows: Title, Owner badge (Provider / Client / Joint), Target Date, Status, Description
- Client can update status on tasks where `Owner = Client` or `Owner = Joint`
- Client can add a note/comment to tasks they own
- Client cannot see: Internal Notes, Forecast data, Provider-only tasks
- Clear callout for tasks that are overdue or due within 7 days
- "Last updated by [Provider Name] on [date]" timestamp in footer
- Mobile-responsive

### 6.8 Activity Log
- Per-MAP chronological activity feed (admin view)
- Tracks: task status changes, date changes, comments added, link shared, link accessed
- Shows: actor (admin user or "Client via shared link"), field changed, old → new value, timestamp
- Admins can add free-text notes to the activity log

### 6.9 MAP Templates
- Default template pre-loaded based on the 30-step sales process defined above
- Admins can create custom templates
- Templates define: phases, tasks, owner, estimated days, success criteria, forecast milestone flag, probability
- Apply template when creating a new MAP
- Cloning: duplicate an existing MAP as a template

### 6.10 Notifications (Phase 2)
Detailed in Section 12.

### 6.11 HubSpot Integration (Phase 3)
Detailed in Section 13.

---

## 7. Technical Architecture

### 7.1 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack in one repo; server components; API routes |
| Language | TypeScript | Type safety across frontend and backend |
| Database | PostgreSQL | Relational, robust, great ecosystem |
| ORM | Prisma | Type-safe queries; schema-as-code; excellent Next.js compatibility |
| Auth | NextAuth.js v5 (Auth.js) | Flexible; supports credentials + OAuth; works with App Router |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent UI components |
| Email | Resend | Developer-friendly; React Email templates; reliable deliverability |
| Background Jobs | Vercel Cron + pg-boss | Notification scheduling; async processing |
| File Storage | Vercel Blob (or S3) | Logo uploads |
| Hosting | Vercel | Zero-config Next.js deployment; edge functions |
| Monitoring | Sentry | Error tracking |
| Analytics | PostHog | Product analytics |

### 7.2 Repository Structure

```
map-app/
├── app/
│   ├── (admin)/                    # Auth-protected admin routes
│   │   ├── layout.tsx              # Admin shell layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── deals/
│   │   │   ├── page.tsx            # Deal list
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create deal
│   │   │   └── [dealId]/
│   │   │       ├── page.tsx        # Deal overview
│   │   │       └── map/
│   │   │           ├── page.tsx    # MAP editor
│   │   │           └── preview/
│   │   │               └── page.tsx  # Client preview mode
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── templates/
│   │       │   ├── page.tsx
│   │       │   └── [templateId]/
│   │       │       └── page.tsx
│   │       ├── team/
│   │       │   └── page.tsx
│   │       └── integrations/
│   │           └── page.tsx
│   ├── (client)/                   # Public client routes (no auth)
│   │   └── map/
│   │       └── [shareToken]/
│   │           └── page.tsx        # Client MAP view
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts
│   │   ├── deals/
│   │   │   ├── route.ts
│   │   │   └── [dealId]/
│   │   │       ├── route.ts
│   │   │       └── map/
│   │   │           ├── route.ts
│   │   │           ├── tasks/
│   │   │           │   ├── route.ts
│   │   │           │   └── [taskId]/
│   │   │           │       └── route.ts
│   │   │           └── share/
│   │   │               └── route.ts
│   │   ├── client/
│   │   │   └── [shareToken]/
│   │   │       ├── map/
│   │   │       │   └── route.ts    # Public MAP data
│   │   │       └── tasks/
│   │   │           └── [taskId]/
│   │   │               └── route.ts  # Client task updates
│   │   ├── templates/
│   │   │   ├── route.ts
│   │   │   └── [templateId]/
│   │   │       └── route.ts
│   │   ├── notifications/
│   │   │   └── route.ts
│   │   └── hubspot/
│   │       ├── sync/
│   │       │   └── route.ts
│   │       └── webhook/
│   │           └── route.ts
│   └── layout.tsx
├── components/
│   ├── admin/
│   │   ├── DashboardStats.tsx
│   │   ├── DealCard.tsx
│   │   ├── DealTable.tsx
│   │   ├── MapEditor.tsx
│   │   ├── MapPhase.tsx
│   │   ├── MapTaskRow.tsx
│   │   ├── TaskEditModal.tsx
│   │   ├── ForecastPanel.tsx
│   │   ├── ShareLinkModal.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── TemplateEditor.tsx
│   ├── client/
│   │   ├── ClientMapView.tsx
│   │   ├── ClientPhase.tsx
│   │   ├── ClientTaskRow.tsx
│   │   └── ClientTaskUpdateModal.tsx
│   └── shared/
│       ├── StatusBadge.tsx
│       ├── OwnerBadge.tsx
│       ├── ProgressBar.tsx
│       └── DateDisplay.tsx
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── auth.ts                     # NextAuth config
│   ├── share-token.ts              # Token generation utilities
│   ├── notifications.ts            # Email/notification helpers
│   └── hubspot.ts                  # HubSpot API client (Phase 3)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                     # Default template seed
├── emails/                         # React Email templates
│   ├── MapShared.tsx
│   ├── TaskReminder.tsx
│   ├── TaskUpdated.tsx
│   └── DealAtRisk.tsx
└── types/
    └── index.ts                    # Shared TypeScript types
```

---

## 8. Database Schema

### 8.1 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

enum UserRole {
  ADMIN
  MEMBER
  VIEWER
}

enum TaskOwner {
  PROVIDER
  CLIENT
  JOINT
}

enum TaskStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETE
  AT_RISK
  BLOCKED
}

enum DealStage {
  DISCOVERY
  PROPOSAL
  EVALUATION
  SOW_REVIEW
  NEGOTIATION
  CLOSED_WON
  CLOSED_LOST
}

enum MapStatus {
  DRAFT
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum NotificationType {
  DEADLINE_REMINDER
  TASK_UPDATED_BY_CLIENT
  TASK_OVERDUE
  MAP_SHARED
  DEAL_AT_RISK
  TASK_STATUS_CHANGED
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}

enum SyncDirection {
  INBOUND
  OUTBOUND
}

enum SyncStatus {
  SUCCESS
  FAILED
  PENDING
}

// ─────────────────────────────────────────────
// ORGANIZATIONS
// ─────────────────────────────────────────────

model Organization {
  id                String    @id @default(cuid())
  name              String
  slug              String    @unique
  logoUrl           String?
  hubspotPortalId   String?   @unique  // Phase 3
  hubspotAccessToken String?  // Phase 3 (encrypted)
  hubspotRefreshToken String? // Phase 3 (encrypted)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  users             User[]
  clients           Client[]
  deals             Deal[]
  templates         MapTemplate[]
}

// ─────────────────────────────────────────────
// USERS (Admin/Provider Team)
// ─────────────────────────────────────────────

model User {
  id              String       @id @default(cuid())
  email           String       @unique
  name            String
  hashedPassword  String?
  role            UserRole     @default(MEMBER)
  organizationId  String
  hubspotOwnerId  String?      // Phase 3
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])
  deals           Deal[]       @relation("DealOwner")
  createdMaps     Map[]        @relation("MapCreator")
  shareTokens     MapShareToken[]
  activityLog     MapActivity[]
  accounts        Account[]    // NextAuth
  sessions        Session[]    // NextAuth
}

// NextAuth required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─────────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────────

model Client {
  id                String    @id @default(cuid())
  organizationId    String
  companyName       String
  website           String?
  hubspotCompanyId  String?   // Phase 3
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  organization      Organization  @relation(fields: [organizationId], references: [id])
  contacts          ClientContact[]
  deals             Deal[]
}

model ClientContact {
  id                String    @id @default(cuid())
  clientId          String
  name              String
  email             String
  title             String?
  isChampion        Boolean   @default(false)
  hubspotContactId  String?   // Phase 3
  createdAt         DateTime  @default(now())

  client            Client    @relation(fields: [clientId], references: [id])
  tasks             MapTask[] @relation("TaskClientContact")
  notifications     Notification[]
}

// ─────────────────────────────────────────────
// DEALS
// ─────────────────────────────────────────────

model Deal {
  id                String      @id @default(cuid())
  organizationId    String
  clientId          String
  ownerId           String
  name              String
  dealValue         Decimal?    @db.Decimal(12, 2)
  stage             DealStage   @default(DISCOVERY)
  targetCloseDate   DateTime?
  actualCloseDate   DateTime?
  hubspotDealId     String?     // Phase 3
  isArchived        Boolean     @default(false)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  organization      Organization  @relation(fields: [organizationId], references: [id])
  client            Client        @relation(fields: [clientId], references: [id])
  owner             User          @relation("DealOwner", fields: [ownerId], references: [id])
  map               Map?
  hubspotSyncLogs   HubspotSyncLog[]  // Phase 3
}

// ─────────────────────────────────────────────
// MAPS
// ─────────────────────────────────────────────

model Map {
  id              String      @id @default(cuid())
  dealId          String      @unique
  title           String
  status          MapStatus   @default(ACTIVE)
  createdById     String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  deal            Deal        @relation(fields: [dealId], references: [id])
  createdBy       User        @relation("MapCreator", fields: [createdById], references: [id])
  phases          MapPhase[]
  shareTokens     MapShareToken[]
  activityLog     MapActivity[]
  notifications   Notification[]
}

model MapPhase {
  id            String    @id @default(cuid())
  mapId         String
  name          String
  displayOrder  Int
  createdAt     DateTime  @default(now())

  map           Map       @relation(fields: [mapId], references: [id], onDelete: Cascade)
  tasks         MapTask[]
}

model MapTask {
  id                  String      @id @default(cuid())
  phaseId             String
  mapId               String      // denormalized for easy querying
  title               String
  description         String?     @db.Text
  owner               TaskOwner
  providerContact     String?     // free text: role/name on provider side
  clientContactId     String?
  estimatedDays       Int?
  targetDate          DateTime?
  completedDate       DateTime?
  originalTargetDate  DateTime?   // set once on first target date assignment; used for at-risk detection
  status              TaskStatus  @default(NOT_STARTED)
  dependsOn           String[]    // array of MapTask IDs
  successCriteria     String?     @db.Text
  internalNotes       String?     @db.Text  // never sent to client
  isClientVisible     Boolean     @default(true)
  isTbdWithClient     Boolean     @default(false)  // flags steps needing client input on dates
  isForecastMilestone Boolean     @default(false)
  forecastProbability Int?        // 0–100, only used if isForecastMilestone = true
  displayOrder        Int
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  phase               MapPhase    @relation(fields: [phaseId], references: [id], onDelete: Cascade)
  clientContact       ClientContact? @relation("TaskClientContact", fields: [clientContactId], references: [id])
  activityLog         MapActivity[]
  notifications       Notification[]
}

// ─────────────────────────────────────────────
// SHARE TOKENS
// ─────────────────────────────────────────────

model MapShareToken {
  id                  String    @id @default(cuid())
  mapId               String
  token               String    @unique  // cryptographically random, URL-safe
  isActive            Boolean   @default(true)
  allowClientEdits    Boolean   @default(true)
  allowClientNotes    Boolean   @default(true)
  expiresAt           DateTime?
  createdById         String
  lastAccessedAt      DateTime?
  totalViews          Int       @default(0)
  createdAt           DateTime  @default(now())

  map                 Map       @relation(fields: [mapId], references: [id])
  createdBy           User      @relation(fields: [createdById], references: [id])
}

// ─────────────────────────────────────────────
// ACTIVITY LOG
// ─────────────────────────────────────────────

model MapActivity {
  id                  String    @id @default(cuid())
  mapId               String
  taskId              String?
  actorUserId         String?   // null if actor was client
  actorShareToken     String?   // set when client makes a change
  actorLabel          String    // display name: "John Smith" or "Client (via shared link)"
  action              String    // e.g. "updated status", "changed target date", "added note"
  fieldChanged        String?
  oldValue            String?
  newValue            String?
  note                String?   @db.Text
  createdAt           DateTime  @default(now())

  map                 Map       @relation(fields: [mapId], references: [id])
  task                MapTask?  @relation(fields: [taskId], references: [id])
  actorUser           User?     @relation(fields: [actorUserId], references: [id])
}

// ─────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────

model MapTemplate {
  id              String    @id @default(cuid())
  organizationId  String
  name            String
  description     String?
  isDefault       Boolean   @default(false)
  createdById     String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  organization    Organization      @relation(fields: [organizationId], references: [id])
  phases          MapTemplatePhase[]
}

model MapTemplatePhase {
  id            String    @id @default(cuid())
  templateId    String
  name          String
  displayOrder  Int

  template      MapTemplate       @relation(fields: [templateId], references: [id], onDelete: Cascade)
  tasks         MapTemplateTask[]
}

model MapTemplateTask {
  id                  String    @id @default(cuid())
  phaseId             String
  title               String
  description         String?   @db.Text
  owner               TaskOwner
  providerContact     String?
  estimatedDays       Int?
  successCriteria     String?   @db.Text
  isClientVisible     Boolean   @default(true)
  isTbdWithClient     Boolean   @default(false)
  isForecastMilestone Boolean   @default(false)
  forecastProbability Int?
  displayOrder        Int

  phase               MapTemplatePhase @relation(fields: [phaseId], references: [id], onDelete: Cascade)
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

model Notification {
  id                  String              @id @default(cuid())
  mapId               String
  taskId              String?
  recipientUserId     String?             // admin user recipient
  recipientContactId  String?             // client contact recipient
  recipientEmail      String?             // fallback email
  type                NotificationType
  status              NotificationStatus  @default(PENDING)
  scheduledFor        DateTime
  sentAt              DateTime?
  payload             Json                // email subject, body context, etc.
  createdAt           DateTime            @default(now())

  map                 Map           @relation(fields: [mapId], references: [id])
  task                MapTask?      @relation(fields: [taskId], references: [id])
  recipientContact    ClientContact? @relation(fields: [recipientContactId], references: [id])
}

// ─────────────────────────────────────────────
// HUBSPOT (Phase 3)
// ─────────────────────────────────────────────

model HubspotSyncLog {
  id                String      @id @default(cuid())
  dealId            String?
  hubspotObjectType String      // "deal", "contact", "company"
  hubspotObjectId   String
  direction         SyncDirection
  status            SyncStatus
  errorMessage      String?
  payload           Json?
  syncedAt          DateTime    @default(now())

  deal              Deal?       @relation(fields: [dealId], references: [id])
}
```

---

## 9. API Design

All admin endpoints require a valid session. Client endpoints authenticate via share token.

### 9.1 Deals

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/deals` | List all deals for the org (supports filters: `stage`, `ownerId`, `isArchived`) |
| `POST` | `/api/deals` | Create a new deal |
| `GET` | `/api/deals/:dealId` | Get deal details |
| `PATCH` | `/api/deals/:dealId` | Update deal (name, value, stage, close date, etc.) |
| `DELETE` | `/api/deals/:dealId` | Archive a deal |

### 9.2 MAPs

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/deals/:dealId/map` | Get full MAP (phases + tasks) |
| `POST` | `/api/deals/:dealId/map` | Create MAP for a deal (body: `templateId` optional) |
| `PATCH` | `/api/deals/:dealId/map` | Update MAP metadata (title, status) |
| `GET` | `/api/deals/:dealId/map/forecast` | Get forecast summary data |
| `GET` | `/api/deals/:dealId/map/activity` | Get activity log |
| `POST` | `/api/deals/:dealId/map/activity` | Add a manual note to activity log |

### 9.3 MAP Phases

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/deals/:dealId/map/phases` | Add a new phase |
| `PATCH` | `/api/deals/:dealId/map/phases/:phaseId` | Rename or reorder phase |
| `DELETE` | `/api/deals/:dealId/map/phases/:phaseId` | Delete phase (and its tasks) |
| `POST` | `/api/deals/:dealId/map/phases/reorder` | Bulk reorder phases (body: `[{id, displayOrder}]`) |

### 9.4 MAP Tasks

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/deals/:dealId/map/tasks` | Create a task |
| `PATCH` | `/api/deals/:dealId/map/tasks/:taskId` | Update any task field |
| `DELETE` | `/api/deals/:dealId/map/tasks/:taskId` | Delete a task |
| `POST` | `/api/deals/:dealId/map/tasks/reorder` | Bulk reorder tasks within a phase |

**PATCH Task Body (all fields optional):**
```json
{
  "title": "string",
  "description": "string",
  "owner": "PROVIDER | CLIENT | JOINT",
  "providerContact": "string",
  "clientContactId": "string",
  "estimatedDays": 0,
  "targetDate": "ISO date",
  "completedDate": "ISO date",
  "status": "NOT_STARTED | IN_PROGRESS | COMPLETE | AT_RISK | BLOCKED",
  "dependsOn": ["taskId1", "taskId2"],
  "successCriteria": "string",
  "internalNotes": "string",
  "isClientVisible": true,
  "isTbdWithClient": false,
  "isForecastMilestone": false,
  "forecastProbability": 65
}
```

### 9.5 Share Token

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/deals/:dealId/map/share` | Get active share token(s) for the MAP |
| `POST` | `/api/deals/:dealId/map/share` | Generate a new share token |
| `PATCH` | `/api/deals/:dealId/map/share/:tokenId` | Update token settings (expiry, permissions) |
| `DELETE` | `/api/deals/:dealId/map/share/:tokenId` | Revoke a token |

### 9.6 Client (Public — No Auth Required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/client/:shareToken/map` | Get client-visible MAP data (validates token, records view) |
| `PATCH` | `/api/client/:shareToken/tasks/:taskId` | Client updates a task (restricted fields only) |

**Client PATCH Task — Allowed Fields:**
```json
{
  "status": "IN_PROGRESS | COMPLETE | AT_RISK | BLOCKED",
  "completedDate": "ISO date",
  "note": "string"  // appended to activity log
}
```

The API validates that: the task `isClientVisible = true`, `owner` is `CLIENT` or `JOINT`, the token is active and not expired, and `allowClientEdits = true` on the token.

### 9.7 Templates

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/templates` | List all templates for the org |
| `POST` | `/api/templates` | Create a template |
| `GET` | `/api/templates/:templateId` | Get template with phases + tasks |
| `PATCH` | `/api/templates/:templateId` | Update template metadata |
| `DELETE` | `/api/templates/:templateId` | Delete template |

### 9.8 Notifications

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/notifications` | List scheduled notifications for org |
| `POST` | `/api/notifications` | Manually schedule a notification |
| `DELETE` | `/api/notifications/:id` | Cancel a pending notification |

---

## 10. Frontend Architecture

### 10.1 Admin Pages

#### `/dashboard`
- Summary cards: Total Active Deals, Total Pipeline ($), Weighted Forecast ($), Closing This Month
- Deal table with sortable columns and filters
- Each row links to `/deals/[dealId]/map`
- At-risk indicator on rows where milestone dates have slipped

#### `/deals/new`
- Step 1: Client lookup or create new client
- Step 2: Deal details (name, value, target close date)
- Step 3: Select MAP template (or blank)
- Redirects to MAP editor on create

#### `/deals/[dealId]/map`
- Split layout:
  - **Left/Main**: MAP editor — phases as expandable accordion sections, tasks as rows
  - **Right panel** (toggleable): Forecast Summary OR Activity Feed
- Top bar: Deal name, client name, share link button, preview button, last updated
- Each phase header shows: phase name, task count, progress (X/Y complete)
- Each task row shows inline: status badge, owner badge, task title, target date
- Click task → opens `TaskEditModal` with all fields
- Inline editing for status and date (click-to-edit)
- "Add task" button at bottom of each phase
- "Add phase" button at bottom of MAP
- Drag handle for reordering tasks and phases

#### `/deals/[dealId]/map/preview`
- Read-only render of exactly what the client will see
- Banner: "This is a preview of the client view"
- Uses identical `ClientMapView` component

#### `/settings/templates/[templateId]`
- Same MAP editor UX but operating on template data
- No dates (templates have estimated days, not actual dates)

### 10.2 Client Pages

#### `/map/[shareToken]`
- Clean, professional layout with provider logo + name
- Page title: "[Provider] × [Client] — Mutual Action Plan"
- Progress bar: "X of Y steps complete"
- Phases as sections with tasks listed beneath
- Each task card: status badge, owner badge, title, target date, description
- "Your tasks" section at top — highlights tasks owned by client with upcoming deadlines
- Overdue tasks highlighted in amber/red
- Tasks due within 7 days highlighted with a warning
- Client-owned tasks have an "Update" button → opens inline update panel (status + note)
- Footer: "Last updated [date] · Managed by [Provider Name]"
- No navigation, no sidebar — clean single-page experience

### 10.3 Key Components

**`StatusBadge`** — Color-coded pill for task status
- Not Started: gray
- In Progress: blue
- Complete: green
- At Risk: amber
- Blocked: red

**`OwnerBadge`** — Distinguishes Provider / Client / Joint

**`ProgressBar`** — Phase or MAP-level completion percentage

**`TaskEditModal`** — Full task editing drawer/modal for admins
- Tabbed: Details / Internal Notes / Activity

**`ForecastPanel`** — Collapsible right panel showing milestone table + weighted pipeline

**`ShareLinkModal`** — Shows share URL, access controls, last-accessed info, copy/email buttons

---

## 11. Authentication & Security

### 11.1 Admin Authentication
- NextAuth.js v5 with Credentials provider (email + bcrypt password)
- Optional: Google OAuth provider
- Session stored as JWT (httpOnly cookie)
- All admin API routes validate session server-side
- Organization-scoped queries: every DB query filters by the user's `organizationId`

### 11.2 Client Authentication (Token-Based)
- Share tokens are generated using `crypto.randomBytes(32).toString('base64url')` — 256 bits of entropy
- Stored as plaintext in DB (tokens are not passwords; they are effectively public URLs — security comes from entropy and revocability)
- Validated on every client API request: check `isActive`, check `expiresAt` if set
- Rate limiting on client endpoints: max 60 requests/minute per token (via Vercel Edge middleware)
- Token revocation immediately blocks all access
- `lastAccessedAt` and `totalViews` updated on each MAP load

### 11.3 Data Isolation
- Every query scoped to `organizationId` — no cross-org data leakage
- Client share tokens only expose `isClientVisible = true` tasks
- Forecast data and internal notes never returned from client API routes
- Input validation with Zod on all API routes
- Parameterized queries only (Prisma handles this)

### 11.4 Additional Security
- CSRF protection via NextAuth built-ins
- Helmet-equivalent headers via Next.js `next.config.js` headers config
- Environment variables for all secrets (never committed)
- Vercel environment variable encryption at rest

---

## 12. Notifications

### 12.1 Notification Types

| Type | Trigger | Recipient |
|---|---|---|
| `MAP_SHARED` | Admin sends share link | Client champion (email with link) |
| `DEADLINE_REMINDER` | 7 days before task target date | Task owner (client or admin) |
| `DEADLINE_REMINDER` | 2 days before task target date | Task owner |
| `TASK_OVERDUE` | Day after target date passes with status not Complete | Task owner + AE |
| `TASK_UPDATED_BY_CLIENT` | Client changes status or adds note | AE (deal owner) |
| `DEAL_AT_RISK` | Forecast milestone slips > 7 days | AE + their manager |

### 12.2 Notification Delivery

**Phase 2 — Email only** via Resend:
- Transactional templates built with React Email
- Each template receives typed props from the `payload` JSON column
- Unsubscribe link in every client-facing email

**Phase 3 — Consider:**
- In-app notifications (admin dashboard)
- Web Push Notifications for client (requires service worker + browser permission)
- Slack integration for internal AE notifications

### 12.3 Scheduling Architecture

```
Vercel Cron Job → /api/cron/notifications (runs every hour)
  → Query Notification table WHERE status = PENDING AND scheduledFor <= now()
  → For each: send email via Resend → update status to SENT/FAILED
```

Notifications are created/scheduled whenever:
- A task target date is set or updated (schedules reminders at T-7 and T-2 days)
- A share token is generated (schedules MAP_SHARED email)
- A milestone slips (detected by comparing `targetDate` to `originalTargetDate`)

### 12.4 Email Templates

**`MapShared.tsx`**
```
Subject: [Provider] has shared a Mutual Action Plan with you
Body:
  - What a MAP is (1 sentence)
  - "Your Action Plan for [Deal Name]"
  - CTA button: "View Your Action Plan"
  - List of their upcoming tasks with dates
```

**`TaskReminder.tsx`**
```
Subject: Reminder: "[Task Title]" is due in [X] days
Body:
  - Task details
  - Current status
  - CTA: "Update Task" → links directly to client MAP view
```

**`TaskUpdatedByClient.tsx`**
```
Subject: [Client Name] updated a task on your MAP
Body:
  - Which task was updated
  - Old status → New status
  - Any notes added
  - CTA: "View MAP"
```

---

## 13. HubSpot Integration (Phase 3)

### 13.1 OAuth Flow
- Admin navigates to Settings → Integrations → Connect HubSpot
- Redirect to HubSpot OAuth authorization URL
- HubSpot returns `code` → exchange for `access_token` + `refresh_token`
- Store tokens encrypted in `Organization.hubspotAccessToken/RefreshToken`
- Token refresh handled automatically on expiry

### 13.2 Deal Sync: HubSpot → MAP

**Trigger:** Webhook from HubSpot on deal create/update, OR manual sync
**Logic:**
1. Receive deal from HubSpot (deal name, value, owner, close date, associated contacts)
2. `upsert` into `Deal` table using `hubspotDealId` as unique key
3. If new deal + no MAP exists → auto-create MAP from default template
4. Map HubSpot deal stage to `DealStage` enum
5. Map HubSpot deal owner (by `hubspotOwnerId`) to `User`
6. Create/update `Client` and `ClientContact` records from associated HubSpot company/contacts

### 13.3 MAP Milestones → HubSpot

When a Forecast Milestone task status changes to `COMPLETE`:
1. Look up the HubSpot deal by `hubspotDealId`
2. Write the milestone completion date to a custom HubSpot deal property (e.g., `map_sow_delivered_date`)
3. Optionally advance the HubSpot deal stage based on milestone reached (configurable)

When Contract Signed task (Close Date milestone) is marked `COMPLETE`:
1. Update HubSpot deal `closedate` to `completedDate`
2. Update HubSpot deal stage to `closedwon`

### 13.4 HubSpot Deal Sidebar Card (App Card)

- Build a HubSpot CRM Card (private app) that embeds in the deal sidebar
- Shows: MAP progress %, next due task, overdue count, link to full MAP
- Allows AE to click into the MAP from within HubSpot

### 13.5 Custom HubSpot Deal Properties

| Property Name | Type | Description |
|---|---|---|
| `map_id` | String | MAP application ID |
| `map_status` | Enum | Draft / Active / Completed |
| `map_progress_pct` | Number | % of tasks complete |
| `map_close_date` | Date | Contract Signed target date from MAP |
| `map_proposal_presented_date` | Date | Step 5 completion date |
| `map_verbal_approval_date` | Date | Step 10 completion date |
| `map_sow_delivered_date` | Date | Step 14 completion date |
| `map_contract_terms_aligned_date` | Date | Step 22 completion date |
| `map_at_risk` | Boolean | Any milestone slipped > 7 days |

---

## 14. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load time (admin MAP view) | < 2 seconds (p95) |
| Page load time (client MAP view) | < 1.5 seconds (p95) |
| API response time | < 500ms (p95) |
| Uptime | 99.9% (Vercel SLA) |
| Database connection pooling | Prisma + PgBouncer via Supabase or Neon |
| Mobile responsiveness | Client view fully responsive; admin view responsive at ≥ 768px |
| Browser support | Latest 2 versions of Chrome, Firefox, Safari, Edge |
| Accessibility | WCAG 2.1 AA on client-facing pages |
| Data backup | Daily automated backups; 30-day retention |
| GDPR / Privacy | Client email addresses stored; unsubscribe honored; data deletion on request |

---

## 15. Open Questions

1. **Multi-org / SaaS model:** Is this a single-tenant internal tool for one company, or a multi-tenant SaaS product that other service providers could use? (Schema supports multi-tenant; auth flows differ slightly.)

2. **Client identity:** Should clients be required to provide their name/email before editing tasks, or is anonymous editing via token acceptable for MVP?

3. **Notification opt-in:** Should clients opt into email notifications explicitly, or should they be auto-enrolled when the MAP is shared with them?

4. **MAP versioning:** Should we track versions/snapshots of the MAP over time (e.g., "this is what the MAP looked like at the time of contract signing")?

5. **Deal ↔ MAP cardinality:** Is one MAP per deal always correct, or could a deal have multiple MAPs (e.g., for multi-phase projects)?

6. **Template customization per deal:** After applying a template, the AE customizes the MAP. Should those customizations be saveable as a "variant" template, or is that scope creep for MVP?

7. **HubSpot field mapping UI:** For the HubSpot integration, should there be an admin UI to configure which HubSpot deal stage maps to which MAP milestone, or is this hardcoded initially?

8. **Branding / white-labeling:** Should the client-facing MAP view support custom colors/logos per organization, or a single provider logo?

9. **Pricing model** (if SaaS): Per seat? Per active MAP? Flat fee?

10. **Offline / PWA:** Should the client MAP view work offline (Progressive Web App)? Relevant for mobile users with unreliable connectivity.

---

## Appendix A — Default Template (30-Step Sales Process)

The seed file (`prisma/seed.ts`) will pre-load one `MapTemplate` record with the following phases and tasks derived from the validated 30-step sales process. Tasks flagged as `isTbdWithClient = true` include explicit callouts in `description` reminding the AE to collaboratively map timelines with the client.

| Step | Phase | Title | Owner | Client Visible | Forecast Milestone | Probability |
|---|---|---|---|---|---|---|
| 1 | Discovery & Scoping | Discovery / Scoping Call | JOINT | Y | | |
| 2 | Discovery & Scoping | Internal debrief & requirements summary | PROVIDER | N | | |
| 3 | Proposal Development | Build proposal with Ops team | PROVIDER | N | | |
| 4 | Proposal Development | Internal proposal review & sign-off | PROVIDER | N | | |
| 5 | Proposal Presentation | Present proposal to client | JOINT | Y | ✓ | 25% |
| 6 | Proposal Presentation | Follow-up: address questions & objections | JOINT | Y | | |
| 7 | Client Internal Review | **[TBD] Client shares proposal internally** | CLIENT | Y | | |
| 8 | Client Internal Review | **[TBD] Client internal stakeholder review** | CLIENT | Y | | |
| 9 | Client Internal Review | Provider check-in / status update | JOINT | Y | | |
| 10 | Client Decision | **[TBD] Client verbal approval to proceed with SOW** | CLIENT | Y | ✓ | 50% |
| 11 | SOW Development | Build Statement of Work | PROVIDER | N | | |
| 12 | SOW Development | Build internal capacity & resource plan | PROVIDER | N | | |
| 13 | SOW Development | Internal SOW review & approval | PROVIDER | N | | |
| 14 | SOW Review | Share SOW to client | PROVIDER | Y | ✓ | 65% |
| 15 | SOW Review | **[TBD] Client SOW review** | CLIENT | Y | | |
| 16 | SOW Review | Client SOW feedback / requested changes | CLIENT | Y | | |
| 17 | SOW Review | Provider reviews & responds to feedback | PROVIDER | Y | | |
| 18 | SOW Review | SOW revision (if applicable) | PROVIDER | N | | |
| 19 | Contract Negotiations | Legal review initiated — Client | CLIENT | Y | | |
| 20 | Contract Negotiations | Legal review initiated — Provider | PROVIDER | N | | |
| 21 | Contract Negotiations | Contract redlines exchanged | JOINT | Y | | |
| 22 | Contract Negotiations | Final contract terms aligned | JOINT | Y | ✓ | 80% |
| 23 | Contract Execution | Final contract issued for signature | PROVIDER | Y | | |
| 24 | Contract Execution | **CONTRACT SIGNED — CLOSED WON** | JOINT | Y | ✓ | 100% |
| 25 | Internal Preparation | Internal staffing alignment | PROVIDER | N | | |
| 26 | Internal Preparation | Internal capacity & scheduling confirmation | PROVIDER | N | | |
| 27 | Internal Preparation | Internal handoff call | PROVIDER | N | | |
| 28 | Internal Preparation | Project setup (systems / tools / access) | PROVIDER | N | | |
| 29 | Client Onboarding | Kickoff call with client | JOINT | Y | ✓ | 100% |
| 30 | Client Onboarding | Onboarding begins | JOINT | Y | | |
