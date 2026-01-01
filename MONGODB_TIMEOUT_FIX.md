# 🔧 Fix MongoDB Timeout Error on Vercel

## Problem
You're seeing: `Operation users.findOne() buffering timed out after 10000ms`

This happens because MongoDB connections in serverless environments (like Vercel) need special handling.

## ✅ Fixes Applied

### 1. **Connection Caching for Serverless**
- Added connection caching to reuse existing connections
- Prevents creating new connections on every request
- **File:** `server.js`

### 2. **Connection Middleware**
- Added `ensureDBConnection` middleware
- Ensures database is connected before handling requests
- Applied to all API routes that need database access
- **File:** `server.js`

### 3. **Improved Connection Options**
- Added `bufferMaxEntries: 0` and `bufferCommands: false`
- Prevents Mongoose from buffering operations
- Better timeout settings for serverless
- **File:** `server.js`

## 🚀 Next Steps

### 1. Commit and Push
```bash
git add .
git commit -m "Fix MongoDB timeout - add connection caching for serverless"
git push
```

### 2. Verify MongoDB Atlas Settings

**Critical checks:**

1. **MongoDB Atlas Connection String:**
   - Go to MongoDB Atlas → Database → Connect → Connect your application
   - Copy the connection string
   - Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bus-booking?retryWrites=true&w=majority`
   - ⚠️ Make sure it includes `/bus-booking` (database name) before the `?`

2. **Network Access (IP Whitelist):**
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - OR manually add `0.0.0.0/0`
   - ⚠️ This is REQUIRED for Vercel to connect

3. **Database User:**
   - Go to MongoDB Atlas → Database Access
   - Make sure your user has correct permissions
   - Username and password must match the connection string

4. **Environment Variable in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - **Key:** `MONGODB_URI`
   - **Value:** Your complete MongoDB Atlas connection string
   - ⚠️ Make sure password is URL encoded if it has special characters
   - ⚠️ Set for all environments: Production, Preview, Development

### 3. Test Connection String Locally (Optional)

You can test your connection string works:

```javascript
// test-connection.js
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
```

Run: `node test-connection.js`

### 4. Redeploy on Vercel

After pushing:
- Vercel will auto-redeploy (if connected to GitHub)
- OR manually redeploy from Vercel Dashboard

### 5. Check Vercel Logs

1. Go to: **Vercel Dashboard → Your Project → Deployments**
2. Click latest deployment → **Functions** → **api/index**
3. Click **View Logs**
4. Look for:
   - ✅ "MongoDB connected successfully"
   - ❌ Any connection errors

## 🔍 Troubleshooting

### Issue: Still getting timeout errors

**Check 1: Connection String Format**
```
❌ Wrong: mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
✅ Correct: mongodb+srv://user:pass@cluster.mongodb.net/bus-booking?retryWrites=true&w=majority
```
Notice the `/bus-booking` before the `?`

**Check 2: Password Encoding**
If your password has special characters like `@`, `#`, `%`, etc., you need to URL encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- Use: https://www.urlencoder.org/

**Check 3: IP Whitelist**
- Must have `0.0.0.0/0` in Network Access
- Wait a few minutes after adding (can take up to 5 minutes)

**Check 4: Database User**
- User must exist in Database Access
- Password must be correct
- User must have read/write permissions

**Check 5: Vercel Environment Variables**
- Go to Settings → Environment Variables
- Make sure `MONGODB_URI` is set
- Check it's set for Production environment
- Copy the value and verify it's correct

### Issue: "MONGODB_URI is not defined"

**Solution:**
- Add `MONGODB_URI` in Vercel environment variables
- Make sure it's set for all environments
- Redeploy after adding

### Issue: Connection works locally but not on Vercel

**Common causes:**
1. Different connection string (local vs Atlas)
2. IP whitelist not set for Vercel
3. Environment variable not set correctly
4. Password encoding issue

**Solution:**
- Use MongoDB Atlas for both local and Vercel (not localhost)
- Make sure IP whitelist includes `0.0.0.0/0`
- Verify environment variable value in Vercel

## 📋 Files Modified

- ✅ `server.js` - Added connection caching and middleware
- ✅ All API routes - Added `ensureDBConnection` middleware

## 🎯 Expected Behavior

After these fixes:
1. ✅ MongoDB connection is cached and reused
2. ✅ Connection is verified before handling requests
3. ✅ No more timeout errors
4. ✅ Faster response times (reused connections)

## 📝 Connection String Example

**Correct format:**
```
mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/bus-booking?retryWrites=true&w=majority
```

**Breakdown:**
- `mongodb+srv://` - Protocol
- `myuser` - Database username
- `mypassword123` - Database password (URL encoded if needed)
- `cluster0.abc123.mongodb.net` - Your cluster address
- `/bus-booking` - Database name (IMPORTANT!)
- `?retryWrites=true&w=majority` - Connection options

---

**After fixing MongoDB Atlas settings and redeploying, the timeout error should be resolved! 🚀**

