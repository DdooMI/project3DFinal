import React from 'react';

export default function RotationToggle({ isRotating, setIsRotating }) {
  return (
    <button
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center justify-center
        w-12 h-12 rounded-full
        bg-white/90 backdrop-blur-sm
        hover:bg-white
        shadow-lg hover:shadow-xl
        transform hover:scale-102
        transition-all duration-200 ease-out
        border border-gray-100
        ${isRotating ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 hover:text-gray-600'}
      `}
      onClick={() => setIsRotating(!isRotating)}
      title={isRotating ? 'Stop Rotation' : 'Start Rotation'}
    >
      <svg
        className={`w-5 h-5 transition-all duration-200 ${isRotating ? 'animate-spin' : 'hover:rotate-180'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  );
}