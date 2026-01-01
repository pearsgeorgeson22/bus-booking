# 🚀 Deployment Guide: GitHub + Vercel

This guide will help you add your project to GitHub and deploy it to Vercel.

## 📋 Prerequisites

1. **Git** installed on your computer
   - Download from: https://git-scm.com/downloads
   - Verify installation: Open terminal and run `git --version`

2. **GitHub account** (free)
   - Sign up at: https://github.com

3. **Vercel account** (free)
   - Sign up at: https://vercel.com
   - You can sign up with your GitHub account

4. **MongoDB Atlas account** (free tier available)
   - Sign up at: https://www.mongodb.com/cloud/atlas
   - Required for production database

---

## 🔵 Step 1: Add Project to GitHub

### Option A: Using GitHub Desktop (Easiest)

1. Download GitHub Desktop: https://desktop.github.com
2. Install and sign in with your GitHub account
3. Click "File" → "Add Local Repository"
4. Browse to `D:\bus-booking` and select it
5. Click "Publish repository" button
6. Choose repository name (e.g., `bus-booking`)
7. Make it Public or Private (your choice)
8. Click "Publish Repository"

### Option B: Using Command Line

1. **Open PowerShell or Command Prompt** in your project folder:
   ```powershell
   cd D:\bus-booking
   ```

2. **Initialize Git** (if not already done):
   ```powershell
   git init
   ```

3. **Add all files**:
   ```powershell
   git add .
   ```

4. **Create first commit**:
   ```powershell
   git commit -m "Initial commit: Bus Booking System"
   ```

5. **Create repository on GitHub**:
   - Go to https://github.com/new
   - Repository name: `bus-booking` (or any name you like)
   - Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

6. **Connect local repository to GitHub**:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/bus-booking.git
   ```
   (Replace `YOUR_USERNAME` with your GitHub username)

7. **Push to GitHub**:
   ```powershell
   git branch -M main
   git push -u origin main
   ```

---

## 🟢 Step 2: Set Up MongoDB Atlas (Production Database)

Since Vercel doesn't provide MongoDB, you need a cloud database:

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas

2. **Create a free cluster**:
   - Click "Build a Database"
   - Choose "FREE" (M0) tier
   - Select a cloud provider and region
   - Click "Create"

3. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Username: `busbooking` (or any name)
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Whitelist IP Address**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for Vercel)
   - Or add `0.0.0.0/0`
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `bus-booking` (or your database name)

---

## 🟣 Step 3: Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/dashboard

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import from GitHub
   - Select your `bus-booking` repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: Leave empty (or `npm install`)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Environment Variables**:
   Click "Environment Variables" and add:
   
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bus-booking?retryWrites=true&w=majority
   ```
   (Use your MongoDB Atlas connection string)
   
   ```
   JWT_SECRET = your-super-secret-jwt-key-change-this-in-production-2025
   ```
   (Use a long, random string - you can generate one at https://randomkeygen.com)
   
   ```
   PORT = (leave empty, Vercel sets this automatically)
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (2-3 minutes)

6. **Get Your URL**:
   - After deployment, you'll get a URL like: `https://bus-booking-xxxxx.vercel.app`
   - Your app is now live! 🎉

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```powershell
   vercel login
   ```

3. **Deploy**:
   ```powershell
   cd D:\bus-booking
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? No
   - Project name: `bus-booking`
   - Directory: `./`
   - Override settings? No

5. **Set Environment Variables**:
   ```powershell
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   ```

6. **Redeploy with environment variables**:
   ```powershell
   vercel --prod
   ```

---

## ✅ Step 4: Verify Deployment

1. **Visit your Vercel URL**: `https://your-project.vercel.app`

2. **Test the application**:
   - Register a new user
   - Login
   - Book a bus ticket
   - Check if everything works

3. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → "Deployments"
   - Click on the latest deployment
   - Check "Functions" tab for any errors

---

## 🔧 Troubleshooting

### Issue: "MongoDB connection error" in Vercel logs

**Solution:**
- Check MongoDB Atlas connection string is correct
- Verify IP whitelist includes `0.0.0.0/0`
- Check database user password is correct
- Make sure connection string includes database name: `...mongodb.net/bus-booking?...`

### Issue: "JWT_SECRET is not defined"

**Solution:**
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Add `JWT_SECRET` with a secure random string
- Redeploy the project

### Issue: "Cannot find module" errors

**Solution:**
- Make sure `package.json` has all dependencies
- Check that `node_modules` is in `.gitignore` (it should be)
- Vercel will install dependencies automatically

### Issue: Static files not loading

**Solution:**
- Check that `vercel.json` is configured correctly
- Verify `api/index.js` exists and exports the app
- Check Vercel function logs for errors

### Issue: Deployment fails

**Solution:**
- Check Vercel build logs for specific errors
- Ensure all environment variables are set
- Verify `package.json` is valid
- Check that Node.js version is compatible (Vercel uses Node 18+ by default)

---

## 📝 Important Notes

1. **Environment Variables**: Never commit `.env` file to GitHub. It's already in `.gitignore`.

2. **MongoDB**: Local MongoDB won't work with Vercel. You must use MongoDB Atlas.

3. **File Uploads**: If you're storing files locally, they won't persist on Vercel. Consider using cloud storage (AWS S3, Cloudinary, etc.).

4. **CORS**: Your frontend should use the Vercel URL, not `localhost:5000`.

5. **Updates**: After pushing to GitHub, Vercel will automatically redeploy if you've connected it to your repository.

---

## 🔄 Updating Your Deployment

1. **Make changes** to your code
2. **Commit and push** to GitHub:
   ```powershell
   git add .
   git commit -m "Your update message"
   git push
   ```
3. **Vercel will automatically redeploy** (if connected to GitHub)
   - Or manually redeploy from Vercel Dashboard

---

## 📚 Additional Resources

- **Vercel Documentation**: https://vercel.com/docs
- **MongoDB Atlas Guide**: https://docs.atlas.mongodb.com
- **Git Documentation**: https://git-scm.com/doc

---

## 🎉 Success!

Your bus booking system should now be:
- ✅ On GitHub
- ✅ Deployed on Vercel
- ✅ Accessible from anywhere
- ✅ Using MongoDB Atlas for database

Happy coding! 🚀

