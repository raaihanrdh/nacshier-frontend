"use client";
import React, { useEffect, useState, useRef } from "react";
import { useToast } from "@/app/contexts/ToastContext";
import {
  Down,
  Search,
  ShoppingCart,
  CloseOne,
  Plus,
  Minus,
  DropDownList,
  Shopping,
  PlusCross,
  Delete,
  MinusTheTop,
  FolderMinus,
  ArrowDown,
  Filter,
} from "@icon-park/react";
import { api, API_ENDPOINTS, formatNumber, auth } from "@/app/lib/api";
import { getImageUrl } from "@/config/api";
import Dropdown from "../component/Dropdown";

const Transaction = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Added categories state
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Produk");
  const [sortOrder, setSortOrder] = useState("Semua Product");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [currentShiftId, setCurrentShiftId] = useState(null);
  const [userLevel, setUserLevel] = useState(null); // Store user level
  const cartRef = useRef(null);

  // Fetch user profile and current shift
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await auth.getProfile();
        if (userData && userData.level) {
          setUserLevel(userData.level);

          // Jika kasir, fetch shift. Jika admin, skip shift
          if (userData.level === "kasir" || userData.level === "user") {
            await fetchCurrentShift();
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch current shift (hanya untuk kasir)
  const fetchCurrentShift = async () => {
    try {
      // Cek dulu dari localStorage
      const savedShift = localStorage.getItem("currentShift");
      if (savedShift) {
        const shiftData = JSON.parse(savedShift);
        setCurrentShiftId(shiftData.shift_id);
        return;
      }

      // Jika tidak ada, fetch dari API
      const shiftData = await api.get(API_ENDPOINTS.SHIFT_GET_OR_CREATE);
      if (shiftData && shiftData.shift_id) {
        setCurrentShiftId(shiftData.shift_id);
        localStorage.setItem("currentShift", JSON.stringify(shiftData));
      }
    } catch (error) {
      console.error("Error fetching shift:", error);
      toast.error("Gagal mendapatkan shift. Silakan login ulang.");
    }
  };

  // Fetch both products and categories
  const fetchProducts = async () => {
    try {
      const [productsData, categoriesResponse] = await Promise.all([
        api.get(API_ENDPOINTS.PRODUCTS),
        api.get(API_ENDPOINTS.CATEGORIES),
      ]);

      // api.get() already extracts data from {success: true, data: ...} format
      // But handle both formats for safety
      let products = productsData;
      let categoriesData = categoriesResponse;

      // If productsData still has wrapper (shouldn't happen, but safety check)
      if (
        productsData &&
        typeof productsData === "object" &&
        "success" in productsData &&
        "data" in productsData
      ) {
        products = productsData.data;
      } else if (!Array.isArray(productsData)) {
        // If it's not an array and not wrapped, log and set empty
        console.error("Products response structure:", productsData);
        products = [];
      }

      // Handle categories response
      if (
        categoriesResponse &&
        typeof categoriesResponse === "object" &&
        "success" in categoriesResponse &&
        "data" in categoriesResponse
      ) {
        categoriesData = categoriesResponse.data;
      } else if (
        categoriesResponse &&
        typeof categoriesResponse === "object" &&
        "categories" in categoriesResponse
      ) {
        categoriesData = categoriesResponse.categories;
      } else if (!Array.isArray(categoriesResponse)) {
        console.error("Categories response structure:", categoriesResponse);
        categoriesData = [];
      }

      // Ensure both are arrays
      if (!Array.isArray(products)) {
        products = [];
      }
      if (!Array.isArray(categoriesData)) {
        categoriesData = [];
      }

      setProducts(products);
      setCategories(categoriesData);
      setFilteredProducts(products);
    } catch (err) {
      console.error("Gagal mengambil data", err);
      setProducts([]);
      setCategories([]);
      setFilteredProducts([]);
    }
  };
  useEffect(() => {
    fetchCurrentShift();
    fetchProducts();

    const handleClickOutside = (event) => {
      if (
        cartRef.current &&
        !cartRef.current.contains(event.target) &&
        showCart
      ) {
        if (!event.target.closest(".cart-toggle")) {
          setShowCart(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCart]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  useEffect(() => {
    let filtered = [...products];

    // Filter by search query
    if (query) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by category
    // Change from:
    {
      selectedCategory !== "Semua Produk" &&
        (filtered = filtered.filter(
          (product) => product.category_id === selectedCategory
        ));
    }

    // To:
    if (selectedCategory !== "Semua Produk") {
      filtered = filtered.filter(
        (product) =>
          product.category_id.toString() === selectedCategory.toString()
      );
    }

    // Sort products
    switch (sortOrder) {
      case "Nama A-Z":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Nama Z-A":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Harga-ASC":
        filtered.sort((a, b) => a.selling_price - b.selling_price);
        break;
      case "Harga-DESC":
        filtered.sort((a, b) => b.selling_price - a.selling_price);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [query, selectedCategory, sortOrder, products, categories]);

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.warning(`Stok ${product.name} habis!`);
      return;
    }

    setCartItems((prevItems) => {
      const existing = prevItems.find(
        (item) => item.product_id === product.product_id
      );
      if (existing) {
        // Cek stock saat menambah quantity
        const newQuantity = existing.quantity + 1;
        if (newQuantity > product.stock) {
          toast.warning(
            `Stok ${product.name} tidak mencukupi! Stok tersedia: ${product.stock}`
          );
          return prevItems; // Tidak update jika stock tidak mencukupi
        }
        return prevItems.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            ...product,
            quantity: 1,
          },
        ];
      }
    });
  };

  const increaseQuantity = (productId) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((i) => i.product_id === productId);
      if (!item) return prevItems;

      // Cek stock sebelum menambah quantity
      const newQuantity = item.quantity + 1;
      if (newQuantity > item.stock) {
        toast.warning(
          `Stok ${item.name} tidak mencukupi! Stok tersedia: ${item.stock}`
        );
        return prevItems; // Tidak update jika stock tidak mencukupi
      }

      return prevItems.map((i) =>
        i.product_id === productId ? { ...i, quantity: newQuantity } : i
      );
    });
  };

  const decreaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.product_id === productId && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter(
        (item) => item.product_id !== productId
      );
      // Auto-close cart jika kosong
      if (newItems.length === 0) {
        setShowCart(false);
      }
      return newItems;
    });
  };

  // Auto-close cart saat kosong
  useEffect(() => {
    if (cartItems.length === 0 && showCart) {
      setShowCart(false);
    }
  }, [cartItems.length, showCart]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.selling_price * item.quantity,
    0
  );

  // Perbaikan untuk function handleCheckout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.warning("Keranjang kosong!");
      return;
    }

    const isAdmin = userLevel === "admin";

    // Validasi shift_id hanya untuk kasir (admin tidak perlu shift_id)
    if (!isAdmin && !currentShiftId) {
      toast.error("Shift tidak ditemukan. Silakan login ulang.");
      return;
    }

    // Validasi stock sebelum checkout
    for (const item of cartItems) {
      const product = products.find((p) => p.product_id === item.product_id);
      if (!product) {
        toast.error(`Produk ${item.name} tidak ditemukan!`);
        return;
      }
      if (product.stock < item.quantity) {
        toast.error(
          `Stok ${item.name} tidak mencukupi! Stok tersedia: ${product.stock}, dibutuhkan: ${item.quantity}`
        );
        return;
      }
    }

    // Prepare transaction data
    // Admin tidak perlu shift_id, kasir wajib shift_id
    const transactionData = {
      total_amount: total,
      payment_method: paymentMethod,
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        // Tidak perlu mengirim selling_price, biarkan backend yang ambil dari database
        // atau jika ingin mengirim, pastikan format number bukan string
        // selling_price: parseFloat(item.selling_price)
      })),
    };

    // Hanya tambahkan shift_id jika user adalah kasir
    if (!isAdmin && currentShiftId) {
      transactionData.shift_id = currentShiftId;
    }

    console.log("Sending transaction data:", transactionData); // Debug log

    try {
      const result = await api.post(
        API_ENDPOINTS.TRANSACTIONS,
        transactionData
      );
      console.log("Response data:", result); // Debug log

      // Success
      toast.success("Transaksi berhasil!");
      console.log("Transaction created:", result);

      // Clear cart and close
      setCartItems([]);
      setShowCart(false);

      // Refresh product stock
      await fetchProducts();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Gagal membuat transaksi: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ShoppingCart
                  theme="filled"
                  size={24}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-500">
                  Transaksi Penjualan
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Lakukan transaksi penjualan produk
                </p>
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <Search theme="filled" size={18} />
              </div>
              <input
                type="text"
                placeholder="Cari produk..."
                value={query}
                onChange={handleSearch}
                className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 pl-12 pr-4 py-3.5 sm:py-3 rounded-xl text-base sm:text-sm bg-white dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter
                  theme="filled"
                  size={20}
                  className="sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300"
                />
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-200">
                  Filter Produk
                </h2>
              </div>
              {(selectedCategory !== "all" ||
                sortOrder !== "Semua Product") && (
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSortOrder("Semua Product");
                  }}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors active:scale-95 min-h-[44px]"
                >
                  <CloseOne theme="outline" size={14} />
                  Reset
                </button>
              )}
            </div>
            {/* Filters section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Dropdown
                label="Kategori"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                placeholder="Semua Produk"
                themeColor="green"
                options={[
                  { value: "all", label: "Semua Produk" },
                  ...categories.map((category) => ({
                    value: category.category_id,
                    label: category.name,
                  })),
                ]}
              />

              <Dropdown
                label="Urutkan"
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
                placeholder="Pilih urutan"
                themeColor="green"
                options={[
                  { value: "Semua Product", label: "Semua Product" },
                  { value: "Nama A-Z", label: "Nama A-Z" },
                  { value: "Nama Z-A", label: "Nama Z-A" },
                  { value: "Harga-ASC", label: "Harga Terendah" },
                  { value: "Harga-DESC", label: "Harga Termahal" },
                ]}
              />
            </div>
          </div>

          {/* Products Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 pb-24 sm:pb-6">
            {filteredProducts.map((product) => (
              <div
                key={product.product_id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none border-2 transition-all duration-300 overflow-hidden active:scale-[0.98] ${
                  product.stock > 0
                    ? "border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-xl dark:hover:shadow-none cursor-pointer"
                    : "opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600"
                }`}
                onClick={() => product.stock > 0 && addToCart(product)}
              >
                <div className="relative w-full h-40 sm:h-36 overflow-hidden bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 dark:from-gray-600 dark:via-gray-700 dark:to-gray-800 flex items-center justify-center">
                  {product.image_url ||
                  product.image_data ||
                  product.image_path ? (
                    <>
                      <img
                        src={
                          product.image_url || // Base64 data URL from controller
                          product.image_data || // Base64 data directly from database
                          (product.image_path
                            ? getImageUrl(product.image_path)
                            : null) // Legacy path support
                        }
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          // Hide image on error and show placeholder
                          e.target.style.display = "none";
                          const placeholder =
                            e.target.parentElement.querySelector(
                              ".image-placeholder"
                            );
                          if (placeholder) {
                            placeholder.style.display = "flex";
                          }
                        }}
                      />
                      {/* Placeholder that shows on error */}
                      <div
                        className="image-placeholder absolute inset-0 items-center justify-center bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 dark:from-gray-600 dark:via-gray-700 dark:to-gray-800"
                        style={{ display: "none" }}
                      >
                        <div className="text-2xl sm:text-3xl text-white font-bold opacity-80">
                          {product.name.slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl sm:text-3xl text-white font-bold opacity-90">
                      {product.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white text-sm font-bold bg-red-600 dark:bg-red-500 px-3 py-1.5 rounded-lg shadow-lg">
                        HABIS
                      </span>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-2 left-2">
                      <span className="text-white text-xs font-bold bg-orange-500 dark:bg-orange-600 px-2 py-1 rounded-lg shadow-md">
                        Stok {product.stock}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-3">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-200 line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  {/* Price with highlight background */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/30 rounded-lg p-2.5 mb-2 border border-green-100 dark:border-green-800/50">
                    <p className="text-green-600 dark:text-green-400 font-bold text-base sm:text-lg leading-tight">
                      Rp {formatNumber(product.selling_price || 0)}
                    </p>
                  </div>

                  {/* Stock and Category Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                        product.stock <= 0
                          ? "bg-red-100 dark:bg-red-900/30"
                          : product.stock <= 5
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          product.stock <= 0
                            ? "text-red-700 dark:text-red-300"
                            : product.stock <= 5
                            ? "text-orange-700 dark:text-orange-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {product.stock <= 0 ? "HABIS" : `${product.stock} stok`}
                      </span>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full truncate max-w-[50%]">
                      {categories.find(
                        (c) => c.category_id === product.category_id
                      )?.name || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-10">
              <div className="text-gray-400 mb-2">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Tidak ada produk ditemukan
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Button - Tetap Bentuk Sama dengan Badge Notifikasi Bulat */}
      <button
        onClick={() => setShowCart(!showCart)}
        className="fixed bottom-6 right-6 z-50 p-4 sm:p-4 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-full shadow-2xl transition-all duration-200 flex items-center justify-center w-14 h-14 sm:w-14 sm:h-14"
      >
        <Shopping size={24} className="sm:w-6 sm:h-6" />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 animate-bounce-notification"></span>
        )}
      </button>

      {/* Cart Sidebar - Mobile Optimized */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end sm:items-center">
          <div
            ref={cartRef}
            className="w-full sm:w-full sm:max-w-md bg-white dark:bg-gray-800 h-full sm:h-[90vh] sm:rounded-t-2xl sm:rounded-b-none shadow-2xl overflow-hidden flex flex-col animate-slide-in-right"
          >
            {/* Cart Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-green-600 to-green-500 text-white flex justify-between items-center shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Shopping size={24} className="sm:w-6 sm:h-6" />
                Keranjang
                {cartItems.length > 0 && (
                  <span className="bg-white/20 text-white text-sm px-2 py-1 rounded-full">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    item
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors active:scale-95"
                aria-label="Tutup keranjang"
              >
                <CloseOne size={24} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-5 bg-gray-50 dark:bg-gray-900/50">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <Shopping size={64} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium">Keranjang kosong</p>
                  <p className="text-sm mt-2">Tambahkan produk ke keranjang</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.product_id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-200 mb-1">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            @ Rp {formatNumber(item.selling_price)}
                          </p>
                          <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                            Rp{" "}
                            {formatNumber(item.selling_price * item.quantity)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                decreaseQuantity(item.product_id);
                              }}
                              className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 active:scale-95 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                              aria-label="Kurangi jumlah"
                            >
                              <Minus size={20} className="sm:w-5 sm:h-5" />
                            </button>
                            <span className="px-4 sm:px-5 py-2 min-w-[50px] text-center font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                increaseQuantity(item.product_id);
                              }}
                              className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 active:scale-95 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                              aria-label="Tambah jumlah"
                            >
                              <Plus size={20} className="sm:w-5 sm:h-5" />
                            </button>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(item.product_id);
                            }}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg active:scale-95 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Hapus dari keranjang"
                          >
                            <Delete size={20} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer - Sticky */}
            {cartItems.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg sticky bottom-0 z-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300">
                    Total
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                    Rp {formatNumber(total)}
                  </span>
                </div>

                <div className="mb-4 z-20 relative">
                  <Dropdown
                    label="Metode Pembayaran"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Pilih metode pembayaran"
                    themeColor="green"
                    options={[
                      { value: "Cash", label: "Cash" },
                      { value: "Qris", label: "QRIS" },
                      { value: "Transfer", label: "Transfer" },
                    ]}
                    className="w-full z-30"
                    placement="top"
                  />
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white py-4 sm:py-4 rounded-xl disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 min-h-[52px] z-20 relative"
                >
                  <Shopping size={24} className="sm:w-6 sm:h-6" />
                  Selesaikan Transaksi
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        @keyframes bounce-notification {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.1);
          }
        }
        .animate-bounce-notification {
          animation: bounce-notification 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Transaction;
