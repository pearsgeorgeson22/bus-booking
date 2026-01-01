# 🔍 Debug MongoDB Connection Timeout

## Current Error
`Operation buses.find() buffering timed out after 10000ms`

This means MongoDB connection is not established before queries run.

## ✅ Fixes Applied

1. **Increased timeouts** - 30 seconds instead of 10
2. **Better connection verification** - Checks connection state before proceeding
3. **Improved error logging** - More detailed error messages
4. **Connection timeout handling** - Prevents infinite waiting

## 🔍 Debugging Steps

### 1. Check Vercel Logs

Go to: **Vercel Dashboard → Your Project → Deployments → Latest → Functions → api/index → View Logs**

**Look for:**
- ✅ "MongoDB connected successfully"
- ✅ "Database: bus-booking"
- ❌ "MongoDB connection error"
- ❌ "MONGODB_URI is not defined"

### 2. Verify Connection String Format

Your connection string should be:
```
mongodb+srv://geodeveloper22:YOUR_PASSWORD@cluster0.er0ybrt.mongodb.net/bus-booking?retryWrites=true&w=majority
```

**Check:**
- ✅ Has `/bus-booking` before the `?`
- ✅ Password is correct (not `<db_password>`)
- ✅ Password is URL encoded if it has special characters
- ✅ Has `?retryWrites=true&w=majority` at the end

### 3. Test Connection String

You can test your connection string works:

**Option A: MongoDB Compass**
1. Open MongoDB Compass
2. New Connection
3. Paste your connection string (with actual password)
4. Click Connect
5. Should connect successfully

**Option B: Command Line**
```bash
# Test connection (replace with your actual connection string)
mongosh "mongodb+srv://geodeveloper22:PASSWORD@cluster0.er0ybrt.mongodb.net/bus-booking?retryWrites=true&w=majority"
```

### 4. Check MongoDB Atlas Settings

**Network Access:**
- Go to MongoDB Atlas → Network Access
- Must have `0.0.0.0/0` whitelisted
- If not, add it and wait 2-3 minutes

**Database Access:**
- Go to MongoDB Atlas → Database Access
- User `geodeveloper22` must exist
- Password must be correct
- User must have read/write permissions

**Database:**
- Go to MongoDB Atlas → Database → Browse Collections
- Should see `bus-booking` database
- Should see collections: `users`, `buses`, `bookings`
- Collections should have data

### 5. Verify Environment Variables in Vercel

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Check `MONGODB_URI`:
   - Key: `MONGODB_URI`
   - Value: Your complete connection string
   - Environments: Production, Preview, Development (all checked)
3. Check `JWT_SECRET`:
   - Key: `JWT_SECRET`
   - Value: Your secret key
   - Environments: All checked

### 6. Common Issues

#### Issue: Connection string missing database name
**Error:** Connection works but queries fail
**Fix:** Add `/bus-booking` before `?` in connection string

#### Issue: Password has special characters
**Error:** Authentication failed
**Fix:** URL encode password (e.g., `@` → `%40`)

#### Issue: IP not whitelisted
**Error:** Connection timeout
**Fix:** Add `0.0.0.0/0` to Network Access in Atlas

#### Issue: Wrong password
**Error:** Authentication failed
**Fix:** Reset password in Atlas and update connection string

#### Issue: Database doesn't exist
**Error:** Queries fail
**Fix:** Create database in Atlas or verify database name in connection string

## 🎯 Quick Test

After fixing, test your API endpoint:

```
https://your-project.vercel.app/api/search-buses?from=Mumbai&to=Delhi&date=2025-01-25
```

**Expected:**
- ✅ Returns JSON with buses (or empty array if no buses)
- ❌ Returns error if connection failed

## 📝 Connection String Checklist

- [ ] Format: `mongodb+srv://username:password@cluster.mongodb.net/database?options`
- [ ] Username: `geodeveloper22`
- [ ] Password: Actual password (not `<db_password>`)
- [ ] Cluster: `cluster0.er0ybrt.mongodb.net`
- [ ] Database: `/bus-booking` (before `?`)
- [ ] Options: `?retryWrites=true&w=majority`
- [ ] Password URL encoded if needed
- [ ] Set in Vercel environment variables
- [ ] Set for all environments

## 🆘 Still Not Working?

1. **Check Vercel logs** - Most important!
2. **Test connection string in Compass** - Verify it works
3. **Check Atlas Network Access** - Must have `0.0.0.0/0`
4. **Verify database exists** - Check in Atlas
5. **Check collections have data** - Verify in Atlas
6. **Redeploy after fixing** - Changes need redeploy

---

**After fixing the connection string and redeploying, the timeout should be resolved! 🚀**

