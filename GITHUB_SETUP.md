# 📦 Quick GitHub Setup Guide

## Step-by-Step Instructions

### 1. Install Git (if not installed)

Download from: https://git-scm.com/downloads

After installation, verify:
```powershell
git --version
```

### 2. Initialize Git Repository

Open PowerShell in your project folder:

```powershell
cd D:\bus-booking
git init
```

### 3. Add All Files

```powershell
git add .
```

### 4. Create First Commit

```powershell
git commit -m "Initial commit: Bus Booking System"
```

### 5. Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `bus-booking` (or your preferred name)
3. Description: "Bus Booking System"
4. Choose **Public** or **Private**
5. **IMPORTANT**: Do NOT check "Initialize with README"
6. Click **"Create repository"**

### 6. Connect Local Repository to GitHub

Copy the commands from GitHub (they'll show after creating the repo), or use:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/bus-booking.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 7. Push to GitHub

```powershell
git branch -M main
git push -u origin main
```

You'll be prompted for your GitHub username and password (or personal access token).

### 8. Verify

Go to: `https://github.com/YOUR_USERNAME/bus-booking`

You should see all your files! ✅

---

## 🔑 Using Personal Access Token (if password doesn't work)

GitHub no longer accepts passwords. Use a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: `bus-booking-deployment`
4. Select scopes: `repo` (full control)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

---

## ✅ Success!

Your project is now on GitHub! 

Next step: Deploy to Vercel (see DEPLOYMENT_GUIDE.md)

