// Konfigurasi API - DEPRECATED: Gunakan @/app/lib/api.js untuk API calls
// File ini hanya untuk backward compatibility dengan getImageUrl
// Semua API_ENDPOINTS sudah dipindahkan ke @/app/lib/api.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Re-export getImageUrl dari lib/api.js untuk backward compatibility
export { getImageUrl } from "@/app/lib/api";

export default API_BASE_URL;
