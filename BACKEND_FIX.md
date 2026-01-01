# 🔧 Backend Not Working on Vercel - Fixes Applied

## ✅ Fixes Applied

### 1. **Fixed API URL in Frontend** ⭐ CRITICAL
- **Problem:** Frontend was hardcoded to `http://localhost:5000/api`
- **Fix:** Changed to `window.location.origin + '/api'` 
- **File:** `index.html` line 439
- **Result:** Now works on both localhost and Vercel automatically

### 2. **Improved Serverless Function Error Handling**
- **Problem:** Errors were not being caught properly
- **Fix:** Added try-catch blocks and better error logging
- **File:** `api/index.js`
- **Result:** Better error messages in Vercel logs

### 3. **Improved MongoDB Connection**
- **Problem:** Connection might fail silently in serverless
- **Fix:** Added timeout and better error handling
- **File:** `server.js`
- **Result:** More reliable database connections

## 🚀 Next Steps

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Fix backend - update API URL and improve error handling"
git push
```

### 2. Verify Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Make sure you have:

**Variable 1:**
- **Key:** `MONGODB_URI`
- **Value:** `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bus-booking?retryWrites=true&w=majority`
- ✅ Check all environments: Production, Preview, Development

**Variable 2:**
- **Key:** `JWT_SECRET`
- **Value:** `your-long-random-secret-key-here`
- ✅ Check all environments: Production, Preview, Development

### 3. Redeploy

After pushing:
- Vercel will auto-redeploy (if connected to GitHub)
- OR manually redeploy from Vercel Dashboard

### 4. Test the Backend

1. **Open your Vercel URL:** `https://your-project.vercel.app`

2. **Open Browser Console (F12)** and check:
   - No CORS errors
   - No 404 errors for API calls
   - Network tab shows API requests going to your Vercel domain

3. **Test API Endpoints:**
   - Try to register a new user
   - Try to login
   - Check if API calls are working

## 🔍 Debugging Steps

### Check Vercel Function Logs

1. Go to: **Vercel Dashboard → Your Project → Deployments**
2. Click on the **latest deployment**
3. Click **"Functions"** tab
4. Click on **"api/index"** function
5. Click **"View Logs"**

**Look for:**
- ✅ "MongoDB connected" message
- ❌ Any error messages
- ❌ "MONGODB_URI is not defined"
- ❌ "JWT_SECRET is not defined"
- ❌ MongoDB connection errors

### Test API Endpoints Directly

Open these URLs in your browser (replace with your Vercel URL):

```
https://your-project.vercel.app/api/search-buses?from=Mumbai&to=Delhi&date=2025-01-20
```

If you see JSON response → Backend is working! ✅
If you see error → Check the logs

### Common Issues and Solutions

#### Issue 1: "MongoDB connection error"
**Solution:**
- Check `MONGODB_URI` is set correctly in Vercel
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check database user password is correct
- Make sure connection string includes database name: `...mongodb.net/bus-booking?...`

#### Issue 2: "JWT_SECRET is not defined"
**Solution:**
- Add `JWT_SECRET` environment variable in Vercel
- Make sure it's set for all environments
- Redeploy after adding

#### Issue 3: API calls still going to localhost
**Solution:**
- Clear browser cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check `index.html` has the updated API_BASE code

#### Issue 4: CORS errors
**Solution:**
- Already handled in `server.js` with `app.use(cors())`
- If still seeing CORS errors, check Vercel logs

#### Issue 5: 404 errors for API routes
**Solution:**
- Check `vercel.json` routing is correct
- Verify `api/index.js` exists and exports correctly
- Check Vercel function logs for routing errors

## 📋 Files Modified

- ✅ `index.html` - Fixed API_BASE URL (CRITICAL FIX)
- ✅ `api/index.js` - Improved error handling
- ✅ `server.js` - Improved MongoDB connection handling

## 🎯 What Should Work Now

After these fixes:
1. ✅ Frontend automatically uses correct API URL (localhost or Vercel)
2. ✅ Backend API endpoints should respond
3. ✅ MongoDB connection should work
4. ✅ Better error messages in logs
5. ✅ User registration and login should work

## 🆘 Still Not Working?

1. **Check Vercel Logs** - Most important step!
2. **Verify Environment Variables** - Make sure they're set correctly
3. **Test API directly** - Use browser to test API endpoints
4. **Check MongoDB Atlas** - Verify connection string and network access
5. **Clear cache** - Hard refresh your browser

---

**After pushing these changes and redeploying, your backend should work! 🚀**

