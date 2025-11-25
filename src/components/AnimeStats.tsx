'use client';

import { Info } from 'lucide-react';
import type { IdentifyResult } from '@/lib/types';
import type { TranslationKeys } from '@/translations';
import { formatTimeUntil } from '@/lib/utils';

interface AnimeStatsProps {
    result: IdentifyResult;
    text: TranslationKeys;
}

export function AnimeStats({ result, text }: AnimeStatsProps) {
    if (!result.anilist) return null;

    return (
        <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-400" />
                {text.details}
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{text.status}</p>
                    <p className="text-base font-semibold text-white">
                        {result.anilist.status === 'FINISHED' && text.statusFinished}
                        {result.anilist.status === 'RELEASING' && text.statusReleasing}
                        {result.anilist.status === 'NOT_YET_RELEASED' && text.statusNotYetReleased}
                        {result.anilist.status === 'CANCELLED' && text.statusCancelled}
                        {/* Fallback for other statuses */}
                        {!['FINISHED', 'RELEASING', 'NOT_YET_RELEASED', 'CANCELLED'].includes(result.anilist.status) && result.anilist.status}
                    </p>
                </div>

                {/* Total Episodes */}
                {result.anilist.episodes && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{text.totalEpisodes}</p>
                        <p className="text-base font-semibold text-white">{result.anilist.episodes}</p>
                    </div>
                )}

                {/* Seasons Count */}
                {result.anilist.seasonCount !== undefined && result.anilist.seasonCount > 0 && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{text.seasons}</p>
                        <p className="text-base font-semibold text-white">{result.anilist.seasonCount}</p>
                    </div>
                )}

                {/* Movies Count */}
                {result.anilist.movieCount !== undefined && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{text.movies}</p>
                        <p className="text-base font-semibold text-white">
                            {result.anilist.movieCount > 0 ? result.anilist.movieCount : '0'}
                        </p>
                    </div>
                )}

                {/* Score */}
                {result.anilist.averageScore && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{text.score}</p>
                        <p className="text-base font-semibold text-white">{result.anilist.averageScore}%</p>
                    </div>
                )}

                {/* Season */}
                {result.anilist.season && result.anilist.seasonYear && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{text.season}</p>
                        <p className="text-base font-semibold text-white capitalize">
                            {result.anilist.season.toLowerCase()} {result.anilist.seasonYear}
                        </p>
                    </div>
                )}
            </div>

            {/* Next Airing Episode */}
            {result.anilist.nextAiringEpisode && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <p className="text-sm text-indigo-300 font-semibold mb-2">
                        {text.nextEpisode} {result.anilist.nextAiringEpisode.episode}
                    </p>
                    <p className="text-xs text-neutral-400">
                        {text.airingIn}: {formatTimeUntil(result.anilist.nextAiringEpisode.airingAt, text)}
                    </p>
                </div>
            )}
        </section>
    );
}
