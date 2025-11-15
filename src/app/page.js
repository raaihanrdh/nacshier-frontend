"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shiftInfo, setShiftInfo] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
      setUsername(rememberedUser);
      setRemember(true);
    }
    // Cek jika sudah login tapi belum tutup shift
    const token = localStorage.getItem("token");
    const shift = localStorage.getItem("currentShift");
    if (token && shift) {
      setShiftInfo(JSON.parse(shift));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Gunakan fetch langsung dengan error handling yang lebih baik
      const loginUrl = `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`;
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      // Check content type sebelum parsing
      const contentType = response.headers.get("content-type");
      
      // Clone response untuk bisa dibaca beberapa kali
      const responseClone = response.clone();

      // Jika response bukan JSON, handle sebagai error
      if (!contentType || !contentType.includes("application/json")) {
        const text = await responseClone.text();
        if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
          setError(
            "Server mengembalikan halaman error. Pastikan server backend berjalan dan endpoint tersedia."
          );
          console.error("HTML Response:", text.substring(0, 200));
          return;
        }
        setError(`Server error: ${response.status}. Response: ${text.substring(0, 100)}`);
        return;
      }

      // Parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        const text = await responseClone.text();
        console.error("JSON parse error:", jsonError);
        console.error("Response text:", text.substring(0, 500));
        setError("Invalid response from server. Please check server logs.");
        return;
      }

      // Handle response
      if (response.ok && data.token) {
        // Simpan data ke localStorage (simpan di kedua tempat untuk kompatibilitas)
        localStorage.setItem("token", data.token);
        localStorage.setItem("auth_token", data.token);
        setUserInfo(data.user);

        // Handle shift untuk kasir (level "user" atau "kasir")
        if (data.user.level === "user" || data.user.level === "kasir") {
          if (data.shift) {
            localStorage.setItem("currentShift", JSON.stringify(data.shift));
            setShiftInfo(data.shift);
            setShowShiftModal(true);
          } else {
            setError("Gagal memulai shift baru");
            return;
          }
        }

        // Handle remember me
        if (remember) {
          localStorage.setItem("rememberedUser", username);
        } else {
          localStorage.removeItem("rememberedUser");
        }

        // Redirect langsung untuk admin (non-kasir)
        if (data.user.level === "admin") {
          router.push("/Dashboard");
        }
      } else {
        setError(data.message || "Login gagal: token tidak ditemukan");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.message) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan jaringan atau server offline. Pastikan server backend berjalan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToDashboard = () => {
    setShowShiftModal(false);
    router.push("/Dashboard");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 relative">
      {/* Modal untuk Shift Information */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Shift Kasir Dimulai
              </h3>

              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 mb-2">Informasi Shift:</p>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">ID Shift:</span>{" "}
                    {shiftInfo?.shift_id}
                  </p>
                  <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Waktu Mulai:</span>{" "}
                    {new Date(shiftInfo?.start_time).toLocaleString()}
                  </p>
                  <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Status:</span>{" "}
                    <span className="text-green-600 dark:text-green-400">Aktif</span>
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Pastikan Anda menutup shift sebelum logout untuk menjaga
                  keamanan transaksi.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleProceedToDashboard}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  Lanjut ke Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Login */}
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg flex overflow-hidden">
        <div className="hidden md:flex flex-1 bg-blue-50 dark:bg-blue-900/20 items-center justify-center p-8">
          <Image
            src="/login.png"
            width={400}
            height={400}
            alt="Login Illustration"
            priority
          />
        </div>

        <div className="w-full md:w-1/2 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
              Selamat Datang
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Silakan login untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-400"
                required
                autoComplete="username"
                placeholder="Masukkan username Anda"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-400"
                required
                autoComplete="current-password"
                placeholder="Masukkan password Anda"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                Ingat Username
              </label>
              <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                Lupa Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-lg text-white font-medium ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              } transition-colors duration-200`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
