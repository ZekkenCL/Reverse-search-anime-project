'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCEPTED_IMAGE_TYPES, MAX_FILES } from '@/lib/constants';
import type { TranslationKeys } from '@/translations';

interface DropZoneProps {
    onImageSelect: (file: File) => void;
    preview: string | null;
    loading: boolean;
    text: TranslationKeys;
}

/**
 * DropZone component for image upload
 * Handles drag and drop, file selection, and preview
 */
export function DropZone({ onImageSelect, preview, loading, text }: DropZoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            onImageSelect(selectedFile);
        }
    }, [onImageSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_IMAGE_TYPES,
        maxFiles: MAX_FILES,
    });

    return (
        <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
        >
            <div
                {...getRootProps()}
                className={cn(
                    "relative group cursor-pointer rounded-3xl p-1 transition-all duration-500",
                    isDragActive ? "scale-[1.02]" : "hover:scale-[1.01]"
                )}
            >
                {/* Gradient Border */}
                <div className={cn(
                    "absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-pink-500/50 opacity-50 blur-sm transition-opacity duration-500",
                    isDragActive ? "opacity-100" : "group-hover:opacity-75"
                )} />

                <div className="relative bg-neutral-950/90 backdrop-blur-xl rounded-[22px] border border-white/10 p-12 md:p-20 overflow-hidden">
                    <input {...getInputProps()} />

                    {/* Inner Content */}
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                        {preview ? (
                            <div className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />

                                {loading && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-20">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse" />
                                            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin relative z-10" />
                                        </div>
                                        <p className="text-indigo-200 font-medium mt-4 animate-pulse tracking-wide">{text.analyzing}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="w-24 h-24 rounded-full bg-neutral-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ring-1 ring-white/10 shadow-xl group-hover:shadow-indigo-500/20">
                                    <Upload className="w-10 h-10 text-neutral-400 group-hover:text-indigo-400 transition-colors duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-semibold text-white">{text.dropTitle}</p>
                                    <p className="text-neutral-500">{text.dropSubtitle}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
