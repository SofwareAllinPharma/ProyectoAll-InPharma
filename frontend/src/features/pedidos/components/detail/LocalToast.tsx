import { useEffect } from 'react';

interface LocalToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function LocalToast({ message, type, isVisible, onClose, duration = 3000 }: LocalToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : type === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200';
  const textColor = type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800';
  const icon = type === 'success' 
    ? '✓' 
    : type === 'error' 
    ? '✕' 
    : 'ℹ';

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-from-right">
      <div className={`${bgColor} ${textColor} px-4 py-3 rounded-lg border shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}>
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold">
          {icon}
        </div>
        <div className="flex-1 text-sm font-medium">{message}</div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-lg hover:opacity-70 transition"
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      </div>
    </div>
  );
}
