import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format seconds to MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format time until a future timestamp
 * @param timestamp - Unix timestamp in seconds
 * @param text - Translation object with days, hours, minutes labels
 * @returns Formatted time string
 */
export function formatTimeUntil(timestamp: number, text: any): string {
    const now = Math.floor(Date.now() / 1000);
    const diff = timestamp - now;

    if (diff <= 0) return '0 ' + text.minutes;

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    if (days > 0) {
        return `${days} ${text.days}${hours > 0 ? ` ${hours} ${text.hours}` : ''}`;
    } else if (hours > 0) {
        return `${hours} ${text.hours}${minutes > 0 ? ` ${minutes} ${text.minutes}` : ''}`;
    } else {
        return `${minutes} ${text.minutes}`;
    }
}
