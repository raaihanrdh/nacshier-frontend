"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/app/contexts/ToastContext";
import {
  Plus,
  Search,
  Filter,
  Close,
  EditTwo,
  Delete,
  ArrowUp,
  ArrowDown,
  IncomeOne,
  ShoppingBag,
  ChartLineArea,
  TransactionOrder,
  FileExcel,
  FilePdf,
  Left,
  Right,
  Calendar,
  Credit,
  BalanceOne,
  Money,
  Income,
} from "@icon-park/react";
// Removed client-side export libraries - now using backend export
import AddCashflowModal from "../component/Modal/AddCashflowModal";
import EditCashflowModal from "../component/Modal/EditCashflowModal";
import CashflowDetailModal from "../component/Modal/CashflowDetailModal";
import { api, API_ENDPOINTS, formatCurrency } from "@/app/lib/api";
import Dropdown from "../component/Dropdown";

export default function Cashflow() {
  const toast = useToast();
  // State untuk data transaksi
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk filter
  const [periode, setPeriode] = useState("semua"); // semua, harian, mingguan, bulanan, custom
  const [tanggal, setTanggal] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    method: "",
    start_date: "",
    end_date: "",
    type: "",
  });

  // State untuk opsi filter
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [methods, setMethods] = useState([]);

  // State untuk pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 25, // Default 25 items per page
    total: 0,
  });

  // State untuk modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTransactionId, setEditTransactionId] = useState(null);
  const [editTransactionData, setEditTransactionData] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Ref untuk debounce
  const debounceTimer = useRef(null);

  // Fetch categories dan methods saat component mount
  useEffect(() => {
    fetchCategories();
    fetchMethods();
  }, []);

  // Initialize dates
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTanggal(today);
    if (!filters.start_date) setFilters((prev) => ({ ...prev, start_date: today }));
    if (!filters.end_date) setFilters((prev) => ({ ...prev, end_date: today }));
  }, []);

  // Set default dates for weekly, monthly, and custom periods
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    
    if (periode === "mingguan") {
      const todayDate = new Date();
      const firstDayOfWeek = new Date(todayDate);
      firstDayOfWeek.setDate(todayDate.getDate() - todayDate.getDay());

      setFilters((prev) => ({
        ...prev,
        start_date: firstDayOfWeek.toISOString().split("T")[0],
        end_date: today,
      }));
    } else if (periode === "bulanan") {
      const todayDate = new Date();
      const firstDayOfMonth = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        1
      );

      setFilters((prev) => ({
        ...prev,
        start_date: firstDayOfMonth.toISOString().split("T")[0],
        end_date: today,
      }));
    } else if (periode === "custom") {
      // Set default custom range to last 30 days
      const todayDate = new Date();
      const thirtyDaysAgo = new Date(todayDate);
      thirtyDaysAgo.setDate(todayDate.getDate() - 30);

      setFilters((prev) => ({
        ...prev,
        start_date: thirtyDaysAgo.toISOString().split("T")[0],
        end_date: today,
      }));
    } else if (periode === "harian") {
      setFilters((prev) => ({
        ...prev,
        start_date: tanggal,
        end_date: tanggal,
      }));
    } else if (periode === "semua") {
      setFilters((prev) => ({
        ...prev,
        start_date: "",
        end_date: "",
      }));
    }
  }, [periode, tanggal]);

  // Fetch data ketika filters, periode, atau pagination berubah
  useEffect(() => {
    fetchData();
  }, [filters, pagination.current_page, pagination.per_page, periode]);

  // Reset ke halaman pertama ketika filter berubah
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  }, [
    periode,
    tanggal,
    filters.search,
    filters.category,
    filters.method,
    filters.start_date,
    filters.end_date,
    filters.type,
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      // Set period parameter
      if (periode === "harian" && tanggal) {
        queryParams.append("period", "daily");
        queryParams.append("date", tanggal);
      } else if (periode === "mingguan") {
        queryParams.append("period", "weekly");
        if (filters.start_date && filters.end_date) {
          queryParams.append("start_date", filters.start_date);
          queryParams.append("end_date", filters.end_date);
        }
      } else if (periode === "bulanan") {
        queryParams.append("period", "monthly");
        if (filters.start_date && filters.end_date) {
          queryParams.append("start_date", filters.start_date);
          queryParams.append("end_date", filters.end_date);
        }
      } else if (periode === "custom" && filters.start_date && filters.end_date) {
        queryParams.append("period", "custom");
        queryParams.append("start_date", filters.start_date);
        queryParams.append("end_date", filters.end_date);
      } else if (periode === "semua") {
        queryParams.append("period", "all");
      }

      // Tambahkan parameter filter lainnya yang memiliki nilai
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== "" && key !== "start_date" && key !== "end_date") {
          queryParams.append(key, value.trim());
        }
      });

      // Tambahkan start_date dan end_date jika periode bukan "semua"
      if (periode !== "semua") {
        if (filters.start_date) queryParams.append("start_date", filters.start_date);
        if (filters.end_date) queryParams.append("end_date", filters.end_date);
      }

      // Tambahkan parameter pagination
      queryParams.append("page", pagination.current_page);
      queryParams.append("per_page", pagination.per_page);

      const data = await api.get(
        `${API_ENDPOINTS.CASHFLOWS}?${queryParams.toString()}`
      );

      // api.get() returns full response if it has meta field (for pagination)
      if (
        data &&
        typeof data === "object" &&
        "success" in data &&
        "data" in data
      ) {
        setTransactions(data.data || []);
        setPagination({
          current_page: data.meta?.current_page || 1,
          last_page: data.meta?.last_page || 1,
          total: data.meta?.total || 0,
          per_page: pagination.per_page,
        });
      } else {
        // Direct array response (fallback)
        setTransactions(Array.isArray(data) ? data : []);
        setPagination({
          current_page: 1,
          last_page: 1,
          total: Array.isArray(data) ? data.length : 0,
          per_page: pagination.per_page,
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.message || "Error fetching data");
      setTransactions([]);
      setPagination({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: pagination.per_page,
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current_page, pagination.per_page, periode, tanggal]);

  const fetchCategories = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.CASHFLOW_CATEGORIES);
      // Handle both formats
      if (data && typeof data === "object" && "success" in data) {
        setCategories({
          income: data.data?.income_categories || [],
          expense: data.data?.expense_categories || [],
        });
      } else if (data && typeof data === "object") {
        setCategories({
          income: data.income_categories || [],
          expense: data.expense_categories || [],
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error fetching categories");
    }
  };

  const fetchMethods = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.CASHFLOW_METHODS);
      // Handle both formats
      if (data && typeof data === "object" && "success" in data) {
        setMethods(data.data || []);
      } else {
        setMethods(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching methods:", error);
      toast.error("Error fetching payment methods");
    }
  };

  // Handler untuk search dengan debounce
  const handleSearchChange = (value) => {
    // Clear timer sebelumnya jika ada
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set timer baru
    debounceTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }));
    }, 500);
  };

  // Handler untuk perubahan filter lainnya
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Reset semua filter
  const handleResetFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    setPeriode("harian");
    setTanggal(today);
    setFilters({
      search: "",
      category: "",
      method: "",
      start_date: today,
      end_date: today,
      type: "",
    });
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    // Clear debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  // Handle period change
  const handlePeriodeChange = (newPeriode) => {
    setPeriode(newPeriode);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  // Handle date change for daily period
  const handleTanggalChange = (newTanggal) => {
    setTanggal(newTanggal);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  // Handler untuk CRUD operations
  const handleAddTransaction = async (transactionData) => {
    try {
      const data = await api.post(API_ENDPOINTS.CASHFLOWS, transactionData);

      if (data.success) {
        toast.success("Transaction added successfully");
        await fetchData();
        return true;
      } else {
        throw new Error(data.message || "Failed to add transaction");
      }
    } catch (error) {
      toast.error(error.message || "Error adding transaction");
      console.error("Error adding transaction:", error);
      return false;
    }
  };

  const handleEditTransaction = async (id, transactionData) => {
    try {
      const data = await api.put(
        `${API_ENDPOINTS.CASHFLOWS}/${id}`,
        transactionData
      );

      if (data.success) {
        toast.success("Transaction updated successfully");
        await fetchData();
        return true;
      } else {
        throw new Error(data.message || "Failed to update transaction");
      }
    } catch (error) {
      toast.error(error.message || "Error updating transaction");
      console.error("Error updating transaction:", error);
      return false;
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;

    try {
      const data = await api.delete(`${API_ENDPOINTS.CASHFLOWS}/${id}`);
      if (data.success) {
        toast.success("Transaction deleted successfully");
        await fetchData();
      } else {
        throw new Error(data.message || "Failed to delete transaction");
      }
    } catch (error) {
      toast.error(error.message || "Error deleting transaction");
      console.error("Error deleting transaction:", error);
    }
  };

  // Handle view detail
  const handleViewDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  // Handle edit from detail modal
  const handleEditFromDetail = (transaction) => {
    setShowDetailModal(false);
    setEditTransactionId(transaction.cashflow_id);
    setEditTransactionData({ ...transaction });
  };

  // Handle delete from detail modal
  const handleDeleteFromDetail = (transaction) => {
    setShowDetailModal(false);
    handleDeleteTransaction(transaction.cashflow_id);
  };

  // Menghitung total pemasukan dan pengeluaran
  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += parseFloat(transaction.amount) || 0;
      } else {
        acc.expense += parseFloat(transaction.amount) || 0;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const balance = totals.income - totals.expense;

  // Generate page numbers untuk pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const currentPage = pagination.current_page;
    const lastPage = pagination.last_page;

    if (lastPage <= maxPagesToShow) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(lastPage);
      } else if (currentPage >= lastPage - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = lastPage - 3; i <= lastPage; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(lastPage);
      }
    }

    return pages;
  };

  // Fungsi untuk ekspor data menggunakan backend
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadExcel = async () => {
    try {
      setIsExporting(true);

      // Prepare request parameters
      const params = new URLSearchParams();
      
      // Set period parameter
      if (periode === "harian") {
        params.append("period", "daily");
        if (tanggal) params.append("date", tanggal);
      } else if (periode === "mingguan") {
        params.append("period", "weekly");
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);
      } else if (periode === "bulanan") {
        params.append("period", "monthly");
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);
      } else if (periode === "custom") {
        params.append("period", "custom");
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);
      } else if (periode === "semua") {
        params.append("period", "all");
      }
      
      if (filters.type) params.append("type", filters.type);
      if (filters.category) params.append("category", filters.category);
      if (filters.method) params.append("method", filters.method);
      if (filters.search) params.append("search", filters.search);

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
        toast.error("API URL tidak dikonfigurasi. Silakan set NEXT_PUBLIC_API_URL");
        return;
      }
      
      const response = await fetch(
        `${apiUrl}${API_ENDPOINTS.CASHFLOW_EXPORT_EXCEL}?${params.toString()}`,
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
      let filename = "Laporan_Cashflow.xlsx";
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

      toast.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Gagal mengekspor ke Excel. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);

      // Prepare request parameters
      const params = new URLSearchParams();
      
      // Set period parameter
      if (periode === "harian") {
        params.append("period", "daily");
        if (tanggal) params.append("date", tanggal);
      } else if (periode === "mingguan") {
        params.append("period", "weekly");
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);
      } else if (periode === "bulanan") {
        params.append("period", "monthly");
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);
      } else if (periode === "custom") {
        params.append("period", "custom");
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);
      } else if (periode === "semua") {
        params.append("period", "all");
      }
      
      if (filters.type) params.append("type", filters.type);
      if (filters.category) params.append("category", filters.category);
      if (filters.method) params.append("method", filters.method);
      if (filters.search) params.append("search", filters.search);

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
        toast.error("API URL tidak dikonfigurasi. Silakan set NEXT_PUBLIC_API_URL");
        return;
      }
      
      const response = await fetch(
        `${apiUrl}${API_ENDPOINTS.CASHFLOW_EXPORT_PDF}?${params.toString()}`,
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
      let filename = "Laporan_Cashflow.pdf";
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

      toast.success("PDF file downloaded successfully");
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
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <TransactionOrder
                  theme="filled"
                  size={24}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Laporan Arus Kas
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Cashflow Report
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 dark:from-emerald-500 dark:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 rounded-xl transition-all shadow-lg active:scale-95 min-h-[48px] sm:min-h-[44px]"
            >
              <Plus theme="filled" size={20} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Tambah Transaksi</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Ringkasan Arus Kas - Attractive & Professional */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-lg dark:shadow-xl mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-5 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <ChartLineArea
              theme="filled"
              size={20}
              className="text-emerald-600 dark:text-emerald-400"
            />
            Ringkasan Arus Kas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-green-200 dark:border-green-700/50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">
                  Pemasukan
                </p>
                <div className="p-2 bg-white dark:bg-green-900/30 rounded-lg shadow-sm">
                <IncomeOne
                  theme="filled"
                    size={18}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
            </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(totals.income)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">Total Income</p>
          </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-red-200 dark:border-red-700/50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">
                  Pengeluaran
                </p>
                <div className="p-2 bg-white dark:bg-red-900/30 rounded-lg shadow-sm">
                <ShoppingBag
                  theme="filled"
                    size={18}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
            </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900 dark:text-red-100">
                {formatCurrency(totals.expense)}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">Total Expense</p>
          </div>

            <div className={`bg-gradient-to-br p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border ${
                    balance >= 0
                ? "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700/50"
                : "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700/50"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs sm:text-sm font-semibold ${
                  balance >= 0
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-orange-700 dark:text-orange-300"
                }`}>
                  Net Cashflow
                </p>
                <div className={`p-2 rounded-lg shadow-sm ${
                  balance >= 0
                    ? "bg-white dark:bg-blue-900/30"
                    : "bg-white dark:bg-orange-900/30"
                }`}>
                <BalanceOne
                  theme="filled"
                    size={18}
                  className={
                    balance >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-orange-600 dark:text-orange-400"
                  }
                />
              </div>
              </div>
              <p
                className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                  balance >= 0
                    ? "text-blue-900 dark:text-blue-100"
                    : "text-orange-900 dark:text-orange-100"
                }`}
              >
                {formatCurrency(balance)}
              </p>
              <p className={`text-xs mt-2 font-medium ${
                balance >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-orange-600 dark:text-orange-400"
              }`}>Balance</p>
            </div>
          </div>
        </div>

        {/* Kontrol Filter - Attractive & Professional */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg dark:shadow-xl mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <Filter
                theme="filled"
                size={18}
                  className="text-emerald-600 dark:text-emerald-400"
              />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                Filter
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadExcel}
                disabled={isExporting}
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
                onClick={handleDownloadPdf}
                disabled={isExporting}
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
                onClick={handleResetFilters}
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors active:scale-95 min-h-[40px] sm:min-h-[36px]"
              >
                <Close theme="outline" size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {/* Period Dropdown */}
            <Dropdown
              label="Periode"
              value={periode}
              onChange={(e) => handlePeriodeChange(e.target.value)}
              placeholder="Pilih periode"
              themeColor="emerald"
              options={[
                { value: "semua", label: "Semua" },
                { value: "harian", label: "Harian" },
                { value: "mingguan", label: "Mingguan" },
                { value: "bulanan", label: "Bulanan" },
                { value: "custom", label: "Custom (Rentang Tanggal)" },
              ]}
            />

            {/* Date Input - Conditional based on period */}
            {periode === "semua" ? null : periode === "harian" ? (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tanggal
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={tanggal}
                  onChange={(e) => handleTanggalChange(e.target.value)}
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
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={filters.start_date}
                    onChange={(e) =>
                      handleFilterChange("start_date", e.target.value)
                    }
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange("end_date", e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    min={filters.start_date}
                  />
                </div>
              </>
            ) : null}

            {/* Search Input */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Cari Deskripsi
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded-lg bg-white dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                placeholder="Cari berdasarkan deskripsi"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Category Select */}
            <Dropdown
              label="Kategori"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              placeholder="Semua Kategori"
              themeColor="emerald"
              optgroups={[
                {
                  label: "Pemasukan",
                  options:
                    categories.income?.map((category) => ({
                      value: category,
                      label: category,
                    })) || [],
                },
                {
                  label: "Pengeluaran",
                  options:
                    categories.expense?.map((category) => ({
                      value: category,
                      label: category,
                    })) || [],
                },
              ]}
            />

            {/* Type & Method */}
            <Dropdown
              label="Tipe"
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
              placeholder="Semua"
              themeColor="emerald"
              options={[
                { value: "", label: "Semua" },
                { value: "income", label: "Pemasukan" },
                { value: "expense", label: "Pengeluaran" },
              ]}
            />

            <Dropdown
              label="Metode"
                  value={filters.method}
                  onChange={(e) => handleFilterChange("method", e.target.value)}
              placeholder="Semua"
              themeColor="emerald"
              options={[
                { value: "", label: "Semua" },
                ...(methods?.map((method) => ({
                  value: method,
                  label: method,
                })) || []),
              ]}
            />
          </div>
        </div>

        {/* Bagian Transaksi - Attractive & Professional */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TransactionOrder
                theme="filled"
                size={20}
                className="text-emerald-600 dark:text-emerald-400"
              />
              Riwayat Transaksi
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat transaksi...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <TransactionOrder size={48} className="mx-auto opacity-50" />
              </div>
              <p className="text-gray-600">
                Tidak ada transaksi ditemukan.{" "}
                <button
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                  onClick={() => setShowAddForm(true)}
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold underline"
                >
                  Tambahkan transaksi baru
                </button>{" "}
                untuk memulai.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.cashflow_id}
                    onClick={() => handleViewDetail(transaction)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`p-1.5 rounded-lg ${
                              transaction.type === "income"
                                ? "bg-green-100 dark:bg-green-900/30"
                                : "bg-red-100 dark:bg-red-900/30"
                            }`}
                          >
                            <Income
                              theme="filled"
                              size={16}
                              className={
                                transaction.type === "income"
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                          {transaction.description || "-"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.category} • {transaction.method}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p
                          className={`text-base font-bold ${
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
                  </div>
                ))}
              </div>

              {/* Desktop Table View - Attractive & Professional */}
              <div className="hidden lg:block overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700">
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Deskripsi
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction, index) => (
                      <tr
                        key={transaction.cashflow_id}
                        className={`hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/30'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {new Date(transaction.date).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {transaction.description || "-"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {transaction.category}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {transaction.method}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <p
                            className={`text-sm font-bold ${
                            transaction.type === "income"
                                ? "text-green-700 dark:text-green-400"
                                : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          {transaction.type === "expense" ? "-" : "+"}
                          {formatCurrency(transaction.amount)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                            onClick={() => handleViewDetail(transaction)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-all active:scale-95"
                            disabled={loading}
                            title="Lihat Detail"
                          >
                            <span>Detail</span>
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Baris per halaman:
                    </span>
                    <Dropdown
                      value={pagination.per_page.toString()}
                      onChange={(e) =>
                        setPagination((prev) => ({
                          ...prev,
                          per_page: Number(e.target.value),
                          current_page: 1,
                        }))
                      }
                      placeholder="Pilih jumlah"
                      options={[
                        { value: "10", label: "10 baris" },
                        { value: "25", label: "25 baris" },
                        { value: "50", label: "50 baris" },
                        { value: "100", label: "100 baris" },
                      ]}
                      themeColor="emerald"
                      className="w-auto min-w-[100px] sm:min-w-[120px]"
                    />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    Menampilkan{" "}
                    <span className="font-medium">
                      {pagination.total > 0
                        ? (pagination.current_page - 1) * pagination.per_page + 1
                        : 0}
                    </span>{" "}
                    sampai{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.current_page * pagination.per_page,
                        pagination.total
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium">{pagination.total}</span> data
                  </span>
                </div>

                <div className="flex items-center justify-center sm:justify-end gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        current_page: Math.max(1, prev.current_page - 1),
                      }))
                    }
                    disabled={pagination.current_page === 1}
                    className={`p-2 rounded-md border transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
                      pagination.current_page === 1
                        ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Left theme="outline" size={16} />
                  </button>

                  {generatePageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof page === "number" &&
                        setPagination((prev) => ({
                          ...prev,
                          current_page: page,
                        }))
                      }
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        page === pagination.current_page
                          ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                          : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      } ${
                        typeof page !== "number"
                          ? "cursor-default"
                          : "cursor-pointer"
                      }`}
                      disabled={typeof page !== "number"}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        current_page: Math.min(
                          pagination.last_page,
                          prev.current_page + 1
                        ),
                      }))
                    }
                    disabled={pagination.current_page === pagination.last_page}
                    className={`p-2 rounded-md border transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
                      pagination.current_page === pagination.last_page
                        ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Right theme="outline" size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Tambah Transaksi */}
      <AddCashflowModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddTransaction}
        categories={categories}
        methods={methods}
      />

      {/* Modal Edit Transaksi */}
      {editTransactionId && editTransactionData && (
        <EditCashflowModal
          editTransactionId={editTransactionId}
          setEditTransactionId={setEditTransactionId}
          transactionData={editTransactionData}
          categories={categories}
          methods={methods}
          onEditTransaction={handleEditTransaction}
        />
      )}

      {/* Cashflow Detail Modal */}
      <CashflowDetailModal
        transaction={selectedTransaction}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTransaction(null);
        }}
        onEdit={() =>
          selectedTransaction && handleEditFromDetail(selectedTransaction)
        }
        onDelete={() =>
          selectedTransaction && handleDeleteFromDetail(selectedTransaction)
        }
        isLoading={loading}
      />
    </div>
  );
}
