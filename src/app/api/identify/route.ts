import { NextRequest, NextResponse } from 'next/server';
// Force re-compile: v2

/**
 * POST /api/identify
 * Identifies anime from an uploaded image using trace.moe and Anilist APIs
 * 
 * @param req - Next.js request with FormData containing image file
 * @returns JSON response with anime identification results
 */
export async function POST(req: NextRequest) {
    try {
        // Extract and validate image from form data
        const formData = await req.formData();
        const image = formData.get('image');

        if (!image || !(image instanceof Blob)) {
            return NextResponse.json(
                { error: 'No valid image provided' },
                { status: 400 }
            );
        }

        // Step 1: Send image to trace.moe for anime identification
        const traceFormData = new FormData();
        traceFormData.append('image', image);

        const traceResponse = await fetch('https://api.trace.moe/search?cutBorders', {
            method: 'POST',
            body: traceFormData,
        });

        if (!traceResponse.ok) {
            throw new Error(`Trace.moe API error: ${traceResponse.statusText}`);
        }

        const traceData = await traceResponse.json();

        // Check if any results were found
        if (!traceData.result || traceData.result.length === 0) {
            return NextResponse.json({ found: false });
        }

        // Get the best match (highest similarity)
        const bestMatch = traceData.result[0];
        const anilistId = bestMatch.anilist;

        // Step 2: Query Anilist GraphQL API for detailed anime metadata
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

        if (!anilistResponse.ok) {
            console.error('Anilist API error');
        }

        const anilistData = await anilistResponse.json();
        const media = anilistData.data?.Media;

        // Calculate season and movie counts from relations
        let seasonCount = 0;
        let movieCount = 0;
        let grandTotalEpisodes = media.episodes || 0;
        let generalDescription = media.description;

        // Helper to convert date object to comparable number
        const getDateValue = (dateObj: any) => {
            if (!dateObj || !dateObj.year) return Infinity;
            return dateObj.year * 10000 + (dateObj.month || 0) * 100 + (dateObj.day || 0);
        };

        let earliestDate = getDateValue(media.startDate);
        const processedIds = new Set<number>();
        processedIds.add(media.id);

        // Calculate Franchise Status
        // Priority: RELEASING > NOT_YET_RELEASED > FINISHED/CANCELLED/etc
        let franchiseStatus = media.status;

        // Helper to process a node
        const processNode = (node: any) => {
            if (processedIds.has(node.id)) return;
            processedIds.add(node.id);

            if (node.format === 'TV' || node.format === 'TV_SHORT' || node.format === 'ONA') {
                seasonCount++;
                if (node.episodes) {
                    grandTotalEpisodes += node.episodes;
                }
            } else if (node.format === 'MOVIE') {
                movieCount++;
                // Movies usually count as 1 "episode" in terms of watchable content units if episodes is null/1
                // But if it has episodes (e.g. broken into parts), add them.
                grandTotalEpisodes += (node.episodes || 1);
            }
        };

        // Helper to check if a relation type is relevant
        const isRelevantRelation = (relationType: string) => {
            return ['PREQUEL', 'SEQUEL', 'PARENT', 'SIDE_STORY'].includes(relationType);
        };

        if (media?.relations?.edges) {
            const relations = media.relations.edges;

            // 1. Process direct relations
            for (const edge of relations) {
                if (edge.node.type === 'ANIME' && isRelevantRelation(edge.relationType)) {
                    processNode(edge.node);

                    // 2. Process nested relations (depth 2)
                    if (edge.node.relations?.edges) {
                        for (const nestedEdge of edge.node.relations.edges) {
                            if (nestedEdge.node.type === 'ANIME' && isRelevantRelation(nestedEdge.relationType)) {
                                processNode(nestedEdge.node);
                            }
                        }
                    }
                }
            }

            // Add self to counts if applicable (already added episodes to grandTotal, just need to increment count types)
            if (media.format === 'TV' || media.format === 'TV_SHORT' || media.format === 'ONA') {
                seasonCount++; // Count self
            } else if (media.format === 'MOVIE') {
                movieCount++; // Count self
            }

            // 2. Find "General" Description (Earliest TV/TV_SHORT/ONA entry in the franchise)
            // Only do this if we don't have a description for the specific media
            if (!generalDescription) {
                const checkEarliest = (node: any) => {
                    if (['TV', 'TV_SHORT', 'ONA'].includes(node.format)) {
                        const nodeDate = getDateValue(node.startDate);
                        if (nodeDate < earliestDate) {
                            earliestDate = nodeDate;
                            if (node.description) {
                                generalDescription = node.description;
                            }
                        }
                    }
                };

                for (const edge of relations) {
                    if (edge.node.type === 'ANIME' && isRelevantRelation(edge.relationType)) {
                        checkEarliest(edge.node);
                        if (edge.node.relations?.edges) {
                            for (const nestedEdge of edge.node.relations.edges) {
                                if (nestedEdge.node.type === 'ANIME' && isRelevantRelation(nestedEdge.relationType)) {
                                    checkEarliest(nestedEdge.node);
                                }
                            }
                        }
                    }
                }
            }

            let hasReleasing = false;
            let hasNotYetReleased = false;

            const checkStatus = (status: string) => {
                if (status === 'RELEASING') hasReleasing = true;
                if (status === 'NOT_YET_RELEASED') hasNotYetReleased = true;
            };

            if (media.status) checkStatus(media.status);

            for (const edge of relations) {
                if (edge.node.type === 'ANIME' && isRelevantRelation(edge.relationType)) {
                    checkStatus(edge.node.status);
                    if (edge.node.relations?.edges) {
                        for (const nestedEdge of edge.node.relations.edges) {
                            if (nestedEdge.node.type === 'ANIME' && isRelevantRelation(nestedEdge.relationType)) {
                                checkStatus(nestedEdge.node.status);
                            }
                        }
                    }
                }
            }

            if (hasReleasing) {
                franchiseStatus = 'RELEASING';
            } else if (hasNotYetReleased) {
                franchiseStatus = 'NOT_YET_RELEASED';
            } else if (franchiseStatus !== 'CANCELLED') {
                if (media.status === 'FINISHED') franchiseStatus = 'FINISHED';
            }
        } else {
            // No relations, just set counts based on self
            if (media.format === 'TV' || media.format === 'TV_SHORT' || media.format === 'ONA') seasonCount = 1;
            if (media.format === 'MOVIE') movieCount = 1;
        }

        // Step 2.5: Fetch News from Jikan API and Anime News Network
        let news: any[] = [];

        // 1. Fetch from Jikan (MyAnimeList)
        if (media.idMal) {
            try {
                const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime/${media.idMal}/news`);
                if (jikanResponse.ok) {
                    const jikanData = await jikanResponse.json();
                    const jikanNews = jikanData.data || [];
                    news = [...news, ...jikanNews.map((item: any) => ({ ...item, source: 'MyAnimeList' }))];
                }
            } catch (error) {
                console.error('Error fetching news from Jikan:', error);
            }
        }

        // 2. Fetch from Anime News Network RSS
        try {
            console.log('Fetching ANN news...');
            const annResponse = await fetch('https://www.animenewsnetwork.com/news/rss.xml', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            if (annResponse.ok) {
                const xmlText = await annResponse.text();
                const annNews = parseRSS(xmlText, 'Anime News Network');
                console.log(`Fetched ${annNews.length} items from ANN`);

                // Filter ANN news by anime title
                const titles = [
                    media.title.english,
                    media.title.romaji,
                    media.title.native
                ].filter(Boolean).map(t => t.toLowerCase());

                const relevantAnnNews = annNews.filter(item => {
                    const titleLower = item.title.toLowerCase();
                    const descLower = item.excerpt.toLowerCase();
                    return titles.some(t => titleLower.includes(t) || descLower.includes(t));
                });
                console.log(`Found ${relevantAnnNews.length} relevant items from ANN`);

                news = [...news, ...relevantAnnNews];
            } else {
                console.error(`Failed to fetch ANN news: ${annResponse.status} ${annResponse.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching news from ANN:', error);
        }

        // 3. Fetch from Crunchyroll RSS
        try {
            console.log('Fetching Crunchyroll news...');
            const crResponse = await fetch('https://www.crunchyroll.com/newsrss?lang=en', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            if (crResponse.ok) {
                const xmlText = await crResponse.text();
                const crNews = parseRSS(xmlText, 'Crunchyroll');
                console.log(`Fetched ${crNews.length} items from Crunchyroll`);

                // Filter Crunchyroll news by anime title
                const titles = [
                    media.title.english,
                    media.title.romaji,
                    media.title.native
                ].filter(Boolean).map(t => t.toLowerCase());

                const relevantCrNews = crNews.filter(item => {
                    const titleLower = item.title.toLowerCase();
                    const descLower = item.excerpt.toLowerCase();
                    return titles.some(t => titleLower.includes(t) || descLower.includes(t));
                });
                console.log(`Found ${relevantCrNews.length} relevant items from Crunchyroll`);

                news = [...news, ...relevantCrNews];
            } else {
                console.error(`Failed to fetch Crunchyroll news: ${crResponse.status} ${crResponse.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching news from Crunchyroll:', error);
        }

        // 4. Fetch from Anime Corner RSS
        try {
            console.log('Fetching Anime Corner news...');
            const acResponse = await fetch('https://animecorner.me/feed/', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            if (acResponse.ok) {
                const xmlText = await acResponse.text();
                const acNews = parseRSS(xmlText, 'Anime Corner');
                console.log(`Fetched ${acNews.length} items from Anime Corner`);

                // Filter Anime Corner news by anime title
                const titles = [
                    media.title.english,
                    media.title.romaji,
                    media.title.native
                ].filter(Boolean).map(t => t.toLowerCase());

                const relevantAcNews = acNews.filter(item => {
                    const titleLower = item.title.toLowerCase();
                    const descLower = item.excerpt.toLowerCase();
                    return titles.some(t => titleLower.includes(t) || descLower.includes(t));
                });
                console.log(`Found ${relevantAcNews.length} relevant items from Anime Corner`);

                news = [...news, ...relevantAcNews];
            } else {
                console.error(`Failed to fetch Anime Corner news: ${acResponse.status} ${acResponse.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching news from Anime Corner:', error);
        }

        // Sort news by date (newest first)
        news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Step 3: Translate description to Spanish
        // Use the general description we found
        const descriptionEN = generalDescription || '';
        let descriptionES = descriptionEN;

        // Translate to Spanish if description exists
        if (descriptionEN) {
            try {
                // Remove HTML tags for translation but keep track of them
                const textToTranslate = descriptionEN.replace(/<[^>]*>/g, '');

                // Use MyMemory Translation API (free, reliable, 10k chars/day limit)
                const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|es`;

                const translateResponse = await fetch(translateUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (translateResponse.ok) {
                    const translateData = await translateResponse.json();
                    if (translateData.responseStatus === 200 && translateData.responseData?.translatedText) {
                        descriptionES = translateData.responseData.translatedText;
                        console.log('Translation successful');
                    } else {
                        console.warn('Translation API returned error:', translateData);
                        descriptionES = descriptionEN;
                    }
                } else {
                    console.warn('Translation request failed:', translateResponse.status);
                    descriptionES = descriptionEN;
                }
            } catch (translateError) {
                console.error('Translation error:', translateError);
                descriptionES = descriptionEN; // Fallback to English
            }
        }

        // Return combined results
        return NextResponse.json({
            found: true,
            similarity: bestMatch.similarity,
            episode: bestMatch.episode,
            from: bestMatch.from,
            to: bestMatch.to,
            video: bestMatch.video,
            image: bestMatch.image,
            anilist: {
                ...media,
                status: franchiseStatus || media.status, // Override status with franchise status
                seasonCount,
                movieCount,
                episodes: grandTotalEpisodes, // Override with grand total
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
            },
        });

    } catch (error: any) {
        console.error('Identify API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

/**
 * Helper to parse RSS XML
 */
function parseRSS(xml: string, source: string) {
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const itemContent = match[1];
        const titleMatch = itemContent.match(/<title>(.*?)<\/title>/);
        const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
        const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);
        const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);

        if (titleMatch && linkMatch) {
            // Decode HTML entities in title and description
            const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"');
            const excerpt = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '').trim() : '';

            items.push({
                mal_id: Math.random(), // Temporary ID
                url: linkMatch[1],
                title: title,
                date: dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString(),
                author_username: source,
                author_url: '',
                forum_url: '',
                images: {
                    jpg: {
                        image_url: null // ANN RSS doesn't provide easy images
                    }
                },
                excerpt: excerpt,
                source: source
            });
        }
    }
    return items;
}
