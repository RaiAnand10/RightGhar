import React from 'react';

interface CompareButtonProps {
  count: number;
  onClick: () => void;
}

export const CompareButton: React.FC<CompareButtonProps> = ({ count, onClick }) => {
  if (count === 0) return null;

  return (
    <button
      className="fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white border-none rounded-full text-base font-semibold cursor-pointer shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl z-50"
      onClick={onClick}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 12h6m-6 4h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Compare</span>
      <span className="flex items-center justify-center min-w-6 h-6 px-2 bg-white/30 rounded-full text-sm font-bold">
        {count}
      </span>
    </button>
  );
};
