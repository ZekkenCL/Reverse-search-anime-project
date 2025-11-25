'use client';

import { Newspaper } from 'lucide-react';
import type { IdentifyResult } from '@/lib/types';
import type { TranslationKeys } from '@/translations';

interface NewsSectionProps {
    news: NonNullable<IdentifyResult['anilist']>['news'];
    text: TranslationKeys;
}

export function NewsSection({ news, text }: NewsSectionProps) {
    if (!news || news.length === 0) return null;

    return (
        <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-indigo-400" />
                {text.news}
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {news.map((item) => (
                    <a
                        key={item.mal_id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                    >
                        <div className="flex gap-4">
                            {item.images?.jpg?.image_url && (
                                <img src={item.images.jpg.image_url} alt="" className="w-16 h-16 object-cover rounded-lg shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-neutral-400 line-clamp-2 mb-2">
                                    {item.excerpt}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                    <span>{new Date(item.date).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="text-indigo-400/70">{item.source}</span>
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
