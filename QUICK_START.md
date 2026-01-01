# ⚡ Quick Start: GitHub + Vercel Deployment

## 🎯 What You Need

1. ✅ Git installed
2. ✅ GitHub account
3. ✅ Vercel account (sign up with GitHub)
4. ✅ MongoDB Atlas account (free tier)

## 📋 Quick Steps

### 1️⃣ Add to GitHub (5 minutes)

**Option A: Command Line**
```powershell
cd D:\bus-booking
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/bus-booking.git
git branch -M main
git push -u origin main
```

**Option B: GitHub Desktop**
- Download: https://desktop.github.com
- Add repository → Publish to GitHub

### 2️⃣ Setup MongoDB Atlas (10 minutes)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0`
5. Get connection string

### 3️⃣ Deploy to Vercel (5 minutes)

1. Go to: https://vercel.com
2. Import from GitHub → Select your repo
3. Add Environment Variables (click "Environment Variables"):
   - **Key:** `MONGODB_URI` | **Value:** (your Atlas connection string)
   - **Key:** `JWT_SECRET` | **Value:** (random secure string)
   - ⚠️ Enter ONLY Key and Value - no equals signs!
4. Click Deploy
5. Done! 🎉

## 🔗 Files Created

- ✅ `vercel.json` - Vercel configuration
- ✅ `api/index.js` - Vercel serverless wrapper
- ✅ `DEPLOYMENT_GUIDE.md` - Detailed guide
- ✅ `GITHUB_SETUP.md` - GitHub instructions
- ✅ `README.md` - Project documentation

## ⚠️ Important Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use MongoDB Atlas** - Local MongoDB won't work on Vercel
3. **Set all environment variables** in Vercel dashboard
4. **Update frontend URLs** - Change `localhost:5000` to your Vercel URL

## 🆘 Need Help?

See detailed guides:
- **GitHub Setup**: [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- **Full Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Fix Vercel Errors**: [VERCEL_FIX.md](./VERCEL_FIX.md)

---

**Ready? Let's deploy! 🚀**

