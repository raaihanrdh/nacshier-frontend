"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserBusiness,
  AddOne,
  Edit,
  Delete,
  Lock,
  Logout,
  CloseOne,
  CheckOne,
} from "@icon-park/react";
import { AlertCircle } from "react-feather";
import { api, API_ENDPOINTS, auth } from "@/app/lib/api";
import Dropdown from "../component/Dropdown";
import UserDetailModal from "../component/Modal/UserDetailModal";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add"); // add, edit, password
  const [formData, setFormData] = useState({
    user_id: "",
    name: "",
    username: "",
    password: "",
    password_confirmation: "",
    level: "kasir",
  });

  // Detail modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Check if admin is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      try {
        const data = await auth.getProfile();

        if (data.level !== "admin") {
          setError("Anda tidak memiliki akses admin");
          localStorage.removeItem("token");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        fetchUsers();
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Error memverifikasi akses");
        localStorage.removeItem("token");
        setTimeout(() => router.push("/"), 2000);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.get(API_ENDPOINTS.USERS);
      // api.get() already extracts data from {success: true, data: ...} format
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Gagal memuat data user");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      });
    }
  };

  // Show add user form
  const handleAddUser = () => {
    setFormData({
      user_id: "",
      name: "",
      username: "",
      password: "",
      password_confirmation: "",
      level: "kasir",
    });
    setFormMode("add");
    setValidationErrors({});
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Show user detail modal
  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // Show edit user form
  const handleEditUser = (user) => {
    setShowDetailModal(false);
    setFormData({
      user_id: user.user_id,
      name: user.name,
      username: user.username,
      password: "",
      password_confirmation: "",
      level: user.level,
    });
    setFormMode("edit");
    setValidationErrors({});
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Show change password form
  const handleChangePassword = (user) => {
    setShowDetailModal(false);
    setFormData({
      user_id: user.user_id,
      name: user.name,
      username: user.username,
      password: "",
      password_confirmation: "",
      level: user.level,
    });
    setFormMode("password");
    setValidationErrors({});
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setValidationErrors({});
    setIsLoading(true);

    try {
      let url, method, body;

      switch (formMode) {
        case "add":
          url = API_ENDPOINTS.USERS;
          method = "POST";
          body = JSON.stringify({
            name: formData.name,
            username: formData.username,
            password: formData.password,
            password_confirmation: formData.password_confirmation,
            level: formData.level,
          });
          break;
        case "edit":
          url = `${API_ENDPOINTS.USERS}/${formData.user_id}`;
          method = "PUT";
          body = JSON.stringify({
            name: formData.name,
            level: formData.level,
          });
          break;
        case "password":
          url = `${API_ENDPOINTS.USERS}/${formData.user_id}/reset-password`;
          method = "POST";
          body = JSON.stringify({
            password: formData.password,
            password_confirmation: formData.password_confirmation,
          });
          break;
        default:
          throw new Error("Mode form tidak valid");
      }

      if (formMode === "add") {
        await api.post(url, {
          name: formData.name,
          username: formData.username,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          level: formData.level,
        });
      } else if (formMode === "edit") {
        await api.put(url, {
          name: formData.name,
          level: formData.level,
        });
      } else if (formMode === "password") {
        await api.post(url, {
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        });
      }

      setSuccess(
        formMode === "add"
          ? "User berhasil dibuat"
          : formMode === "edit"
          ? "User berhasil diperbarui"
          : "Password berhasil diubah"
      );
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      console.error("Submit form error:", err);
      // Error message sudah di-handle oleh api.post/put yang throw error dengan message
      setError(err.message || "Terjadi kesalahan yang tidak diketahui");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (user) => {
    setShowDetailModal(false);
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      return;
    }

    if (user.user_id.toString() === localStorage.getItem("user_id")) {
      setError("Anda tidak dapat menghapus akun sendiri");
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`${API_ENDPOINTS.USERS}/${user.user_id}`);
      setSuccess("User berhasil dihapus");
      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err.message || "Gagal menghapus user");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      user_id: "",
      name: "",
      username: "",
      password: "",
      password_confirmation: "",
      level: "kasir",
    });
    setValidationErrors({});
    setError("");
    setSuccess("");
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      router.push("/");
    }
  };

  // Helper function to get error message for a field
  const getErrorMessage = (field) => {
    if (validationErrors[field]) {
      const errors = Array.isArray(validationErrors[field])
        ? validationErrors[field]
        : [validationErrors[field]];

      return (
        <div className="mt-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get input class with error styling
  const getInputClass = (field) => {
    const baseClass =
      "w-full px-4 py-2.5 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm transition-colors dark:text-white";
    const errorClass = validationErrors[field]
      ? "border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/30 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400"
      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800";
    return `${baseClass} ${errorClass}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <UserBusiness
                  theme="filled"
                  size={24}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Manajemen User
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Kelola pengguna dan akses sistem
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleAddUser}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2.5 border border-transparent rounded-xl shadow-md hover:shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95 min-h-[44px] flex-1 sm:flex-initial"
              >
                <AddOne theme="filled" size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Tambah User</span>
                <span className="sm:hidden">Tambah</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2.5 border border-transparent rounded-xl shadow-md hover:shadow-lg text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all active:scale-95 min-h-[44px] flex-1 sm:flex-initial"
              >
                <Logout theme="filled" size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckOne theme="filled" size={20} className="text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* User List */}
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12">
            <div className="flex flex-col justify-center items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Memuat data...
              </span>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12">
            <div className="flex flex-col items-center gap-2">
              <UserBusiness size={48} className="text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Tidak ada data user
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Klik "Tambah User" untuk menambahkan user baru
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {users.map((user) => (
                <div
                  key={user.user_id}
                  onClick={() => handleViewDetail(user)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <UserBusiness
                          theme="filled"
                          size={24}
                          className="text-white"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-2.5 py-1 inline-flex items-center text-xs font-semibold rounded-full ${
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
              ))}
            </div>

            {/* Desktop Table View - Enhanced */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700">
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user, index) => (
                      <tr
                        key={user.user_id}
                        className={`hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors ${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/30'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                              <UserBusiness
                                theme="filled"
                                size={20}
                                className="text-white"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                ID: {user.user_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 dark:text-gray-500">@</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.username}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1.5 inline-flex items-center text-xs font-bold rounded-full shadow-sm ${
                              user.level === "admin"
                                ? "bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700"
                                : "bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700"
                            }`}
                          >
                            {user.level === "admin" ? "Admin" : "Kasir"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-all active:scale-95 shadow-sm"
                              disabled={isLoading}
                              title="Edit User"
                            >
                              <Edit theme="filled" size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleChangePassword(user)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-all active:scale-95 shadow-sm"
                              disabled={isLoading}
                              title="Ubah Password"
                            >
                              <Lock theme="filled" size={14} />
                              <span>Password</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-all active:scale-95 shadow-sm"
                              disabled={isLoading}
                              title="Hapus User"
                            >
                              <Delete theme="filled" size={14} />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed z-[60] inset-0 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
            aria-hidden="true"
            onClick={handleCloseForm}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-none sm:rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all w-full h-full sm:h-auto sm:max-w-lg lg:max-w-lg border-0 sm:border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 sm:px-8 py-4 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {formMode === "add" && (
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <AddOne
                          theme="filled"
                          size={20}
                          className="text-indigo-600 dark:text-indigo-400"
                        />
                      </div>
                    )}
                    {formMode === "edit" && (
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Edit
                          theme="filled"
                          size={20}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                    )}
                    {formMode === "password" && (
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Lock
                          theme="filled"
                          size={20}
                          className="text-green-600 dark:text-green-400"
                        />
                      </div>
                    )}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                      {formMode === "add"
                        ? "Tambah User Baru"
                        : formMode === "edit"
                        ? "Edit User"
                        : "Ubah Password"}
                    </h3>
                  </div>
                  <button
                    onClick={handleCloseForm}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
                    title="Tutup"
                  >
                    <CloseOne theme="filled" size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 sm:px-8 py-4 sm:py-6 sm:pb-4">
                <form onSubmit={handleSubmit} id="user-form" className="space-y-5">
                  {formMode !== "password" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Nama <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={getInputClass("name")}
                          required
                          placeholder="Masukkan nama lengkap"
                        />
                        {getErrorMessage("name")}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className={getInputClass("username")}
                          required
                          disabled={formMode === "edit"}
                          placeholder="Masukkan username"
                        />
                        {getErrorMessage("username")}
                      </div>
                      <div>
                        <Dropdown
                          label={
                            <>
                              Level <span className="text-red-500">*</span>
                            </>
                          }
                          name="level"
                          value={formData.level}
                          onChange={handleInputChange}
                          placeholder="Pilih level"
                          error={getErrorMessage("level")}
                          options={[
                            { value: "kasir", label: "Kasir" },
                            { value: "admin", label: "Admin" },
                          ]}
                        />
                      </div>
                    </>
                  )}

                  {(formMode === "add" || formMode === "password") && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={getInputClass("password")}
                          required
                          placeholder="Minimal 8 karakter dengan kombinasi huruf, angka, simbol"
                        />
                        {getErrorMessage("password")}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Konfirmasi Password{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleInputChange}
                          className={getInputClass("password_confirmation")}
                          required
                          placeholder="Ulangi password"
                        />
                        {getErrorMessage("password_confirmation")}
                      </div>
                    </>
                  )}
                </form>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 sm:px-8 py-4 flex-shrink-0">
                <div className="flex flex-col-reverse sm:flex-row sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    form="user-form"
                    disabled={isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-transparent shadow-lg px-5 py-3.5 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all active:scale-[0.98] min-h-[48px] sm:min-h-[44px]"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <CheckOne theme="filled" size={18} className="sm:w-4 sm:h-4" />
                        <span>
                          {formMode === "add"
                            ? "Tambah User"
                            : formMode === "edit"
                            ? "Update User"
                            : "Ubah Password"}
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    disabled={isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-sm px-5 py-3.5 sm:py-2.5 bg-white dark:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] min-h-[48px] sm:min-h-[44px]"
                  >
                    <CloseOne theme="filled" size={18} className="sm:w-4 sm:h-4" />
                    Batal
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUser(null);
        }}
        onEdit={() => selectedUser && handleEditUser(selectedUser)}
        onChangePassword={() => selectedUser && handleChangePassword(selectedUser)}
        onDelete={() => selectedUser && handleDeleteUser(selectedUser)}
        isLoading={isLoading}
      />
    </div>
  );
}
