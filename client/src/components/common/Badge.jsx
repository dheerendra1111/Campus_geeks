import React from 'react';

/**
 * Reusable Badge for statuses, categories, and conditions
 */
export const Badge = ({ children, variant = 'slate', size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1 font-bold',
  };

  const variantStyles = {
    // State machine & Status colors
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    ACTIVE: 'bg-blue-50 text-blue-700 border-blue-200/80',
    RETURNED: 'bg-slate-100 text-slate-700 border-slate-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200/80',
    OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
    REJECTED: 'bg-slate-100 text-slate-500 border-slate-200 line-through',
    CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
    
    // Generic colors
    brand: 'bg-brand-50 text-brand-700 border-brand-200/80',
    campus: 'bg-campus-50 text-campus-700 border-campus-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const style = variantStyles[variant] || variantStyles.slate;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${sizeStyles[size]} ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
};

export default Badge;
