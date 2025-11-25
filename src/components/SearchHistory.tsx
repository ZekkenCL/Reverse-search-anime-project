'use client';

import Image from 'next/image';
import { History, Clock } from 'lucide-react';
import type { IdentifyResult } from '@/lib/types';
import type { TranslationKeys } from '@/translations';

interface SearchHistoryProps {
    history: IdentifyResult[];
    onSelect: (result: IdentifyResult) => void;
    onClear: () => void;
    text: TranslationKeys;
}

export function SearchHistory({ history, onSelect, onClear, text }: SearchHistoryProps) {
    if (history.length === 0) return null;

    return (
        <div className="w-full max-w-3xl mx-auto mt-12">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-neutral-400" />
                    Recent Searches
                </h3>
                <button
                    onClick={onClear}
                    className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                >
                    Clear History
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {history.map((item, index) => (
                    <button
                        key={`${item.filename}-${index}`}
                        onClick={() => onSelect(item)}
                        className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 border border-white/5 hover:border-indigo-500/50 transition-all text-left"
                    >
                        {item.anilist?.coverImage?.large ? (
                            <Image
                                src={item.anilist.coverImage.large}
                                alt={item.anilist.title?.romaji || 'Anime'}
                                fill
                                className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                                <Clock className="w-8 h-8 text-neutral-600" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
                            <p className="text-sm font-medium text-white line-clamp-2">
                                {item.anilist?.title?.english || item.anilist?.title?.romaji || 'Unknown'}
                            </p>
                            <p className="text-xs text-indigo-300 mt-1">
                                Ep {item.episode}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
