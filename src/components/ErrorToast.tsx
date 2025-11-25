'use client';

import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ErrorToastProps {
    error: string | null;
    onClose: () => void;
}

/**
 * Error toast notification component
 * Displays error messages with animation
 */
export function ErrorToast({ error, onClose }: ErrorToastProps) {
    if (!error) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-200 px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 z-50"
        >
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
            <button onClick={onClose} className="ml-2 hover:text-white">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
