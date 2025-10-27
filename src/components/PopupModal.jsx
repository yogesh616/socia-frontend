import React from "react";

const PopupModal = ({ handleLogout, showLogoutModal, setShowLogoutModal }) => {
  if (!showLogoutModal) return null; // Don't render if hidden

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm"
      onClick={() => setShowLogoutModal(false)} // Click outside to close
    >
      <div
        className="relative bg-white dark:bg-gray-700 rounded-lg shadow-lg w-full max-w-md p-6 text-center"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Close button */}
        <button
          onClick={() => setShowLogoutModal(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>

        {/* Icon */}
        <svg
          className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>

        <h3 className="mb-5 text-lg font-normal text-gray-600 dark:text-gray-300">
          Are you sure you want to log out?
        </h3>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={handleLogout}
            className="cursor-pointer text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 
                       font-medium rounded-lg text-sm px-5 py-2.5 
                       dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800"
          >
            Yes, log out
          </button>

          <button
            onClick={() => setShowLogoutModal(false)}
            className="cursor-pointer px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                       rounded-lg hover:bg-gray-100 hover:text-blue-700 
                       focus:outline-none focus:ring-4 focus:ring-gray-100 
                       dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 
                       dark:hover:text-white dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
