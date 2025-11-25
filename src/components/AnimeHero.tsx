'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import type { IdentifyResult } from '@/lib/types';
import type { TranslationKeys } from '@/translations';
import { formatTime } from '@/lib/utils';
import { ShareButton } from './ShareButton';

interface AnimeHeroProps {
    result: IdentifyResult;
    text: TranslationKeys;
    uploadedImage: string | null;
}

export function AnimeHero({ result, text, uploadedImage }: AnimeHeroProps) {
    const [showUploaded, setShowUploaded] = useState(false);

    if (!result.anilist) return null;

    return (
        <div className="relative h-64 md:h-80">
            {result.anilist.bannerImage && (
                <div className="absolute inset-0">
                    <Image
                        src={result.anilist.bannerImage}
                        alt="Banner"
                        fill
                        className="object-cover opacity-50"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent" />
                </div>
            )}

            <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col md:flex-row gap-8 items-end">
                {/* Cover Art / Comparison View */}
                <div className="relative group">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="shrink-0 w-40 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20 bg-neutral-800 -mb-16 md:-mb-20 relative z-10"
                    >
                        <AnimatePresence mode="wait">
                            {showUploaded && uploadedImage ? (
                                <motion.div
                                    key="uploaded"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full relative"
                                >
                                    {/* Uploaded image is a blob URL, so we can use standard img or Image with unoptimized */}
                                    <img
                                        src={uploadedImage}
                                        alt="Uploaded"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="cover"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full relative"
                                >
                                    {result.anilist.coverImage?.large && (
                                        <Image
                                            src={result.anilist.coverImage.large}
                                            alt="Cover"
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Toggle Button */}
                        {uploadedImage && (
                            <button
                                onClick={() => setShowUploaded(!showUploaded)}
                                className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                                title={showUploaded ? "Show Result Cover" : "Show Uploaded Image"}
                            >
                                {showUploaded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        )}
                    </motion.div>
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 text-white pb-2 relative z-10">
                    <div className="flex items-start justify-between gap-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl md:text-5xl font-bold leading-tight mb-2"
                        >
                            {result.anilist.title?.english || result.anilist.title?.romaji || 'Unknown Title'}
                        </motion.h2>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <ShareButton result={result} />
                        </motion.div>
                    </div>
                    <p className="text-lg text-neutral-400 mt-1 font-medium">
                        {result.anilist.title?.native}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 backdrop-blur-md">
                            {(result.similarity * 100).toFixed(1)}% {text.match}
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 backdrop-blur-md">
                            {text.episode} {result.episode}
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-neutral-300 border border-white/10 backdrop-blur-md">
                            {formatTime(result.from)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
