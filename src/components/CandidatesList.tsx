'use client';

import Image from 'next/image';
import { HelpCircle } from 'lucide-react';
import type { Candidate } from '@/lib/types';
import type { TranslationKeys } from '@/translations';

interface CandidatesListProps {
    candidates: Candidate[];
    onSelect: (candidate: Candidate) => void;
    text: TranslationKeys;
}

export function CandidatesList({ candidates, onSelect, text }: CandidatesListProps) {
    if (!candidates || candidates.length <= 1) return null;

    // Filter out candidates with very low similarity if needed, but for "Wrong result?" we might want to show them all.
    // We skip the first one usually as it is the current result, but let's assume the parent component handles filtering or we show all.

    return (
        <section className="space-y-4 pt-8 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-yellow-400" />
                Not the right anime?
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {candidates.map((candidate, index) => (
                    <button
                        key={`${candidate.id}-${index}`}
                        onClick={() => onSelect(candidate)}
                        className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 border border-white/5 hover:border-indigo-500/50 transition-all text-left"
                    >
                        {candidate.coverImage?.large && (
                            <Image
                                src={candidate.coverImage.large}
                                alt={candidate.title.romaji}
                                fill
                                className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
                            <p className="text-sm font-medium text-white line-clamp-2">
                                {candidate.title.english || candidate.title.romaji}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-indigo-300">
                                    Ep {candidate.episode}
                                </span>
                                <span className="text-xs text-green-400">
                                    {(candidate.similarity * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}
