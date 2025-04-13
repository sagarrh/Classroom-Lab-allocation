import React from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ size =  'medium', show = true, children, className = '' }) {
  const spinnerClasses = show ? 'flex flex-col items-center justify-center' : 'hidden';
  const sizeClasses = {
    small: 'size-6',
    medium: 'size-8',
    large: 'size-12',
  };

  return (
    <span className={`${spinnerClasses} ${className}`}>
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {children}
    </span>
  );
}
