import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There are currently no items matching your criteria. Try adjusting your filter choices.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-xl bg-white border border-[var(--color-border)] shadow-sm ${className}`}>
      <div className="w-14 h-14 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-secondary)] flex items-center justify-center mb-4">
        <FolderOpen className="w-7 h-7" />
      </div>
      <h3 className="text-style-h3 text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-style-body text-[var(--color-text-muted)] max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
