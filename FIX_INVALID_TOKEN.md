# 🔧 Fix "Invalid Token" Error

## Problem
You're seeing "Invalid token" error because the `.env` file is not created yet.

## ✅ QUICK FIX (Choose One Method)

### Method 1: Run the Setup Script (EASIEST) ⭐

**For Windows:**
```cmd
create-env.bat
```

**For Mac/Linux:**
```bash
chmod +x create-env.sh
./create-env.sh
```

Then **restart your server**:
```bash
npm start
```

---

### Method 2: Create .env File Manually

1. Create a new file named `.env` in the root directory (same folder as server.js)

2. Copy and paste this content:
```
MONGODB_URI=mongodb://localhost:27017/bus-booking
JWT_SECRET=my-super-secret-jwt-key-bus-booking-2025
PORT=5000
```

3. Save the file

4. **Restart your server**:
```bash
npm start
```

---

## 🎯 What Was Fixed

### Backend Changes (server.js):
1. ✅ Added startup check for JWT_SECRET
2. ✅ Better error messages
3. ✅ Changed "Invalid token" to "Session expired. Please login again."
4. ✅ Server now exits with clear error if .env is missing

### Frontend Changes (index.html):
1. ✅ Added automatic token expiration handling
2. ✅ Auto-logout on expired token
3. ✅ Clear message: "Your session has expired. Please login again."
4. ✅ No more confusing errors!

---

## 🔍 Verify It's Working

After creating the .env file and restarting:

1. **Check server startup:**
   - Should NOT show "JWT_SECRET is not defined" error
   - Should show "Server running on port 5000"
   - Should show "MongoDB connected"

2. **Test the app:**
   - Go to http://localhost:5000
   - Register a new account
   - Login
   - Should work without "invalid token" error!

---

## 🚨 Still Having Issues?

### Issue: Server exits immediately
**Cause:** .env file is missing  
**Fix:** Run `create-env.bat` or create .env file manually

### Issue: "JWT_SECRET is not defined"
**Cause:** .env file doesn't have JWT_SECRET  
**Fix:** Make sure .env file contains:
```
JWT_SECRET=my-super-secret-jwt-key-bus-booking-2025
```

### Issue: "MongoDB connection error"
**Cause:** MongoDB is not running  
**Fix:** Start MongoDB with `mongod` command

### Issue: Token expires too quickly
**Cause:** This is normal - tokens expire after 7 days for security  
**Solution:** Just login again

---

## 📝 New Error Messages (User Friendly!)

**Before:**
- ❌ "Invalid token" (confusing!)

**After:**
- ✅ "Session expired. Please login again." (clear!)
- ✅ "Your session has expired. Please login again." (friendly!)
- ✅ Server shows helpful hints if .env is missing

---

## 🔐 Security Note

The JWT_SECRET in the setup scripts is for **development only**. 

For production, change it to a random secure string:
```
JWT_SECRET=your-own-random-very-secure-secret-key-here-change-this
```

---

## ✅ Complete Checklist

- [ ] Create .env file (run create-env.bat or manually)
- [ ] Verify .env has JWT_SECRET
- [ ] Restart server
- [ ] Clear browser localStorage (F12 → Application → Local Storage → Clear)
- [ ] Test registration
- [ ] Test login
- [ ] No more "invalid token" error! 🎉

---

## 🎉 Summary

The "invalid token" error is now FIXED with:
1. ✅ Easy setup scripts (create-env.bat / create-env.sh)
2. ✅ Better error messages
3. ✅ Automatic session handling
4. ✅ User-friendly alerts

Just run the setup script and restart your server!

