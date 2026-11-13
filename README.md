# Merit Data Collection System

Internal app for collecting closing merit data for Pakistan University Admission Predictor.

## Features

✅ **3-User System** - user1, user2, user3 (team collaboration)  
✅ **266 Universities** - Pre-loaded from refined dataset  
✅ **2,697 Programs** - All programs organized by university  
✅ **263 Merit Formulas** - Calculation formulas included  
✅ **CRUD Operations** - Add, edit, view merit entries  
✅ **PostgreSQL Database** - Hosted on Vercel  
✅ **Deployed on Vercel** - Accessible via URL  
✅ **Real-time Collaboration** - All 3 members can work simultaneously  

## Quick Start

### Local Development

```bash
npm install
cp .env.example .env.local
# Add your database credentials
npm run dev
```

### Deploy to Vercel

See `DEPLOYMENT_GUIDE.md` for complete instructions.

## Login Credentials

- **user1** / password123
- **user2** / password123
- **user3** / password123

## Tech Stack

- **Frontend:** Next.js 15, React, TailwindCSS
- **Backend:** Next.js API Routes, Server Actions
- **Database:** PostgreSQL (Vercel Postgres)
- **Auth:** NextAuth.js v5
- **Deployment:** Vercel

## Database Schema

- `users` - 3 team members
- `universities` - 266 universities
- `programs` - 2,697 programs
- `merit_formulas` - 263 formulas
- `closing_merits` - **Main collection target** (empty, to be filled)
- `merit_lists` - Multiple lists per year
- `activity_log` - Track who added what

## Usage

1. Login with your credentials
2. Select a university from dashboard
3. Browse programs in that university
4. Click a program to add merit data
5. Fill in:
   - Year (2021-2026)
   - Closing Merit % (required)
   - Opening Merit %
   - Seats, category, source URL, notes
6. Submit and repeat!

## Goal

Collect closing merit data for all programs across 5 years:
- **Target:** 13,150+ merit entries
- **Current:** 0 (ready to start!)

## Project Structure

```
merit-data-app/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── university/[id]/
│   │   ├── page.tsx          # University detail
│   │   └── UniversityDashboard.tsx
│   └── api/
│       ├── auth/[...nextauth]/
│       └── closing-merits/
├── lib/
│   ├── auth.ts               # Authentication
│   ├── db.ts                 # Database functions
│   ├── db-schema.sql         # Database schema
│   └── seed-data.ts          # Data seeding script
├── .env.example              # Environment template
└── DEPLOYMENT_GUIDE.md       # Deployment instructions
```

## Team Workflow

1. **user1** focuses on Tier 1 universities (NUST, LUMS, FAST, etc.)
2. **user2** focuses on Tier 2 universities (UET, GCU, etc.)
3. **user3** focuses on Tier 3 or verification/quality check

All changes are saved to shared database in real-time.

## Export Data

When done, export via SQL:

```sql
SELECT * FROM closing_merits
ORDER BY university_id, program_id, year;
```

Save as JSON for your main app!

---

Built for Pakistan University Admission Predictor 🇵🇰
