import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { anilistId, episode, from, to, video, image, similarity } = await request.json();

        if (!anilistId) {
            return NextResponse.json({ error: 'Anilist ID is required' }, { status: 400 });
        }

        // Query Anilist for full details
        const query = `
            query ($id: Int) {
                Media (id: $id, type: ANIME) {
                    id
                    idMal
                    title {
                        english
                        romaji
                        native
                    }
                    coverImage {
                        extraLarge
                        large
                        color
                    }
                    description
                    externalLinks {
                        site
                        url
                        icon
                        color
                    }
                    bannerImage
                    siteUrl
                    status
                    season
                    seasonYear
                    episodes
                    startDate {
                        year
                        month
                        day
                    }
                    nextAiringEpisode {
                        episode
                        airingAt
                    }
                    trending
                    popularity
                    averageScore
                    trailer {
                        id
                        site
                        thumbnail
                    }
                    characters(sort: [ROLE, RELEVANCE], perPage: 6) {
                        edges {
                            node {
                                id
                                name {
                                    full
                                }
                                image {
                                    large
                                }
                            }
                            role
                            voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) {
                                id
                                name {
                                    full
                                }
                                image {
                                    large
                                }
                                languageV2
                            }
                        }
                    }
                    relations {
                        edges {
                            node {
                                id
                                title {
                                    english
                                    romaji
                                }
                                format
                                type
                                status
                                episodes
                                startDate {
                                    year
                                    month
                                    day
                                }
                                description
                                relations {
                                    edges {
                                        node {
                                            id
                                            title {
                                                english
                                                romaji
                                            }
                                            format
                                            type
                                            status
                                            episodes
                                            startDate {
                                                year
                                                month
                                                day
                                            }
                                            description
                                        }
                                        relationType
                                    }
                                }
                            }
                            relationType
                        }
                    }
                }
            }
        `;

        const anilistResponse = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { id: anilistId },
            }),
        });

        const anilistData = await anilistResponse.json();
        const media = anilistData.data?.Media;

        if (!media) {
            return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
        }

        // Process description (same logic as identify route)
        let descriptionEN = media.description || '';
        let descriptionES = '';

        if (descriptionEN) {
            descriptionEN = descriptionEN.replace(/<br\s*\/?>/gi, '\n');

            try {
                const translationResponse = await fetch(
                    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(descriptionEN.substring(0, 500))}&langpair=en|es`
                );
                const translationData = await translationResponse.json();
                descriptionES = translationData.responseData?.translatedText || descriptionEN;
            } catch {
                descriptionES = descriptionEN;
            }
        }

        // Calculate franchise stats (same logic as identify route)
        const relations = media.relations?.edges || [];
        const allRelatedMedia = [media];
        const processedIds = new Set([media.id]);

        relations.forEach((edge: any) => {
            const relatedMedia = edge.node;
            if (!processedIds.has(relatedMedia.id)) {
                allRelatedMedia.push(relatedMedia);
                processedIds.add(relatedMedia.id);

                relatedMedia.relations?.edges?.forEach((nestedEdge: any) => {
                    const nestedMedia = nestedEdge.node;
                    if (!processedIds.has(nestedMedia.id)) {
                        allRelatedMedia.push(nestedMedia);
                        processedIds.add(nestedMedia.id);
                    }
                });
            }
        });

        const seasons = allRelatedMedia.filter((m: any) =>
            (m.format === 'TV' || m.format === 'TV_SHORT' || m.format === 'ONA') && m.type === 'ANIME'
        );
        const movies = allRelatedMedia.filter((m: any) => m.format === 'MOVIE' && m.type === 'ANIME');

        const seasonCount = seasons.length;
        const movieCount = movies.length;

        const grandTotalEpisodes = allRelatedMedia
            .filter((m: any) => m.type === 'ANIME')
            .reduce((sum: number, m: any) => sum + (m.episodes || 0), 0);

        const hasAiring = allRelatedMedia.some((m: any) => m.status === 'RELEASING');
        const franchiseStatus = hasAiring ? 'RELEASING' : media.status;

        // Fetch news
        let news: any[] = [];
        try {
            const newsResponse = await fetch(`https://api.jikan.moe/v4/anime/${media.idMal}/news`);
            if (newsResponse.ok) {
                const newsData = await newsResponse.json();
                news = newsData.data?.slice(0, 5).map((item: any) => ({
                    title: item.title,
                    url: item.url,
                    date: item.date,
                    author: item.author_username,
                    image: item.images?.jpg?.image_url
                })) || [];
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
        }

        return NextResponse.json({
            found: true,
            similarity,
            episode: episode || 0,
            from: 0,
            to: 0,
            video: '', // Clear video as it doesn't correspond to this anime
            image: image || '',
            anilist: {
                ...media,
                status: franchiseStatus,
                seasonCount,
                movieCount,
                episodes: grandTotalEpisodes,
                news,
                trailer: media.trailer,
                characters: media.characters?.edges?.map((edge: any) => ({
                    id: edge.node.id,
                    name: edge.node.name,
                    image: edge.node.image,
                    role: edge.role,
                    voiceActors: edge.voiceActors
                })) || [],
                description: {
                    en: descriptionEN,
                    es: descriptionES
                }
            }
        });

    } catch (error: any) {
        console.error('Details fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch anime details' },
            { status: 500 }
        );
    }
}
