# 📦 Migrate Local MongoDB Data to MongoDB Atlas

## Why?
Vercel runs in the cloud and **cannot access your local MongoDB database**. You need to migrate your data to MongoDB Atlas (cloud database).

## ✅ Step-by-Step Migration

### Method 1: Using MongoDB Compass (Easiest) ⭐

#### Step 1: Export Data from Local MongoDB

1. **Open MongoDB Compass**
2. **Connect to your local database** (usually `mongodb://localhost:27017`)
3. **Select your database** (probably `bus-booking`)
4. **For each collection** (users, buses, bookings):
   - Click on the collection
   - Click the **"Export Collection"** button (or three dots menu → Export Collection)
   - Choose format: **JSON** or **CSV**
   - Save the file (e.g., `users.json`, `buses.json`, `bookings.json`)

#### Step 2: Connect to MongoDB Atlas in Compass

1. **Get your Atlas connection string:**
   - Go to MongoDB Atlas → Database → Connect
   - Choose "Connect using MongoDB Compass"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

2. **Open MongoDB Compass**
3. **Click "New Connection"**
4. **Paste your Atlas connection string**
5. **Click "Connect"**

#### Step 3: Import Data to Atlas

1. **Create the database:**
   - In Compass, click "Create Database"
   - Database name: `bus-booking`
   - Collection name: `users` (or any collection name)
   - Click "Create"

2. **Import each collection:**
   - Click on the collection
   - Click **"Import Data"** button
   - Choose the exported JSON/CSV file
   - Click "Import"

3. **Repeat for all collections:**
   - `users` → Import `users.json`
   - `buses` → Import `buses.json`
   - `bookings` → Import `bookings.json`

---

### Method 2: Using MongoDB Tools (Command Line)

#### Step 1: Export from Local MongoDB

```bash
# Export users collection
mongoexport --uri="mongodb://localhost:27017/bus-booking" --collection=users --out=users.json

# Export buses collection
mongoexport --uri="mongodb://localhost:27017/bus-booking" --collection=buses --out=buses.json

# Export bookings collection
mongoexport --uri="mongodb://localhost:27017/bus-booking" --collection=bookings --out=bookings.json
```

#### Step 2: Import to MongoDB Atlas

```bash
# Import users collection
mongoimport --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bus-booking?retryWrites=true&w=majority" --collection=users --file=users.json

# Import buses collection
mongoimport --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bus-booking?retryWrites=true&w=majority" --collection=buses --file=buses.json

# Import bookings collection
mongoimport --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bus-booking?retryWrites=true&w=majority" --collection=bookings --file=bookings.json
```

**Replace:**
- `username` with your Atlas username
- `password` with your Atlas password
- `cluster0.xxxxx.mongodb.net` with your cluster address

---

### Method 3: Using mongodump and mongorestore

#### Step 1: Dump Local Database

```bash
# Create a dump of your local database
mongodump --uri="mongodb://localhost:27017/bus-booking" --out=./backup
```

#### Step 2: Restore to Atlas

```bash
# Restore to Atlas
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bus-booking?retryWrites=true&w=majority" ./backup/bus-booking
```

---

## 🔧 Update Vercel Connection String

After migrating data to Atlas:

1. **Get your Atlas connection string:**
   ```
   mongodb+srv://geodeveloper22:YOUR_PASSWORD@cluster0.er0ybrt.mongodb.net/bus-booking?retryWrites=true&w=majority
   ```

2. **Update in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `MONGODB_URI` with your Atlas connection string
   - Make sure it includes `/bus-booking` before the `?`

3. **Redeploy** your Vercel project

---

## 📋 Quick Checklist

- [ ] Export data from local MongoDB (using Compass or command line)
- [ ] Connect MongoDB Compass to Atlas
- [ ] Create `bus-booking` database in Atlas
- [ ] Import all collections (users, buses, bookings)
- [ ] Verify data in Atlas (check collections have data)
- [ ] Update `MONGODB_URI` in Vercel with Atlas connection string
- [ ] Redeploy Vercel project
- [ ] Test your app - data should now be accessible!

---

## 🎯 What Collections Do You Have?

Check your local MongoDB to see what collections exist:
- `users` - User accounts
- `buses` - Bus information
- `bookings` - Booking records

Make sure to export and import all of them!

---

## ⚠️ Important Notes

1. **Data Format:** Make sure exported data format matches what your models expect
2. **ObjectIds:** MongoDB will create new ObjectIds when importing, which is fine
3. **Passwords:** User passwords (if hashed with bcrypt) will work the same
4. **Indexes:** You may need to recreate indexes in Atlas if you had any

---

## 🆘 Troubleshooting

### Issue: "Collection already exists"
**Solution:** Delete the collection in Atlas first, then import

### Issue: "Invalid JSON format"
**Solution:** Make sure you exported as JSON (not CSV) or fix the format

### Issue: "Connection timeout"
**Solution:** 
- Check Atlas IP whitelist has `0.0.0.0/0`
- Verify connection string is correct
- Check username/password

### Issue: "Authentication failed"
**Solution:**
- Verify username and password in connection string
- Check database user has correct permissions in Atlas

---

**After migrating to Atlas, your Vercel app will be able to access all your data! 🚀**

