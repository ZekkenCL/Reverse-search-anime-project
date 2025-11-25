import type { CommunitySite } from './types';

/**
 * Accepted image file types for dropzone
 */
export const ACCEPTED_IMAGE_TYPES = {
    'image/jpeg': [],
    'image/png': [],
    'image/webp': [],
} as const;

/**
 * Maximum number of files allowed in dropzone
 */
export const MAX_FILES = 1;

/**
 * Community anime streaming sites
 * These are used to generate search links
 */
export const COMMUNITY_SITES: CommunitySite[] = [
    {
        name: 'AnimeFLV',
        url: 'https://www3.animeflv.net/browse?q='
    },
    {
        name: 'Monoschinos',
        url: 'https://monoschinos2.com/buscar?q='
    },
    {
        name: 'Jkanime',
        url: 'https://jkanime.net/buscar/'
    },
];

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
    IDENTIFY: '/api/identify',
    TRACE_MOE: 'https://api.trace.moe/search?cutBorders',
    ANILIST: 'https://graphql.anilist.co',
} as const;
