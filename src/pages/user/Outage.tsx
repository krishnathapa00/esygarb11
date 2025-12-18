import React from "react";

const OutageModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-5 sm:p-6 text-center shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="mb-3 text-lg sm:text-xl font-semibold text-gray-900">
          We’ll Be Right Back
        </h2>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Our website is temporarily unavailable due to technical issues.
          <br className="hidden sm:block" />
          Our team is working to restore service as quickly as possible.
        </p>

        <p className="mt-4 text-sm sm:text-base font-medium text-gray-700">
          Thank you for your patience.
        </p>
      </div>
    </div>
  );
};

export default OutageModal;
