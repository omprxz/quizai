import '@/styles/buttonsComponent.css';
import React from 'react';

export const AiGenerateButton = ({ text, loading, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        relative flex items-center justify-center w-48 h-12 rounded-md font-medium 
        transition-all duration-300 overflow-hidden
        ${loading || disabled
          ? 'bg-base-300 text-base-content cursor-not-allowed'
          : 'bg-primary text-primary-content hover:bg-primary-focus'
        }
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-primary/40 animate-[pulse_0.7s_ease-in-out_0s_infinite]"></span>
          <span className="w-2 h-2 rounded-full bg-primary/40 animate-[pulse_0.7s_ease-in-out_0.2s_infinite]"></span>
          <span className="w-2 h-2 rounded-full bg-primary/40 animate-[pulse_0.7s_ease-in-out_0.4s_infinite]"></span>
        </div>
      ) : (
        <span className="flex items-center gap-2">
          {text}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </span>
      )}
      
      {!loading && !disabled && (
        <span className="absolute bottom-0 left-0 w-full h-1 bg-secondary transform scale-x-0 transition-transform origin-left group-hover:scale-x-100"></span>
      )}
    </button>
  );
};