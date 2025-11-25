'use client';

import { Play } from 'lucide-react';
import type { TranslationKeys } from '@/translations';

interface VideoPreviewProps {
    videoUrl: string;
    text: TranslationKeys;
}

export function VideoPreview({ videoUrl, text }: VideoPreviewProps) {
    return (
        <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-indigo-400" />
                {text.preview}
            </h3>
            <div className="rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 shadow-2xl">
                <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full aspect-video object-contain"
                />
            </div>
        </section>
    );
}
