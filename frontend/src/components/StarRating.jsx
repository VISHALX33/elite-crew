import React from 'react';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 6 }) {
  // value: number (1-5), onChange: function(newValue), readOnly: bool
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`focus:outline-none ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          onClick={() => !readOnly && onChange && onChange(star)}
          tabIndex={readOnly ? -1 : 0}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          style={{ pointerEvents: readOnly ? 'none' : 'auto' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={star <= value ? '#f59e42' : 'none'}
            viewBox="0 0 24 24"
            stroke="#f59e42"
            className={`w-${size} h-${size}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.261a1 1 0 00.95.69h6.6c.969 0 1.371 1.24.588 1.81l-5.347 3.89a1 1 0 00-.364 1.118l2.036 6.261c.3.921-.755 1.688-1.54 1.118l-5.347-3.89a1 1 0 00-1.176 0l-5.347 3.89c-.784.57-1.838-.197-1.54-1.118l2.036-6.261a1 1 0 00-.364-1.118l-5.347-3.89c-.783-.57-.38-1.81.588-1.81h6.6a1 1 0 00.95-.69l2.036-6.261z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
} 