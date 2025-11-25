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

        // Get top 5 matches
        const topMatches = traceData.result.slice(0, 5);
        const bestMatch = topMatches[0];
        const anilistId = bestMatch.anilist;

        // Collect IDs for candidates query
        const candidateIds = topMatches.map((m: any) => m.anilist);

        // Step 2: Query Anilist GraphQL API for detailed anime metadata
        const query = `
      query ($id: Int, $ids: [Int]) {
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
        # Fetch candidates metadata
        Page(page: 1, perPage: 5) {
            media(id_in: $ids, type: ANIME) {
                id
                title {
                    english
                    romaji
                    native
                }
                coverImage {
                    large
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
                variables: { id: anilistId, ids: candidateIds },
            }),
        });

        if (!anilistResponse.ok) {
            console.error('Anilist API error');
        }

        const anilistData = await anilistResponse.json();
        const media = anilistData.data?.Media;

        // ===================================================================
        // Find the main/first series in the franchise EARLY
        // ===================================================================
        let mainSeries = media;
        let matchedSeason = media;
        let seasonNumber = 1;

        // Get all related media from the franchise
        const mediaRelations = media.relations?.edges || [];
        const allRelatedForMain: any[] = [media];
        const mainProcessedIds = new Set([media.id]);

        // Process all relations recursively
        mediaRelations.forEach((edge: any) => {
            const relatedMedia = edge.node;
            if (!mainProcessedIds.has(relatedMedia.id)) {
                allRelatedForMain.push(relatedMedia);
                mainProcessedIds.add(relatedMedia.id);

                // Process nested relations
                const nestedRelations = relatedMedia.relations?.edges || [];
                nestedRelations.forEach((nestedEdge: any) => {
                    const nestedMedia = nestedEdge.node;
                    if (!mainProcessedIds.has(nestedMedia.id)) {
                        allRelatedForMain.push(nestedMedia);
                        mainProcessedIds.add(nestedMedia.id);
                    }
                });
            }
        });

        // Filter to only TV/ONA series (not movies, specials, PVs, etc.)
        const tvSeries = allRelatedForMain.filter((m: any) => {
            if (!['TV', 'TV_SHORT', 'ONA'].includes(m.format)) return false;
            if (m.type !== 'ANIME') return false;
            const title = (m.title?.english || m.title?.romaji || '').toLowerCase();
            if (title.includes(' pv') || title.includes('promotional') || title.includes('cm')) return false;
            if (!m.episodes || m.episodes === 0) return false;
            return true;
        });

        // Sort by start date to find the earliest (main series)
        tvSeries.sort((a: any, b: any) => {
            const aDate = a.startDate;
            const bDate = b.startDate;
            if (!aDate?.year) return 1;
            if (!bDate?.year) return -1;
            if (aDate.year !== bDate.year) return aDate.year - bDate.year;
            if (aDate.month !== bDate.month) return (aDate.month || 0) - (bDate.month || 0);
            return (aDate.day || 0) - (bDate.day || 0);
        });

        // The first one (earliest) is the main series
        if (tvSeries.length > 0) {
            mainSeries = tvSeries[0];
            const matchedIndex = tvSeries.findIndex((s: any) => s.id === media.id);
            if (matchedIndex !== -1) {
                seasonNumber = matchedIndex + 1;
            }
        }
        matchedSeason = media;

        // Calculate season and movie counts from relations
        let seasonCount = 0;
        let movieCount = 0;
        let grandTotalEpisodes = mainSeries.episodes || 0;
        let generalDescription = mainSeries.description; // Use main series description!

        // Helper to convert date object to comparable number
        const getDateValue = (dateObj: any) => {
            if (!dateObj || !dateObj.year) return Infinity;
            return dateObj.year * 10000 + (dateObj.month || 0) * 100 + (dateObj.day || 0);
        };

        let earliestDate = getDateValue(mainSeries.startDate);
        const processedIds = new Set<number>();
        processedIds.add(mainSeries.id);

        // Calculate Franchise Status
        // Priority: RELEASING > NOT_YET_RELEASED > FINISHED/CANCELLED/etc
        let franchiseStatus = mainSeries.status;

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

        if (mainSeries?.relations?.edges) {
            const relations = mainSeries.relations.edges;

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
            if (mainSeries.format === 'TV' || mainSeries.format === 'TV_SHORT' || mainSeries.format === 'ONA') {
                seasonCount++; // Count self
            } else if (mainSeries.format === 'MOVIE') {
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

            if (mainSeries.status) checkStatus(mainSeries.status);

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
                if (mainSeries.status === 'FINISHED') franchiseStatus = 'FINISHED';
            }
        } else {
            // No relations, just set counts based on self
            if (mainSeries.format === 'TV' || mainSeries.format === 'TV_SHORT' || mainSeries.format === 'ONA') seasonCount = 1;
            if (mainSeries.format === 'MOVIE') movieCount = 1;
        }

        // Step 2.5: Fetch News from Jikan API and Anime News Network
        let news: any[] = [];

        // 1. Fetch from Jikan (MyAnimeList)
        if (mainSeries.idMal) {
            try {
                const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime/${mainSeries.idMal}/news`);
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
                    mainSeries.title.english,
                    mainSeries.title.romaji,
                    mainSeries.title.native
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
                    mainSeries.title.english,
                    mainSeries.title.romaji,
                    mainSeries.title.native
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
                    mainSeries.title.english,
                    mainSeries.title.romaji,
                    mainSeries.title.native
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
                console.log('=== TRANSLATION DEBUG ===');

                // Use Google Translate 'gtx' endpoint (more reliable)
                // We still chunk to be safe, though it handles larger texts better
                const textToTranslate = descriptionEN.replace(/<br>/g, '\n').replace(/<[^>]*>/g, ''); // Convert breaks to newlines, remove other tags

                const maxChunkSize = 1000;
                const chunks: string[] = [];

                if (textToTranslate.length > maxChunkSize) {
                    const sentences = textToTranslate.match(/[^.!?]+[.!?]+/g) || [textToTranslate];
                    let currentChunk = '';

                    for (const sentence of sentences) {
                        if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
                            chunks.push(currentChunk.trim());
                            currentChunk = sentence;
                        } else {
                            currentChunk += sentence;
                        }
                    }
                    if (currentChunk.trim()) {
                        chunks.push(currentChunk.trim());
                    }
                } else {
                    chunks.push(textToTranslate);
                }

                console.log(`Translating ${chunks.length} chunk(s) with Google GTX`);
                const translatedChunks: string[] = [];

                for (const chunk of chunks) {
                    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(chunk)}`;

                    const response = await fetch(url);
                    if (response.ok) {
                        const data = await response.json();
                        // data[0] contains the translated sentences
                        if (data && data[0]) {
                            const translatedText = data[0].map((item: any) => item[0]).join('');
                            translatedChunks.push(translatedText);
                        } else {
                            translatedChunks.push(chunk);
                        }
                    } else {
                        console.warn('Google Translate failed:', response.status);
                        translatedChunks.push(chunk);
                    }

                    // Small delay to be polite
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                descriptionES = translatedChunks.join(' ').replace(/\n/g, '<br>'); // Restore breaks
                console.log('Translation complete');

            } catch (translateError) {
                console.error('Translation error:', translateError);
                descriptionES = descriptionEN;
            }
        }

        const candidatesMedia = anilistData.data?.Page?.media || [];

        // Map candidates with their trace info
        const candidates = topMatches.map((match: any) => {
            const mediaInfo = candidatesMedia.find((m: any) => m.id === match.anilist);
            if (!mediaInfo) return null;
            return {
                id: mediaInfo.id,
                similarity: match.similarity,
                episode: match.episode,
                title: mediaInfo.title,
                coverImage: mediaInfo.coverImage
            };
        }).filter(Boolean);

        // Return combined results
        return NextResponse.json({
            found: true,
            similarity: bestMatch.similarity,
            episode: bestMatch.episode,
            from: bestMatch.from,
            to: bestMatch.to,
            video: bestMatch.video,
            image: bestMatch.image,
            matchedSeasonNumber: seasonNumber,
            matchedSeasonTitle: matchedSeason.title,
            anilist: {
                ...mainSeries, // Use main series for general info
                // Preserve these from original media since relations don't have full data
                coverImage: media.coverImage,
                externalLinks: media.externalLinks,
                bannerImage: media.bannerImage,
                status: franchiseStatus || mainSeries.status,
                seasonCount,
                movieCount,
                episodes: grandTotalEpisodes,
                news,
                trailer: mainSeries.trailer,
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
            candidates
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
