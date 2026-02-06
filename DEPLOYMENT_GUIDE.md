# 🚀 NepSafe Deployment Guide (100% FREE)

This guide will help you deploy your NepSafe application to the internet for FREE.

## 📋 What You'll Deploy

- **Frontend (React)** → Vercel (FREE)
- **Backend (FastAPI)** → Render (FREE)
- **Database (MongoDB)** → MongoDB Atlas (FREE)

---

## ⏱️ Total Time: 30-40 minutes

---

## STEP 1: Prepare Your Code (5 mins)

### 1.1 Create environment files

**Backend (.env):**
```bash
cd backend
copy .env.example .env
```

Then edit `backend/.env` with your values (we'll get these in next steps).

**Frontend (.env):**
```bash
cd frontend
copy .env.example .env
```

Edit `frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:8000
```
(We'll change this to production URL later)

### 1.2 Push to GitHub

```bash
# In project root
git init
git add .
git commit -m "Initial commit - NepSafe project"

# Create a new repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/nepsafe-app.git
git branch -M main
git push -u origin main
```

---

## STEP 2: Set Up MongoDB Atlas (10 mins)

### 2.1 Create Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with Google/email

### 2.2 Create Database
1. Choose **FREE** M0 cluster
2. Provider: AWS
3. Region: Choose closest to you
4. Cluster Name: experiment-nep
5. Click "Create"

### 2.3 Create Database User
1. Security → Database Access
2. Add New Database User
3. Username: `nepsafe_user`
4. Password: Generate strong password (SAVE THIS!)
5. User Privileges: Read and write to any database
6. Add User

### 2.4 Allow Network Access
1. Security → Network Access
2. Add IP Address
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm

### 2.5 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string:
```
mongodb+srv://nepsafe_user:<password>@experiment-nep.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
4. Replace `<password>` with your actual password
5. **SAVE THIS** - you'll need it for backend deployment

---

## STEP 3: Deploy Backend to Render (10 mins)

### 3.1 Create Account
1. Go to https://render.com
2. Sign up with GitHub

### 3.2 Create Web Service
1. Dashboard → New → Web Service
2. Connect your GitHub repository
3. Select `nepsafe-app` (or whatever you named it)

### 3.3 Configure Service
```
Name: nepsafe-backend
Region: Oregon (or closest to you)
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
```

### 3.4 Add Environment Variables
Click "Advanced" → Add Environment Variables:

```
MONGO_URL = <paste your MongoDB connection string>
DB_NAME = experiment_nep_db
SECRET_KEY = <generate random 32+ character string>
CORS_ORIGINS = http://localhost:3000,https://your-frontend-url.vercel.app
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = your-gmail-app-password
GOOGLE_API_KEY = your-google-gemini-api-key
```

**To generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3.5 Deploy
1. Select **Free** plan
2. Click "Create Web Service"
3. Wait 5-10 minutes for deployment
4. Once done, copy your backend URL: `https://nepsafe-backend.onrender.com`

---

## STEP 4: Deploy Frontend to Vercel (10 mins)

### 4.1 Create Account
1. Go to https://vercel.com
2. Sign up with GitHub

### 4.2 Import Project
1. Dashboard → Add New → Project
2. Import your GitHub repository
3. Select `nepsafe-app`

### 4.3 Configure Build Settings
```
Framework Preset: Create React App
Root Directory: frontend
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### 4.4 Add Environment Variable
1. Environment Variables section
2. Add:
```
Key: REACT_APP_BACKEND_URL
Value: https://nepsafe-backend.onrender.com
(Use your actual Render backend URL)
```

### 4.5 Deploy
1. Click "Deploy"
2. Wait 3-5 minutes
3. Your app is live! 🎉
4. You'll get a URL like: `https://nepsafe-app.vercel.app`

---

## STEP 5: Update CORS (2 mins)

### 5.1 Update Backend Environment
1. Go back to Render dashboard
2. Select your backend service
3. Environment → Edit CORS_ORIGINS
4. Change to:
```
CORS_ORIGINS = https://nepsafe-app.vercel.app
```
(Use your actual Vercel URL)
5. Save Changes (backend will redeploy automatically)

---

## ✅ DEPLOYMENT COMPLETE!

Your app is now live at:
- **Frontend**: https://nepsafe-app.vercel.app
- **Backend**: https://nepsafe-backend.onrender.com

---

## 🔄 How to Update After Deployment

### Update Code:
```bash
# Make your changes locally
# Test everything
git add .
git commit -m "Added new feature"
git push
```

**That's it!** Both Vercel and Render will automatically redeploy.

---

## 🏠 Keep Working Locally

Your local environment is unchanged:
```bash
# Start backend
cd backend
python -m uvicorn server:app --reload

# Start frontend
cd frontend
npm start
```

---

## 🆓 FREE Tier Limitations

### Render:
- ✅ 750 hours/month (24/7 for 1 app)
- ⚠️ Sleeps after 15 mins inactivity
- ⚠️ Takes 30 seconds to wake up

### Vercel:
- ✅ No sleep mode
- ✅ Fast worldwide

### MongoDB Atlas:
- ✅ 512 MB storage
- ✅ Shared cluster

**Good enough for your final year project and demo!**

---

## 🐛 Troubleshooting

### Backend not connecting to database:
- Check MongoDB connection string
- Ensure IP whitelist is 0.0.0.0/0
- Verify database user password

### Frontend can't reach backend:
- Check CORS_ORIGINS includes your Vercel URL
- Verify REACT_APP_BACKEND_URL is set correctly
- Check Render logs for errors

### App is slow:
- Render free tier sleeps after inactivity
- First request after sleep takes 30 seconds
- Consider Railway ($5/month credit, no sleep)

---

## 📞 Need Help?

Check logs:
- **Render**: Dashboard → Your Service → Logs
- **Vercel**: Dashboard → Your Project → Deployments → View Function Logs
- **MongoDB**: Atlas → Cluster → Metrics

---

## 🎓 For Your Final Year Project Demo

### Tips:
1. **Demo the live site first** - shows it's production-ready
2. **Have local backup** - in case internet is slow
3. **Create test accounts** - admin, hotel_owner, regular user
4. **Prepare the URL** - write it on presentation slides
5. **Show the deployment** - briefly show Render/Vercel dashboards

### What to Say:
> "I've deployed this application to the cloud using industry-standard platforms. 
> The frontend is on Vercel, backend on Render, and database on MongoDB Atlas. 
> Anyone can access it via this URL. I used CI/CD so updates deploy automatically 
> when I push to GitHub."

**This shows professional-level deployment skills!**

---

Good luck with your project! 🚀
