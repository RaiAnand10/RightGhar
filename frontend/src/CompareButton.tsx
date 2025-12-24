import React from 'react';
import './CompareButton.css';

interface CompareButtonProps {
  count: number;
  onClick: () => void;
}

export const CompareButton: React.FC<CompareButtonProps> = ({ count, onClick }) => {
  if (count === 0) return null;

  return (
    <button className="compare-floating-button" onClick={onClick}>
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
      <span className="compare-text">Compare</span>
      <span className="compare-count-badge">{count}</span>
    </button>
  );
};
