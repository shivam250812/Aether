'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ExternalLink, 
  Heart, 
  Sparkles, 
  Compass, 
  Flame, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Layers, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { computeRankingsForPerson } from '@/lib/dating-engine';

export default function ProfileDetailPage() {
  const params = useParams();
  const [profile, setProfile] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        setAllProfiles(data);
        const current = data.find(p => p.id === params.id);
        setProfile(current || null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="py-32 text-center">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Loading agent analysis...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
        <p className="text-zinc-400 mb-6">Could not find an agent profile for &quot;{params.id}&quot;.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all 25 profiles
        </Link>
      </div>
    );
  }

  const rankings = computeRankingsForPerson(profile.id, allProfiles);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all 25 Profiles
      </Link>

      {/* Main Profile Header */}
      <div className="rounded-3xl bg-zinc-900/80 border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-rose-500/30 shadow-2xl"
          />

          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Agent Profile Analysis
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {profile.name}
            </h1>
            <p className="text-base text-zinc-300 mt-1">
              {profile.title}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Location: {profile.location}
            </p>

            {/* Official Source Links */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
              >
                LinkedIn Profile
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={profile.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-600/20 text-pink-300 border border-pink-500/30 hover:bg-pink-600/30 transition-colors"
              >
                Public Instagram
                <ExternalLink className="w-3 h-3" />
              </a>

              <Link
                href={`/dates?agentA=${profile.id}&agentB=${rankings[0]?.candidate?.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all hover:scale-105"
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                Date Top Match Now
              </Link>
            </div>
          </div>
        </div>

        {/* Synthesis statement */}
        <div className="mt-8 p-5 rounded-2xl bg-white/[0.03] border border-white/5 relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
            Agent Persona Synthesis
          </span>
          <p className="text-sm text-zinc-200 leading-relaxed italic">
            &quot;{profile.agentSummary}&quot;
          </p>
        </div>
      </div>

      {/* Grid of Agent Analysis: Needs, Hobbies, Interests, Qualities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Needs Section */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Extracted Needs</h2>
              <p className="text-xs text-zinc-400">What this person truly requires in a partner</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {profile.needs.map((need, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                <CheckCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <span>{need}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Hobbies Section */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Hobbies & Passions</h2>
              <p className="text-xs text-zinc-400">Activities that bring them energy and flow</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {profile.hobbies.map((hobby, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <span>{hobby}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interests Section */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Intellectual Interests</h2>
              <p className="text-xs text-zinc-400">Domains and ideas they love discussing</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {profile.interests.map((interest, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                <span>{interest}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Other Qualities Found */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Other Qualities & Vibe</h2>
              <p className="text-xs text-zinc-400">Personality traits, values, and dealbreakers</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Communication Style:</span>
              <p className="text-zinc-200 mt-0.5">{profile.qualities?.communicationStyle}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Energy & Humor:</span>
              <p className="text-zinc-200 mt-0.5">{profile.qualities?.energy} · {profile.qualities?.humor}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Core Values:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.qualities?.values?.map((val, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-emerald-300">
                    {val}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Key Dealbreakers:
              </span>
              <ul className="mt-1 space-y-1">
                {profile.dealbreakers?.map((d, i) => (
                  <li key={i} className="text-zinc-400 flex items-center gap-1.5">
                    <XCircle className="w-3 h-3 text-rose-500 flex-shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Section For This Person */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-400" />
              Rankings: Who Fits {profile.name} Best?
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Calculated across Values, Lifestyle, Intellect, and Conversation Vibe
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {rankings.slice(0, 8).map((match, rankIdx) => (
            <div
              key={match.candidate.id}
              className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  rankIdx === 0 
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' 
                    : rankIdx === 1 
                    ? 'bg-zinc-300 text-black' 
                    : rankIdx === 2 
                    ? 'bg-amber-700 text-white' 
                    : 'bg-white/5 text-zinc-400'
                }`}>
                  #{rankIdx + 1}
                </div>

                <img
                  src={match.candidate.avatar}
                  alt={match.candidate.name}
                  className="w-12 h-12 rounded-xl object-cover border border-white/10"
                />

                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {match.candidate.name}
                    <span className="text-[10px] font-medium text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                      {match.verdict}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {match.candidate.title}
                  </p>
                </div>
              </div>

              {/* Score pill & actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <div className="text-lg font-black text-rose-400">
                    {match.score}%
                  </div>
                  <div className="text-[10px] text-zinc-500">Compatibility</div>
                </div>

                <Link
                  href={`/dates?agentA=${profile.id}&agentB=${match.candidate.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  Watch Date
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
