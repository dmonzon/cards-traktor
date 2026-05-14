# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint via next lint
npm run db:push      # Apply schema changes to DB (no migration files)
npm run db:studio    # Open Prisma Studio UI
npx prisma generate  # Regenerate Prisma client after schema changes
```

Required `.env.local` before running:
```
DATABASE_URL="postgresql://user:password@localhost:5432/cards_traktor"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
```

## Architecture

**Next.js 15 App Router** with `"type": "module"` in package.json. All route handlers, Server Components, and middleware coexist under `app/`.

### Auth flow
- `lib/authOptions.ts` — central `NextAuthOptions` object (Credentials provider + JWT strategy). Imported by the NextAuth route handler, by `getServerSession()` in Server Components, and by `withAuth` middleware.
- `app/api/auth/[...nextauth]/route.ts` — NextAuth v4 App Router handler: `export { handler as GET, handler as POST }`.
- `middleware.ts` (project root) — uses `withAuth` to guard `/dashboard/:path*` and `/api/plans/:path*`. Never include `/api/auth/:path*` in the matcher.
- `components/providers/SessionProvider.tsx` — client boundary wrapper. `app/layout.tsx` fetches the session server-side with `getServerSession(authOptions)` and passes it as a prop to avoid client-side loading flicker.
- `types/next-auth.d.ts` — module augmentation that adds `id` to `Session["user"]` and `JWT`.

### Payment plan engine
`lib/payment-plan.ts` exports two pure functions: `calculateAvalanchePlan` and `calculateSnowballPlan`. Both accept `CreditCardInput[]` + a `monthlyPayment` number and return a `PaymentPlanResult` with per-month `PaymentItem[]`. Interest is computed monthly (`annualRate / 100 / 12`). The simulation caps at 360 months (30 years).

### Database layer
`lib/db.ts` exports a singleton `PrismaClient` instance using the Next.js global pattern to survive hot reloads. All DB access goes through this singleton. `lib/auth.ts` exposes user CRUD (`createUser`, `getUserByEmail`, `getUserById`) and password utilities (`hashPassword`, `verifyPassword`) built on top of it.

### Data model relationships
`User → CreditCard[]` and `User → PaymentPlan[]` (both cascade-delete). `PaymentItem` is the join between `CreditCard` and `PaymentPlan`, storing the month-by-month breakdown. `CreditCard` names are unique per user (`@@unique([userId, name])`).

## Key constraints

- **NextAuth v4** (not v5/Auth.js). `getServerSession` imports from `"next-auth/next"`, not from `"next-auth"`.
- `session: { strategy: "jwt" }` must be explicit in `authOptions` — no database adapter is used.
- `app/` is the only source of pages and API routes — no `pages/` directory.
- The app stores only balance and interest rate — never card numbers or full account details.
- `interestRate` is stored as annual percentage (e.g., `24.5` for 24.5% APR).
