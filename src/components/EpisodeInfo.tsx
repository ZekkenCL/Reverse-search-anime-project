'use client';

import { useState } from 'react';
import { Play, Eye, AlertTriangle } from 'lucide-react';
import type { IdentifyResult } from '@/lib/types';
import type { TranslationKeys } from '@/translations';
import { formatTime } from '@/lib/utils';

interface EpisodeInfoProps {
    result: IdentifyResult;
    text: TranslationKeys;
}

export function EpisodeInfo({ result, text }: EpisodeInfoProps) {
    const [revealed, setRevealed] = useState(false);

    // Only show if we have a video (meaning this is the original match, not a candidate)
    if (!result.video) return null;

    return (
        <section className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 relative overflow-hidden">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-indigo-400" />
                Matched Scene Details
            </h3>

            {/* Spoiler Overlay */}
            {!revealed && (
                <div
                    className="absolute inset-0 backdrop-blur-xl bg-black/60 z-10 flex flex-col items-center justify-center gap-4 cursor-pointer"
                    onClick={() => setRevealed(true)}
                >
                    <AlertTriangle className="w-16 h-16 text-yellow-400" />
                    <div className="text-center px-4">
                        <p className="text-xl font-bold text-white mb-2">Spoiler Warning</p>
                        <p className="text-neutral-300 mb-4">This section contains scene details from the episode</p>
                        <button className="px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors flex items-center gap-2 mx-auto">
                            <Eye className="w-5 h-5" />
                            Click to Reveal
                        </button>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Episode Info */}
                <div className="space-y-3">
                    {/* Always show season info if we have it */}
                    {result.matchedSeasonNumber && result.matchedSeasonTitle && (
                        <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/30">
                            <p className="text-xs text-purple-300 uppercase tracking-wide">Matched Season</p>
                            <p className="text-lg font-bold text-white">
                                {result.matchedSeasonTitle?.english || result.matchedSeasonTitle?.romaji || result.matchedSeasonTitle?.native}
                            </p>
                            {result.matchedSeasonNumber > 1 && (
                                <p className="text-xs text-purple-300 mt-1">Season {result.matchedSeasonNumber}</p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                            <p className="text-xs text-indigo-300 uppercase tracking-wide">Episode</p>
                            <p className="text-2xl font-bold text-white">{result.episode}</p>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
                            <p className="text-xs text-green-300 uppercase tracking-wide">Match</p>
                            <p className="text-2xl font-bold text-white">{(result.similarity * 100).toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs text-neutral-400 mb-1">Timestamp</p>
                        <p className="text-lg font-mono text-white">
                            {formatTime(result.from)} - {formatTime(result.to)}
                        </p>
                    </div>
                </div>

                {/* Video Preview */}
                <div className="rounded-xl overflow-hidden bg-black ring-1 ring-white/10 shadow-2xl aspect-video">
                    <video
                        src={result.video}
                        controls
                        loop
                        muted
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>
        </section>
    );
}
