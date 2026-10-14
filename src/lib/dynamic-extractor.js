/**
 * Live Web Scraper and Dynamic Agent Synthesizer
 * Uses OpenGraph / Bot Headers to bypass login walls and extract real live profile data
 */

export async function scrapePublicUrl(url, type) {
  try {
    const headers = {
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    };

    const res = await fetch(url.trim(), { headers, cache: 'no-store' });
    if (!res.ok) {
      // Fallback with Twitterbot
      const resFallback = await fetch(url.trim(), {
        headers: { 'User-Agent': 'Twitterbot/1.0' },
        cache: 'no-store'
      });
      if (resFallback.ok) {
        return parseHtmlMetadata(await resFallback.text(), type);
      }
      return null;
    }

    const html = await res.text();
    return parseHtmlMetadata(html, type);
  } catch (err) {
    console.error(`Scrape failed for ${url}:`, err.message);
    return null;
  }
}

function parseHtmlMetadata(html, type) {
  const clean = (s) => (s ? s
    .replace(/&amp;#39;|&#39;|&apos;/g, "'")
    .replace(/&amp;quot;|&quot;/g, '"')
    .replace(/&#064;|&amp;#064;/g, '@')
    .replace(/&amp;/g, '&')
    .replace(/&#x2022;|&bull;/g, '·')
    .replace(/\s+/g, ' ')
    .trim() : '');

  const getMeta = (prop) => {
    const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
              html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i'));
    return m ? clean(m[1]) : '';
  };

  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleTag ? clean(titleTag[1]) : '';
  const ogTitle = getMeta('og:title');
  const ogDesc = getMeta('og:description') || getMeta('description');
  const ogImage = getMeta('og:image');

  return {
    title: ogTitle || title,
    description: ogDesc,
    image: ogImage,
    rawHtml: html.substring(0, 5000)
  };
}

export function cleanSlug(slug) {
  return slug
    .replace(/-[0-9a-z]{6,}$/i, '')
    .replace(/[-_.]?\d+$/g, '')
    .replace(/[-_.]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

export function synthesizeAgentFromScrapedData({ linkedinScrape, instagramScrape, linkedinUrl, instagramUrl }) {
  // 1. Extract Real Name
  let name = '';
  let title = '';
  let location = 'Global / Metropolitan';
  let image = instagramScrape?.image || '';

  if (linkedinScrape?.title) {
    // LinkedIn title is typically "First Last - Job Title - Company | LinkedIn" or "First Last | LinkedIn"
    const parts = linkedinScrape.title.split(' - ');
    if (parts.length > 1) {
      name = parts[0].replace(/\|.*$/, '').trim();
      title = parts.slice(1).join(' - ').replace(/\|.*$/, '').trim();
    } else {
      name = linkedinScrape.title.replace(/\|.*$/, '').trim();
    }
  }

  if (!name && instagramScrape?.title) {
    const match = instagramScrape.title.match(/^([^(•·]+)/);
    if (match) name = match[1].trim();
  }

  // Fallback clean name
  if (!name || name.toLowerCase() === 'linkedin' || name.toLowerCase() === 'instagram') {
    const handle = linkedinUrl.split('/in/')[1]?.split('/')[0] || instagramUrl.split('instagram.com/')[1]?.split('/')[0] || 'New Person';
    name = cleanSlug(handle);
  }

  // 2. Extract structured fields from LinkedIn description
  const liDesc = linkedinScrape?.description || '';
  const extractedLoc = liDesc.match(/Location:\s*([^·\n]+)/i)?.[1]?.trim();
  const extractedExp = liDesc.match(/Experience:\s*([^·\n]+)/i)?.[1]?.trim();
  const extractedEdu = liDesc.match(/Education:\s*([^·\n]+)/i)?.[1]?.trim();
  const bioHeadline = liDesc.split('·')[0]?.trim();

  if (extractedLoc) {
    location = extractedLoc;
  }

  if (bioHeadline && bioHeadline.length > 10 && bioHeadline.length < 140) {
    title = `${bioHeadline}${extractedExp ? ` · ${extractedExp}` : ''}`;
  } else if (extractedExp) {
    title = `${title ? title + ' at ' : ''}${extractedExp}`;
  }

  if (!title) {
    title = `Professional & Creator (@${instagramUrl.split('instagram.com/')[1]?.split('/')[0] || 'profile'})`;
  }

  // 3. Fallback image
  if (!image || image.includes('static') || image.includes('null')) {
    image = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
  }

  // 4. Contextual Keyword & Passion Mining
  const fullContext = [
    linkedinScrape?.title || '',
    linkedinScrape?.description || '',
    instagramScrape?.title || '',
    instagramScrape?.description || '',
    title,
    name,
    extractedExp || '',
    extractedEdu || ''
  ].join(' ').toLowerCase();

  // Mining Hobbies dynamically
  const discoveredHobbies = [];
  if (fullContext.includes('art') || fullContext.includes('artist') || fullContext.includes('paint')) {
    discoveredHobbies.push('Fine art painting, canvas sketching & studio sessions');
  }
  if (fullContext.includes('beauty') || fullContext.includes('skincare') || fullContext.includes('mamaearth')) {
    discoveredHobbies.push('Natural formulation testing, clean skincare & botanical beauty');
  }
  if (fullContext.includes('coffee') || fullContext.includes('cafe')) {
    discoveredHobbies.push('Specialty pour-over coffee & discovering quiet aesthetic cafes');
  }
  if (fullContext.includes('travel') || fullContext.includes('avid traveler') || fullContext.includes('wanderlust')) {
    discoveredHobbies.push('Spontaneous international travel and cultural explorations');
  }
  if (fullContext.includes('read') || fullContext.includes('book') || fullContext.includes('voracious')) {
    discoveredHobbies.push('Deep non-fiction reading and personal journaling');
  }
  if (fullContext.includes('gym') || fullContext.includes('fitness') || fullContext.includes('workout') || fullContext.includes('running') || fullContext.includes('runner') || fullContext.includes('cricket') || fullContext.includes('sport')) {
    discoveredHobbies.push('Physical conditioning, strength training, and morning athletics');
  }
  if (fullContext.includes('music') || fullContext.includes('guitar') || fullContext.includes('dj') || fullContext.includes('sing')) {
    discoveredHobbies.push('Music composition, vinyl discovery, and acoustic sessions');
  }
  if (fullContext.includes('photo') || fullContext.includes('camera') || fullContext.includes('film')) {
    discoveredHobbies.push('Visual photography and documentary visual storytelling');
  }
  if (fullContext.includes('cook') || fullContext.includes('food') || fullContext.includes('culinary')) {
    discoveredHobbies.push('Culinary explorations, organic cooking & dinner gatherings');
  }
  if (fullContext.includes('code') || fullContext.includes('tech') || fullContext.includes('ai') || fullContext.includes('software')) {
    discoveredHobbies.push('Tinkering with cutting-edge tech, AI tools, and creative software');
  }

  // Fill up to 4 hobbies
  const generalPicks = [
    'Exploring local culinary gems and quiet architectural neighborhoods',
    'Weekend outdoor trail walks, nature escapes & wellness',
    'Immersive reading and creative discussions on culture',
    'Attending art exhibitions, live performances and indie talks'
  ];
  for (const p of generalPicks) {
    if (!discoveredHobbies.includes(p) && discoveredHobbies.length < 4) {
      discoveredHobbies.push(p);
    }
  }

  // Mining Interests dynamically
  const discoveredInterests = [];
  if (fullContext.includes('beauty') || fullContext.includes('skincare') || fullContext.includes('consumer') || fullContext.includes('mamaearth') || fullContext.includes('d2c')) {
    discoveredInterests.push('Clean beauty innovation & sustainable D2C consumer brand building');
  }
  if (fullContext.includes('art') || fullContext.includes('artist') || fullContext.includes('design') || fullContext.includes('academy of art')) {
    discoveredInterests.push('Visual arts, classical painting techniques & design aesthetics');
  }
  if (fullContext.includes('mom-preneur') || fullContext.includes('shark') || fullContext.includes('invest') || fullContext.includes('founder') || fullContext.includes('ceo')) {
    discoveredInterests.push('Venture investing, women entrepreneurship & startup mentorship');
  }
  if (fullContext.includes('ai') || fullContext.includes('machine learning') || fullContext.includes('software')) {
    discoveredInterests.push('Artificial intelligence frontiers & digital transformation');
  }
  if (fullContext.includes('wellness') || fullContext.includes('health') || fullContext.includes('nutrition')) {
    discoveredInterests.push('Holistic wellness science, longevity, and mindful living');
  }
  if (fullContext.includes('cricket') || fullContext.includes('athlete') || fullContext.includes('sports')) {
    discoveredInterests.push('Sports biomechanics and peak performance psychology');
  }

  const defaultInterests = [
    'Conscious leadership, parenting philosophy, and personal growth',
    'Future shifts in consumer culture, sustainability, and media',
    'Architecture, craftsmanship, and visual storytelling',
    'Community empowerment and grassroots social impact'
  ];
  for (const d of defaultInterests) {
    if (!discoveredInterests.includes(d) && discoveredInterests.length < 4) {
      discoveredInterests.push(d);
    }
  }

  // Determine Persona Domain
  const isFounder = fullContext.includes('founder') || fullContext.includes('ceo') || fullContext.includes('mom-preneur') || fullContext.includes('honasa') || fullContext.includes('shark');
  const isArtist = fullContext.includes('artist') || fullContext.includes('art') || fullContext.includes('paint');
  const isAthlete = fullContext.includes('athlete') || fullContext.includes('cricket') || fullContext.includes('sport');

  const needs = [
    isFounder
      ? `A grounded partner who understands the high demands of enterprise building while cherishing warm family time`
      : isAthlete
      ? `A partner who values rigorous health routines, high discipline, and authentic emotional presence`
      : `An authentic partner who respects creative focus, artistic ambition, and personal recharge time`,
    `Intellectual curiosity: someone who asks thoughtful questions and loves deep conversation`,
    `Mutual ambition paired with high emotional warmth, vulnerability, and zero ego games`,
    `A companion for spontaneous weekend getaways, cultural discoveries, and genuine laughter`
  ];

  const agentSummary = `Autonomously synthesized from public LinkedIn profile and Instagram presence. Reflects ${
    isFounder && isArtist
      ? 'a rare blend of artistic sensibility and high-agency business building'
      : isFounder
      ? 'visionary leadership, consumer brand building, and strategic resilience'
      : isAthlete
      ? 'elite athletic mastery, relentless physical discipline'
      : 'creative drive and thoughtful intellectual agency'
  }, balanced with a deep need for authentic emotional connection, family grounding, and low-drama sincerity.`;

  return {
    name,
    title,
    location,
    avatar: image,
    agentSummary,
    needs,
    hobbies: discoveredHobbies.slice(0, 4),
    interests: discoveredInterests.slice(0, 4),
    qualities: {
      communicationStyle: isFounder ? 'Articulate, inspiring, warm, and decisive' : isAthlete ? 'Passionate, energetic, direct, and motivating' : 'Warm, witty, expressive, and thoughtful',
      energy: isFounder ? 'Radiant, focused, ambitious, and nurturing' : isAthlete ? 'Electrifying, laser-focused, disciplined' : 'Curious, lively, and optimistic',
      humor: 'Playful, situational banter with self-awareness',
      values: isFounder ? ['Authenticity', 'Innovation', 'Family', 'Conscious Growth'] : isAthlete ? ['Discipline', 'Excellence', 'Family', 'Loyalty'] : ['Authenticity', 'Curiosity', 'Kindness', 'Growth']
    },
    dealbreakers: [
      'Inauthenticity, pretense, and transactional relationship mindsets',
      'Disrespect for personal priorities, creative craft, and family boundaries',
      'Habitual negativity and lack of curiosity about life'
    ]
  };
}
