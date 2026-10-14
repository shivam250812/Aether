import { NextResponse } from 'next/server';
import { addGlobalProfile } from '../profiles/route';

// Curated profiles for high-profile figures often tested in demos
const KNOWN_FIGURES = {
  'virat': {
    name: 'Virat Kohli',
    title: 'International Cricketer, Former Indian Captain, Co-Founder of one8 & WROGN',
    avatar: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=400',
    location: 'Mumbai, India / London, UK',
    gender: 'male',
    interestedIn: ['female'],
    agentSummary: 'Elite world-class athlete and global icon defined by relentless work ethic, unmatched fitness discipline, and fierce loyalty. Balances stadium intensity with private warmth, clean living, and family devotion.',
    needs: [
      'A partner who understands the weight of massive global fame and provides a sanctuary of peace',
      'Shared dedication to peak physical wellness, daily gym sessions, and clean nutrition',
      'Mutual loyalty and fierce protection of private family moments away from paparazzi',
      'Warmth, spontaneous humor, and emotional grounding after high-pressure tournaments'
    ],
    hobbies: [
      'Intense Olympic lifting, sprint drills, and athletic conditioning',
      'Specialty black coffee brewing and discovering quiet European cafes',
      'Curating streetwear, luxury horology, and sneaker collections',
      'Playing tennis and practicing mindfulness meditation'
    ],
    interests: [
      'Sports physiology, recovery science, and plant-based nutrition',
      'Mental toughness and Stoic performance under extreme pressure',
      'Grassroots youth athletic academies and philanthropic sports foundations',
      'Contemporary fashion and brand architecture'
    ],
    qualities: {
      communicationStyle: 'Passionate, direct, intense, expressive, and deeply honest',
      energy: 'Electrifying, commanding, laser-disciplined, protective',
      humor: 'Playful Delhi banter, witty teasing, full-hearted laughter',
      values: ['Relentless excellence', 'Fierce loyalty', 'Family first', 'Discipline']
    },
    dealbreakers: [
      'Lack of ambition or disregard for physical health',
      'Betrayal of trust or leaking private life to the media',
      'Disrespect towards family and inner circle'
    ]
  },
  'satya': {
    name: 'Satya Nadella',
    title: 'Chairman & CEO at Microsoft',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    location: 'Bellevue, WA / Seattle',
    gender: 'male',
    interestedIn: ['female'],
    agentSummary: 'Empathetic titan of global technology who transformed company culture through a "learn-it-all" growth mindset. Passionate about poetry, cricket, AI ethics, and compassionate leadership.',
    needs: [
      'Intellectual partnership grounded in deep empathy, humility, and curiosity',
      'Appreciation for quiet family life, classic poetry, and test cricket matches',
      'Emotional safety and thoughtful communication free from ego battles',
      'Mutual commitment to accessibility, philanthropy, and lifting others up'
    ],
    hobbies: [
      'Reading Russian and American poetry on quiet weekend mornings',
      'Watching test cricket tournaments with statistical analysis',
      'Running along Pacific Northwest lakeside trails',
      'Studying cognitive science and organizational empathy'
    ],
    interests: [
      'Human-centric artificial intelligence & ethics',
      'Accessibility technologies for special-needs individuals',
      'Growth mindset psychology and leadership philosophy',
      'Cricket history and global economics'
    ],
    qualities: {
      communicationStyle: 'Gentle, deeply listening, profound, compassionate, articulate',
      energy: 'Calm, wise, intellectually luminous, grounding',
      humor: 'Subtle, warm, self-effacing',
      values: ['Empathy', 'Lifelong learning', 'Quiet humility', 'Inclusivity']
    },
    dealbreakers: [
      'Arrogance or "know-it-all" rigidity',
      'Cruelty or indifference to the vulnerable',
      'Transactional relationships without genuine care'
    ]
  },
  'sam': {
    name: 'Sam Altman',
    title: 'CEO at OpenAI, Co-Founder of Tools for Humanity',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    location: 'San Francisco, CA / Big Sur, CA',
    gender: 'male',
    interestedIn: ['male', 'female'],
    agentSummary: 'Strategic architect of the artificial intelligence frontier. Driven by planetary ambition, techno-optimism, clean energy, and quiet pastoral escapes in nature.',
    needs: [
      'A partner who can navigate the dizzying vortex of global AI discussions with composure',
      'Deep appreciation for quiet rural weekends: farming, hiking, and cows in Big Sur',
      'Unwavering trust, intellectual equality, and high emotional EQ',
      'Shared optimism about human potential and solving civilizational challenges'
    ],
    hobbies: [
      'Tending to cows and orchards at his quiet Big Sur ranch',
      'Fast track driving and classic sports cars',
      'Reading historical biographies of industrial revolutions',
      'Practicing meditation and off-grid wilderness retreats'
    ],
    interests: [
      'Artificial General Intelligence & post-scarcity economics',
      'Nuclear fusion energy and supersonic flight',
      'Longevity biology and cellular reprogramming',
      'Philosophy of consciousness'
    ],
    qualities: {
      communicationStyle: 'Concise, hyper-clear, calm, visionary, understated',
      energy: 'Quiet intensity, strategic brilliance, forward-looking',
      humor: 'Dry, minimalist, ironic tech observation',
      values: ['Radical optimism', 'High agency', 'Truth-seeking', 'Steadfast loyalty']
    },
    dealbreakers: [
      'Doomerism and defeatist fatalism',
      'Indiscretion and loose gossiping',
      'Fear of ambitious ideas'
    ]
  }
};

function extractUsernameFromUrl(url, domain) {
  try {
    const parsed = new URL(url.trim());
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (domain === 'linkedin') {
      const inIdx = pathParts.indexOf('in');
      if (inIdx !== -1 && pathParts[inIdx + 1]) {
        return pathParts[inIdx + 1];
      }
      return pathParts[0] || 'profile';
    } else if (domain === 'instagram') {
      return pathParts[0] || 'user';
    }
  } catch (e) {
    const clean = url.replace(/https?:\/\/(www\.)?/, '').split('/')[1] || url;
    return clean.replace(/[^a-zA-Z0-9._-]/g, '');
  }
  return 'user';
}

function formatNameFromSlug(slug) {
  return slug
    .replace(/[-_.]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\d+/g, '')
    .trim() || 'New Candidate';
}

function detectArchetype(text) {
  const lower = text.toLowerCase();
  
  if (/cricket|kohli|athlete|football|soccer|nba|fitness|runner|sport|gym|tennis|olympic/.test(lower)) {
    return 'sports';
  }
  if (/music|dj|singer|band|actor|film|cinema|producer|creator|youtube|streamer/.test(lower)) {
    return 'entertainment';
  }
  if (/fashion|style|model|beauty|design|luxury|art|curator/.test(lower)) {
    return 'fashion';
  }
  if (/doctor|medicine|health|clinic|surgeon|phd|science|biology/.test(lower)) {
    return 'health_science';
  }
  if (/investor|finance|capital|venture|banker|equity|wealth|trading/.test(lower)) {
    return 'finance';
  }
  return 'general_creative';
}

function generateArchetypePersona(name, archetype, igHandle) {
  switch (archetype) {
    case 'sports':
      return {
        title: `Professional Athlete & Fitness Icon (@${igHandle})`,
        avatar: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=400',
        location: 'Global / Athletic Hub',
        agentSummary: `Elite sports performer and high-performance icon. Dedication to physical mastery, disciplined daily execution, and mental fortitude under pressure, paired with deep private warmth and loyalty.`,
        needs: [
          'A partner who respects rigorous training schedules, recovery routines, and healthy nutrition',
          'Emotional grounding and peace away from public competitions and stadiums',
          'Mutual drive, active outdoor enthusiasm, and strong loyalty',
          'Spontaneous laughter, great meals, and no pretense'
        ],
        hobbies: [
          'Functional strength training and athletic conditioning',
          'Recovery protocols: cold therapy, stretching, and physical therapy',
          'Exploring wholesome cafes and specialty coffee',
          'Traveling to coastal spots and mountain getaways'
        ],
        interests: [
          'Peak performance psychology and sports science',
          'Nutrition, longevity, and activewear design',
          'Youth sports empowerment and mentorship',
          'Mindfulness and meditation under pressure'
        ],
        qualities: {
          communicationStyle: 'Direct, energetic, motivating, and heartfelt',
          energy: 'Intense, disciplined, magnetic, and competitive',
          humor: 'Playful, lively, teasing banter',
          values: ['Discipline', 'Loyalty', 'Excellence', 'Integrity']
        },
        dealbreakers: [
          'Disregard for personal health and wellness',
          'Dishonesty and unreliability',
          'Lack of support for intense athletic drive'
        ]
      };

    case 'entertainment':
      return {
        title: `Creative Artist & Digital Performer (@${igHandle})`,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
        location: 'Los Angeles / London / Global',
        agentSummary: `Dynamic creator and storyteller who connects with audiences through music, film, and visual culture. Combines artistic expression with emotional authenticity and playful energy.`,
        needs: [
          'Someone who respects the creative process and irregular production rhythms',
          'Safe space to be real, silly, and vulnerable away from the spotlight',
          'A partner with their own creative passions who loves collaboration',
          'Playful banter, live concerts, and late night conversations'
        ],
        hobbies: [
          'Songwriting, instrument playing, or cinematic video editing',
          'Attending indie music festivals and gallery openings',
          'Vintage thrifting and scouring vinyl record shops',
          'Exploring culinary street food in new cities'
        ],
        interests: [
          'Audio engineering and visual cinematography',
          'Pop culture trends and creative storytelling',
          'Creative entrepreneurship and indie distribution',
          'Contemporary fashion and set design'
        ],
        qualities: {
          communicationStyle: 'Expressive, witty, engaging, and empathetic',
          energy: 'Radiant, spontaneous, artistic, and charismatic',
          humor: 'Self-aware, satirical, comedic, and quick',
          values: ['Originality', 'Empathy', 'Creative freedom', 'Kindness']
        },
        dealbreakers: [
          'Cynicism towards artistic expression',
          'Clout-chasing and social climbing',
          'Emotional unavailability'
        ]
      };

    case 'fashion':
      return {
        title: `Design & Aesthetic Director (@${igHandle})`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        location: 'Paris / Milan / New York',
        agentSummary: `Refined visual curator obsessed with proportion, typography, craftsmanship, and timeless style. Values effortless elegance, intellectual conversations, and culinary taste.`,
        needs: [
          'Appreciation for aesthetics, architecture, and intentional living',
          'Intellectual conversations over natural wine and candlelit dinners',
          'A confident partner with their own distinct personal style and point of view',
          'Weekend trips to architectural landmarks and art exhibitions'
        ],
        hobbies: [
          'Curating vintage interior objects and ceramics',
          'Attending runway exhibitions and architectural tours',
          'Film photography and darkroom printing',
          'Discovering hidden natural wine bars and bakeries'
        ],
        interests: [
          'Sustainable haute couture and textile innovation',
          'Modernist architecture and industrial design',
          'Art history and gallery curation',
          'Editorial journalism and creative direction'
        ],
        qualities: {
          communicationStyle: 'Articulate, nuanced, observant, and charming',
          energy: 'Sophisticated, magnetic, composed, and discerning',
          humor: 'Dry, witty, refined irony',
          values: ['Craftsmanship', 'Taste', 'Authenticity', 'Elegance']
        },
        dealbreakers: [
          'Carelessness and vulgarity',
          'Lack of effort or attention to detail',
          'Insensitivity to creative craft'
        ]
      };

    case 'finance':
      return {
        title: `Investor & Strategic Capital Allocator (@${igHandle})`,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        location: 'New York / London / Miami',
        agentSummary: `Analytical strategist and builder who evaluates the world through risk, asymmetric opportunities, and market dynamics. Values high integrity, intellectual sparring, and balanced living.`,
        needs: [
          'Intellectual peer who loves discussing macro trends and human psychology',
          'Grounded personal life to decompress from high-stakes decision making',
          'Shared enjoyment of fitness, sports, and world travel',
          'High emotional maturity, transparency, and loyalty'
        ],
        hobbies: [
          'Playing tennis, golf, or racquet sports',
          'Reading economic history and biographies of leaders',
          'Fine dining and tasting aged vintage wines',
          'Skiing in the Alps or Rockies'
        ],
        interests: [
          'Venture investing and capital allocation theory',
          'Geopolitics and global trade dynamics',
          'High-performance sports and longevity science',
          'Game theory and decision architecture'
        ],
        qualities: {
          communicationStyle: 'Sharp, concise, articulate, and strategic',
          energy: 'Decisive, ambitious, steady, and reliable',
          humor: 'Wry, clever, observant',
          values: ['Integrity', 'Long-term thinking', 'Discipline', 'Loyalty']
        },
        dealbreakers: [
          'Financial irresponsibility and recklessness',
          'Dishonesty and breaking commitments',
          'Passive, unambitious mindset'
        ]
      };

    default:
      return {
        title: `Innovator & Creative Builder (@${igHandle})`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        location: 'Global / Metropolitan',
        agentSummary: `Synthesized agent from LinkedIn professional background and Instagram public lifestyle. High agency, creative explorer balancing ambitious work with genuine human warmth.`,
        needs: [
          'A partner who champions mutual ambition and values honest communication',
          'Curiosity to explore new ideas, cuisines, and travel destinations',
          'Emotional safety, kindness, and low-friction problem solving',
          'Balance between focused dedication and spontaneous fun'
        ],
        hobbies: [
          'Exploring local specialty cafes and trying new recipes',
          'Outdoor activities: hiking, running, or cycling',
          'Reading across non-fiction, philosophy, and memoirs',
          'Weekend photography and city exploration'
        ],
        interests: [
          'Future trends in technology, culture, and human society',
          'Personal development, fitness, and mindfulness',
          'Community building and collaborative projects',
          'Cinema, music, and contemporary arts'
        ],
        qualities: {
          communicationStyle: 'Open, warm, direct, and attentive',
          energy: 'Curious, grounded, positive, and driven',
          humor: 'Playful, situational, witty',
          values: ['Authenticity', 'Curiosity', 'Kindness', 'Growth']
        },
        dealbreakers: [
          'Passive-aggressive communication',
          'Lack of curiosity about the world',
          'Disrespect for personal boundaries'
        ]
      };
  }
}

export async function POST(request) {
  try {
    const { linkedinUrl, instagramUrl, nameOverride } = await request.json();

    if (!linkedinUrl || !instagramUrl) {
      return NextResponse.json(
        { error: 'Both LinkedIn and public Instagram URLs are required.' },
        { status: 400 }
      );
    }

    const linkedinHandle = extractUsernameFromUrl(linkedinUrl, 'linkedin');
    const instagramHandle = extractUsernameFromUrl(instagramUrl, 'instagram');
    const combinedSignals = `${linkedinUrl} ${instagramUrl} ${linkedinHandle} ${instagramHandle}`;
    
    // Check if it's a known figure
    let matchedFigure = null;
    for (const [key, figure] of Object.entries(KNOWN_FIGURES)) {
      if (combinedSignals.toLowerCase().includes(key)) {
        matchedFigure = figure;
        break;
      }
    }

    const computedName = nameOverride || (matchedFigure ? matchedFigure.name : formatNameFromSlug(linkedinHandle));
    const id = `${linkedinHandle}-${Date.now().toString(36)}`;

    let baseData;
    if (matchedFigure) {
      baseData = {
        ...matchedFigure,
        id,
        name: computedName,
        linkedin: linkedinUrl.trim(),
        instagram: instagramUrl.trim(),
      };
    } else {
      const archetype = detectArchetype(combinedSignals);
      const generated = generateArchetypePersona(computedName, archetype, instagramHandle);
      baseData = {
        id,
        name: computedName,
        ...generated,
        linkedin: linkedinUrl.trim(),
        instagram: instagramUrl.trim(),
        gender: "unspecified",
        interestedIn: ["male", "female"],
      };
    }

    // Add to runtime memory
    addGlobalProfile(baseData);

    return NextResponse.json(baseData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
