"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/app/contexts/ToastContext";
import {
  AdProduct,
  Down,
  Search,
  AddOne,
  DeleteFive,
  Edit,
  Filter,
  Close,
} from "@icon-park/react";
import ProductModal from "../component/Modal/ProductModal";
import { api, API_ENDPOINTS, formatNumber } from "@/app/lib/api";
import { getImageUrl } from "@/config/api";
import Dropdown from "../component/Dropdown";

export default function ProductGrid() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortOrder, setSortOrder] = useState("A-Z");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get(API_ENDPOINTS.PRODUCTS);

      // Laravel controller mengembalikan array langsung, bukan wrapper dengan success
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.success) {
        setProducts(data.data || data);
      } else {
        console.error("Failed to fetch products:", data.message);
        setProducts([]);
      }
    } catch (err) {
      console.error("Error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.CATEGORIES);

      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data.success) {
        setCategories(data.data || data);
      } else {
        console.error("Failed to fetch categories:", data.message);
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category_id == selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === "A-Z") return a.name.localeCompare(b.name);
      if (sortOrder === "Z-A") return b.name.localeCompare(a.name);
      if (sortOrder === "Harga-ASC") return a.selling_price - b.selling_price;
      if (sortOrder === "Harga-DESC") return b.selling_price - a.selling_price;
      return 0;
    });

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (productId, event) => {
    event.stopPropagation();
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      setLoading(true);
      try {
        await api.delete(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
        await fetchProducts();
        toast.success("Produk berhasil dihapus");
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("Gagal menghapus produk: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to handle image removal
  const handleRemoveImage = async (productId, event) => {
    event.stopPropagation();
    if (
      window.confirm("Apakah Anda yakin ingin menghapus gambar produk ini?")
    ) {
      setLoading(true);
      try {
        await api.delete(`${API_ENDPOINTS.PRODUCTS}/${productId}/image`);
        await fetchProducts();
        toast.success("Gambar produk berhasil dihapus");
      } catch (err) {
        console.error("Remove image error:", err);
        toast.error("Gagal menghapus gambar: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setSelectedProduct(null);
  };

  const closeModal = () => {
    setShowAddModal(false);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.category_id == categoryId);
    return category ? category.name : "Unknown";
  };

  // Function to get image URL - using image_url from controller if available
  const getProductImageUrl = (product) => {
    if (product.image_url) {
      return product.image_url;
    } else if (product.image_path) {
      return getImageUrl(product.image_path);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <AdProduct
                  theme="filled"
                  size={20}
                  className="sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-500">
                  Katalog Produk
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Kelola semua produk Anda dalam satu tempat
                </p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-2.5 text-sm sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 dark:from-purple-500 dark:to-purple-600 dark:hover:from-purple-600 dark:hover:to-purple-700 rounded-xl transition-all shadow-lg active:scale-95 min-h-[48px] sm:min-h-[44px]"
            >
              <AddOne theme="filled" size={20} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Tambah Produk</span>
              <span className="sm:hidden">Tambah Produk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Control Panel */}
        <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 p-3 sm:p-5 mb-4 sm:mb-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Filter
                theme="filled"
                size={16}
                className="sm:w-[18px] sm:h-[18px] text-gray-600 dark:text-gray-300"
              />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-500">
                Filter
              </h2>
            </div>
            {(query || selectedCategory !== "all" || sortOrder !== "A-Z") && (
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("all");
                  setSortOrder("A-Z");
                }}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors active:scale-95 min-h-[44px]"
              >
                <Close theme="outline" size={14} />
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Cari Produk
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <Search theme="filled" size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={query}
                  onChange={handleSearch}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 pl-10 rounded-lg text-sm bg-white dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <Dropdown
              label="Kategori"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              placeholder="Semua Kategori"
              themeColor="purple"
              options={[
                { value: "all", label: "Semua Kategori" },
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
              themeColor="purple"
              options={[
                { value: "A-Z", label: "Nama A-Z" },
                { value: "Z-A", label: "Nama Z-A" },
                { value: "Harga-ASC", label: "Harga Terendah" },
                { value: "Harga-DESC", label: "Harga Tertinggi" },
              ]}
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading && products.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
            <div className="flex flex-col justify-center items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Memuat produk...
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <div
                  key={`product-${product.product_id || product.name}-${index}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl dark:hover:shadow-none transition-all duration-300 overflow-hidden cursor-pointer group active:scale-[0.98]"
                >
                  {/* Product Image */}
                  <div
                    className={`relative w-full h-40 sm:h-36 overflow-hidden ${
                      getProductImageUrl(product)
                        ? ""
                        : "bg-gradient-to-br from-gray-500 to-blue-900 flex items-center justify-center"
                    }`}
                  >
                    {getProductImageUrl(product) ? (
                      <>
                        <img
                          src={getProductImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/150";
                          }}
                        />
                        {/* Remove image button */}
                        <button
                          onClick={(e) =>
                            handleRemoveImage(product.product_id, e)
                          }
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"
                          title="Hapus gambar"
                        >
                          <DeleteFive size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="text-3xl text-white font-bold">
                        {product.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-3 sm:p-3">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-200 line-clamp-2 mb-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    
                    {/* Price with highlight background */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/30 rounded-lg p-2.5 mb-2 border border-purple-100 dark:border-purple-800/50">
                      <p className="text-purple-600 dark:text-purple-400 font-bold text-base sm:text-lg leading-tight">
                        Rp {formatNumber(product.selling_price || 0)}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        Modal: Rp {formatNumber(product.capital_price || 0)}
                      </p>
                    </div>

                    {/* Stock and Category Row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                        product.stock <= 0 
                          ? 'bg-red-100 dark:bg-red-900/30' 
                          : product.stock <= 5 
                          ? 'bg-orange-100 dark:bg-orange-900/30' 
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <span className={`text-xs font-semibold ${
                          product.stock <= 0 
                            ? 'text-red-700 dark:text-red-300' 
                            : product.stock <= 5 
                            ? 'text-orange-700 dark:text-orange-300' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {product.stock <= 0 ? 'HABIS' : `${product.stock} stok`}
                        </span>
                      </div>
                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full truncate max-w-[50%]">
                        {getCategoryName(product.category_id)}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product);
                        }}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg active:scale-95 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Edit produk"
                      >
                        <Edit size={20} className="sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product.product_id, e);
                        }}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg active:scale-95 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Hapus produk"
                      >
                        <DeleteFive size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
                <div className="flex flex-col items-center gap-3">
                  <Search
                    size={48}
                    className="text-gray-300 dark:text-gray-600"
                  />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Tidak ada produk ditemukan
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Coba ubah filter atau kata kunci pencarian
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          onClose={closeModal}
          onSave={fetchProducts}
        />
      )}
    </div>
  );
}
