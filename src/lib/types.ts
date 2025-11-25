/**
 * Type definitions for the Anime Search application
 */

/**
 * Anilist media information
 */
export interface AnilistMedia {
    id: number;
    title: {
        english: string;
        romaji: string;
        native: string;
    };
    coverImage: {
        extraLarge: string;
        large: string;
        color: string;
    };
    description: {
        en: string;
        es: string;
    };
    externalLinks: ExternalLink[];
    bannerImage: string;
    siteUrl: string;
    status: string;
    season: string;
    seasonYear: number;
    episodes: number;
    nextAiringEpisode: {
        episode: number;
        airingAt: number;
    } | null;
    trending: number;
    popularity: number;
    averageScore: number;
    seasonCount: number;
    movieCount: number;
    news?: AnimeNews[];
}

/**
 * Anime News item from Jikan API
 */
export interface AnimeNews {
    mal_id: number;
    url: string;
    title: string;
    date: string;
    author_username: string;
    author_url: string;
    forum_url: string;
    images: {
        jpg: {
            image_url: string | null;
        };
    };
    excerpt: string;
    source?: string;
}

/**
 * External link to streaming platform
 */
export interface ExternalLink {
    site: string;
    url: string;
    icon: string;
    color: string;
}

/**
 * Result from anime identification
 */
export interface IdentifyResult {
    found: boolean;
    similarity: number;
    episode: number | null;
    from: number;
    to: number;
    video: string;
    image: string;
    filename?: string;
    anilist: AnilistMedia | null;
}

/**
 * Supported languages
 */
export type Language = 'es' | 'en';

/**
 * Community anime site
 */
export interface CommunitySite {
    name: string;
    url: string;
}
