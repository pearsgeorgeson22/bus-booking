# 🔧 Fix Vercel 500 Error

## Problem
You're seeing: `500: INTERNAL_SERVER_ERROR` or `FUNCTION_INVOCATION_FAILED`

## ✅ Solution Steps

### 1. Check Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Make sure you have these TWO variables set:**

1. **MONGODB_URI**
   - Key: `MONGODB_URI`
   - Value: Your MongoDB Atlas connection string
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bus-booking?retryWrites=true&w=majority`

2. **JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: A long random string (at least 32 characters)
   - Example: `my-super-secret-jwt-key-bus-booking-2025-random-string-12345`

**⚠️ Important:**
- Enter ONLY the Key name and Value
- NO equals signs (=)
- NO quotes around the value
- NO spaces around the equals sign
- Select all environments: Production, Preview, Development

### 2. Verify MongoDB Atlas Connection

1. Go to MongoDB Atlas Dashboard
2. Check "Network Access" - make sure `0.0.0.0/0` is whitelisted
3. Check "Database Access" - verify your user has correct permissions
4. Test your connection string format:
   ```
   mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
   ```
   - Replace USERNAME with your database username
   - Replace PASSWORD with your database password (URL encoded if it has special characters)
   - Replace CLUSTER with your cluster address
   - Replace DATABASE_NAME with `bus-booking` (or your database name)

### 3. Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click "Functions" tab
4. Look for error messages

**Common errors:**
- `JWT_SECRET is not defined` → Add JWT_SECRET environment variable
- `MongoDB connection error` → Check MONGODB_URI and network access
- `Cannot find module` → Dependencies issue (should auto-fix on redeploy)

### 4. Redeploy

After fixing environment variables:

1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" tab
3. Click the three dots (⋯) on latest deployment
4. Click "Redeploy"
5. Or push a new commit to trigger auto-deploy

### 5. Test the Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Check browser console (F12) for errors
3. Try to register/login
4. Check Vercel function logs if errors persist

## 🔍 Debugging Checklist

- [ ] MONGODB_URI is set correctly (no extra spaces, correct format)
- [ ] JWT_SECRET is set (long random string)
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] MongoDB database user has correct permissions
- [ ] Connection string includes database name: `...mongodb.net/bus-booking?...`
- [ ] Password in connection string is URL encoded (if it has special characters)
- [ ] Environment variables are set for all environments (Production, Preview, Development)
- [ ] Redeployed after setting environment variables

## 🆘 Still Not Working?

1. **Check Vercel Function Logs:**
   - Dashboard → Project → Deployments → Latest → Functions → View Logs

2. **Test MongoDB Connection:**
   - Try connecting with MongoDB Compass or a test script
   - Verify the connection string works

3. **Verify Code:**
   - Make sure `api/index.js` exists
   - Make sure `vercel.json` is correct
   - Make sure `server.js` exports the app correctly

4. **Common Issues:**
   - Password has special characters → URL encode it (e.g., `@` becomes `%40`)
   - Database name missing → Add `/bus-booking` before `?` in connection string
   - Wrong environment → Make sure variables are set for Production environment

## 📝 Example Environment Variables Setup

**In Vercel Dashboard:**

```
Key: MONGODB_URI
Value: mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/bus-booking?retryWrites=true&w=majority
Environments: Production, Preview, Development
```

```
Key: JWT_SECRET
Value: my-super-secret-jwt-key-bus-booking-2025-abc123xyz789
Environments: Production, Preview, Development
```

**That's it! No equals signs, no quotes, just Key and Value.**

