'use client';

import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import type { TranslationKeys } from '@/translations';

interface VideoPreviewProps {
    videoUrl: string;
    text: TranslationKeys;
}

export function VideoPreview({ videoUrl, text }: VideoPreviewProps) {
    const [autoplay, setAutoplay] = useState(false);

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Play className="w-5 h-5 text-indigo-400" />
                    {text.preview}
                </h3>
                <button
                    onClick={() => setAutoplay(!autoplay)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${autoplay
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                        }`}
                >
                    {autoplay ? 'Autoplay ON' : 'Autoplay OFF'}
                </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 shadow-2xl">
                <video
                    key={autoplay ? 'autoplay' : 'manual'}
                    src={videoUrl}
                    controls
                    autoPlay={autoplay}
                    loop
                    muted={autoplay}
                    className="w-full aspect-video object-contain"
                />
            </div>
        </section>
    );
}
