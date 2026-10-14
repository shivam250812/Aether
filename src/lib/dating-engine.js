import { INITIAL_PROFILES } from '../data/profiles.js';

const DATE_VENUES = [
  { name: "Specialty Pour-Over Bar & Quiet Cafe", vibe: "Cerebral, intimate, quiet" },
  { name: "Sunset Architectural Walk & Lookout", vibe: "Inspiring, scenic, aesthetic" },
  { name: "Dimly Lit Natural Wine & Tapas Bar", vibe: "Flirty, sophisticated, relaxed" },
  { name: "Modern Art Gallery & Rooftop Terrace", vibe: "Creative, bold, expressive" },
  { name: "Matcha Lounge & Notebook Brainstorm", vibe: "Playful, energetic, high agency" }
];

export function calculateBaseCompatibility(p1, p2) {
  if (p1.id === p2.id) return { score: 0, breakdown: {}, verdict: "Self" };

  // Shared hobbies overlap
  const p1Hobbies = p1.hobbies.map(h => h.toLowerCase());
  const p2Hobbies = p2.hobbies.map(h => h.toLowerCase());
  let hobbyHits = 0;
  for (const h1 of p1Hobbies) {
    if (p2Hobbies.some(h2 => h2.includes(h1.split(' ')[0]) || h1.includes(h2.split(' ')[0]))) {
      hobbyHits += 1;
    }
  }

  // Shared interests overlap
  const p1Interests = p1.interests.map(i => i.toLowerCase());
  const p2Interests = p2.interests.map(i => i.toLowerCase());
  let interestHits = 0;
  for (const i1 of p1Interests) {
    if (p2Interests.some(i2 => i2.includes(i1.split(' ')[0]) || i1.includes(i2.split(' ')[0]))) {
      interestHits += 1;
    }
  }

  // Shared values overlap
  const p1Values = (p1.qualities?.values || []).map(v => v.toLowerCase());
  const p2Values = (p2.qualities?.values || []).map(v => v.toLowerCase());
  let valueHits = 0;
  for (const v1 of p1Values) {
    if (p2Values.some(v2 => v2.includes(v1.split(' ')[0]) || v1.includes(v2.split(' ')[0]))) {
      valueHits += 1;
    }
  }

  // Calculate scores
  const valuesScore = Math.min(98, Math.max(62, 70 + valueHits * 7 + (p1.location === p2.location ? 8 : 0)));
  const lifestyleScore = Math.min(96, Math.max(55, 68 + hobbyHits * 6 + (Math.abs(p1.hobbies.length - p2.hobbies.length) < 2 ? 5 : 0)));
  const intellectScore = Math.min(99, Math.max(65, 75 + interestHits * 5));
  const vibeScore = Math.min(97, Math.max(58, 69 + Math.floor(Math.sin((p1.id.length + p2.id.length) * 17) * 10) + (interestHits > 0 ? 8 : 0)));

  const overallScore = Math.round((valuesScore * 0.35) + (lifestyleScore * 0.25) + (intellectScore * 0.2) + (vibeScore * 0.2));

  let verdict = "Interesting Dynamic";
  if (overallScore >= 90) verdict = "Exceptional Chemistry & Alignment";
  else if (overallScore >= 82) verdict = "Strong Match with Shared Values";
  else if (overallScore >= 74) verdict = "Stimulating Connection & Good Balance";
  else verdict = "Great Friendship or Collaborators";

  return {
    score: overallScore,
    breakdown: {
      values: valuesScore,
      lifestyle: lifestyleScore,
      intellect: intellectScore,
      vibe: vibeScore
    },
    verdict
  };
}

export function generateDateSimulation(agentA, agentB, venueOverride = null) {
  const venue = venueOverride || DATE_VENUES[(agentA.id.length + agentB.id.length) % DATE_VENUES.length];
  const compat = calculateBaseCompatibility(agentA, agentB);

  // Generate dynamic, context-aware dialogue between the two agents
  const turns = [
    {
      speakerId: agentA.id,
      speakerName: agentA.name,
      thought: `I've analyzed ${agentB.name}'s public profiles. Noticed their love for ${agentB.hobbies[0] || 'craft'} and focus on ${agentB.interests[0] || 'design'}. Starting on an authentic, grounded note.`,
      message: `Hey ${agentB.name.split(' ')[0]}! I was reading through your journey and saw how you spend time with ${agentB.hobbies[0]?.toLowerCase() || 'your projects'}. In a world full of noise, that kind of dedication really caught my eye.`
    },
    {
      speakerId: agentB.id,
      speakerName: agentB.name,
      thought: `${agentA.name} isn't just reciting bio lines—they actually tuned into what keeps me grounded. Let's see if our day-to-day rhythm and pace align.`,
      message: `Thanks ${agentA.name.split(' ')[0]}, that means a lot! For me, it's about staying grounded. I actually noticed your emphasis on ${agentA.needs[0]?.toLowerCase() || 'craft'}. With everything you have going on, how do you protect that quiet space?`
    },
    {
      speakerId: agentA.id,
      speakerName: agentA.name,
      thought: `Great emotional EQ question. Testing alignment on lifestyle balance and emotional safety.`,
      message: `It takes ruthless intentionality. If I can't disconnect for a quiet walk or an honest conversation about ${agentA.interests[1]?.toLowerCase() || 'life'}, the success doesn't mean much. What about you—what's an absolute dealbreaker for you when you let someone into your world?`
    },
    {
      speakerId: agentB.id,
      speakerName: agentB.name,
      thought: `Direct question. I appreciate people who don't beat around the bush. Checking dealbreakers against our communication styles.`,
      message: `Honestly? ${agentB.dealbreakers?.[0] || 'Inauthenticity'}. Life's too short for pretense. I need someone who can celebrate big ambitious moves, but also just laugh over ${agentB.hobbies[1]?.toLowerCase() || 'simple moments'} on a lazy Sunday.`
    },
    {
      speakerId: agentA.id,
      speakerName: agentA.name,
      thought: `We share the same foundational values: ${agentA.qualities?.values?.[0] || 'authenticity'} and genuine curiosity. Chemistry feels natural and unforced.`,
      message: `Couldn't agree more. That exact balance between relentless drive and simple human warmth is what makes a partnership thrive. I'm really glad our agents set this up.`
    },
    {
      speakerId: agentB.id,
      speakerName: agentB.name,
      thought: `Positive verdict confirmed. Scoring alignment high on both emotional security and mutual ambition.`,
      message: `Same here. My agent definitely knew what it was doing tonight. Let's definitely do this again—in real life.`
    }
  ];

  const greenFlags = [
    `Aligned on core value: "${agentA.qualities?.values?.[0] || 'Authenticity'}" and "${agentB.qualities?.values?.[0] || 'Integrity'}"`,
    `Complementary communication styles: ${agentA.qualities?.communicationStyle} paired with ${agentB.qualities?.communicationStyle}`,
    `Shared appreciation for focused lifestyle: ${agentA.hobbies[0]} & ${agentB.hobbies[0]}`
  ];

  const watchouts = [
    compat.score > 85 
      ? `Both have intense schedules; will need deliberate time blocks for relationship nurturing.`
      : `Slight differences in geographic base (${agentA.location} vs ${agentB.location}) will require travel enthusiasm.`
  ];

  return {
    venue,
    compatibility: compat,
    dialogue: turns,
    greenFlags,
    watchouts,
    timestamp: new Date().toISOString()
  };
}

export function computeRankingsForPerson(personId, allProfiles = INITIAL_PROFILES) {
  const currentPerson = allProfiles.find(p => p.id === personId);
  if (!currentPerson) return [];

  const candidates = allProfiles.filter(p => p.id !== personId);
  
  const ranked = candidates.map(candidate => {
    const compat = calculateBaseCompatibility(currentPerson, candidate);
    return {
      candidate,
      score: compat.score,
      breakdown: compat.breakdown,
      verdict: compat.verdict
    };
  });

  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}

export function computeAllRankings(allProfiles = INITIAL_PROFILES) {
  const matrix = {};
  for (const person of allProfiles) {
    matrix[person.id] = computeRankingsForPerson(person.id, allProfiles);
  }
  return matrix;
}
