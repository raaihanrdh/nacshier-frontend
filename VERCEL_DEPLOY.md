# 🚀 Vercel Deployment Guide - NaCshier Frontend

## ✅ Build Status
**Build berhasil!** ✓
- Semua halaman berhasil di-generate
- Tidak ada error yang menghalangi deployment
- ESLint warning tidak mempengaruhi build

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Pastikan set di Vercel Dashboard:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Cara set:**
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://api.yourdomain.com` (atau backend URL production)
   - Environment: Production, Preview, Development

---

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository: `raaihanrdh/nacshier-frontend`
   - Select repository

2. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `kasirfe` (jika repo root, atau kosongkan jika repo langsung frontend)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

3. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

---

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd kasirfe
   vercel --prod
   ```

---

## ⚙️ Vercel Configuration (Optional)

Create `vercel.json` in `kasirfe/` if needed:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

---

## 🔍 Post-Deployment Verification

### 1. Test Frontend
- [ ] Open deployed URL
- [ ] Login works
- [ ] All pages load correctly
- [ ] API calls work (check Network tab)
- [ ] No CORS errors in console

### 2. Test API Connection
- [ ] Login endpoint accessible
- [ ] CORS configured correctly
- [ ] Token-based auth works

### 3. Test Features
- [ ] Dashboard loads
- [ ] Products page works
- [ ] Transactions work
- [ ] Dark mode works
- [ ] Mobile responsive

---

## 🐛 Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify `NEXT_PUBLIC_API_URL` is set
- Check Node.js version (should be 18+)

### CORS Errors
- Verify backend CORS allows Vercel domain
- Check `FRONTEND_URL` in backend `.env`

### API Not Working
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running and accessible
- Test API endpoint directly with curl

### 404 Errors
- Check routing configuration
- Verify all pages are in `app/` directory
- Check `next.config.mjs` for redirects

---

## 📝 Notes

1. **Automatic Deployments**: Vercel will auto-deploy on every push to `main` branch
2. **Preview Deployments**: Every PR gets a preview URL
3. **Environment Variables**: Set separately for Production, Preview, and Development
4. **Custom Domain**: Add your domain in Vercel Dashboard → Settings → Domains

---

## ✅ Ready to Deploy!

Build sudah berhasil, aplikasi siap untuk deployment ke Vercel! 🎉

