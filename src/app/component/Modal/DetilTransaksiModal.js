"use client";
import React from "react";
import { formatNumber, formatCurrency } from "@/app/lib/api";
import {
  CloseOne,
  TransactionOrder,
  Calendar,
  Wallet,
  ShoppingBag,
  Money,
  Store,
  PaperMoney,
  CommuterBag,
} from "@icon-park/react";

const DetailTransaksi = ({ isOpen, onClose, transaksi }) => {
  if (!isOpen || !transaksi) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[90vh] flex flex-col border-0 sm:border border-gray-200 dark:border-gray-700">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <TransactionOrder
                  theme="filled"
                  size={20}
                  className="text-white"
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  Struk Transaksi
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  #{transaksi.transaction_id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
              title="Tutup"
            >
              <CloseOne theme="filled" size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="space-y-6">
            {/* Store Header */}
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CommuterBag
                  theme="filled"
                  size={24}
                  className="text-indigo-600 dark:text-indigo-400"
                />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  NaCshier
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Point of Sale System
              </p>
            </div>

            {/* Transaction Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar theme="outline" size={16} />
                <span>
                  {transaksi.tanggal || "N/A"}{" "}
                  {transaksi.jam ? `• ${transaksi.jam}` : ""}
                </span>
              </div>
              {transaksi.kasir && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Wallet theme="outline" size={16} />
                  <span>{transaksi.kasir}</span>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag
                  theme="outline"
                  size={18}
                  className="text-gray-600 dark:text-gray-400"
                />
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Daftar Barang
                </h4>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transaksi.barang && transaksi.barang.length > 0 ? (
                  transaksi.barang.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {item.nama || "Produk"}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 ml-2">
                          {formatCurrency(
                            (item.harga || 0) * (item.jumlah || 0)
                          )}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {formatCurrency(item.harga || 0)} × {item.jumlah || 0}
                        </span>
                        {item.subtotalSelling && item.subtotalCapital && (
                          <span className="text-green-600 dark:text-green-400">
                            Profit:{" "}
                            {formatCurrency(
                              item.subtotalSelling - item.subtotalCapital
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Tidak ada item</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-4 sm:p-5 border-2 border-indigo-200 dark:border-indigo-800">
              <div className="space-y-3">
                {transaksi.totalSellingPrice && transaksi.totalCapitalPrice && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Total Harga Jual</span>
                      <span className="font-medium">
                        {formatCurrency(transaksi.totalSellingPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Total Modal</span>
                      <span className="font-medium">
                        {formatCurrency(transaksi.totalCapitalPrice)}
                      </span>
                    </div>
                    {transaksi.profit !== undefined && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400 pt-2 border-t border-indigo-200 dark:border-indigo-700">
                        <span className="font-semibold">Profit</span>
                        <span className="font-bold">
                          {formatCurrency(transaksi.profit)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between items-center pt-3 border-t-2 border-indigo-300 dark:border-indigo-700">
                  <div className="flex items-center gap-2">
                    <PaperMoney
                      theme="filled"
                      size={20}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                    <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Total Pembayaran
                    </span>
                  </div>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(transaksi.total || 0)}
                  </span>
                </div>
                {transaksi.metodePembayaran && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Metode Pembayaran
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        transaksi.metodePembayaran?.toLowerCase() === "qris"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : transaksi.metodePembayaran?.toLowerCase() === "cash"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {transaksi.metodePembayaran}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Message */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Terima kasih atas kunjungan Anda
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Barang yang sudah dibeli tidak dapat dikembalikan
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-white rounded-lg font-semibold transition-all active:scale-[0.98] min-h-[48px] sm:min-h-[44px] shadow-lg"
          >
            <span>Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailTransaksi;
