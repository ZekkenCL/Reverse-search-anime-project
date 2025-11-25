'use client';

import Image from 'next/image';
import { Users } from 'lucide-react';
import type { Character } from '@/lib/types';
import type { TranslationKeys } from '@/translations';

interface CharacterListProps {
    characters: Character[];
    text: TranslationKeys;
}

export function CharacterList({ characters, text }: CharacterListProps) {
    if (!characters || characters.length === 0) return null;

    return (
        <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                {text.charactersAndVoiceActors}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {characters.map((char) => (
                    <div
                        key={char.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors gap-2"
                    >
                        {/* Character */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border border-white/10">
                                {char.image?.large && (
                                    <Image
                                        src={char.image.large}
                                        alt={char.name.full}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white leading-tight line-clamp-2">{char.name.full}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">{char.role}</p>
                            </div>
                        </div>

                        {/* Voice Actor (Japanese) */}
                        {char.voiceActors && char.voiceActors.length > 0 && (
                            <div className="flex items-center gap-3 flex-1 justify-end min-w-0 text-right">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-white leading-tight line-clamp-2">{char.voiceActors[0].name.full}</p>
                                    <p className="text-xs text-neutral-400 mt-0.5">{text.japanese}</p>
                                </div>
                                <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border border-white/10">
                                    {char.voiceActors[0].image?.large && (
                                        <Image
                                            src={char.voiceActors[0].image.large}
                                            alt={char.voiceActors[0].name.full}
                                            fill
                                            className="object-cover"
                                            sizes="48px"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
