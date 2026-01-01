# 🔧 Fix Your MongoDB URI

## ❌ Current URI (Incorrect)
```
mongodb+srv://geodeveloper22:<db_password>@cluster0.er0ybrt.mongodb.net/?appName=Cluster0
```

## ✅ Correct URI Format

You need to:
1. **Add the database name** (`/bus-booking`) before the `?`
2. **Replace `<db_password>`** with your actual password
3. **Use proper connection options**

### Correct Format:
```
mongodb+srv://geodeveloper22:YOUR_ACTUAL_PASSWORD@cluster0.er0ybrt.mongodb.net/bus-booking?retryWrites=true&w=majority
```

## 📝 Steps to Fix

### 1. Get Your Actual Password
- Go to MongoDB Atlas → Database Access
- Find your user `geodeveloper22`
- If you forgot the password, click "Edit" → "Edit Password" → Generate new password
- **Save this password!**

### 2. Build the Correct Connection String

**Format:**
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

**Your values:**
- USERNAME: `geodeveloper22`
- PASSWORD: `YOUR_ACTUAL_PASSWORD` (replace this!)
- CLUSTER: `cluster0.er0ybrt.mongodb.net`
- DATABASE_NAME: `bus-booking`

**Example (replace YOUR_PASSWORD with actual password):**
```
mongodb+srv://geodeveloper22:MyPassword123@cluster0.er0ybrt.mongodb.net/bus-booking?retryWrites=true&w=majority
```

### 3. URL Encode Password (if needed)

If your password has special characters like `@`, `#`, `%`, `&`, etc., you need to URL encode them:

**Special characters:**
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `/` → `%2F`
- `?` → `%3F`
- `=` → `%3D`

**Example:**
If password is `My@Pass#123`, it becomes `My%40Pass%23123`

Use: https://www.urlencoder.org/ to encode your password

### 4. Update in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

**Update `MONGODB_URI`:**
- **Key:** `MONGODB_URI`
- **Value:** `mongodb+srv://geodeveloper22:YOUR_PASSWORD@cluster0.er0ybrt.mongodb.net/bus-booking?retryWrites=true&w=majority`
- Replace `YOUR_PASSWORD` with your actual password (URL encoded if needed)

**Verify `JWT_SECRET`:**
- **Key:** `JWT_SECRET`
- **Value:** `your-super-secret-jwt-key-change-this-in-production-2025`
- ✅ This looks fine, but consider using a longer, more random string for production

### 5. Redeploy

After updating the environment variable:
- Vercel will auto-redeploy, OR
- Manually redeploy from Vercel Dashboard

## 🔍 Quick Check

Your connection string should look like this:
```
mongodb+srv://geodeveloper22:password123@cluster0.er0ybrt.mongodb.net/bus-booking?retryWrites=true&w=majority
                                                                    ^^^^^^^^^^^
                                                                    Database name here!
```

**Notice:**
- ✅ Has `/bus-booking` before the `?`
- ✅ Has `?retryWrites=true&w=majority` at the end
- ✅ Password is actual password (not `<db_password>`)

## ⚠️ Important Notes

1. **Database Name:** The `/bus-booking` part is the database name. MongoDB Atlas will create it automatically when you first use it.

2. **Password Security:** Never share your actual password. The example above is just a format.

3. **IP Whitelist:** Make sure MongoDB Atlas → Network Access has `0.0.0.0/0` whitelisted for Vercel to connect.

4. **Test Connection:** After updating, check Vercel logs to see "MongoDB connected successfully"

## 🎯 Summary

**What to change:**
1. Add `/bus-booking` before the `?` in your URI
2. Replace `<db_password>` with your actual password
3. Change `?appName=Cluster0` to `?retryWrites=true&w=majority`
4. Update in Vercel environment variables
5. Redeploy

---

**After fixing the URI format, your MongoDB connection should work! 🚀**

