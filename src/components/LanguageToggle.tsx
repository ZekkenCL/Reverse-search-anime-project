'use client';

import { motion } from 'framer-motion';
import type { Language } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
    language: Language;
    onLanguageChange: (language: Language) => void;
}

/**
 * Language toggle component
 * Allows switching between Spanish and English
 */
export function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
    return (
        <div className="flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
            <button
                onClick={() => onLanguageChange('es')}
                className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    language === 'es'
                        ? "bg-indigo-500 text-white shadow-lg"
                        : "text-neutral-400 hover:text-white"
                )}
            >
                ES
            </button>
            <button
                onClick={() => onLanguageChange('en')}
                className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    language === 'en'
                        ? "bg-indigo-500 text-white shadow-lg"
                        : "text-neutral-400 hover:text-white"
                )}
            >
                EN
            </button>
        </div>
    );
}
