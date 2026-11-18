# 🚀 Deploy to Vercel - Step by Step Guide

**Repository:** https://github.com/whizali/univa-local-data.git  
**Status:** ✅ Code pushed and ready to deploy

---

## Step 1: Create Vercel Postgres Database (5 minutes)

1. Go to **https://vercel.com/dashboard**
2. Click **"Storage"** tab in top navigation
3. Click **"Create Database"** button
4. Select **"Postgres"**
5. Choose **Region:** Singapore or Mumbai (closest to Pakistan)
6. Name: `merit-data-db` (or any name)
7. Click **"Create"**
8. **IMPORTANT:** Copy all connection strings that appear - you'll need them next

Keep this tab open - you'll use it in Step 2.

---

## Step 2: Initialize Database Schema (3 minutes)

1. In your Vercel Postgres database dashboard, click **"Query"** tab
2. Open this file in your code editor: `lib/db-schema.sql`
3. Copy the **entire file content** (all 8 tables + indexes + triggers)
4. Paste into the Vercel Query editor
5. Click **"Run Query"**
6. Wait for success message
7. Verify tables created: run `SELECT COUNT(*) FROM users;` (should return 0)

---

## Step 3: Import Seed Data (5 minutes)

1. Still in the **"Query"** tab
2. Open this file: `seed-data.sql` (918KB file in project root)
3. Copy the **entire file content**
4. Paste into Vercel Query editor
5. Click **"Run Query"**
6. **Wait 1-2 minutes** for import to complete
7. Verify import succeeded:
   ```sql
   SELECT COUNT(*) FROM universities;  -- Should return 264
   SELECT COUNT(*) FROM programs;      -- Should return 5382
   SELECT COUNT(*) FROM merit_formulas; -- Should return 346
   SELECT COUNT(*) FROM users;          -- Should return 3
   ```

If the query editor times out, split the file into 3 parts:
- Part 1: Users + Universities
- Part 2: Merit Formulas
- Part 3: Programs

---

## Step 4: Deploy to Vercel (10 minutes)

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Search for: `whizali/univa-local-data`
4. Click **"Import"**
5. Configure project:
   - **Project Name:** `merit-data-app` (or your choice)
   - **Framework:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** Leave default
   - **Output Directory:** Leave default

6. Click **"Environment Variables"**
7. Add the following variables (get values from Step 1):

   ```
   POSTGRES_URL
   POSTGRES_PRISMA_URL
   POSTGRES_URL_NON_POOLING
   POSTGRES_USER
   POSTGRES_HOST
   POSTGRES_PASSWORD
   POSTGRES_DATABASE
   ```

8. Generate AUTH_SECRET:
   - Open PowerShell/Terminal
   - Run: `openssl rand -base64 32`
   - Copy the output
   - Add variable: `AUTH_SECRET` = (paste the output)

9. Add AUTH_URL (you'll update this after deployment):
   - For now, use: `AUTH_URL` = `https://your-app.vercel.app`
   - You'll change "your-app" to actual URL in Step 5

10. Click **"Deploy"**
11. Wait 2-3 minutes for build to complete

---

## Step 5: Update AUTH_URL (2 minutes)

After deployment completes:

1. Vercel will show your deployment URL (e.g., `https://merit-data-app-xyz.vercel.app`)
2. Copy that URL
3. Go to **Project Settings** → **Environment Variables**
4. Find `AUTH_URL` variable
5. Click **"Edit"**
6. Replace with your actual deployment URL
7. Click **"Save"**
8. Go to **"Deployments"** tab
9. Click **"Redeploy"** on latest deployment
10. Wait 1-2 minutes

---

## Step 6: Test Your App (5 minutes)

1. Visit your deployment URL: `https://your-app.vercel.app`
2. You should see the login page
3. Login with:
   - **Username:** user1
   - **Password:** password123

4. After login, verify:
   - ✅ Dashboard shows **264 universities**
   - ✅ University list loads
   - ✅ Click any university (e.g., "LUMS")
   - ✅ See **Programs** tab with programs
   - ✅ See **Formulas** tab with merit formulas
   - ✅ See **Merit Data** tab (empty initially)

5. **Test adding merit entry:**
   - Click **"Programs"** tab
   - Click any program name
   - Modal should open
   - Fill in test data:
     - Year: 2024
     - Final Closing Merit: 85.5
     - Gender: Open
     - Seat Category: Open
   - Click **"Add Merit Entry"**
   - Success message should appear
   - Go to **"Merit Data"** tab
   - Your entry should appear

6. **Test logout:**
   - Click **"Logout"** button
   - Should redirect to login page

---

## Step 7: Share with Team (2 minutes)

1. Copy your deployment URL
2. Share with your 2 team members:
   
   ```
   Merit Data Collection App:
   https://your-app.vercel.app
   
   Login Credentials:
   - Username: user1 / Password: password123
   - Username: user2 / Password: password123
   - Username: user3 / Password: password123
   
   Each of you use a different user account.
   You can all work simultaneously!
   ```

3. Have them test login
4. Start collecting merit data! 🎉

---

## 📋 Quick Verification Checklist

After deployment, check all these work:

- [ ] Login page loads
- [ ] Can login with user1/password123
- [ ] Dashboard shows 264 universities
- [ ] Can search/filter universities
- [ ] Clicking university opens detail page
- [ ] Programs tab shows all programs
- [ ] Formulas tab shows merit formulas
- [ ] Merit Data tab loads (empty initially)
- [ ] Can click program to open Add Merit form
- [ ] Can submit merit entry successfully
- [ ] New entry appears in Merit Data tab
- [ ] Can logout successfully
- [ ] user2 and user3 can also login

---

## 🎯 Data Collection Strategy

Now that the app is live, here's how to collect merit data efficiently:

### Phase 1: Recent Data (Priority)
- Focus on years: **2024, 2025, 2026**
- Start with top 50 P1 universities (LUMS, NUST, IBA, etc.)
- Target: ~200 programs × 3 years = **600 entries** (quick wins)

### Phase 2: Comprehensive Coverage
- Add years: **2023, 2022, 2021**
- Expand to all 264 universities
- Target: **5,000-10,000 entries**

### Phase 3: Complete Dataset
- Fill gaps in historical data
- Add optional fields (opening merit, seats, sources)
- Mark verified entries
- Target: **10,000-13,000+ entries**

### Tips:
- Each person takes ~90 universities (divide alphabetically)
- Add source URLs when available
- Mark "Verified" only if you confirm the data
- Use Notes field for any clarifications
- Check Merit Data tab regularly to see team progress

---

## 🔧 Troubleshooting

### Build Fails on Vercel
**Solution:** Check deployment logs in Vercel. Common issues:
- Missing environment variables → Add all 9 variables
- Wrong AUTH_URL format → Must include https://

### Cannot Login
**Solution:**
- Verify users were seeded: In Vercel Postgres Query tab, run `SELECT * FROM users;`
- Should show 3 users (user1, user2, user3)
- Check AUTH_SECRET is set correctly
- Clear browser cookies/cache

### Merit Entry Doesn't Save
**Solution:**
- Check browser console (F12) for errors
- Verify program_id exists in database
- Ensure final_closing_merit is between 0-100
- Check Vercel function logs for errors

### Seed Data Import Fails
**Solution:** File too large for query editor
- Split `seed-data.sql` into chunks:
  - Lines 1-50: Users + Universities
  - Lines 51-400: Merit Formulas
  - Lines 401-end: Programs
- Run each chunk separately

### AUTH_URL Error
**Solution:** Must match exact Vercel deployment URL
- No trailing slash
- Must use https://
- Must be the actual deployed URL (not localhost)

---

## 📊 Monitor Progress

Use these SQL queries in Vercel Postgres to track progress:

### Total Entries by User
```sql
SELECT 
  u.name as user,
  COUNT(*) as entries_added,
  COUNT(DISTINCT cm.university_id) as universities_covered
FROM closing_merits cm
JOIN users u ON cm.created_by = u.id
GROUP BY u.name
ORDER BY entries_added DESC;
```

### Coverage by Year
```sql
SELECT 
  year,
  COUNT(*) as total_entries,
  COUNT(DISTINCT university_id) as universities,
  COUNT(DISTINCT program_id) as programs
FROM closing_merits
GROUP BY year
ORDER BY year DESC;
```

### Top 10 Universities by Data
```sql
SELECT 
  u.name,
  COUNT(*) as merit_entries
FROM closing_merits cm
JOIN universities u ON cm.university_id = u.id
GROUP BY u.name
ORDER BY merit_entries DESC
LIMIT 10;
```

### Recent Activity (Last 20 entries)
```sql
SELECT 
  u.name as university,
  p.full_program_name,
  cm.year,
  cm.final_closing_merit,
  usr.name as added_by,
  cm.created_at
FROM closing_merits cm
JOIN universities u ON cm.university_id = u.id
JOIN programs p ON cm.program_id = p.id
JOIN users usr ON cm.created_by = usr.id
ORDER BY cm.created_at DESC
LIMIT 20;
```

---

## ✅ Success!

You now have:
- ✅ Live merit data collection app
- ✅ 264 universities pre-loaded
- ✅ 5,382 programs ready for data entry
- ✅ 346 merit formulas for reference
- ✅ 3 team members with access
- ✅ All CRUD operations working

**Next:** Start collecting merit data with your team! 🚀

---

## 🔗 Important Links

- **GitHub Repo:** https://github.com/whizali/univa-local-data.git
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Your App:** https://[your-deployment-url].vercel.app
- **Postgres Database:** Vercel Dashboard → Storage → merit-data-db

---

**Deployment completed!** 🎊

Now go collect that merit data! Each entry brings you closer to having the most comprehensive merit database for Pakistani universities. 🎯

---

_Last updated: November 13, 2026_
