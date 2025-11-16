# 🔄 URGENT: Redeploy Frontend Sekarang!

## ✅ Environment Variable Sudah Di-Set!

**NEXT_PUBLIC_API_URL** = `https://api.nacshier.my.id` ✅

## ⚠️ TAPI: Next.js Perlu Build Ulang!

Next.js menggunakan **build-time** environment variables untuk `NEXT_PUBLIC_*`.

Artinya:
- ❌ Set env var saja **TIDAK cukup**
- ✅ Harus **redeploy** agar env var ter-apply ke build

---

## 🚀 Langkah Redeploy:

### Step 1: Buka Deployments
1. Vercel Dashboard → Project `nacshier-frontend`
2. Klik tab **"Deployments"** di bagian atas

### Step 2: Redeploy Latest Deployment
1. Cari deployment terbaru (yang paling atas)
2. Klik menu **"..."** (tiga titik) di pojok kanan
3. Pilih **"Redeploy"**
4. Pastikan pilih environment: **"Production"**
5. Klik **"Redeploy"**

### Step 3: Tunggu Build
- Build biasanya butuh 1-3 menit
- Bisa lihat progress di halaman deployment
- Status akan berubah dari "Building" → "Ready"

### Step 4: Verify
Setelah build selesai:
1. Visit: `https://www.nacshier.my.id`
2. Open browser DevTools (F12) → Console
3. Ketik: `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. **Seharusnya muncul:** `https://api.nacshier.my.id`
5. Coba login lagi

---

## 🔍 Verifikasi Setelah Redeploy:

### Di Browser Console:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should show: https://api.nacshier.my.id
// NOT: undefined
```

### Di Network Tab:
- Request URL seharusnya: `https://api.nacshier.my.id/api/login`
- **BUKAN:** `https://www.nacshier.my.id/undefined/api/login`

---

## ⚡ Quick Check:

Jika setelah redeploy masih error:
1. Pastikan deployment status: **"Ready"** (hijau)
2. Pastikan menggunakan deployment terbaru
3. Clear browser cache (Ctrl+Shift+R atau Cmd+Shift+R)
4. Test di incognito/private window

---

## ✅ Checklist:

- [x] Environment variable `NEXT_PUBLIC_API_URL` sudah di-set
- [ ] **Redeploy project di Vercel**
- [ ] Tunggu build selesai (status "Ready")
- [ ] Test login di browser
- [ ] Verify request URL di Network tab

---

**Status:** ⚠️ Perlu Redeploy!

Setelah redeploy, error 405 akan hilang karena URL akan benar!

