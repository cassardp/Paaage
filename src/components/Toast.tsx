import { useEffect } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export function Toast({ message, visible, onHide, duration = 2000 }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide, duration]);

  return (
    <div
      className={`fixed bottom-48 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm shadow-lg transition-all duration-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
    >
      {message}
    </div>
  );
}
