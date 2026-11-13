# Merit Data Collection App - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
1. GitHub account
2. Vercel account (free tier is fine)
3. Your existing refined data files

### Step 1: Push to GitHub

```bash
cd merit-data-app
git init
git add .
git commit -m "Initial commit: Merit data collection app"
gh repo create pakistan-merit-data --private
git remote add origin https://github.com/YOUR_USERNAME/pakistan-merit-data.git
git push -u origin main
```

### Step 2: Create Vercel Postgres Database

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database"
3. Choose "Postgres"
4. Select region (closest to Pakistan: Singapore or Mumbai)
5. Click "Create"
6. Copy all the connection strings (you'll need them)

### Step 3: Initialize Database Schema

1. In Vercel dashboard, go to your Postgres database
2. Click "Query" tab
3. Copy the entire content from `lib/db-schema.sql`
4. Paste and click "Run Query"
5. Verify all tables are created

### Step 4: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

4. Add Environment Variables:
   ```
   POSTGRES_URL=postgres://...
   POSTGRES_PRISMA_URL=postgres://...
   POSTGRES_URL_NON_POOLING=postgres://...
   POSTGRES_USER=...
   POSTGRES_HOST=...
   POSTGRES_PASSWORD=...
   POSTGRES_DATABASE=...
   AUTH_SECRET=<generate with: openssl rand -base64 32>
   AUTH_URL=https://your-app.vercel.app
   ```

5. Click "Deploy"

### Step 5: Seed the Database

After deployment, import your existing data using the pre-generated SQL file:

#### Recommended: Use Pre-Generated SQL File ✅

We've already generated `seed-data.sql` with:
- **3 users** (user1, user2, user3)
- **264 universities**
- **346 merit formulas**
- **5,382 programs**

**To import:**
1. In Vercel Postgres dashboard, go to "Query" tab
2. Open `seed-data.sql` from the project root
3. Copy the entire file content (~918KB)
4. Paste into Vercel query editor
5. Click "Run Query"
6. Wait for completion (may take 1-2 minutes)
7. Verify: `SELECT COUNT(*) FROM universities;` should return 264

**To regenerate (if you modify source data):**
```bash
node scripts/generate-seed-sql.js
```

#### Alternative: Manual API Seeding

If SQL import fails, use the Next.js API:

1. Create `scripts/upload-via-api.js`:
```javascript
// Upload data via your deployed API endpoints
const API_URL = 'https://your-app.vercel.app/api';
// Implementation details in scripts/README.md
```

2. Run:
```bash
node scripts/upload-via-api.js
```

### Step 6: Access Your App

1. Go to your Vercel deployment URL (e.g., `https://merit-data-xyz.vercel.app`)
2. Login with:
   - **user1** / password123
   - **user2** / password123
   - **user3** / password123

### Step 7: Share with Team

Share the Vercel URL with your 2 team members:
- They can bookmark it
- All 3 can work simultaneously
- Changes are saved to the shared database

---

## 🔧 Local Development

### Setup

```bash
cd merit-data-app
npm install

# Create .env.local
cp .env.example .env.local
# Add your Vercel Postgres credentials
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📊 Usage

### Adding Merit Data

1. Login with your credentials
2. Click on a university
3. Navigate to "Programs" tab
4. Click on a program
5. Click "Add Merit Entry" button
6. Fill in the form:
   - Year (2021-2026)
   - Final Closing Merit % **(required)**
   - Opening Merit % (optional)
   - Total Seats (optional)
   - Gender Category
   - Seat Category
   - Source URL (optional)
   - Notes (optional)
   - Verified checkbox
7. Click "Add Merit Entry"

### Viewing Data

- **Dashboard:** See overall statistics
- **Universities List:** Click any university
- **Programs Tab:** See all programs for that university
- **Formulas Tab:** View merit calculation formulas
- **Merits Tab:** See all collected closing merit data

### Data Export

You can export data via SQL queries in Vercel Postgres:

```sql
-- Export all closing merits
SELECT
  u.name as university,
  p.full_program_name as program,
  cm.year,
  cm.final_closing_merit,
  cm.opening_merit,
  cm.verified
FROM closing_merits cm
JOIN universities u ON cm.university_id = u.id
JOIN programs p ON cm.program_id = p.id
ORDER BY u.name, p.full_program_name, cm.year DESC;
```

---

## 🔐 Security

### User Management

Currently 3 users (user1, user2, user3) with same password. To change:

1. Go to Vercel Postgres Query tab
2. Run:
   ```sql
   UPDATE users
   SET password_hash = '$2a$10$...'  -- Generate hash with bcrypt
   WHERE username = 'user1';
   ```

### Access Control

- App is private (requires login)
- No public pages
- All 3 users have equal access (can add/edit/view all data)
- Activity is logged (who added what, when)

---

## 📈 Monitoring

### Track Progress

```sql
-- Merit entries by user
SELECT
  u.name as user,
  COUNT(*) as entries_added
FROM closing_merits cm
JOIN users u ON cm.created_by = u.id
GROUP BY u.name
ORDER BY entries_added DESC;

-- Coverage by university
SELECT
  u.name,
  COUNT(DISTINCT cm.program_id) as programs_with_data,
  COUNT(DISTINCT cm.year) as years_covered,
  COUNT(*) as total_entries
FROM universities u
LEFT JOIN closing_merits cm ON u.id = cm.university_id
GROUP BY u.id, u.name
ORDER BY total_entries DESC;
```

---

## 🐛 Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify database connection strings are correct

### Cannot Login
- Check AUTH_SECRET is set
- Verify users are seeded in database

### Merit Entry Not Saving
- Check database connection
- Verify program_id and university_id exist
- Check browser console for errors

---

## 📞 Support

For issues:
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Check database Query logs in Vercel

---

## ✅ Checklist

- [ ] GitHub repo created
- [ ] Vercel Postgres database created
- [ ] Database schema initialized
- [ ] App deployed to Vercel
- [ ] Environment variables configured
- [ ] Database seeded with university/program data
- [ ] Test login works
- [ ] Test adding a merit entry
- [ ] URL shared with team members
- [ ] Team members can access and add data

---

**App Structure:**
- 264 universities
- 5,382 programs
- 346 merit formulas (across 263 universities)
- Ready for **13,000+ merit entries** (target: 5 years × ~2,600 programs)

**Your job:** Fill in the closing merit data! 🎯
