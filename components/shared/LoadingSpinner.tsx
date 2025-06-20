/**
 * Loading Spinner Component
 *
 * Reusable loading spinner for async operations
 */

import { cn } from '@/lib/utils/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-16 w-16', // doubled for more impact
    xl: 'h-32 w-32', // extra large for hero/redirect
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        className={cn(
          'animate-[spin_0.7s_cubic-bezier(0.4,0,0.2,1)_infinite] drop-shadow-lg',
          sizeClasses[size]
        )}
        viewBox="0 0 64 64"
        fill="none"
      >
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="#3B82F6" // Tailwind blue-500
          strokeWidth="8"
          strokeDasharray="44 88"
          strokeLinecap="round"
          opacity="0.25"
        />
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="#3B82F6" // Tailwind blue-500
          strokeWidth="8"
          strokeDasharray="44 88"
          strokeDashoffset="22"
          strokeLinecap="round"
          className="animate-[dash_1.2s_ease-in-out_infinite]"
        />
        <style>{`
          @keyframes dash {
            0% { stroke-dashoffset: 22; }
            50% { stroke-dashoffset: 66; }
            100% { stroke-dashoffset: 22; }
          }
        `}</style>
      </svg>
    </div>
  );
}
