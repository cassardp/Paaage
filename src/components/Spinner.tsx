import { Loader } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  isDark?: boolean;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function Spinner({ size = 'md', isDark = true }: SpinnerProps) {
  return (
    <Loader 
      className={`${sizeClasses[size]} animate-spin ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} 
    />
  );
}
