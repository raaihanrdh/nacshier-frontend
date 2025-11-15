"use client";
import { CloseOne, Edit, Lock, Delete, UserBusiness } from "@icon-park/react";

const UserDetailModal = ({
  user,
  isOpen,
  onClose,
  onEdit,
  onChangePassword,
  onDelete,
  isLoading,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-xl shadow-xl w-full h-full sm:h-auto sm:max-w-md sm:max-h-[90vh] flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <UserBusiness
                  theme="filled"
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                Detail User
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
              title="Tutup"
              disabled={isLoading}
            >
              <CloseOne theme="filled" size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="space-y-5">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <UserBusiness
                  theme="filled"
                  size={40}
                  className="text-white"
                />
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {user.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  @{user.username}
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    @{user.username}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Level
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span
                    className={`px-3 py-1.5 inline-flex items-center text-sm font-semibold rounded-full ${
                      user.level === "admin"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    }`}
                  >
                    {user.level === "admin" ? "Admin" : "Kasir"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onEdit}
              disabled={isLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[44px] active:scale-[0.98]"
            >
              <Edit theme="filled" size={18} />
              <span>Edit</span>
            </button>
            <button
              onClick={onChangePassword}
              disabled={isLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[44px] active:scale-[0.98]"
            >
              <Lock theme="filled" size={18} />
              <span>Password</span>
            </button>
            <button
              onClick={onDelete}
              disabled={isLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[44px] active:scale-[0.98]"
            >
              <Delete theme="filled" size={18} />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;

