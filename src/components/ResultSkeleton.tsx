'use client';

import { motion } from 'framer-motion';

export function ResultSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative"
        >
            <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Hero Section Skeleton */}
                <div className="relative h-64 md:h-80 bg-neutral-800/50 animate-pulse">
                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col md:flex-row gap-8 items-end">
                        {/* Cover Art Skeleton */}
                        <div className="shrink-0 w-40 md:w-56 aspect-[2/3] rounded-xl bg-neutral-700/50 -mb-16 md:-mb-20 relative z-10" />

                        {/* Title Info Skeleton */}
                        <div className="flex-1 space-y-4 mb-2 w-full">
                            <div className="flex gap-2">
                                <div className="h-6 w-20 bg-neutral-700/50 rounded-full" />
                                <div className="h-6 w-24 bg-neutral-700/50 rounded-full" />
                                <div className="h-6 w-16 bg-neutral-700/50 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-10 md:h-14 w-3/4 bg-neutral-700/50 rounded-lg" />
                                <div className="h-6 w-1/2 bg-neutral-700/50 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Body Skeleton */}
                <div className="p-8 md:p-10 pt-20 md:pt-24 grid md:grid-cols-12 gap-10">
                    {/* Left Column */}
                    <div className="md:col-span-8 space-y-10">
                        {/* Synopsis Skeleton */}
                        <div className="space-y-4">
                            <div className="h-6 w-32 bg-neutral-800/50 rounded-lg" />
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-neutral-800/50 rounded" />
                                <div className="h-4 w-full bg-neutral-800/50 rounded" />
                                <div className="h-4 w-2/3 bg-neutral-800/50 rounded" />
                            </div>
                        </div>

                        {/* Video Skeleton */}
                        <div className="space-y-4">
                            <div className="h-6 w-32 bg-neutral-800/50 rounded-lg" />
                            <div className="w-full aspect-video bg-neutral-800/50 rounded-2xl" />
                        </div>

                        {/* Details Grid Skeleton */}
                        <div className="space-y-4">
                            <div className="h-6 w-32 bg-neutral-800/50 rounded-lg" />
                            <div className="grid grid-cols-2 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-neutral-800/30 border border-white/5 h-20" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="h-64 rounded-2xl bg-neutral-800/30 border border-white/5" />
                        <div className="h-64 rounded-2xl bg-neutral-800/30 border border-white/5" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
