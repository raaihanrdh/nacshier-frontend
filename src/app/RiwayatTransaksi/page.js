"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "@/app/contexts/ToastContext";
import {
  History,
  DownloadTwo,
  FileExcel,
  FilePdf,
  Filter,
  Search,
  Calendar,
  User,
  Close,
  Money,
  TransactionOrder,
  ShoppingBag,
  Wallet,
  Goods,
  Dollar,
  PaperMoney,
  ChartLineArea,
} from "@icon-park/react";
import { AlertCircle } from "react-feather";
import DetailTransaksi from "../component/Modal/DetilTransaksiModal";
// Removed client-side export libraries - now using backend export
import { api, API_ENDPOINTS, formatCurrency } from "@/app/lib/api";
import Dropdown from "../component/Dropdown";

const LaporanTransaksi = () => {
  const toast = useToast();
  // State management
  const [transaksi, setTransaksi] = useState([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState([]);
  const [periode, setPeriode] = useState("harian");
  const [tanggal, setTanggal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [produk, setProduk] = useState("");
  const [kasir, setKasir] = useState("");
  const [pendapatan, setPendapatan] = useState(0);
  const [incomeQRIS, setIncomeQRIS] = useState(0);
  const [incomeCash, setIncomeCash] = useState(0);
  const [incomeTransfer, setIncomeTransfer] = useState(0);
  const [totalTransaksi, setTotalTransaksi] = useState(0);
  const [totalBarang, setTotalBarang] = useState(0);
  const [totalSellingPrice, setTotalSellingPrice] = useState(0);
  const [totalCapitalPrice, setTotalCapitalPrice] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // Default 25 items per page
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Reset summary data
  const resetSummary = useCallback(() => {
    setPendapatan(0);
    setIncomeQRIS(0);
    setIncomeCash(0);
    setIncomeTransfer(0);
    setTotalTransaksi(0);
    setTotalBarang(0);
    setTotalSellingPrice(0);
    setTotalCapitalPrice(0);
    setTotalProfit(0);
  }, []);

  // Calculate summary statistics
  const calculateSummary = useCallback((data) => {
    return data.reduce(
      (acc, trx) => {
        const total = parseFloat(trx.total || 0);
        acc.totalPendapatan += total;

        // Fixed payment method comparison
        const paymentMethod = trx.metodePembayaran?.toLowerCase();
        if (paymentMethod === "qris") {
          acc.totalQRIS += total;
        } else if (paymentMethod === "cash") {
          acc.totalCash += total;
        } else if (paymentMethod === "transfer") {
          acc.totalTransfer += total;
        }

        acc.barangCount += (trx.barang || []).reduce(
          (sum, item) => sum + (parseInt(item.jumlah) || 0),
          0
        );

        // Add selling price calculations
        acc.totalSellingPrice += parseFloat(trx.totalSellingPrice || 0);
        acc.totalCapitalPrice += parseFloat(trx.totalCapitalPrice || 0);
        acc.totalProfit += parseFloat(trx.profit || 0);

        return acc;
      },
      {
        totalPendapatan: 0,
        totalQRIS: 0,
        totalCash: 0,
        totalTransfer: 0,
        barangCount: 0,
        totalSellingPrice: 0,
        totalCapitalPrice: 0,
        totalProfit: 0,
      }
    );
  }, []);

  // Helper function to normalize date format
  const normalizeDate = (dateString) => {
    if (!dateString) return "";

    // Handle different date formats
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }

    if (dateString.includes(" ")) {
      return dateString.split(" ")[0];
    }

    return dateString;
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to format time for display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "";
    try {
      // If it's already in HH:MM format, return as is
      if (timeString.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        return timeString.substring(0, 5); // Return HH:MM only
      }

      // If it's a full datetime, extract time
      const date = new Date(timeString);
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return timeString;
    }
  };

  // Fetch transaction data
  const fetchTransaksi = useCallback(
    async (date, start, end) => {
      setIsLoading(true);
      setError(null);
      resetSummary();

      try {
        let url = API_ENDPOINTS.TRANSACTIONS;
        const params = new URLSearchParams();

        // Set parameters based on period
        if (periode === "harian" && date) {
          params.append("period", "daily");
          params.append("date", date);
        } else if (periode === "mingguan") {
          params.append("period", "weekly");
          if (start && end) {
            params.append("start_date", start);
            params.append("end_date", end);
          }
        } else if (periode === "bulanan") {
          params.append("period", "monthly");
          if (start && end) {
            params.append("start_date", start);
            params.append("end_date", end);
          }
        } else if (periode === "custom" && start && end) {
          params.append("period", "custom");
          params.append("start_date", start);
          params.append("end_date", end);
        } else if (periode === "semua") {
          params.append("period", "all");
        }

        console.log("Fetching with params:", params.toString());

        const data = await api.get(`${url}?${params.toString()}`);
        let transactionsData = Array.isArray(data)
          ? data
          : data.transactions || [];

        console.log("Raw API data:", transactionsData);

        // Additional client-side filtering for daily transactions (backup filter)
        if (periode === "harian" && date && transactionsData.length > 0) {
          transactionsData = transactionsData.filter((trx) => {
            const trxDate = normalizeDate(
              trx.transaction_time || trx.tanggal || ""
            );
            const filterDate = normalizeDate(date);
            return trxDate === filterDate;
          });
        }

        // Format transaction data
        const formatted = transactionsData.map((trx) => {
          const transactionTime = trx.transaction_time || "";
          const [tgl, jam] = transactionTime.includes(" ")
            ? transactionTime.split(" ")
            : [transactionTime, ""];

          return {
            transaction_id: trx.transaction_id,
            shift_id: trx.shift_id || "?",
            tanggal: normalizeDate(tgl) || "",
            jam: jam || "",
            kasir: `Kasir #${trx.shift_id || "?"}`,
            metodePembayaran: trx.payment_method || "Tidak diketahui",
            total: parseFloat(trx.total_amount || 0),
            totalSellingPrice: parseFloat(trx.total_selling_price || 0),
            totalCapitalPrice: parseFloat(trx.total_capital_price || 0),
            profit: parseFloat(trx.profit || 0),
            barang: (trx.items || []).map((item) => ({
              nama: item.product?.name || "Tidak diketahui",
              harga: parseFloat(item.price || item.selling_price || 0),
              jumlah: parseInt(item.quantity || 0),
              subtotalSelling: parseFloat(item.subtotal_selling || 0),
              subtotalCapital: parseFloat(item.subtotal_capital || 0),
              capitalPrice: parseFloat(item.product?.capital_price || 0),
            })),
            raw_transaction_time: trx.transaction_time,
          };
        });

        console.log("Formatted transactions:", formatted);
        setTransaksi(formatted);
        setFilteredTransaksi(formatted);

        // Calculate and set summary
        const calculated = calculateSummary(formatted);
        setPendapatan(calculated.totalPendapatan);
        setIncomeQRIS(calculated.totalQRIS);
        setIncomeCash(calculated.totalCash);
        setIncomeTransfer(calculated.totalTransfer);
        setTotalTransaksi(formatted.length);
        setTotalBarang(calculated.barangCount);
        setTotalSellingPrice(calculated.totalSellingPrice);
        setTotalCapitalPrice(calculated.totalCapitalPrice);
        setTotalProfit(calculated.totalProfit);
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Gagal memuat data transaksi. Silakan coba lagi.");
        setTransaksi([]);
        setFilteredTransaksi([]);
      } finally {
        setIsLoading(false);
      }
    },
    [periode, resetSummary, calculateSummary]
  );

  // Initialize dates
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTanggal(today);
    setStartDate(today);
    setEndDate(today);
  }, []);

  // Fetch data when period or dates change
  useEffect(() => {
    if (periode === "semua") {
      console.log("Fetching all transactions");
      fetchTransaksi("", "", "");
    } else if (periode === "harian" && tanggal) {
      console.log("Fetching daily transactions for:", tanggal);
      fetchTransaksi(tanggal, "", "");
    } else if (periode === "mingguan") {
      console.log("Fetching weekly transactions:", startDate, "to", endDate);
      fetchTransaksi("", startDate, endDate);
    } else if (periode === "bulanan") {
      console.log("Fetching monthly transactions:", startDate, "to", endDate);
      fetchTransaksi("", startDate, endDate);
    } else if (periode === "custom" && startDate && endDate) {
      console.log("Fetching custom range transactions:", startDate, "to", endDate);
      fetchTransaksi("", startDate, endDate);
    }
  }, [periode, tanggal, startDate, endDate, fetchTransaksi]);

  // Set default dates for weekly, monthly, and custom periods
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    
    if (periode === "mingguan") {
      const todayDate = new Date();
      const firstDayOfWeek = new Date(todayDate);
      firstDayOfWeek.setDate(todayDate.getDate() - todayDate.getDay());

      setStartDate(firstDayOfWeek.toISOString().split("T")[0]);
      setEndDate(today);
    } else if (periode === "bulanan") {
      const todayDate = new Date();
      const firstDayOfMonth = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        1
      );

      setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
      setEndDate(today);
    } else if (periode === "custom") {
      // Set default custom range to last 30 days
      const todayDate = new Date();
      const thirtyDaysAgo = new Date(todayDate);
      thirtyDaysAgo.setDate(todayDate.getDate() - 30);

      setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
      setEndDate(today);
    }
  }, [periode]);

  // Apply filters to transactions
  const applyFilters = useCallback(() => {
    let filtered = [...transaksi];

    if (produk.trim() !== "") {
      filtered = filtered.filter((trx) =>
        trx.barang?.some((item) =>
          item.nama.toLowerCase().includes(produk.toLowerCase())
        )
      );
    }

    if (kasir.trim() !== "") {
      filtered = filtered.filter((trx) =>
        trx.kasir.toLowerCase().includes(kasir.toLowerCase())
      );
    }

    setFilteredTransaksi(filtered);
    setCurrentPage(1);

    const calculated = calculateSummary(filtered);
    setPendapatan(calculated.totalPendapatan);
    setIncomeQRIS(calculated.totalQRIS);
    setIncomeCash(calculated.totalCash);
    setIncomeTransfer(calculated.totalTransfer);
    setTotalTransaksi(filtered.length);
    setTotalBarang(calculated.barangCount);
    setTotalSellingPrice(calculated.totalSellingPrice);
    setTotalCapitalPrice(calculated.totalCapitalPrice);
    setTotalProfit(calculated.totalProfit);
  }, [transaksi, produk, kasir, calculateSummary]);

  // Handle filter button click
  const handleFilter = () => {
    applyFilters();
  };

  // Handle view details of a transaction
  const handleDetil = (trx) => {
    setSelectedTransaksi(trx);
    setIsModalOpen(true);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Pagination calculations
  const indexOfLastTransaction = currentPage * itemsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
  const currentTransactions = filteredTransaksi.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(filteredTransaksi.length / itemsPerPage);

  // Generate pagination numbers
  const paginationNumbers = [];
  const pageRange = 3;
  let startPage = Math.max(1, currentPage - pageRange);
  let endPage = Math.min(totalPages, currentPage + pageRange);

  if (endPage - startPage < 6 && totalPages > 6) {
    if (currentPage < totalPages / 2) {
      endPage = Math.min(startPage + 6, totalPages);
    } else {
      startPage = Math.max(endPage - 6, 1);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationNumbers.push(i);
  }

  // Format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "Rp 0";

    const numValue = typeof value === "string" ? parseFloat(value) : value || 0;
    if (isNaN(numValue)) return "Rp 0";

    // Check if number has decimal part
    const hasDecimal = numValue % 1 !== 0;

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: hasDecimal ? 2 : 0,
      maximumFractionDigits: hasDecimal ? 2 : 0,
    }).format(numValue);
  };

  // Handle period change
  const handlePeriodeChange = (newPeriode) => {
    setPeriode(newPeriode);
    setProduk("");
    setKasir("");
    setCurrentPage(1);
  };

  // Handle date change
  const handleTanggalChange = (newTanggal) => {
    setTanggal(newTanggal);
    setCurrentPage(1);
  };

  // Export Excel menggunakan backend
  const exportToExcel = async () => {
    try {
      setIsExporting(true);

      // Prepare request parameters
      const params = new URLSearchParams();
      
      // Set period parameter
      if (periode === "harian") {
        params.append("period", "daily");
      } else if (periode === "mingguan") {
        params.append("period", "weekly");
      } else if (periode === "bulanan") {
        params.append("period", "monthly");
      } else if (periode === "custom") {
        params.append("period", "custom");
      } else if (periode === "semua") {
        params.append("period", "all");
      } else {
        params.append("period", "daily"); // Default fallback
      }

      if (periode === "harian" && tanggal) {
        params.append("date", tanggal);
      } else if (
        (periode === "mingguan" || periode === "bulanan" || periode === "custom") &&
        startDate &&
        endDate
      ) {
        params.append("start_date", startDate);
        params.append("end_date", endDate);
      }

      if (produk) {
        params.append("product_filter", produk);
      }
      if (kasir) {
        params.append("cashier_filter", kasir);
      }

      // Get token
      const token =
        localStorage.getItem("token") || localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        return;
      }

      // Download file from backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        toast.error(
          "API URL tidak dikonfigurasi. Silakan set NEXT_PUBLIC_API_URL"
        );
        return;
      }

      const response = await fetch(
        `${apiUrl}${
          API_ENDPOINTS.TRANSACTIONS_EXPORT_EXCEL
        }?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengekspor Excel");
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "Laporan_Transaksi.xlsx";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("Excel export successful");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Gagal mengekspor ke Excel. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export PDF menggunakan backend
  const exportToPDF = async () => {
    try {
      setIsExporting(true);

      // Prepare request parameters
      const params = new URLSearchParams();
      
      // Set period parameter
      if (periode === "harian") {
        params.append("period", "daily");
      } else if (periode === "mingguan") {
        params.append("period", "weekly");
      } else if (periode === "bulanan") {
        params.append("period", "monthly");
      } else if (periode === "custom") {
        params.append("period", "custom");
      } else if (periode === "semua") {
        params.append("period", "all");
      } else {
        params.append("period", "daily"); // Default fallback
      }

      if (periode === "harian" && tanggal) {
        params.append("date", tanggal);
      } else if (
        (periode === "mingguan" || periode === "bulanan" || periode === "custom") &&
        startDate &&
        endDate
      ) {
        params.append("start_date", startDate);
        params.append("end_date", endDate);
      }

      if (produk) {
        params.append("product_filter", produk);
      }
      if (kasir) {
        params.append("cashier_filter", kasir);
      }

      // Get token
      const token =
        localStorage.getItem("token") || localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        return;
      }

      // Download file from backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        toast.error(
          "API URL tidak dikonfigurasi. Silakan set NEXT_PUBLIC_API_URL"
        );
        return;
      }

      const response = await fetch(
        `${apiUrl}${
          API_ENDPOINTS.TRANSACTIONS_EXPORT_PDF
        }?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengekspor PDF");
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "Laporan_Transaksi.pdf";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("PDF export successful");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Gagal mengekspor ke PDF. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <History
                  theme="filled"
                  size={24}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Laporan Transaksi
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Transaction Report
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 mb-6">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Memuat data transaksi...
              </span>
            </div>
          </div>
        )}

        {/* Filter Section - Professional Design */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                <Filter
                  theme="filled"
                  size={18}
                  className="text-gray-700 dark:text-gray-300"
                />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                Filter
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={exportToPDF}
                disabled={isExporting || isLoading}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 min-h-[40px] sm:min-h-[36px] flex-1 sm:flex-initial"
              >
                <FilePdf
                  theme="filled"
                  size={16}
                  className="sm:w-[18px] sm:h-[18px]"
                />
                <span className="hidden xs:inline">
                  {isExporting ? "Mengekspor..." : "PDF"}
                </span>
                <span className="xs:hidden">{isExporting ? "..." : "PDF"}</span>
              </button>
              <button
                onClick={exportToExcel}
                disabled={isExporting || isLoading}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 min-h-[40px] sm:min-h-[36px] flex-1 sm:flex-initial"
              >
                <FileExcel
                  theme="filled"
                  size={16}
                  className="sm:w-[18px] sm:h-[18px]"
                />
                <span className="hidden xs:inline">
                  {isExporting ? "Mengekspor..." : "Excel"}
                </span>
                <span className="xs:hidden">
                  {isExporting ? "..." : "Excel"}
                </span>
              </button>
              <button
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setPeriode("harian");
                  setTanggal(today);
                  setStartDate(today);
                  setEndDate(today);
                  setProduk("");
                  setKasir("");
                  setCurrentPage(1);
                }}
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors active:scale-95 min-h-[40px] sm:min-h-[36px]"
              >
                <Close theme="outline" size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Dropdown
              label="Periode"
              value={periode}
              onChange={(e) => handlePeriodeChange(e.target.value)}
              placeholder="Pilih periode"
              themeColor="blue"
              options={[
                { value: "semua", label: "Semua" },
                { value: "harian", label: "Harian" },
                { value: "mingguan", label: "Mingguan" },
                { value: "bulanan", label: "Bulanan" },
                { value: "custom", label: "Custom (Rentang Tanggal)" },
              ]}
            />

            {periode === "semua" ? null : periode === "harian" ? (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => handleTanggalChange(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            ) : (periode === "mingguan" || periode === "bulanan" || periode === "custom") ? (
              <>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    max={new Date().toISOString().split("T")[0]}
                    min={startDate}
                  />
                </div>
              </>
            ) : null}

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Produk
              </label>
              <input
                type="text"
                value={produk}
                onChange={(e) => setProduk(e.target.value)}
                placeholder="Cari produk..."
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Kasir
              </label>
              <input
                type="text"
                value={kasir}
                onChange={(e) => setKasir(e.target.value)}
                placeholder="Cari kasir..."
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleFilter}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 sm:py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-xl transition-all shadow-lg active:scale-95 min-h-[48px] sm:min-h-[44px]"
              >
                <Filter theme="filled" size={20} className="sm:w-5 sm:h-5" />
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards - Attractive & Professional */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-lg dark:shadow-xl mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-5 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <ChartLineArea
              theme="filled"
              size={20}
              className="text-blue-600 dark:text-blue-400"
            />
            Ringkasan Transaksi
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-indigo-200 dark:border-indigo-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  Pendapatan
                </p>
                <div className="p-1.5 bg-white dark:bg-indigo-900/30 rounded-lg shadow-sm">
                  <Dollar
                    theme="filled"
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-indigo-900 dark:text-indigo-100">
                {formatCurrency(pendapatan)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-blue-200 dark:border-blue-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  QRIS
                </p>
                <div className="p-1.5 bg-white dark:bg-blue-900/30 rounded-lg shadow-sm">
                  <Wallet
                    theme="filled"
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(incomeQRIS)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-green-200 dark:border-green-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                  Cash
                </p>
                <div className="p-1.5 bg-white dark:bg-green-900/30 rounded-lg shadow-sm">
                  <PaperMoney
                    theme="filled"
                    size={16}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(incomeCash)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-purple-200 dark:border-purple-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  Transaksi
                </p>
                <div className="p-1.5 bg-white dark:bg-purple-900/30 rounded-lg shadow-sm">
                  <TransactionOrder
                    theme="filled"
                    size={16}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-purple-900 dark:text-purple-100">
                {totalTransaksi}
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-pink-200 dark:border-pink-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-pink-700 dark:text-pink-300">
                  Barang
                </p>
                <div className="p-1.5 bg-white dark:bg-pink-900/30 rounded-lg shadow-sm">
                  <ShoppingBag
                    theme="filled"
                    size={16}
                    className="text-pink-600 dark:text-pink-400"
                  />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-pink-900 dark:text-pink-100">
                {totalBarang}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white shadow-sm rounded-xl p-8 flex justify-center border border-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data transaksi...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {currentTransactions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Tidak ada data transaksi
                    </p>
                  </div>
                </div>
              ) : (
                currentTransactions.map((trx) => (
                  <div
                    key={trx.transaction_id}
                    onClick={() => handleDetil(trx)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <TransactionOrder
                              theme="filled"
                              size={16}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          </div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                            #{trx.transaction_id}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Shift #{trx.shift_id}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {new Date(trx.tanggal).toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {trx.kasir} • {trx.metodePembayaran}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-base font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(trx.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View - Attractive & Professional */}
            <div className="hidden lg:block overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700">
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">📋</div>
                            <p>Tidak ada data transaksi</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentTransactions.map((trx, index) => (
                        <tr
                          key={trx.transaction_id}
                          className={`hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50 dark:bg-gray-700/30"
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                #{trx.transaction_id}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                  Shift #{trx.shift_id}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {trx.kasir}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  {trx.metodePembayaran}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {new Date(trx.tanggal).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                              {formatCurrency(trx.total)}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleDetil(trx)}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg shadow-sm hover:shadow transition-all active:scale-95"
                              title="Lihat Detail"
                            >
                              <span>Detail</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 || filteredTransaksi.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Items Per Page Selector */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Baris per halaman:
                  </label>
                  <Dropdown
                    value={itemsPerPage.toString()}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    placeholder="Pilih"
                    themeColor="blue"
                    options={[
                      { value: "10", label: "10 baris" },
                      { value: "25", label: "25 baris" },
                      { value: "50", label: "50 baris" },
                      { value: "100", label: "100 baris" },
                    ]}
                  />
                </div>

                {/* Mobile Pagination */}
                {totalPages > 1 && (
                  <div className="flex-1 flex justify-between sm:hidden w-full">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Desktop Pagination */}
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Menampilkan{" "}
                      <span className="font-medium">
                        {filteredTransaksi.length > 0 ? indexOfFirstTransaction + 1 : 0}
                      </span>{" "}
                      sampai{" "}
                      <span className="font-medium">
                        {Math.min(
                          indexOfLastTransaction,
                          filteredTransaksi.length
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-medium">
                        {filteredTransaksi.length}
                      </span>{" "}
                      data
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                          currentPage === 1
                            ? "border-gray-300 text-gray-300 cursor-not-allowed"
                            : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {paginationNumbers.map((number) => (
                        <button
                          key={`page-${number}`}
                          onClick={() => handlePageChange(number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === number
                              ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {number}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                          currentPage === totalPages
                            ? "border-gray-300 text-gray-300 cursor-not-allowed"
                            : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* Modal Detail Transaksi */}
        <DetailTransaksi
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaksi={selectedTransaksi}
        />
      </div>
    </div>
  );
};

export default LaporanTransaksi;
