# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This repository is in the **pre-implementation planning phase**. The codebase does not yet exist. The repository contains:
- `MAP_App_PRD.md` — Full product requirements document
- `MAP_Template.csv` — The 30-step sales process template that seeds the default MAP template

## What Is Being Built

**MAP** is a collaborative web application for managing Mutual Action Plans — shared deal roadmaps between service providers (admins) and their clients. Admins create and manage MAPs; clients access them via a private share token link (no login required).

## Intended Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v5 (Auth.js) — credentials + optional Google OAuth |
| Styling | Tailwind CSS + shadcn/ui |
| Email | Resend with React Email templates |
| Background Jobs | Vercel Cron + pg-boss |
| Hosting | Vercel |

## Development Commands (once project is scaffolded)

```bash
# Install dependencies
npm install

# Database
npx prisma generate          # Regenerate Prisma client after schema changes
npx prisma migrate dev       # Apply migrations in development
npx prisma db seed           # Seed default 30-step MAP template
npx prisma studio            # Open Prisma Studio GUI

# Development server
npm run dev

# Build
npm run build

# Lint / typecheck
npm run lint
npm run typecheck
```

## Architecture Overview

### Route Groups
The app uses two Next.js route groups:
- `app/(admin)/` — All auth-protected admin routes (dashboard, deal management, MAP editor, settings)
- `app/(client)/map/[shareToken]/` — Public client MAP view; no auth, validated by share token

### API Structure
- `app/api/deals/[dealId]/map/...` — Admin MAP management endpoints (session-authenticated)
- `app/api/client/[shareToken]/...` — Public client endpoints (token-authenticated); only returns `isClientVisible = true` tasks, never returns forecast data or internal notes

### Authentication Model
- **Admins**: NextAuth.js session (JWT in httpOnly cookie); every DB query scoped by `organizationId`
- **Clients**: 256-bit cryptographically random share tokens stored in `MapShareToken` table; validated on every request for `isActive` and `expiresAt`

### Key Domain Concepts

**Task fields that control visibility/behavior:**
- `isClientVisible` — whether the task appears in the client view
- `isForecastMilestone` + `forecastProbability` — drives the Forecast Panel (admin-only)
- `isTbdWithClient` — flags tasks where dates need to be collaboratively set with the client
- `internalNotes` — never exposed via client API routes
- `originalTargetDate` — set once on first date assignment; used to detect at-risk milestones (slipped > 7 days)

**Task ownership** (`TaskOwner` enum): `PROVIDER` | `CLIENT` | `JOINT`
- Only `CLIENT` or `JOINT` tasks can be updated via the client API

**Task status** (`TaskStatus` enum): `NOT_STARTED` | `IN_PROGRESS` | `COMPLETE` | `AT_RISK` | `BLOCKED`

**Multi-tenancy**: Every model scopes to `organizationId`. One organization = one service provider company.

### Default Template
`prisma/seed.ts` pre-loads the 30-step sales process from `MAP_Template.csv` as the default `MapTemplate`. This includes 8 phases: Discovery & Scoping → Proposal Development → Proposal Presentation → Client Internal Review → Client Decision → SOW Development → SOW Review → Contract Negotiations → Contract Execution → Internal Preparation → Client Onboarding. Six steps are forecast milestones (Steps 5, 10, 14, 22, 24, 29) with probabilities 25%, 50%, 65%, 80%, 100%, 100%.

### Notification Scheduling
Notifications are stored in the `Notification` table and processed by a Vercel Cron job hitting `/api/cron/notifications` hourly. Reminders are scheduled at T-7 and T-2 days when a task target date is set.

## Development Phases

- **Phase 1 (MVP)**: Auth, deal/MAP CRUD, MAP editor, client share link view, forecast panel
- **Phase 2**: Email notifications (Resend), activity log, MAP templates, at-risk flagging
- **Phase 3**: HubSpot OAuth integration — bidirectional deal/contact sync, milestone writebacks, CRM sidebar card

## Key Security Rules

- All admin API routes must validate session and scope queries to `session.user.organizationId`
- Client API routes must validate token `isActive`, `expiresAt`, and that the task being modified has `owner = CLIENT | JOINT` and `isClientVisible = true`
- Forecast data and `internalNotes` must never be returned from client API routes
- Input validation with Zod on all API routes
- Share tokens use `crypto.randomBytes(32).toString('base64url')`
