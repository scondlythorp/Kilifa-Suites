import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = true,
  padding = 'md',
  border = true,
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-[#111111] rounded-xl ${
        border ? 'border border-white/10' : ''
      } ${paddingClasses[padding]} shadow-kilifa-card ${
        hoverable ? 'shadow-kilifa-hover' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
