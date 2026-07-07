# JobTrackr — Job Application Tracker

A production-ready web app for tracking job applications through the pipeline: Applied → Interview → Offer → Rejected.

Built with Next.js 16, TypeScript, Prisma, SQLite, Tailwind CSS, and more.

## Features

- **Authentication** — Email/password sign-up and sign-in via NextAuth Credentials provider
- **Job Application CRUD** — Create, edit, archive, and delete applications
- **Kanban Board** — Drag-and-drop applications between status columns using @dnd-kit
- **Reminders & Follow-ups** — Set follow-up dates per application with overdue alerts
- **Dashboard** — Summary cards, status breakdown pie chart, weekly trend bar chart
- **Analytics** — Response rate, interview rate, offer rate, funnel summary
- **Notes & Tags** — Add notes per application, tag with colors
- **Activity Log** — Automatic timeline of status changes and actions
- **Search, Filter & Sort** — Find applications quickly
- **Responsive** — Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | SQLite (local) / Turso (production) |
| ORM | Prisma 7 |
| Auth | NextAuth v5 (Credentials) |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |
| Validation | Zod 4 |
| Testing | Jest + React Testing Library |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Clone the repo
cd job-application-tracker

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Seed the database with demo data
npm run seed

# Start the dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and sign in with:

```
Email:    demo@jobtrackr.com
Password: password123
```

### Environment Variables

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/        # Login, Signup pages
│   ├── (app)/         # Dashboard, Kanban, Applications, Reminders, Analytics
│   └── api/           # NextAuth route handler
├── components/
│   ├── applications/  # Application card, modal
│   ├── kanban/        # Kanban board, column, card
│   ├── reminders/     # Reminders list
│   ├── dashboard/     # Dashboard content, charts
│   └── layout/        # Sidebar navigation
├── actions/           # Server Actions
├── lib/               # Prisma client, auth config, validations, utils
└── types/             # TypeScript types
prisma/
├── schema.prisma      # Database schema
└── seed.ts            # Seed script
middleware.ts          # Auth middleware
```

## Deployment

### Vercel (Free Tier)

1. Push the repo to GitHub
2. Import into Vercel
3. Set environment variables:
   - `DATABASE_URL` — For production, use Turso (libSQL) and set the URL
   - `NEXTAUTH_SECRET` — Generate a random string
   - `NEXTAUTH_URL` — Your production URL

### Turso (Production Database)

```bash
# Install Turso CLI
npm install -g turso

# Create a database
turso db create jobtrackr

# Get the connection URL
turso db show jobtrackr --url

# Create an auth token
turso db tokens create jobtrackr
```

Update `DATABASE_URL` in your production environment.

## License

MIT
