# 🚀 Quick Deployment Checklist

## Before You Start:
- [ ] GitHub account created
- [ ] Code pushed to GitHub
- [ ] Email ready for signups

---

## ✅ Step-by-Step (Copy this list):

### 1️⃣ MongoDB Atlas (10 mins)
- [ ] Sign up at mongodb.com/cloud/atlas
- [ ] Create FREE M0 cluster
- [ ] Create database user (save password!)
- [ ] Allow all IPs (0.0.0.0/0)
- [ ] Copy connection string

### 2️⃣ Render - Backend (10 mins)
- [ ] Sign up at render.com with GitHub
- [ ] New Web Service → Connect repo
- [ ] Root directory: `backend`
- [ ] Build: `pip install -r requirements.txt`
- [ ] Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- [ ] Add environment variables (see DEPLOYMENT_GUIDE.md)
- [ ] Deploy → Copy backend URL

### 3️⃣ Vercel - Frontend (5 mins)
- [ ] Sign up at vercel.com with GitHub
- [ ] Import project
- [ ] Root directory: `frontend`
- [ ] Add env var: `REACT_APP_BACKEND_URL=<your-render-url>`
- [ ] Deploy → Copy frontend URL

### 4️⃣ Update CORS (2 mins)
- [ ] Go back to Render
- [ ] Update CORS_ORIGINS with Vercel URL
- [ ] Save (auto-redeploys)

---

## 🎉 DONE!
Your app is live and accessible worldwide!

## 📱 Share these URLs:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

---

## Need detailed instructions?
See **DEPLOYMENT_GUIDE.md** in this folder.
