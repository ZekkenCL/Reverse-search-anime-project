'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAnimeIdentifier } from '@/hooks/useAnimeIdentifier';
import { DropZone } from '@/components/DropZone';
import { ResultCard } from '@/components/ResultCard';

import { LanguageToggle } from '@/components/LanguageToggle';
import { ErrorToast } from '@/components/ErrorToast';
import { getTranslations } from '@/translations';
import type { Language } from '@/lib/types';

/**
 * Home page - Anime Reverse Search
 * Main application page that allows users to upload anime screenshots
 * and identify the anime, episode, and exact timestamp
 */
export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('es');
  const { loading, result, error, identify, reset, setError } = useAnimeIdentifier();

  const text = getTranslations(language);

  /**
   * Handle image selection from DropZone
   */
  const handleImageSelect = (file: File) => {
    setPreview(URL.createObjectURL(file));
    identify(file);
  };

  /**
   * Handle reset - clear all state
   */
  const handleReset = () => {
    setPreview(null);
    reset();
  };

  return (
    <main className="min-h-screen relative selection:bg-indigo-500/30 bg-neutral-950">
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 z-[-1] pointer-events-none blur-3xl opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial-[at_50%_50%] from-indigo-900/40 to-transparent rounded-full" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-radial-[at_50%_50%] from-sky-500/20 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-radial-[at_50%_50%] from-pink-500/20 to-transparent rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-16 relative z-10">

        {/* Top Controls */}
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>

        {/* Header */}
        <header className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm text-indigo-300 font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Anime Recognition</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white"
          >
            {text.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            {text.subtitle}
          </motion.p>
        </header>

        {/* Main Interaction Area */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {!result && (
              <DropZone
                onImageSelect={handleImageSelect}
                preview={preview}
                loading={loading}
                text={text}
              />
            )}

            {result && result.found && (
              <ResultCard
                result={result}
                language={language}
                text={text}
                onReset={handleReset}
              />
            )}
          </AnimatePresence>

          {/* Error Toast */}
          <AnimatePresence>
            <ErrorToast error={error} onClose={() => setError(null)} />
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

