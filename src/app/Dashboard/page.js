"use client";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  MoneyCollect,
  Calendar,
  TransactionOrder,
  ShoppingCart,
  AreaChart,
  Trophy,
  Clock,
  Box,
  Warning,
  Fire,
  TopBar,
  AreaMap,
  BigClock,
  Income,
  ChartLineArea,
} from "@icon-park/react";
import { AlertCircle } from "react-feather";
import { api, API_ENDPOINTS, formatNumber } from "@/app/lib/api";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    daily_income: 0,
    monthly_income: 0,
    total_transactions: 0,
    total_items_sold: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [salesChartData, setSalesChartData] = useState([]);

  useEffect(() => {
    // Fetch dashboard summary data
    const fetchDashboardSummary = async () => {
      try {
        const data = await api.get(API_ENDPOINTS.DASHBOARD_SUMMARY);
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        // Keep default values (all zeros)
      }
    };

    // Fetch recent transactions
    const fetchRecentTransactions = async () => {
      try {
        const data = await api.get(API_ENDPOINTS.DASHBOARD_LATEST_TRANSACTIONS);
        setRecentTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching recent transactions:", error);
        setRecentTransactions([]);
      }
    };

    // Fetch top products
    const fetchTopProducts = async () => {
      try {
        const data = await api.get(API_ENDPOINTS.DASHBOARD_TOP_PRODUCTS);
        setTopProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching top products:", error);
        setTopProducts([]);
      }
    };

    // Fetch sales chart data
    const fetchSalesChart = async () => {
      try {
        const data = await api.get(API_ENDPOINTS.DASHBOARD_SALES_CHART);
        setSalesChartData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sales chart:", error);
        setSalesChartData([]);
      }
    };

    // Fetch low stock products
    const fetchLowStockProducts = async () => {
      try {
        const data = await api.get(API_ENDPOINTS.DASHBOARD_LOW_STOCK);
        setLowStockProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching low stock products:", error);
        setLowStockProducts([]);
      }
    };

    // Call all fetch functions
    fetchDashboardSummary();
    fetchRecentTransactions();
    fetchTopProducts();
    fetchSalesChart();
    fetchLowStockProducts();
  }, []);

  const chartData = {
    labels: salesChartData.map((entry) => entry.date),
    datasets: [
      {
        label: "Pemasukan",
        data: salesChartData.map((entry) => entry.total),
        borderColor: "rgba(79, 70, 229, 1)",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <ChartLineArea
                theme="filled"
                size={20}
                className="sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-500">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Ringkasan aktivitas dan performa bisnis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <SummaryCard
            icon={
              <Income theme="filled" size={24} className="text-indigo-600" />
            }
            title="Pemasukan Hari Ini"
            value={`Rp ${formatNumber(dashboardData.daily_income)}`}
            bgColor="bg-indigo-50"
          />
          <SummaryCard
            icon={
              <Calendar theme="filled" size={24} className="text-blue-600" />
            }
            title="Pemasukan Bulanan"
            value={`Rp ${formatNumber(dashboardData.monthly_income)}`}
            bgColor="bg-blue-50"
          />
          <SummaryCard
            icon={
              <TransactionOrder
                theme="filled"
                size={24}
                className="text-green-600"
              />
            }
            title="Total Transaksi"
            value={dashboardData.total_transactions}
            bgColor="bg-green-50"
          />
          <SummaryCard
            icon={
              <ShoppingCart
                theme="filled"
                size={24}
                className="text-purple-600"
              />
            }
            title="Total Barang Keluar"
            value={dashboardData.total_items_sold}
            bgColor="bg-purple-50"
          />
        </div>

        {/* Charts and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 p-3 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700/50 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <AreaMap
                theme="filled"
                size={16}
                className="sm:w-[18px] sm:h-[18px] text-indigo-600 dark:text-indigo-400"
              />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-500">
                Grafik Penjualan
              </h2>
            </div>
            <div className="h-48 sm:h-64 lg:h-72">
              {salesChartData.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Tidak ada data grafik penjualan
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 p-3 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700/50 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <TopBar
                theme="filled"
                size={16}
                className="sm:w-[18px] sm:h-[18px] text-amber-600 dark:text-amber-400"
              />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-500">
                Barang Terlaris
              </h2>
            </div>
            <div className="space-y-2">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                      {product.name}
                    </span>
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded-full">
                      {product.total_sold} terjual
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Tidak ada data produk terlaris
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions and Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-800/50 p-3 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700/50 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <BigClock
                theme="filled"
                size={16}
                className="sm:w-[18px] sm:h-[18px] text-blue-600 dark:text-blue-400"
              />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-500">
                Transaksi Terbaru
              </h2>
            </div>
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700/50">
                      <th className="pb-2 pr-4">ID</th>
                      <th className="pb-2 pr-4">Jumlah</th>
                      <th className="pb-2">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => (
                        <tr
                          key={transaction.transaction_id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="py-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-200 pr-4">
                            #{transaction.transaction_id}
                          </td>
                          <td className="py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 pr-4">
                            Rp {formatNumber(transaction.total_amount)}
                          </td>
                          <td className="py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {new Date(
                              transaction.transaction_time
                            ).toLocaleDateString("id-ID")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400"
                        >
                          Tidak ada data transaksi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 p-3 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700/50 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <AlertCircle size={16} className="sm:w-[18px] sm:h-[18px] text-red-500" />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-500">
                Segera Restock
              </h2>
            </div>
            <div className="space-y-2">
              {Array.isArray(lowStockProducts) &&
              lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      product.stock <= (product.minimum_stock || 5)
                        ? "bg-red-50 dark:bg-red-900/20"
                        : "bg-orange-50 dark:bg-orange-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {product.stock <= (product.minimum_stock || 5) ? (
                        <Fire
                          theme="filled"
                          size={16}
                          className="text-red-500"
                        />
                      ) : (
                        <Box
                          theme="filled"
                          size={16}
                          className="text-orange-500"
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          product.stock <= (product.minimum_stock || 5)
                            ? "text-red-700 dark:text-red-300"
                            : "text-orange-700 dark:text-orange-300"
                        }`}
                      >
                        {product.name}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock <= (product.minimum_stock || 5)
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                          : "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200"
                      }`}
                    >
                      {product.stock} stok
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Tidak ada produk yang perlu direstock
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Summary Card Component
const SummaryCard = ({ icon, title, value, bgColor }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border-2 border-gray-200 dark:border-gray-700 shadow-md dark:shadow-none hover:shadow-lg dark:hover:shadow-none transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">{title}</p>
        <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-200 truncate">
          {value}
        </p>
      </div>
      <div className={`p-2 sm:p-3 ${bgColor} dark:opacity-80 rounded-xl flex-shrink-0 ml-3`}>{icon}</div>
    </div>
  </div>
);

export default Dashboard;
