# ⚠️ URGENT: Fix Environment Variable di Vercel

## 🔴 Masalah:

Request URL menunjukkan: `https://www.nacshier.my.id/undefined/api/login`

Ini berarti `NEXT_PUBLIC_API_URL` **belum di-set** di Vercel!

## ✅ Solusi:

### Step 1: Login ke Vercel Dashboard
1. Kunjungi: https://vercel.com/dashboard
2. Login dengan akun GitHub Anda

### Step 2: Pilih Project
1. Cari project **`nacshier-frontend`** (atau nama project frontend Anda)
2. Klik pada project tersebut

### Step 3: Settings → Environment Variables
1. Di halaman project, klik tab **"Settings"** di bagian atas
2. Di sidebar kiri, scroll ke bawah dan klik **"Environment Variables"**

### Step 4: Add Environment Variable
1. Klik tombol **"Add New"** atau **"Add"**
2. Isi form:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://api.nacshier.my.id`
   - **Environment:** 
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
3. Klik **"Save"**

### Step 5: Redeploy
1. Setelah save, Vercel biasanya akan auto-redeploy
2. Jika tidak, klik tab **"Deployments"**
3. Klik menu **"..."** (tiga titik) di deployment terbaru
4. Pilih **"Redeploy"**
5. Pastikan pilih environment **"Production"**

### Step 6: Verify
Setelah deploy selesai:
1. Visit: `https://www.nacshier.my.id`
2. Open browser DevTools (F12) → Console
3. Ketik: `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. Seharusnya muncul: `https://api.nacshier.my.id`
5. Coba login lagi

---

## 🎯 Quick Checklist:

- [ ] Login ke Vercel Dashboard
- [ ] Pilih project `nacshier-frontend`
- [ ] Settings → Environment Variables
- [ ] Add: `NEXT_PUBLIC_API_URL` = `https://api.nacshier.my.id`
- [ ] Pilih semua environments (Production, Preview, Development)
- [ ] Save
- [ ] Redeploy project
- [ ] Test login

---

## 🔍 Verify Environment Variable:

### Di Browser Console:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should show: https://api.nacshier.my.id
```

### Di Network Tab:
- Request URL seharusnya: `https://api.nacshier.my.id/api/login`
- **BUKAN:** `https://www.nacshier.my.id/undefined/api/login`

---

**Status:** ⚠️ Environment Variable belum di-set di Vercel!

Setelah set dan redeploy, error 405 akan hilang karena URL akan benar.

