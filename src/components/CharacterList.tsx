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
                Characters & Voice Actors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((char) => (
                    <div
                        key={char.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        {/* Character */}
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10">
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
                            <div>
                                <p className="text-sm font-medium text-white">{char.name.full}</p>
                                <p className="text-xs text-neutral-400">{char.role}</p>
                            </div>
                        </div>

                        {/* Voice Actor (Japanese) */}
                        {char.voiceActors && char.voiceActors.length > 0 && (
                            <div className="flex items-center gap-3 text-right">
                                <div>
                                    <p className="text-sm font-medium text-white">{char.voiceActors[0].name.full}</p>
                                    <p className="text-xs text-neutral-400">Japanese</p>
                                </div>
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10">
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
