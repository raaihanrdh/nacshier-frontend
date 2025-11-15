import { useState, useEffect } from "react";
import { getImageUrl } from "@/config/api";
import { api, API_ENDPOINTS } from "@/app/lib/api";
import Dropdown from "../Dropdown";
import { useToast } from "@/app/contexts/ToastContext";

export default function ProductModal({
  product,
  categories = [],
  onClose,
  onSave,
}) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    selling_price: "",
    stock: "",
    description: "",
    capital_price: "",
    category_id: "",
    image_file: null,
    image_preview: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      // Mode edit - populate form dengan data produk
      setFormData({
        name: product.name || "",
        selling_price: product.selling_price || "",
        stock: product.stock || "",
        description: product.description || "",
        capital_price: product.capital_price || "",
        category_id: product.category_id || "",
        image_file: null,
        image_preview:
          product.image_url ||
          (product.image_path ? getImageUrl(product.image_path) : null),
      });
    } else {
      // Mode tambah - set default category jika ada
      setFormData((prev) => ({
        ...prev,
        category_id: categories.length > 0 ? categories[0].category_id : "",
      }));
    }
  }, [product, categories]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB sesuai controller)
      if (file.size > 2048 * 1024) {
        toast.error("Ukuran gambar maksimal 2MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Format gambar harus JPEG, PNG, JPG, atau GIF");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image_file: file,
        image_preview: URL.createObjectURL(file),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama produk wajib diisi";
    }

    if (!formData.selling_price || formData.selling_price < 0) {
      newErrors.selling_price = "Harga jual harus lebih dari 0";
    }

    if (!formData.capital_price || formData.capital_price < 0) {
      newErrors.capital_price = "Harga modal harus lebih dari 0";
    }

    if (!formData.stock || formData.stock < 0) {
      newErrors.stock = "Stok harus lebih dari atau sama dengan 0";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Kategori wajib dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Siapkan data dasar
      const baseData = {
        name: formData.name.trim(),
        selling_price: formData.selling_price,
        capital_price: formData.capital_price,
        stock: formData.stock,
        description: formData.description.trim(),
        category_id: formData.category_id,
      };

      let responseData;

      if (product) {
        // Mode update
        const url = `${API_ENDPOINTS.PRODUCTS}/${product.product_id}`;

        if (formData.image_file) {
          // Jika ada file gambar, gunakan FormData dengan postFormData
          const formDataToSend = new FormData();
          Object.keys(baseData).forEach((key) => {
            formDataToSend.append(key, baseData[key]);
          });
          formDataToSend.append("image", formData.image_file);

          // Gunakan postFormData untuk upload file dengan method PUT
          responseData = await api.postFormData(url, formDataToSend, "PUT");
        } else {
          // Jika tidak ada file gambar, gunakan PUT biasa
          responseData = await api.put(url, baseData);
        }
      } else {
        // Mode create
        const url = API_ENDPOINTS.PRODUCTS;

        if (formData.image_file) {
          // Dengan file gambar, gunakan FormData
          const formDataToSend = new FormData();
          Object.keys(baseData).forEach((key) => {
            formDataToSend.append(key, baseData[key]);
          });
          formDataToSend.append("image", formData.image_file);

          // Gunakan postFormData untuk upload file
          responseData = await api.postFormData(url, formDataToSend);
        } else {
          // Tanpa file gambar, gunakan POST biasa
          responseData = await api.post(url, baseData);
        }
      }

      // Handle response format (bisa langsung data atau wrapped dalam success)
      const finalData = responseData?.data || responseData;
      console.log("Success:", finalData);

      // Reset form
      setFormData({
        name: "",
        selling_price: "",
        stock: "",
        description: "",
        capital_price: "",
        category_id: categories.length > 0 ? categories[0].category_id : "",
        image_file: null,
        image_preview: null,
      });

      // Callback ke parent component untuk refresh data
      if (onSave) {
        await onSave();
      }
      
      onClose();

      // Show success message
      toast.success(
        product ? "Produk berhasil diupdate!" : "Produk berhasil ditambahkan!"
      );
    } catch (err) {
      console.error("Error saving product:", err);
      const errorMessage = err.message || "Terjadi kesalahan saat menyimpan produk";
      toast.error("Gagal menyimpan produk: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image_file: null,
      image_preview: null,
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-xl shadow-xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 id="modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {product ? "Edit" : "Tambah"} Produk
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-3xl sm:text-2xl leading-none w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
              aria-label="Tutup modal"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <form onSubmit={handleSubmit} id="product-form" className="space-y-5 sm:space-y-6">
            <fieldset disabled={loading} className="space-y-5 sm:space-y-6 border-0 p-0 m-0">
              {/* Input Nama */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Nama Produk *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 dark:text-white ${
                    errors.name ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500`}
                  placeholder="Masukkan nama produk"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Input Harga */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                <div>
                  <label
                    htmlFor="selling_price"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Harga Jual *
                  </label>
                  <input
                    type="number"
                    id="selling_price"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 dark:text-white ${
                      errors.selling_price
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    aria-invalid={!!errors.selling_price}
                    aria-describedby={
                      errors.selling_price ? "selling-price-error" : undefined
                    }
                  />
                  {errors.selling_price && (
                    <p
                      id="selling-price-error"
                      className="text-red-500 dark:text-red-400 text-xs mt-1"
                    >
                      {errors.selling_price}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="capital_price"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Harga Modal *
                  </label>
                  <input
                    type="number"
                    id="capital_price"
                    name="capital_price"
                    value={formData.capital_price}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 dark:text-white ${
                      errors.capital_price
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    aria-invalid={!!errors.capital_price}
                    aria-describedby={
                      errors.capital_price ? "capital-price-error" : undefined
                    }
                  />
                  {errors.capital_price && (
                    <p
                      id="capital-price-error"
                      className="text-red-500 dark:text-red-400 text-xs mt-1"
                    >
                      {errors.capital_price}
                    </p>
                  )}
                </div>
              </div>

              {/* Input Stok dan Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Stok *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 dark:text-white ${
                      errors.stock ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500`}
                    placeholder="0"
                    min="0"
                    aria-invalid={!!errors.stock}
                    aria-describedby={errors.stock ? "stock-error" : undefined}
                  />
                  {errors.stock && (
                    <p id="stock-error" className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {errors.stock}
                    </p>
                  )}
                </div>
                <div>
                  <Dropdown
                    label="Kategori *"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    placeholder="Pilih Kategori"
                    error={errors.category_id}
                    options={categories.map((category) => ({
                      value: category.category_id,
                      label: category.name,
                    }))}
                  />
                </div>
              </div>

              {/* Input Gambar */}
              <div>
                <label
                  htmlFor="image_file"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Gambar Produk
                </label>
                <input
                  type="file"
                  id="image_file"
                  accept="image/jpeg,image/png,image/jpg,image/gif"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2.5 sm:file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400
                    hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                    file:cursor-pointer cursor-pointer"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Format: JPEG, PNG, JPG, GIF. Maksimal 2MB.
                </p>

                {formData.image_preview && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={formData.image_preview}
                      alt="Preview produk"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center text-base sm:text-sm hover:bg-red-600 transition-colors"
                      aria-label="Hapus gambar"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>

              {/* Input Deskripsi */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                  rows="3"
                  placeholder="Deskripsi produk (opsional)"
                />
              </div>
            </fieldset>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium min-h-[48px] sm:min-h-[44px] active:scale-[0.98]"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              form="product-form"
              className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium min-h-[48px] sm:min-h-[44px] active:scale-[0.98] shadow-lg shadow-blue-500/30"
              disabled={loading}
            >
              {loading && (
                <span
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                ></span>
              )}
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
