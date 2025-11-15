import Dropdown from "../Dropdown";

const FormInput = ({
  label,
  name,
  type,
  value,
  onChange,
  error,
  options,
  placeholder,
}) => {
  if (type === "select") {
    return (
      <div className="mb-4">
        <Dropdown
          label={label}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder || `Pilih ${label}`}
          error={error}
          options={options?.map((option) => ({
            value: option,
            label: option,
          })) || []}
        />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{label}</label>
      <input
        type={type}
        className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-400 ${
          error ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
        }`}
        value={value}
        onChange={onChange}
        name={name}
        placeholder={placeholder}
      />
      {error && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
