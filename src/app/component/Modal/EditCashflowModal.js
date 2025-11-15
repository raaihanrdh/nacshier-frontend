import { useState, useEffect } from "react";
import { EditTwo, Close } from "@icon-park/react";
import FormInput from "./FormInput";

const EditCashflowModal = ({
  editTransactionId,
  setEditTransactionId,
  transactionData,
  categories,
  methods,
  onEditTransaction,
}) => {
  const [formErrors, setFormErrors] = useState({});
  const [editedTransaction, setEditedTransaction] = useState({
    date: "",
    description: "",
    amount: "",
    category: "",
    method: "",
    type: "expense",
  });

  // Set data transaksi yang akan diedit
  useEffect(() => {
    if (transactionData) {
      setEditedTransaction({ ...transactionData });
    }
  }, [transactionData]);

  // Validasi form
  const validateForm = (data) => {
    const errors = {};
    if (!data.date) errors.date = "Date is required";
    if (!data.description) errors.description = "Description is required";
    if (!data.amount) errors.amount = "Amount is required";
    else if (isNaN(data.amount)) errors.amount = "Amount must be a number";
    if (!data.category) errors.category = "Category is required";
    if (!data.method) errors.method = "Payment method is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(editedTransaction);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const success = await onEditTransaction(
      editTransactionId,
      editedTransaction
    );
    if (success) {
      setEditTransactionId(null);
      setFormErrors({});
    }
  };

  const handleClose = () => {
    setEditTransactionId(null);
    setFormErrors({});
  };

  if (!editTransactionId) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-xl shadow-xl w-full h-full sm:h-auto sm:max-w-md sm:max-h-[90vh] flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <EditTwo theme="outline" size={18} className="sm:w-5 sm:h-5" /> Edit Transaksi
            </h2>
            <button
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={handleClose}
            >
              <Close theme="outline" size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <form onSubmit={handleSubmit} id="edit-cashflow-form" className="space-y-4 sm:space-y-5">
            <FormInput
              label="Tanggal"
              name="date"
              type="date"
              value={editedTransaction.date}
              onChange={(e) =>
                setEditedTransaction({
                  ...editedTransaction,
                  date: e.target.value,
                })
              }
              error={formErrors.date}
            />
            <FormInput
              label="Deskripsi"
              name="description"
              type="text"
              value={editedTransaction.description}
              onChange={(e) =>
                setEditedTransaction({
                  ...editedTransaction,
                  description: e.target.value,
                })
              }
              error={formErrors.description}
            />
            <FormInput
              label="Jumlah"
              name="amount"
              type="number"
              value={editedTransaction.amount}
              onChange={(e) =>
                setEditedTransaction({
                  ...editedTransaction,
                  amount: e.target.value,
                })
              }
              error={formErrors.amount}
            />
            <FormInput
              label="Kategori"
              name="category"
              type="select"
              value={editedTransaction.category}
              onChange={(e) =>
                setEditedTransaction({
                  ...editedTransaction,
                  category: e.target.value,
                })
              }
              error={formErrors.category}
              options={
                editedTransaction.type === "income"
                  ? categories.income
                  : categories.expense
              }
            />
            <FormInput
              label="Metode Pembayaran"
              name="method"
              type="select"
              value={editedTransaction.method}
              onChange={(e) =>
                setEditedTransaction({
                  ...editedTransaction,
                  method: e.target.value,
                })
              }
              error={formErrors.method}
              options={methods}
            />
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Tipe Transaksi
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-5 w-5 text-blue-600 dark:text-blue-500"
                    checked={editedTransaction.type === "expense"}
                    onChange={() =>
                      setEditedTransaction({
                        ...editedTransaction,
                        type: "expense",
                        category: "",
                      })
                    }
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Pengeluaran</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-5 w-5 text-blue-600 dark:text-blue-500"
                    checked={editedTransaction.type === "income"}
                    onChange={() =>
                      setEditedTransaction({
                        ...editedTransaction,
                        type: "income",
                        category: "",
                      })
                    }
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Pemasukan</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-3 sm:py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[48px] sm:min-h-[44px] active:scale-[0.98]"
              onClick={handleClose}
            >
              Batal
            </button>
            <button
              type="submit"
              form="edit-cashflow-form"
              className="w-full sm:flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 hover:from-indigo-700 hover:to-indigo-800 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white px-4 py-3 sm:py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[44px] active:scale-[0.98] shadow-lg shadow-indigo-500/30"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCashflowModal;
