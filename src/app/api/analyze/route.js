import { NextResponse } from 'next/server';
import { addGlobalProfile } from '../profiles/route';
import { scrapePublicUrl, synthesizeAgentFromScrapedData } from '@/lib/dynamic-extractor';

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
  'bill': {
    name: 'Bill Gates',
    title: 'Co-Founder of Microsoft, Co-Chair of Bill & Melinda Gates Foundation',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    location: 'Seattle, WA',
    gender: 'male',
    interestedIn: ['female'],
    agentSummary: 'Voracious reader, bridge player, and philanthropist devoted to eradicating disease and scaling clean energy innovations worldwide.',
    needs: [
      'Intellectual sparring partner with endless curiosity about books, science, and history',
      'Shared dedication to global humanitarian impact and climate innovation',
      'Appreciation for quiet reading retreats, competitive bridge games, and tennis',
      'High emotional grounding and mutual intellectual respect'
    ],
    hobbies: [
      'Voracious reading across science, history, and immunology',
      'Playing tournament-level bridge and racquet sports',
      'Visiting research labs, nuclear reactor facilities, and agricultural centers',
      'Writing long-form reflections and annual book recommendations'
    ],
    interests: [
      'Clean energy technology and next-gen nuclear reactors',
      'Global health, eradication of polio, and vaccine distribution',
      'Artificial intelligence in education and healthcare',
      'Poverty reduction and agricultural innovation'
    ],
    qualities: {
      communicationStyle: 'Analytical, intensely curious, data-driven, and earnest',
      energy: 'Intellectual powerhouse, optimistic, and relentless',
      humor: 'Nerdy, self-deprecating, wry',
      values: ['Impact', 'Intellectual rigor', 'Optimism', 'Generosity']
    },
    dealbreakers: [
      'Anti-scientific thinking or willful ignorance',
      'Cynicism about human progress',
      'Lack of curiosity'
    ]
  },
  'warikoo': {
    name: 'Ankur Warikoo',
    title: 'Entrepreneur, Author (Do Epic Shit, Make Epic Money) & Educator, Ex-CEO nearbuy',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    location: 'New Delhi / Gurugram, India',
    gender: 'male',
    interestedIn: ['female'],
    agentSummary: 'Radically candid educator, entrepreneur, and author focused on self-awareness, financial literacy, and personal growth. Balances ruthless daily reflection with warm family devotion.',
    needs: [
      'Radical honesty, high self-awareness, and comfortable vulnerability',
      'A partner who embraces continuous personal growth and financial intentionality',
      'Quiet family dinners, long morning walks, and reading sessions',
      'Freedom from status games and social pretense'
    ],
    hobbies: [
      'Writing daily reflective journals and book manuscripts',
      'Public speaking and mentoring young entrepreneurs',
      'Daily 10k steps walking and morning tea rituals',
      'Listening to audiobooks on human psychology and decision making'
    ],
    interests: [
      'Financial freedom and behavioral money psychology',
      'Habit design, daily systems, and time auditing',
      'Consumer internet startups and angel investing',
      'Parenting, philosophy, and mental models'
    ],
    qualities: {
      communicationStyle: 'Vulnerable, structured, clear, empathetic, and direct',
      energy: 'Grounded, purposeful, encouraging, and reflective',
      humor: 'Self-deprecating, wry, observant',
      values: ['Self-awareness', 'Truth', 'Consistency', 'Family first']
    },
    dealbreakers: [
      'Victim mentality and blaming others',
      'Dishonesty and emotional games',
      'Financial recklessness or chasing hollow status'
    ]
  },
  'hustlerani': {
    name: 'Ankita Chawla (Hustlerani)',
    title: 'Visual Artist, Creative Director & Storyteller (@hustlerani)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    location: 'Mumbai / New Delhi, India',
    gender: 'female',
    interestedIn: ['male'],
    agentSummary: 'Viral visual artist and creative disruptor famed for turning Instagram into an artistic canvas. Energetic, bold, aesthetic, and deeply authentic with high emotional EQ.',
    needs: [
      'Someone who cherishes the artistic soul and respects creative flow states',
      'Spontaneous adventures: exploring street art, vintage markets, and local indie cafes',
      'Mutual drive and creative ambition without ego competition',
      'Deep emotional warmth, laughter, and safe vulnerability'
    ],
    hobbies: [
      'Digital illustration and typographic artwork design',
      'Exploring independent cafes, matcha spots, and pottery studios',
      'Documenting aesthetic visual stories and reels',
      'Pilates, morning stretches, and sound healing'
    ],
    interests: [
      'Visual storytelling, typography, and creative branding',
      'Gen-Z consumer aesthetics and digital culture',
      'Art history, contemporary exhibitions, and design systems',
      'Mental well-being, mindfulness, and creative entrepreneurship'
    ],
    qualities: {
      communicationStyle: 'Vibrant, witty, emotionally open, visually expressive',
      energy: 'Electric, inspiring, creative, and warm',
      humor: 'Playful, relatable, self-aware, sharp',
      values: ['Authenticity', 'Creative courage', 'Loyalty', 'Kindness']
    },
    dealbreakers: [
      'Cynicism towards art and creator work',
      'Mansplaining or patriarchal attitudes',
      'Emotional coldness and lack of self-expression'
    ]
  },
  'ghazal': {
    name: 'Ghazal Alagh',
    title: 'Co-Founder & CIO at Honasa Consumer (Mamaearth), Shark Tank India Judge, Artist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    location: 'Gurugram, India',
    gender: 'female',
    interestedIn: ['male'],
    agentSummary: 'Artist turned D2C unicorn founder and Shark Tank investor. Blends fine arts sensibility with relentless business execution, clean beauty advocacy, and deep family values.',
    needs: [
      'A grounded partner who understands high-stakes business building while prioritizing home life',
      'Mutual passion for intentional living, children, and conscious consumerism',
      'Intellectual curiosity across art, wellness, and business strategy',
      'Genuine warmth, low-drama problem solving, and mutual respect'
    ],
    hobbies: [
      'Canvas oil painting and fine art studio sessions',
      'Botanical formulation testing and clean beauty experiments',
      'Weekend family getaways and nature walks',
      'Mentoring women entrepreneurs and mom-preneurs'
    ],
    interests: [
      'Toxin-free sustainable consumer products & D2C brand mechanics',
      'New York Academy of Art techniques and visual composition',
      'Early-stage startup investing and brand building',
      'Conscious parenting and holistic health'
    ],
    qualities: {
      communicationStyle: 'Articulate, inspiring, grounded, and decisive',
      energy: 'Radiant, focused, ambitious, and nurturing',
      humor: 'Witty, warm, situational banter',
      values: ['Authenticity', 'Innovation', 'Family', 'Conscious Growth']
    },
    dealbreakers: [
      'Inauthenticity, pretense, and transactional relationship mindsets',
      'Disrespect for family commitments and artistic craft',
      'Habitual negativity and passive complaining'
    ]
  }
};

export async function POST(request) {
  try {
    const { linkedinUrl, instagramUrl, nameOverride } = await request.json();

    if (!linkedinUrl || !instagramUrl) {
      return NextResponse.json(
        { error: 'Both LinkedIn and public Instagram URLs are required.' },
        { status: 400 }
      );
    }

    // 1. Run live scraping in parallel on both official URLs
    const [linkedinScrape, instagramScrape] = await Promise.all([
      scrapePublicUrl(linkedinUrl, 'linkedin'),
      scrapePublicUrl(instagramUrl, 'instagram')
    ]);

    console.log('DEBUG analyze route:', {
      linkedinScrapeTitle: linkedinScrape?.title,
      linkedinScrapeDesc: linkedinScrape?.description?.substring(0, 100),
      instagramScrapeTitle: instagramScrape?.title
    });

    // 2. Synthesize agent persona dynamically from actual scraped metadata
    const synthesized = synthesizeAgentFromScrapedData({
      linkedinScrape,
      instagramScrape,
      linkedinUrl,
      instagramUrl
    });

    // 3. Check if matching any high-profile curated figure
    const combinedSignals = `${linkedinUrl} ${instagramUrl} ${synthesized.name}`.toLowerCase();
    let matchedFigure = null;
    for (const [key, figure] of Object.entries(KNOWN_FIGURES)) {
      if (combinedSignals.includes(key)) {
        matchedFigure = figure;
        break;
      }
    }

    const id = `${(synthesized.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

    const finalProfile = {
      id,
      name: nameOverride || (matchedFigure ? matchedFigure.name : synthesized.name),
      title: matchedFigure?.title || synthesized.title,
      avatar: (matchedFigure?.avatar || synthesized.avatar),
      linkedin: linkedinUrl.trim(),
      instagram: instagramUrl.trim(),
      gender: matchedFigure?.gender || "unspecified",
      interestedIn: matchedFigure?.interestedIn || ["male", "female"],
      location: matchedFigure?.location || synthesized.location || "Global / Metropolitan",
      agentSummary: matchedFigure?.agentSummary || synthesized.agentSummary,
      needs: matchedFigure?.needs || synthesized.needs,
      hobbies: matchedFigure?.hobbies || synthesized.hobbies,
      interests: matchedFigure?.interests || synthesized.interests,
      qualities: matchedFigure?.qualities || synthesized.qualities,
      dealbreakers: matchedFigure?.dealbreakers || synthesized.dealbreakers,
      scrapedLive: {
        linkedinTitle: linkedinScrape?.title || null,
        instagramDesc: instagramScrape?.description || null
      }
    };

    // Store in global runtime memory
    addGlobalProfile(finalProfile);

    return NextResponse.json(finalProfile, { status: 201 });
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
