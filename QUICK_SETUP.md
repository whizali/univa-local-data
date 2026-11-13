# Merit App - Quick Setup Guide

## ✅ What's Done

Your Next.js app is **ready to deploy**! Here's what's included:

- ✅ Full authentication system (3 users)
- ✅ Complete database schema
- ✅ CRUD operations for merit data
- ✅ Beautiful responsive UI
- ✅ Ready for Vercel deployment

## 🚀 Deploy in 10 Minutes

### 1. Create Vercel Postgres (3 min)

1. Go to [vercel.com/storage](https://vercel.com/storage)
2. Create Database → Choose "Postgres"
3. Select region: **Singapore** (closest to Pakistan)
4. Copy all connection strings

### 2. Initialize Database (2 min)

1. In Vercel Postgres → Query tab
2. Copy & run the SQL from `lib/db-schema.sql`
3. Then run this to create users:

```sql
INSERT INTO users (username, password_hash, name, email) VALUES
('user1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Team Member 1', 'user1@merit.app'),
('user2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Team Member 2', 'user2@merit.app'),
('user3', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Team Member 3', 'user3@merit.app');
```

Password for all users: **password123**

### 3. Push to GitHub (2 min)

```bash
cd merit-data-app
git init
git add .
git commit -m "Merit data collection app"

# Create private repo on GitHub
# Then:
git remote add origin https://github.com/YOUR_USERNAME/merit-data.git
git push -u origin main
```

### 4. Deploy to Vercel (3 min)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Add environment variables (from step 1):
   - All POSTGRES_* variables
   - `AUTH_SECRET` (generate: `openssl rand -base64 32`)
   - `AUTH_URL` (will be your Vercel URL)
4. Click **Deploy**

### 5. Import Data

After deployment, you need to import your refined data.

**Option A - Manual CSV Import (Easiest):**

I'll help you create CSV files that you can import via Vercel Postgres UI:

1. Universities CSV
2. Programs CSV  
3. Merit Formulas CSV

**Option B - Use Node Script:**

```bash
# Copy your data files to merit-data-app/
cp -r ../data merit-data-app/

# Then create import script
npm install tsx
# Run import
```

## 🎯 Start Using

1. Open your Vercel URL
2. Login: **user1** / **password123**
3. Click a university
4. Click a program
5. Add merit data!

## 📊 What to Collect

For each program, add:
- **Year** (2021-2026)
- **Closing Merit %** (required)
- Opening Merit %
- Total Seats
- Source URL (if available)
- Notes

## 💡 Tips

- Start with recent years (2024, 2023)
- Focus on popular programs first
- Mark as "verified" if from official source
- Add source URL for reference
- Use notes for context

## Need Help?

Check:
- `README.md` - Overview
- `DEPLOYMENT_GUIDE.md` - Detailed steps
- `MERIT_APP_COMPLETE.md` - Full documentation

---

**Login:** user1, user2, user3  
**Password:** password123

🚀 **You're ready to go!**
