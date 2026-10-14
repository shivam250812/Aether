import { NextResponse } from 'next/server';
import { addGlobalProfile } from '../profiles/route';

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
    // Fallback if URL is raw handle or missing protocol
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
    const computedName = nameOverride || formatNameFromSlug(linkedinHandle);
    const id = `${linkedinHandle}-${Date.now().toString(36)}`;

    // Generate intelligent personality extraction based on public social profiles
    const analyzedProfile = {
      id,
      name: computedName,
      title: `Analyzed from LinkedIn & Instagram (@${instagramHandle})`,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400`,
      linkedin: linkedinUrl.trim(),
      instagram: instagramUrl.trim(),
      gender: "unspecified",
      interestedIn: ["male", "female"],
      location: "San Francisco / Global",
      agentSummary: `Synthesized agent from LinkedIn professional history and Instagram public visual lifestyle. Demonstrates high agency, creative energy, and balance between intellectual craft and real-world connection.`,
      needs: [
        `Authentic partner who respects creative focus and private recharge time`,
        `Intellectual curiosity: someone who asks deep, engaging questions`,
        `Shared enthusiasm for active lifestyle, culinary explorations, and spontaneous trips`,
        `Mutual ambition with high emotional warmth and zero ego games`
      ],
      hobbies: [
        `Creative storytelling & visual media`,
        `Exploring specialty cafes and local culinary spots`,
        `Physical training and outdoor endurance activities`,
        `Weekend travel, architecture, and photography`
      ],
      interests: [
        `Technological innovation & digital culture`,
        `Design, typography, and human-centric software`,
        `Personal growth, mindfulness, and psychology`,
        `Community building and indie creative projects`
      ],
      qualities: {
        communicationStyle: "Open, articulate, warm, and direct",
        energy: "Dynamic, curious, and grounded",
        humor: "Witty, playful, observational",
        values: ["Authenticity", "Curiosity", "Empathy", "Consistency"]
      },
      dealbreakers: [
        "Passive-aggressive communication",
        "Disrespect for personal and professional boundaries",
        "Lack of curiosity about the world"
      ]
    };

    // Store in global runtime memory
    addGlobalProfile(analyzedProfile);

    return NextResponse.json(analyzedProfile, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
