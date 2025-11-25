'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';
import type { IdentifyResult } from '@/lib/types';

interface ShareButtonProps {
    result: IdentifyResult;
}

export function ShareButton({ result }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (!result.anilist) return;

        const title = result.anilist.title.english || result.anilist.title.romaji;
        const text = `I found ${title} using Anime Reverse Search!`;
        const url = result.anilist.siteUrl;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Anime Reverse Search',
                    text: text,
                    url: url,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${text} ${url}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('Error copying to clipboard:', error);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md border border-white/10"
            title="Share"
        >
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
        </button>
    );
}
