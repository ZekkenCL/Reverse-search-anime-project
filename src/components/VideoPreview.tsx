'use client';

import { useState } from 'react';
import { Play, Pause, Youtube, Film } from 'lucide-react';
import type { TranslationKeys } from '@/translations';

interface VideoPreviewProps {
    videoUrl: string;
    text: TranslationKeys;
    trailer?: {
        id: string;
        site: string;
        thumbnail: string;
    } | null;
}

export function VideoPreview({ videoUrl, text, trailer }: VideoPreviewProps) {
    const [autoplay, setAutoplay] = useState(false);
    const [showTrailer, setShowTrailer] = useState(false);

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {showTrailer ? <Youtube className="w-5 h-5 text-red-500" /> : <Play className="w-5 h-5 text-indigo-400" />}
                    {showTrailer ? 'Official Trailer' : text.preview}
                </h3>
                <div className="flex items-center gap-2">
                    {trailer && trailer.site === 'youtube' && (
                        <button
                            onClick={() => setShowTrailer(!showTrailer)}
                            className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${showTrailer
                                ? 'bg-red-500/20 border-red-500/50 text-red-300'
                                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                                }`}
                        >
                            {showTrailer ? 'Show Clip' : 'Show Trailer'}
                        </button>
                    )}
                    {!showTrailer && (
                        <button
                            onClick={() => setAutoplay(!autoplay)}
                            className={`text-xs px-3 py-1 rounded-full border transition-all ${autoplay
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                                }`}
                        >
                            {autoplay ? 'Autoplay ON' : 'Autoplay OFF'}
                        </button>
                    )}
                </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 shadow-2xl aspect-video relative">
                {showTrailer && trailer?.site === 'youtube' ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${trailer.id}?autoplay=1`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    />
                ) : (
                    <video
                        key={autoplay ? 'autoplay' : 'manual'}
                        src={videoUrl}
                        controls
                        autoPlay={autoplay}
                        loop
                        muted={autoplay}
                        className="w-full h-full object-contain"
                    />
                )}
            </div>
        </section>
    );
}
