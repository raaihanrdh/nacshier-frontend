"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, API_ENDPOINTS } from "@/app/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();

  const token = params.get("token");
  const email = params.get("email");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setIsError(true);
      setMessage("Link tidak valid. Silakan minta link baru.");
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setIsError(true);
      setMessage("Password minimal 8 karakter");
      return;
    }

    if (password !== confirm) {
      setIsError(true);
      setMessage("Password tidak cocok");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      await api.post(API_ENDPOINTS.RESET_PASSWORD, {
        token,
        email,
        password,
        password_confirmation: confirm,
      });

      setIsSuccess(true);
      setMessage("Password berhasil direset!");
      setTimeout(() => router.push("/"), 3000);
    } catch (err) {
      setIsError(true);
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
          Reset Password
        </h1>

        {message && (
          <div
            className={`p-4 mb-4 rounded ${
              isError
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            }`}
          >
            {message}
          </div>
        )}

        {!isSuccess && (
          <form onSubmit={handleSubmit}>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Password Baru
            </label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password baru"
            />

            <label className="block mt-4 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Konfirmasi Password
            </label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-400"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Konfirmasi password baru"
            />

            <button
              type="submit"
              className={`mt-6 w-full bg-blue-500 dark:bg-blue-600 text-white p-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 ${
                isLoading && "opacity-50"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-blue-500 dark:text-blue-400 hover:underline"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
