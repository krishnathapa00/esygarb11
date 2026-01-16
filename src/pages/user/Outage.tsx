import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

const OutageModal = ({ onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="outage-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <AlertTriangle className="h-6 w-6 text-gray-700" />
        </div>

        {/* Content */}
        <h2
          id="outage-title"
          className="mb-2 text-lg sm:text-xl font-semibold text-gray-900"
        >
          Temporarily Closed
        </h2>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          We’re currently performing scheduled maintenance and have temporarily
          paused access to the site.
        </p>

        <p className="mt-4 text-sm sm:text-base text-gray-700">
          We’ll be back shortly.
        </p>

        <p className="mt-6 text-xs text-gray-400">
          Thank you for your patience.
        </p>
      </div>
    </div>
  );
};

export default OutageModal;
