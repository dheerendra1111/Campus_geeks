import React from 'react';

/**
 * Reusable Button Component with variants, sizes, and accessible loading state
 */
export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] shadow-sm';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-brand-500/20 shadow-md',
    secondary:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400 border border-slate-200',
    outline:
      'bg-transparent text-slate-700 hover:bg-slate-50 border border-slate-300 focus:ring-slate-400',
    campus:
      'bg-campus-600 text-white hover:bg-campus-700 focus:ring-campus-500 shadow-campus-500/20 shadow-md',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-rose-500/20',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
