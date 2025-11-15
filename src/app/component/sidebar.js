"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AdProduct,
  ArrowDown,
  Credit,
  DashboardOne,
  History,
  ListNumbers,
  ListView,
  MenuFold,
  CloseOne,
  CardTwo,
  User,
  Logout,
  UserBusiness,
  TransactionOrder,
  Calendar,
  Clock,
} from "@icon-park/react";
import { api, API_ENDPOINTS, auth } from "@/app/lib/api";
import { useTheme } from "@/app/contexts/ThemeContext";

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [shiftData, setShiftData] = useState(null);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Close sidebar when clicking outside or on mobile navigation
  const closeSidebar = () => {
    setIsOpen(false);
  };

  // Close sidebar when clicking on link (mobile only)
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  // Close sidebar on window resize if switching to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await auth.getProfile();
        console.log("User profile data:", data); // Debug log
        if (data && typeof data === "object" && data.user_id) {
          setUserData(data);
        } else {
          console.error("Invalid user data format:", data);
          router.replace("/");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.replace("/");
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
      router.replace("/");
    }
  };

  // Fetch shift data saat modal dibuka (hanya untuk kasir)
  const fetchShiftData = async () => {
    if (userData && (userData.level === "kasir" || userData.level === "user")) {
      try {
        const shift = await api.get(API_ENDPOINTS.SHIFT_ACTIVE);
        if (shift && shift.shift_id) {
          setShiftData(shift);
        } else {
          setShiftData(null);
        }
      } catch (error) {
        console.error("Error fetching shift:", error);
        setShiftData(null);
      }
    }
  };

  const handleOpenProfile = () => {
    setShowProfileModal(true);
    fetchShiftData();
  };

  // Jika tidak ada userData (belum login), jangan render apapun
  if (!userData) return null;

  const isAdmin = userData.level === "admin";

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg shadow-lg lg:hidden hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle menu"
      >
        <MenuFold size={24} />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed lg:relative z-50 bg-gray-800 dark:bg-gray-800 text-white w-64 min-h-screen transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none`}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button for mobile */}
          <div className="flex items-center justify-between p-5 border-b border-gray-700 lg:border-none">
            <div className="text-xl font-bold">naCshier</div>
            <button
              onClick={closeSidebar}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <CloseOne size={20} className="text-white" />
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            <div className="mt-4 lg:mt-8 flex flex-col gap-2 lg:gap-5">
              {isAdmin ? (
                <>
                  <Link href="/Dashboard" onClick={handleLinkClick}>
                    <div className="flex items-center gap-3 p-2.5 lg:p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <DashboardOne size={20} />
                      <span className="text-sm lg:text-base">Dashboard</span>
                    </div>
                  </Link>
                  <Link href="/Transaction" onClick={handleLinkClick}>
                    <div className="flex items-center gap-3 p-2.5 lg:p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Credit size={20} />
                      <span className="text-sm lg:text-base">Transaksi</span>
                    </div>
                  </Link>
                  <div
                    onClick={() => setIsReportOpen(!isReportOpen)}
                    className="flex items-center gap-3 p-2.5 lg:p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <ListView size={20} />
                    <span className="text-sm lg:text-base">Laporan</span>
                    <ArrowDown
                      size={16}
                      className={`ml-auto transition-transform ${
                        isReportOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {isReportOpen && (
                    <div className="ml-6 flex flex-col gap-2 border-l-2 border-gray-700 pl-4">
                      <Link href="/Profit" onClick={handleLinkClick}>
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <CardTwo size={18} />
                          <span className="text-sm">Profit</span>
                        </div>
                      </Link>
                      <Link href="/Cashflow" onClick={handleLinkClick}>
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <ListNumbers size={18} />
                          <span className="text-sm">Cashflow</span>
                        </div>
                      </Link>
                      <Link href="/RiwayatTransaksi" onClick={handleLinkClick}>
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <History size={18} />
                          <span className="text-sm">Transaksi</span>
                        </div>
                      </Link>
                    </div>
                  )}
                  <Link href="/Product" onClick={handleLinkClick}>
                    <div className="flex items-center gap-3 p-2.5 lg:p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <AdProduct size={20} />
                      <span className="text-sm lg:text-base">Product</span>
                    </div>
                  </Link>
                  <Link href="/UserManagement" onClick={handleLinkClick}>
                    <div className="flex items-center gap-3 p-2.5 lg:p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <UserBusiness size={20} />
                      <span className="text-sm lg:text-base">User</span>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/Dashboard" onClick={handleLinkClick}>
                    <div className="flex items-center gap-3 p-2.5 lg:p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <DashboardOne size={20} />
                      <span className="text-sm lg:text-base">Dashboard</span>
                    </div>
                  </Link>
                  <Link href="/Transaction" onClick={handleLinkClick}>
                    <div className="flex items-center gap-3 p-2.5 lg:p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Credit size={20} />
                      <span className="text-sm lg:text-base">Transaksi</span>
                    </div>
                  </Link>
                  <Link href="/RiwayatTransaksi" onClick={closeSidebar}>
                    <div className="flex items-center gap-3 p-2.5 lg:p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <History size={20} />
                      <span className="text-sm lg:text-base">
                        Riwayat Transaksi
                      </span>
                    </div>
                  </Link>
                  <Link href="/Product" onClick={handleLinkClick}>
                    <div className="flex items-center gap-3 p-2.5 lg:p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <AdProduct size={20} />
                      <span className="text-sm lg:text-base">Product</span>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Profile Section */}
          <div className="mt-auto p-4 lg:p-5 border-t border-gray-700">
            <div
              onClick={() => {
                handleOpenProfile();
                closeSidebar();
              }}
              className="flex items-center gap-3 p-2.5 lg:p-3 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-600 dark:bg-gray-600 flex items-center justify-center">
                  <User size={20} />
                </div>
                {isAdmin && (
                  <span className="absolute -bottom-1 -right-1 bg-green-500 text-xs rounded-full px-1.5 py-0.5">
                    Admin
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm lg:text-base">
                  {userData.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  @{userData.username}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="w-full mt-2 lg:mt-3 flex items-center gap-2 p-2.5 lg:p-2 text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
              <span className="text-sm lg:text-base">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full mt-2 lg:mt-3 flex items-center gap-2 p-2.5 lg:p-2 text-red-400 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Logout size={18} />
              <span className="text-sm lg:text-base">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-0 sm:p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setShowProfileModal(false)
          }
        >
          <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-xl shadow-2xl w-full h-full sm:h-auto sm:max-w-md sm:max-h-[90vh] flex flex-col border-0 sm:border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  Profil {userData.level === "admin" ? "Admin" : "Kasir"}
                </h3>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
                >
                  <CloseOne theme="filled" size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
              <div className="space-y-6">
                {/* Avatar & Name */}
                <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <User size={40} className="text-white" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {userData.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      @{userData.username}
                    </p>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Role
                    </label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <span
                        className={`px-3 py-1.5 inline-flex items-center text-sm font-semibold rounded-full ${
                          userData.level === "admin"
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        }`}
                      >
                        {userData.level === "admin" ? "Admin" : "Kasir"}
                      </span>
                    </div>
                  </div>

                  {/* Shift Info (hanya untuk kasir) */}
                  {userData.level !== "admin" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Informasi Shift
                      </label>
                      {shiftData ? (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <TransactionOrder
                                theme="filled"
                                size={20}
                                className="text-blue-600 dark:text-blue-400"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Shift {shiftData.shift_number || "Aktif"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {shiftData.shift_id}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Calendar theme="outline" size={16} />
                              <span>
                                Mulai:{" "}
                                {new Date(shiftData.start_time).toLocaleString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            {shiftData.end_time && (
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <History theme="outline" size={16} />
                                <span>
                                  Selesai:{" "}
                                  {new Date(shiftData.end_time).toLocaleString(
                                    "id-ID",
                                    {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                {shiftData.end_time ? "Selesai" : "Aktif"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Tidak ada shift aktif
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
              <button
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 text-white rounded-lg font-semibold transition-all active:scale-[0.98] min-h-[48px] sm:min-h-[44px] shadow-lg"
              >
                <Logout theme="filled" size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto lg:ml-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
