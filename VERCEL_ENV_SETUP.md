# 🔧 Cara Set Environment Variable di Vercel

## 📍 Langkah-langkah:

### 1. Login ke Vercel Dashboard
- Kunjungi: https://vercel.com/dashboard
- Login dengan akun GitHub Anda

### 2. Pilih Project
- Cari dan klik project **`nacshier-frontend`** (atau nama project frontend Anda)

### 3. Masuk ke Settings
- Di halaman project, klik tab **"Settings"** di bagian atas

### 4. Environment Variables
- Di sidebar kiri, klik **"Environment Variables"**
- Atau scroll ke bagian **"Environment Variables"**

### 5. Tambah Variable
- Klik tombol **"Add New"** atau **"Add"**
- Isi:
  - **Key:** `NEXT_PUBLIC_API_URL`
  - **Value:** `https://api.nacshier.my.id`
  - **Environment:** Pilih semua (Production, Preview, Development)

### 6. Save
- Klik **"Save"** atau **"Add"**

### 7. Redeploy (Jika perlu)
- Setelah save, Vercel biasanya auto-deploy
- Jika tidak, klik **"Deployments"** tab
- Klik menu **"..."** di deployment terbaru
- Pilih **"Redeploy"**

---

## 🎯 Screenshot Locations:

1. **Vercel Dashboard:** `vercel.com/dashboard`
2. **Project Settings:** `vercel.com/[username]/[project-name]/settings`
3. **Environment Variables:** `vercel.com/[username]/[project-name]/settings/environment-variables`

---

## ✅ Checklist:

- [ ] Login ke Vercel Dashboard
- [ ] Pilih project `nacshier-frontend`
- [ ] Masuk ke Settings → Environment Variables
- [ ] Add `NEXT_PUBLIC_API_URL` = `https://api.nacshier.my.id`
- [ ] Pilih semua environments (Production, Preview, Development)
- [ ] Save
- [ ] Redeploy jika perlu
- [ ] Test aplikasi setelah deploy

---

## 🔍 Verify Environment Variable:

Setelah deploy, cek di browser console:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should show: https://api.nacshier.my.id
```

---

## ⚠️ Important:

- Variable `NEXT_PUBLIC_*` akan di-expose ke browser (public)
- Jangan simpan sensitive data di `NEXT_PUBLIC_*`
- Set variable ini sebelum deploy pertama kali

