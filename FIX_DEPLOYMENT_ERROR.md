# Fix Deployment Authentication Error

## 🚨 Issue Found
Your Merit Data Collection app at https://merit-data-app.vercel.app/ shows a "Server error" when trying to login.

**Root Cause:** Missing `AUTH_SECRET` environment variable in Vercel deployment.

## ✅ Quick Fix (5 minutes)

### Step 1: Generate AUTH_SECRET

Run this in PowerShell to generate a secure random secret:

```powershell
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 2: Manual string (temporary)
# Use: "your-super-secret-key-at-least-32-characters-long-abc123xyz"
```

Copy the output.

### Step 2: Add to Vercel

1. Go to https://vercel.com/ali-hassans-projects-06bc8c2b/merit-data-app
2. Click **Settings** tab
3. Click **Environment Variables** in left sidebar
4. Click **Add New** button
5. Fill in:
   - **Key:** `AUTH_SECRET`
   - **Value:** (paste the secret you generated)
   - **Environment:** Check all (Production, Preview, Development)
6. Click **Save**

### Step 3: Add AUTH_URL

While you're there, add one more:

1. Click **Add New** again
2. Fill in:
   - **Key:** `AUTH_URL`
   - **Value:** `https://merit-data-app.vercel.app`
   - **Environment:** Production only
3. Click **Save**

### Step 4: Redeploy

After adding environment variables, Vercel will ask if you want to redeploy.

**Option A:** Click "Redeploy" button in the notification

**Option B:** Manually trigger redeploy:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click ⋮ (three dots menu)
4. Click **Redeploy**
5. Wait 1-2 minutes for rebuild

### Step 5: Test

1. Go to https://merit-data-app.vercel.app/
2. Try logging in with:
   - Username: `user1`
   - Password: `password123`
3. Should work now! ✅

---

## 🔍 What I Found

Using Playwright browser automation (in headed mode), I:
1. ✅ Navigated to your deployed app
2. ✅ Saw the login page (looks great!)
3. ✅ Filled in credentials (user1 / password123)
4. ✅ Clicked "Sign in"
5. ❌ Got "Server error" page

Error message: "There is a problem with the server configuration"

**Diagnosis:** NextAuth.js requires `AUTH_SECRET` to encrypt session tokens. Without it, authentication fails.

---

## 📋 Current Environment Variables

**✅ Already Set (from .env.local):**
- DATABASE_URL
- POSTGRES_URL
- POSTGRES_PRISMA_URL
- POSTGRES_URL_NON_POOLING
- All other database credentials

**❌ Missing:**
- AUTH_SECRET (CRITICAL - causes login to fail)
- AUTH_URL (optional but recommended)

---

## 🎯 After Fix

Once fixed, your app will:
- ✅ Show login page
- ✅ Accept user1/user2/user3 credentials
- ✅ Redirect to dashboard
- ✅ Allow adding merit data
- ✅ Work for all 3 team members simultaneously

---

## 💡 Alternative: Local Testing First

If you want to test locally before fixing Vercel:

```powershell
cd merit-data-app

# Generate AUTH_SECRET locally
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add to .env.local
echo "AUTH_SECRET=<paste-the-secret-here>" >> .env.local
echo "AUTH_URL=http://localhost:3000" >> .env.local

# Run locally
npm run dev

# Open http://localhost:3000 in browser
# Login with user1/password123
# Test adding merit data
```

If it works locally, you know the fix will work on Vercel too!

---

## 🚀 Summary

**What went wrong:**
- App deployed ✅
- Database connected ✅
- Data seeded ✅
- Authentication configured ❌ (missing AUTH_SECRET)

**Fix:**
1. Add AUTH_SECRET to Vercel environment variables (1 minute)
2. Redeploy (1 minute)
3. Test login (30 seconds)
4. Start collecting merit data! 🎉

**Total time to fix:** ~5 minutes

---

**Need help?** The Vercel dashboard shows exactly where to add environment variables. Look for the gear icon ⚙️ → Settings → Environment Variables.
