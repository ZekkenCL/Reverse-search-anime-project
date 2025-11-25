'use client';

import { motion } from 'framer-motion';
import { X, Info } from 'lucide-react';
import type { IdentifyResult, Language, Candidate } from '@/lib/types';
import type { TranslationKeys } from '@/translations';
import { AnimeHero } from './AnimeHero';
import { AnimeStats } from './AnimeStats';
import { NewsSection } from './NewsSection';
import { StreamingLinks } from './StreamingLinks';
import { CharacterList } from './CharacterList';
import { CandidatesList } from './CandidatesList';
import { EpisodeInfo } from './EpisodeInfo';

interface ResultCardProps {
    result: IdentifyResult;
    language: Language;
    text: TranslationKeys;
    onReset: () => void;
    uploadedImage: string | null;
    onSelectCandidate?: (candidate: Candidate) => void;
}

/**
 * ResultCard component
 * Displays anime identification results with details, preview, and links
 * Refactored to use sub-components for better maintainability
 */
export function ResultCard({ result, language, text, onReset, uploadedImage, onSelectCandidate }: ResultCardProps) {
    if (!result.found || !result.anilist) return null;

    // Filter candidates to exclude the current result
    const otherCandidates = result.candidates?.filter(c => c.id !== result.anilist?.id) || [];

    return (
        <motion.div
            key="result"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative"
        >
            {/* Reset Button */}
            <button
                onClick={onReset}
                className="absolute -top-12 right-0 text-neutral-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
            >
                <X className="w-4 h-4" /> {text.uploadAnother}
            </button>

            <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

                {/* Hero Section */}
                <AnimeHero result={result} text={text} uploadedImage={uploadedImage} />

                {/* Content Body */}
                <div className="p-8 md:p-10 pt-20 md:pt-24 grid md:grid-cols-12 gap-10">

                    {/* Left Column (Details) */}
                    <div className="md:col-span-8 space-y-10">

                        {/* Synopsis */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Info className="w-5 h-5 text-indigo-400" />
                                {text.synopsis}
                            </h3>
                            <div
                                className="text-neutral-300 leading-relaxed text-base md:text-lg font-light prose prose-invert max-w-none prose-p:text-neutral-300 prose-a:text-indigo-400"
                                dangerouslySetInnerHTML={{
                                    __html: (language === 'es' ? result.anilist.description?.es : result.anilist.description?.en) || result.anilist.description?.en || 'No description available.'
                                }}
                            />
                        </section>

                        {/* Character List */}
                        {result.anilist.characters && result.anilist.characters.length > 0 && (
                            <CharacterList characters={result.anilist.characters} text={text} />
                        )}

                        {/* Details Section */}
                        <AnimeStats result={result} text={text} />

                        {/* News & Updates Section */}
                        {result.anilist.news && result.anilist.news.length > 0 && (
                            <NewsSection news={result.anilist.news} text={text} />
                        )}

                        {/* Episode-Specific Information */}
                        <EpisodeInfo result={result} text={text} />

                        {/* Candidates List */}
                        {otherCandidates.length > 0 && onSelectCandidate && (
                            <CandidatesList
                                candidates={otherCandidates}
                                onSelect={onSelectCandidate}
                                text={text}
                            />
                        )}
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="md:col-span-4 space-y-6">
                        <StreamingLinks result={result} text={text} />
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
