"use client";
import {
  CloseOne,
  EditTwo,
  Delete,
  Calendar,
  Document,
  Category,
  Wallet,
  Money,
  CategoryManagement,
  DocumentFolder,
  Income,
} from "@icon-park/react";
import { formatCurrency } from "@/app/lib/api";

const CashflowDetailModal = ({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (!isOpen || !transaction) return null;

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
              <div
                className={`p-2 rounded-lg ${
                  transaction.type === "income"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                <Income
                  theme="filled"
                  size={20}
                  className={
                    transaction.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                Detail Transaksi
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
            {/* Amount Card */}
            <div
              className={`p-5 rounded-xl border-2 ${
                transaction.type === "income"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    transaction.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.type === "expense" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  <Calendar theme="outline" size={14} />
                  Tanggal
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {new Date(transaction.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  <DocumentFolder theme="outline" size={14} />
                  Deskripsi
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {transaction.description || "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  <CategoryManagement theme="outline" size={14} />
                  Kategori
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {transaction.category || "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  <Wallet theme="outline" size={14} />
                  Metode Pembayaran
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {transaction.method || "-"}
                  </p>
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
              <EditTwo theme="filled" size={18} />
              <span>Edit</span>
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

export default CashflowDetailModal;
