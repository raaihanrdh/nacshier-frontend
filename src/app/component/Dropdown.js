"use client";
import { useState, useRef, useEffect } from "react";
import { Down, CheckOne } from "@icon-park/react";

const Dropdown = ({
  value,
  onChange,
  options = [],
  placeholder = "Pilih...",
  label,
  error,
  className = "",
  disabled = false,
  optgroups = null, // For grouped options like { label: "Group", options: [...] }
  name, // For form compatibility
  themeColor = "purple", // purple, green, emerald, amber, blue
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Get display value
  const getDisplayValue = () => {
    if (!value) return placeholder;
    
    // Handle optgroups
    if (optgroups) {
      for (const group of optgroups) {
        const option = group.options?.find((opt) => {
          const optValue = typeof opt === "object" ? opt.value : opt;
          return optValue === value;
        });
        if (option) {
          return typeof option === "object" ? option.label : option;
        }
      }
    }
    
    // Handle regular options
    const option = options.find((opt) => {
      const optValue = typeof opt === "object" ? opt.value : opt;
      return optValue === value;
    });
    
    if (option) {
      return typeof option === "object" ? option.label : option;
    }
    
    return value;
  };

  const handleSelect = (optionValue) => {
    const event = {
      target: {
        value: optionValue,
        name: name || undefined,
      },
    };
    onChange(event);
    setIsOpen(false);
  };

  // Theme colors mapping
  const themeColors = {
    purple: {
      border: "border-purple-500 dark:border-purple-400",
      ring: "ring-purple-200 dark:ring-purple-800",
      hover: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
      selected: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      icon: "text-purple-600 dark:text-purple-400",
    },
    green: {
      border: "border-green-500 dark:border-green-400",
      ring: "ring-green-200 dark:ring-green-800",
      hover: "hover:bg-green-50 dark:hover:bg-green-900/20",
      selected: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
      icon: "text-green-600 dark:text-green-400",
    },
    emerald: {
      border: "border-emerald-500 dark:border-emerald-400",
      ring: "ring-emerald-200 dark:ring-emerald-800",
      hover: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
      selected: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
      icon: "text-emerald-600 dark:text-emerald-400",
    },
    amber: {
      border: "border-amber-500 dark:border-amber-400",
      ring: "ring-amber-200 dark:ring-amber-800",
      hover: "hover:bg-amber-50 dark:hover:bg-amber-900/20",
      selected: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
      icon: "text-amber-600 dark:text-amber-400",
    },
    blue: {
      border: "border-blue-500 dark:border-blue-400",
      ring: "ring-blue-200 dark:ring-blue-800",
      hover: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
      selected: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      icon: "text-blue-600 dark:text-blue-400",
    },
  };

  const colors = themeColors[themeColor] || themeColors.purple;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </div>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3.5 sm:py-2.5 rounded-xl border-2 bg-white dark:bg-gray-800 text-left transition-all duration-200 min-h-[44px] ${
          error
            ? "border-red-500 dark:border-red-400"
            : isOpen
            ? `${colors.border} ring-2 ${colors.ring}`
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
            : "cursor-pointer"
        } ${
          !value ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-200"
        } text-base sm:text-sm font-medium`}
      >
        <span className="truncate flex-1">{getDisplayValue()}</span>
        <Down
          size={20}
          className={`flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          } ${!value ? "text-gray-400" : "text-gray-600 dark:text-gray-400"}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-[100] lg:hidden bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-[101] w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-auto">
            {optgroups ? (
              // Render with optgroups
              optgroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {group.label && (
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                      {group.label}
                    </div>
                  )}
                  {group.options?.map((option, index) => {
                    const optionValue = typeof option === "object" ? option.value : option;
                    const optionLabel = typeof option === "object" ? option.label : option;
                    const isSelected = value === optionValue;
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelect(optionValue)}
                        className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-left ${colors.hover} transition-colors ${
                          isSelected
                            ? `${colors.selected}`
                            : "text-gray-900 dark:text-gray-200"
                        } text-sm font-medium min-h-[44px] active:bg-opacity-80`}
                      >
                        <span className="flex-1">{optionLabel}</span>
                        {isSelected && (
                          <CheckOne
                            size={18}
                            className={`${colors.icon} flex-shrink-0`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              // Render regular options
              options.map((option, index) => {
                const optionValue = typeof option === "object" ? option.value : option;
                const optionLabel = typeof option === "object" ? option.label : option;
                const isSelected = value === optionValue;
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(optionValue)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors ${
                      isSelected
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        : "text-gray-900 dark:text-gray-200"
                    } text-sm font-medium min-h-[44px]`}
                  >
                    <span className="flex-1">{optionLabel}</span>
                    {isSelected && (
                      <CheckOne
                        size={18}
                        className="text-purple-600 dark:text-purple-400 flex-shrink-0"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}

      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{error}</p>
      )}
    </div>
  );
};

export default Dropdown;

