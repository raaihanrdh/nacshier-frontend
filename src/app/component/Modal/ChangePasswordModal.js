"use client";

import { useState } from "react";
import { api, API_ENDPOINTS } from "@/app/lib/api";

export default function ChangePasswordModal({ token, onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi tidak sama");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await api.post(API_ENDPOINTS.CHANGE_PASSWORD, {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
      });
        onSuccess();
    } catch (error) {
      setError(error.message || "Gagal mengubah password");
      console.error("Change password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-lg shadow-xl w-full h-full sm:h-auto sm:max-w-md sm:max-h-[90vh] flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">Ubah Password</h3>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          {error && <div className="mb-4 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</div>}

          <form onSubmit={handleSubmit} id="change-password-form" className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password Saat Ini</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-400 min-h-[48px] sm:min-h-[44px]"
                required
                placeholder="Masukkan password saat ini"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-400 min-h-[48px] sm:min-h-[44px]"
                required
                minLength="6"
                placeholder="Masukkan password baru (min. 6 karakter)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-400 min-h-[48px] sm:min-h-[44px]"
                required
                minLength="6"
                placeholder="Konfirmasi password baru"
              />
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors min-h-[48px] sm:min-h-[44px] active:scale-[0.98]"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              form="change-password-form"
              disabled={isLoading}
              className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg font-medium transition-all min-h-[48px] sm:min-h-[44px] active:scale-[0.98] ${
                isLoading 
                  ? "bg-blue-300 dark:bg-blue-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white shadow-lg shadow-blue-500/30"
              }`}
            >
              {isLoading ? "Memproses..." : "Ubah Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
