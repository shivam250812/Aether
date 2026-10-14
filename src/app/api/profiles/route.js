import { NextResponse } from 'next/server';
import { INITIAL_PROFILES } from '@/data/profiles';

let globalProfiles = [...INITIAL_PROFILES];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const found = globalProfiles.find(p => p.id === id);
    if (!found) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json(found);
  }

  return NextResponse.json(globalProfiles);
}

export function getGlobalProfiles() {
  return globalProfiles;
}

export function addGlobalProfile(newProfile) {
  globalProfiles.unshift(newProfile);
  return globalProfiles;
}
