// Konfigurasi API - DEPRECATED: Gunakan @/app/lib/api.js untuk API calls
// File ini hanya untuk backward compatibility dengan getImageUrl
// Semua API_ENDPOINTS sudah dipindahkan ke @/app/lib/api.js

// API URL must be set via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  console.error("❌ NEXT_PUBLIC_API_URL is not set!");
}

// Re-export getImageUrl dari lib/api.js untuk backward compatibility
export { getImageUrl } from "@/app/lib/api";

export default API_BASE_URL;
