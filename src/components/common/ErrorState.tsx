import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this information. Please check your connection and try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#111111] border border-red-500/30 text-white shadow-xl ${className}`}>
      <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-serif italic text-white mb-2">{title}</h3>
      <p className="text-xs text-white/70 max-w-md mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={onRetry}
          className="border-red-500/40 text-red-300 hover:bg-red-500/10"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
