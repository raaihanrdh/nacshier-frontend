"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Dropdown from "../component/Dropdown";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  MoneyCollect,
  AreaChart,
  PieChart,
  Trophy,
  ArrowUp,
  ArrowDown,
  Filter,
  Info,
  Income,
  ChartLineArea,
  IncomeOne,
  ChartPie,
  TopBar,
  BalanceOne,
  PearlOfTheOrient,
  PaperMoney,
  Dollar,
  ChartGraph,
  ChartHistogram,
  FilePdf,
  FileExcel,
  Calendar,
} from "@icon-park/react";
import { AlertCircle } from "react-feather";
import { api, API_ENDPOINTS } from "@/app/lib/api";
import { useToast } from "@/app/contexts/ToastContext";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProfitDashboard = () => {
  const toast = useToast();
  const [profitData, setProfitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // For daily
  const [startDate, setStartDate] = useState(""); // For custom/weekly/monthly
  const [endDate, setEndDate] = useState(""); // For custom/weekly/monthly
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchProfitData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build params based on period
        const params = { period };
        if (period === "daily" && date) {
          params.date = date;
        } else if (period === "custom" && startDate && endDate) {
          params.start_date = startDate;
          params.end_date = endDate;
        } else if (period === "weekly" && startDate && endDate) {
          params.start_date = startDate;
          params.end_date = endDate;
        } else if (period === "monthly" && startDate && endDate) {
          params.start_date = startDate;
          params.end_date = endDate;
        }

        const data = await api.get(API_ENDPOINTS.PROFIT, params);

        // api.get() already extracts data, but check if still wrapped
        if (data && typeof data === "object" && "success" in data) {
          setProfitData(data.data);
        } else if (data && typeof data === "object") {
          setProfitData(data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching profit data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfitData();
  }, [period, date, startDate, endDate]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "Rp 0";

    const numValue = typeof value === "string" ? parseFloat(value) : value;
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

  const renderValue = (value) => {
    const numValue =
      typeof value === "string"
        ? parseFloat(value.replace(/[^0-9.-]+/g, ""))
        : value;
    const isNegative = numValue < 0;

    return (
      <span className={isNegative ? "text-red-600" : ""}>
        {formatCurrency(value)}
      </span>
    );
  };

  const exportToPDF = async () => {
    try {
      setIsExporting(true);

      // Prepare request parameters
      const params = new URLSearchParams();
      params.append("period", period);

      if (period === "daily" && date) {
        params.append("date", date);
      } else if (
        (period === "weekly" || period === "monthly" || period === "custom") &&
        startDate &&
        endDate
      ) {
        params.append("start_date", startDate);
        params.append("end_date", endDate);
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
        `${apiUrl}${API_ENDPOINTS.PROFIT_EXPORT_PDF}?${params.toString()}`,
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
      let filename = "Laporan_Profit.pdf";
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

  const exportToExcel = async () => {
    try {
      setIsExporting(true);

      // Prepare request parameters
      const params = new URLSearchParams();
      params.append("period", period);

      if (period === "daily" && date) {
        params.append("date", date);
      } else if (
        (period === "weekly" || period === "monthly" || period === "custom") &&
        startDate &&
        endDate
      ) {
        params.append("start_date", startDate);
        params.append("end_date", endDate);
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
        `${apiUrl}${API_ENDPOINTS.PROFIT_EXPORT_EXCEL}?${params.toString()}`,
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
      let filename = "Laporan_Profit.xlsx";
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

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col justify-center items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
            <span className="text-sm text-gray-500">Memuat data profit...</span>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );

  if (!profitData)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle size={20} className="text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                No data available
              </p>
            </div>
          </div>
        </div>
      </div>
    );

  // Chart options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += formatCurrency(context.raw);
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          },
        },
        grid: {
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <ChartLineArea
                  theme="filled"
                  size={24}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-500">
                  Profit Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Analisis laba rugi bisnis Anda
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Period Selector */}
        <div className="bg-white dark:bg-gray-800/50 p-3 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700/50 mb-4 sm:mb-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter
                theme="filled"
                size={18}
                className="text-gray-600 dark:text-gray-300"
              />
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-500">
                Filter Periode
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
              <button
                onClick={exportToExcel}
                disabled={isExporting || loading || !profitData}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-4 py-3 sm:py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 rounded-xl transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg active:scale-95 min-h-[48px] sm:min-h-[44px]"
                title="Download laporan profit dalam format Excel"
              >
                <FileExcel theme="filled" size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">
                  {isExporting ? "Mengekspor..." : "Export Excel"}
                </span>
                <span className="sm:hidden">
                  {isExporting ? "..." : "Excel"}
                </span>
              </button>
              <button
                onClick={exportToPDF}
                disabled={isExporting || loading || !profitData}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-4 py-3 sm:py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 rounded-xl transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg active:scale-95 min-h-[48px] sm:min-h-[44px]"
                title="Download laporan profit dalam format PDF"
              >
                <FilePdf theme="filled" size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">
                  {isExporting ? "Mengekspor..." : "Export PDF"}
                </span>
                <span className="sm:hidden">{isExporting ? "..." : "PDF"}</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Dropdown
              label="Pilih Periode"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Pilih Periode"
              themeColor="amber"
              options={[
                { value: "daily", label: "Harian" },
                { value: "weekly", label: "Mingguan" },
                { value: "monthly", label: "Bulanan" },
                { value: "yearly", label: "Tahunan" },
                { value: "custom", label: "Custom" },
              ]}
            />

            {period === "daily" && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded-lg bg-white dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            )}

            {(period === "weekly" ||
              period === "monthly" ||
              period === "custom") && (
              <>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded-lg bg-white dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
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
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded-lg bg-white dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    max={new Date().toISOString().split("T")[0]}
                    min={startDate || undefined}
                  />
                </div>
              </>
            )}

            {profitData && profitData.period && (
              <div className="flex items-end">
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg w-full">
                  <Info theme="outline" size={16} />
                  <span>
                    Periode: <strong>{profitData.period.label}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {/* Gross Income */}
          <div className="bg-indigo-100 dark:bg-indigo-900/20 p-4 sm:p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <Income
                    theme="filled"
                    size={14}
                    className="sm:w-4 sm:h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0"
                  />
                  <span className="truncate">Pendapatan Kotor</span>
                </p>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-gray-500 mt-1 truncate">
                  {formatCurrency(profitData.summary.gross_income)}
                </p>
              </div>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <IncomeOne
                    theme="filled"
                    size={14}
                    className="sm:w-4 sm:h-4 text-green-500 dark:text-green-400 flex-shrink-0"
                  />
                  <span className="truncate">Laba Kotor</span>
                </p>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-gray-500 mt-1 truncate">
                  {renderValue(profitData.summary.gross_profit)}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Margin: {profitData.summary.gross_margin}%
                </p>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-green-100 dark:bg-green-900/20 p-4 sm:p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <Dollar
                    theme="filled"
                    size={14}
                    className="sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400 flex-shrink-0"
                  />
                  <span className="truncate">Laba Bersih</span>
                </p>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-gray-500 mt-1 truncate">
                  {renderValue(profitData.summary.net_profit)}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Margin: {profitData.summary.net_margin}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Profit Trend Chart */}
          <div className="bg-white dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-500 mb-4 flex items-center gap-2">
              <ChartLineArea
                theme="filled"
                size={20}
                className="text-indigo-500 dark:text-indigo-400"
              />
              Trend Profit {profitData.period.label}
            </h3>
            <div className="h-80">
              <Line
                data={{
                  labels: profitData.profit_trend.map((item) => item.date),
                  datasets: [
                    {
                      label: "Pendapatan",
                      data: profitData.profit_trend.map((item) => item.revenue),
                      borderColor: "rgba(79, 70, 229, 1)", // indigo-600
                      backgroundColor: "rgba(79, 70, 229, 0.1)",
                      tension: 0.3,
                      fill: true,
                    },
                    {
                      label: "Laba Bersih",
                      data: profitData.profit_trend.map(
                        (item) => item.net_profit
                      ),
                      borderColor: "rgba(16, 185, 129, 1)", // green-500
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      tension: 0.3,
                      fill: true,
                    },
                  ],
                }}
                options={commonChartOptions}
              />
            </div>
          </div>

          {/* Profit by Category Chart */}
          <div className="bg-white dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-500 mb-4 flex items-center gap-2">
              <ChartHistogram
                theme="filled"
                size={20}
                className="text-blue-500"
              />
              Profit by Category
            </h3>
            <div className="h-80">
              <Bar
                data={{
                  labels: profitData.by_category.map(
                    (item) => item.category_name
                  ),
                  datasets: [
                    {
                      label: "Laba Kotor",
                      data: profitData.by_category.map(
                        (item) => item.gross_profit
                      ),
                      backgroundColor: "rgba(99, 102, 241, 0.7)", // indigo-500
                    },
                  ],
                }}
                options={commonChartOptions}
              />
            </div>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TopBar theme="filled" size={20} className="text-yellow-500" />
            Produk Paling Menguntungkan
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Terjual
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Laba
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profitData.top_products.map((product) => (
                  <tr key={product.product_id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-200">
                      {product.name}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {product.total_sold}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-200">
                      {renderValue(product.gross_profit)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {product.margin_percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Profit Calculation Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-500 mb-4">
            Detail Perhitungan Laba
          </h2>

          <div className="space-y-4">
            {/* Gross Income */}
            <div className="border-b pb-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  Pendapatan Kotor (Gross Income):
                </span>
                <span className="font-medium">
                  {formatCurrency(profitData.summary.gross_income)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Total penjualan produk/jasa periode {profitData.period.label}
              </p>
            </div>

            {/* COGS */}
            <div className="border-b pb-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  Harga Pokok Penjualan (COGS):
                </span>
                <span className="font-medium text-red-600">
                  -
                  {formatCurrency(
                    profitData.summary.gross_income -
                      profitData.summary.gross_profit
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Biaya langsung produksi barang yang dijual
              </p>
            </div>

            {/* Gross Profit */}
            <div className="border-b pb-2 pt-2 bg-gray-50 px-4 -mx-4">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-800">
                  Laba Kotor (Gross Profit):
                </span>
                <span
                  className={
                    profitData.summary.gross_profit < 0
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {formatCurrency(profitData.summary.gross_profit)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Margin Laba Kotor:</span>
                <span>{profitData.summary.gross_margin}%</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="border-b pb-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  Biaya Operasional:
                </span>
                <span className="font-medium text-red-600">
                  -
                  {formatCurrency(
                    profitData.summary.gross_profit -
                      profitData.summary.net_profit
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Termasuk gaji, sewa, listrik, dan biaya operasional lainnya
              </p>
            </div>

            {/* Net Profit */}
            <div className="pt-4 border-t-2 border-gray-200">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-800">Laba Bersih (Net Profit):</span>
                <span
                  className={
                    profitData.summary.net_profit < 0
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {formatCurrency(profitData.summary.net_profit)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Margin Laba Bersih:</span>
                <span>{profitData.summary.net_margin}%</span>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Info theme="filled" size={16} />
                Keterangan:
              </h4>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>
                  Margin Laba Kotor = (Laba Kotor / Pendapatan Kotor) × 100%
                </li>
                <li>
                  Margin Laba Bersih = (Laba Bersih / Pendapatan Kotor) × 100%
                </li>
                <li>Perhitungan belum termasuk pajak penghasilan</li>
                <li>Data berdasarkan periode {profitData.period.label}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitDashboard;
