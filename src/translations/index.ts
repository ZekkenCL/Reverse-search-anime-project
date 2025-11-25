import type { Language } from '@/lib/types';

/**
 * Translation keys and values
 */
export const translations = {
    es: {
        title: 'Búsqueda Inversa de Anime',
        subtitle: 'Sube una captura de pantalla. Te diremos el anime, episodio y momento exacto.',
        dropTitle: 'Arrastra tu imagen aquí',
        dropSubtitle: 'o haz clic para seleccionar (JPG, PNG, WebP)',
        analyzing: 'Analizando imagen...',
        uploadAnother: 'Subir otra',
        match: 'Coincidencia',
        episode: 'Ep',
        synopsis: 'Sinopsis',
        preview: 'Vista Previa',
        watchOn: 'Ver en',
        official: 'Oficial / Premium',
        community: 'Comunidad / Gratis (Búsqueda)',
        noLinks: 'No se encontraron enlaces oficiales.',
        poweredBy: 'Impulsado por trace.moe & Anilist',
        news: 'Noticias y Actualizaciones',
        details: 'Detalles',
        status: 'Estado',
        nextEpisode: 'Próximo Episodio',
        airingIn: 'Sale en',
        totalEpisodes: 'Episodios',
        score: 'Puntuación',
        popularity: 'Popularidad',
        trending: 'Tendencia',
        season: 'Temporada',
        statusFinished: 'Finalizado',
        statusReleasing: 'En Emisión',
        statusNotYetReleased: 'Próximamente',
        statusCancelled: 'Cancelado',
        days: 'días',
        hours: 'horas',
        minutes: 'minutos',
        seasons: 'Temporadas',
        movies: 'Películas',
        hasMovies: 'Tiene Películas',
    },
    en: {
        title: 'Find that Anime',
        subtitle: "Upload a screenshot and let our engine identify the series, episode, and exact moment instantly.",
        dropTitle: 'Drop your screenshot',
        dropSubtitle: 'Supports JPG, PNG, WebP',
        analyzing: 'Analyzing frame...',
        uploadAnother: 'Upload Another',
        match: 'Match',
        episode: 'Ep',
        synopsis: 'Synopsis',
        preview: 'Scene Preview',
        watchOn: 'Watch On',
        official: 'Official / Premium',
        community: 'Community / Free (Search)',
        noLinks: 'No official links found.',
        poweredBy: 'Powered by trace.moe & Anilist',
        news: 'News & Updates',
        details: 'Details',
        status: 'Status',
        nextEpisode: 'Next Episode',
        airingIn: 'Airing in',
        totalEpisodes: 'Episodes',
        score: 'Score',
        popularity: 'Popularity',
        trending: 'Trending',
        season: 'Season',
        statusFinished: 'Finished',
        statusReleasing: 'Airing',
        statusNotYetReleased: 'Not Yet Aired',
        statusCancelled: 'Cancelled',
        days: 'days',
        hours: 'hours',
        minutes: 'minutes',
        seasons: 'Seasons',
        movies: 'Movies',
        hasMovies: 'Has Movies',
    },
} as const;

/**
 * Get translations for a specific language
 */
export function getTranslations(language: Language): TranslationKeys {
    return translations[language];
}

export type TranslationKeys = typeof translations.es | typeof translations.en;
