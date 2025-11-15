"use client";

import { useState } from "react";
import Link from "next/link";
import { api, API_ENDPOINTS } from "@/app/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.includes("@") || !email.includes(".")) {
      setIsError(true);
      setMessage("Email tidak valid");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const data = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });

      setIsSent(true);
      setMessage(
        `Link reset telah dikirim ke ${email}. ${
          data.token ? `(Token: ${data.token})` : ""
        }`
      );
    } catch (err) {
      setIsError(true);
      setMessage(err.message || "Gagal mengirim link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
          Lupa Password
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

        {!isSent && (
          <form onSubmit={handleSubmit}>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Masukkan email Anda"
            />

            <button
              type="submit"
              className={`mt-4 w-full bg-blue-500 dark:bg-blue-600 text-white p-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 ${
                isLoading && "opacity-50"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Mengirim..." : "Kirim Link Reset"}
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
