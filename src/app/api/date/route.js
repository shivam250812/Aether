import { NextResponse } from 'next/server';
import { INITIAL_PROFILES } from '@/data/profiles';
import { generateDateSimulation, calculateBaseCompatibility } from '@/lib/dating-engine';
import { getGlobalProfiles } from '../profiles/route';

export async function POST(request) {
  try {
    const { agentAId, agentBId, venue } = await request.json();

    const allProfiles = getGlobalProfiles ? getGlobalProfiles() : INITIAL_PROFILES;
    const agentA = allProfiles.find(p => p.id === agentAId);
    const agentB = allProfiles.find(p => p.id === agentBId);

    if (!agentA || !agentB) {
      return NextResponse.json({ error: 'One or both agents not found' }, { status: 404 });
    }

    const simulation = generateDateSimulation(agentA, agentB, venue ? { name: venue, vibe: 'Custom selected' } : null);

    return NextResponse.json(simulation);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
