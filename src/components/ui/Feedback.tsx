import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info'
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-destructive text-destructive-foreground',
    warning: 'bg-amber-500 text-white',
    info: 'bg-primary text-primary-foreground'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden"
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              {variant === 'danger' && <AlertCircle className="text-destructive" size={24} />}
              {variant === 'warning' && <AlertTriangle className="text-amber-500" size={24} />}
              {variant === 'info' && <Info className="text-primary" size={24} />}
              <h3 className="text-xl font-serif italic font-bold text-foreground">{title}</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">{message}</p>
            <div className="flex gap-3 pt-4">
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-xl font-bold hover:opacity-90 transition-colors ${colors[variant]}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-destructive" size={20} />,
    info: <Info className="text-primary" size={20} />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className="fixed bottom-8 left-1/2 z-[110] flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-2xl shadow-2xl min-w-[300px]"
    >
      {icons[type]}
      <p className="text-sm font-medium text-foreground flex-1">{message}</p>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
        <X size={18} />
      </button>
    </motion.div>
  );
};
