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

    const res = await fetch(url.trim(), { headers, next: { revalidate: 3600 } });
    if (!res.ok) {
      // Fallback with Twitterbot
      const resFallback = await fetch(url.trim(), {
        headers: { 'User-Agent': 'Twitterbot/1.0' }
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
  const clean = (s) => (s ? s.replace(/&#x2022;|&bull;|&#064;|&amp;/g, (m) => {
    if (m === '&#064;') return '@';
    if (m === '&amp;') return '&';
    return '·';
  }).trim() : '');

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

export function synthesizeAgentFromScrapedData({ linkedinScrape, instagramScrape, linkedinUrl, instagramUrl }) {
  // 1. Extract Real Name
  let name = '';
  let title = '';
  let bio = '';
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
    // Instagram title is often "Name (@handle) • Instagram photos"
    const match = instagramScrape.title.match(/^([^(•]+)/);
    if (match) name = match[1].trim();
  }

  // Fallback name from URL if scrape blocked
  if (!name || name.toLowerCase() === 'linkedin' || name.toLowerCase() === 'instagram') {
    const handle = linkedinUrl.split('/in/')[1]?.split('/')[0] || instagramUrl.split('instagram.com/')[1]?.split('/')[0] || 'New Person';
    name = handle.replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\d+/g, '').trim();
  }

  // 2. Build full contextual text from both sources
  const fullContext = [
    linkedinScrape?.title || '',
    linkedinScrape?.description || '',
    instagramScrape?.title || '',
    instagramScrape?.description || '',
    title
  ].join(' ');

  // 3. Dynamic Title if not extracted
  if (!title && linkedinScrape?.description) {
    // LinkedIn og:desc often starts with their headline before bullet/dash
    const headline = linkedinScrape.description.split(/[·•|-]/)[0]?.trim();
    if (headline && headline.length > 5 && headline.length < 120) {
      title = headline;
    }
  }
  if (!title) {
    title = `Professional & Creator (@${instagramUrl.split('instagram.com/')[1]?.split('/')[0] || 'profile'})`;
  }

  // 4. Dynamic Avatar fallback
  if (!image || image.includes('static') || image.includes('null')) {
    image = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
  }

  // 5. Dynamic Keyword & Passion Mining
  const keywords = fullContext.toLowerCase();

  // Mining Hobbies dynamically from words found in their bio
  const discoveredHobbies = [];
  if (keywords.includes('coffee') || keywords.includes('cafe')) discoveredHobbies.push('Specialty coffee brewing & cafe exploring');
  if (keywords.includes('travel') || keywords.includes('avid traveler') || keywords.includes('wanderlust')) discoveredHobbies.push('Spontaneous travel and cultural exploration');
  if (keywords.includes('read') || keywords.includes('book') || keywords.includes('voracious reader')) discoveredHobbies.push('Deep non-fiction reading and journaling');
  if (keywords.includes('gym') || keywords.includes('fitness') || keywords.includes('workout') || keywords.includes('running') || keywords.includes('runner')) discoveredHobbies.push('Physical conditioning, strength training, and endurance');
  if (keywords.includes('cricket')) discoveredHobbies.push('Test cricket analysis & batting practice');
  if (keywords.includes('music') || keywords.includes('guitar') || keywords.includes('dj')) discoveredHobbies.push('Music composition, vinyl discovery, and audio tech');
  if (keywords.includes('photo') || keywords.includes('camera') || keywords.includes('film')) discoveredHobbies.push('Visual photography and documentary filmmaking');
  if (keywords.includes('cook') || keywords.includes('food') || keywords.includes('baking')) discoveredHobbies.push('Culinary experiments and hosting dinner parties');
  if (keywords.includes('code') || keywords.includes('tech') || keywords.includes('build')) discoveredHobbies.push('Tinkering with code, open-source software, and AI');

  // Fill up to 4 hobbies
  if (discoveredHobbies.length < 4) {
    const generalPicks = [
      'Exploring local culinary gems and quiet neighborhoods',
      'Weekend outdoor trail walks and coastal drives',
      'Immersive reading and creative discussions',
      'Attending live cultural performances and talks'
    ];
    for (const p of generalPicks) {
      if (!discoveredHobbies.includes(p) && discoveredHobbies.length < 4) {
        discoveredHobbies.push(p);
      }
    }
  }

  // 6. Mining Interests dynamically
  const discoveredInterests = [];
  if (keywords.includes('ai') || keywords.includes('artificial intelligence') || keywords.includes('machine learning')) discoveredInterests.push('Artificial intelligence & future computing frontiers');
  if (keywords.includes('design') || keywords.includes('art') || keywords.includes('creative')) discoveredInterests.push('Design craft, aesthetics, and visual expression');
  if (keywords.includes('business') || keywords.includes('founder') || keywords.includes('ceo') || keywords.includes('investor')) discoveredInterests.push('High-growth venture strategy and market dynamics');
  if (keywords.includes('health') || keywords.includes('wellness') || keywords.includes('bio')) discoveredInterests.push('Longevity science, holistic wellness, and mental fitness');
  if (keywords.includes('philanthropy') || keywords.includes('foundation') || keywords.includes('impact') || keywords.includes('climate')) discoveredInterests.push('Philanthropic impact, climate innovation, and global equity');
  if (keywords.includes('sports') || keywords.includes('cricket') || keywords.includes('athletic')) discoveredInterests.push('Sports biomechanics and peak performance under pressure');

  if (discoveredInterests.length < 4) {
    const defaultInterests = [
      'Personal growth, psychological models, and mindfulness',
      'Future shifts in culture, media, and human connection',
      'Architecture, craftsmanship, and storytelling',
      'Community building and empowering grassroots talent'
    ];
    for (const d of defaultInterests) {
      if (!discoveredInterests.includes(d) && discoveredInterests.length < 4) {
        discoveredInterests.push(d);
      }
    }
  }

  // 7. Dynamic Needs Formulation
  const isHighExecutive = keywords.includes('ceo') || keywords.includes('chair') || keywords.includes('founder') || keywords.includes('captain');
  const isAthletic = keywords.includes('athlete') || keywords.includes('cricket') || keywords.includes('fitness') || keywords.includes('sport');

  const needs = [
    isHighExecutive
      ? `A calm, supportive partner who understands high-stakes leadership demands and provides emotional shelter`
      : isAthletic
      ? `A partner who values rigorous health routines, high discipline, and authentic emotional presence`
      : `An authentic partner who respects creative focus, ambition, and personal recharge time`,
    `Intellectual curiosity: someone who asks thoughtful questions and loves deep conversation`,
    `Mutual ambition paired with high emotional warmth, vulnerability, and zero ego games`,
    `A companion for spontaneous weekend getaways, culinary discoveries, and genuine laughter`
  ];

  // 8. Dynamic Persona Synthesis Statement
  const agentSummary = `Autonomously synthesized from public LinkedIn profile and Instagram presence. Reflects ${
    isHighExecutive ? 'visionary leadership, strategic resilience' : isAthletic ? 'elite physical mastery, relentless discipline' : 'creative drive, intellectual agency'
  }, balanced with a deep need for genuine emotional connection, shared lifestyle rhythm, and low-drama authenticity.`;

  return {
    name,
    title,
    avatar: image,
    agentSummary,
    needs,
    hobbies: discoveredHobbies.slice(0, 4),
    interests: discoveredInterests.slice(0, 4),
    qualities: {
      communicationStyle: isHighExecutive ? 'Visionary, articulate, calm, and deeply observant' : isAthletic ? 'Passionate, energetic, direct, and motivating' : 'Warm, witty, articulate, and thoughtful',
      energy: isHighExecutive ? 'Grounded intensity, strategic, and reassuring' : isAthletic ? 'Electrifying, laser-focused, disciplined' : 'Curious, lively, and optimistic',
      humor: 'Playful, situational banter with self-awareness',
      values: isHighExecutive ? ['Impact', 'Integrity', 'Wisdom', 'Loyalty'] : isAthletic ? ['Discipline', 'Excellence', 'Family', 'Loyalty'] : ['Authenticity', 'Curiosity', 'Kindness', 'Growth']
    },
    dealbreakers: [
      'Inauthenticity, pretense, and transactional relationship mindsets',
      'Disrespect for personal priorities and healthy boundaries',
      'Habitual negativity and lack of curiosity about life'
    ]
  };
}
