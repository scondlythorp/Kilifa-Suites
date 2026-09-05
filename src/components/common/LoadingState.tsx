import React from 'react';
import { Loader2, Building2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading Kilifa Suites information...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center my-8 ${className}`}>
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)]">
          <Building2 className="w-8 h-8 opacity-40 animate-pulse" />
        </div>
        <Loader2 className="w-16 h-16 text-[var(--color-secondary)] animate-spin absolute inset-0" />
      </div>
      <p className="text-sm font-medium text-[var(--color-text-muted)] tracking-wide">{message}</p>
    </div>
  );
};
