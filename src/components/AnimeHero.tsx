'use client';

import { motion } from 'framer-motion';
import type { IdentifyResult } from '@/lib/types';
import type { TranslationKeys } from '@/translations';
import { formatTime } from '@/lib/utils';

interface AnimeHeroProps {
    result: IdentifyResult;
    text: TranslationKeys;
}

export function AnimeHero({ result, text }: AnimeHeroProps) {
    if (!result.anilist) return null;

    return (
        <div className="relative h-64 md:h-80">
            {result.anilist.bannerImage && (
                <div className="absolute inset-0">
                    <img src={result.anilist.bannerImage} alt="Banner" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent" />
                </div>
            )}

            <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col md:flex-row gap-8 items-end">
                {/* Cover Art */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="shrink-0 w-40 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20 bg-neutral-800 -mb-16 md:-mb-20 relative z-10"
                >
                    {result.anilist.coverImage?.large && (
                        <img src={result.anilist.coverImage.large} alt="Cover" className="w-full h-full object-cover" />
                    )}
                </motion.div>

                {/* Title Info */}
                <div className="flex-1 space-y-4 mb-2">
                    <div className="flex flex-wrap gap-2">
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

                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            {result.anilist.title?.english || result.anilist.title?.romaji || 'Unknown Title'}
                        </h2>
                        <p className="text-lg text-neutral-400 mt-1 font-medium">
                            {result.anilist.title?.native}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
