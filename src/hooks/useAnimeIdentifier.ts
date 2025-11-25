import { useState, useCallback } from 'react';
import type { IdentifyResult } from '@/lib/types';
import { API_ENDPOINTS } from '@/lib/constants';

/**
 * Custom hook for anime identification logic
 * Encapsulates API calls and state management
 */
export function useAnimeIdentifier() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<IdentifyResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Identify anime from an image file
     */
    const identify = useCallback(async (imageFile: File) => {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch(API_ENDPOINTS.IDENTIFY, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to identify image');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setResult({ ...data, filename: imageFile.name });
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Reset all state
     */
    const reset = useCallback(() => {
        setResult(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        loading,
        result,
        error,
        identify,
        reset,
        setError,
    };
}
