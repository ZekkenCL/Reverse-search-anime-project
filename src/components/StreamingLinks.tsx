'use client';

import { ExternalLink, Search } from 'lucide-react';
import type { IdentifyResult } from '@/lib/types';
import type { TranslationKeys } from '@/translations';
import { COMMUNITY_SITES } from '@/lib/constants';

interface StreamingLinksProps {
    result: IdentifyResult;
    text: TranslationKeys;
}

export function StreamingLinks({ result, text }: StreamingLinksProps) {
    if (!result.anilist) return null;

    return (
        <div className="space-y-6">
            {/* Official / Premium Section */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 shadow-lg shadow-indigo-500/10 space-y-4">
                {/* Premium Badge */}
                <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold shadow-lg">
                    Premium
                </div>

                <div className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">{text.official}</h3>
                </div>

                <div className="flex flex-col gap-2">
                    {result.anilist.externalLinks
                        ?.filter((link) => !['Twitter', 'YouTube', 'Youtube'].includes(link.site))
                        .map((link) => (
                            <a
                                key={link.site}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/70 hover:bg-indigo-500/30 border border-indigo-500/20 hover:border-indigo-400/50 transition-all group shadow-sm hover:shadow-indigo-500/20"
                            >
                                <span className="font-medium text-neutral-200 group-hover:text-white transition-colors text-sm">{link.site}</span>
                                <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                            </a>
                        ))}
                    {(!result.anilist.externalLinks?.filter((link) => !['Twitter', 'YouTube', 'Youtube'].includes(link.site)).length) && (
                        <p className="text-neutral-400 text-sm italic p-3">{text.noLinks}</p>
                    )}
                </div>
            </div>

            {/* Community / Free Section */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/20 shadow-lg shadow-green-500/10 space-y-4">
                {/* Free Badge */}
                <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold shadow-lg">
                    Free
                </div>

                <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">{text.community}</h3>
                </div>

                <div className="flex flex-col gap-2">
                    {COMMUNITY_SITES.map((site) => (
                        <a
                            key={site.name}
                            href={`${site.url}${encodeURIComponent(result.anilist?.title?.romaji || '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/70 hover:bg-green-500/30 border border-green-500/20 hover:border-green-400/50 transition-all group shadow-sm hover:shadow-green-500/20"
                        >
                            <span className="font-medium text-neutral-200 group-hover:text-white transition-colors text-sm">{site.name}</span>
                            <Search className="w-4 h-4 text-green-400 group-hover:text-green-300 transition-colors" />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
