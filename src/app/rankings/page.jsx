'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Sparkles, 
  Heart, 
  Flame, 
  ExternalLink, 
  CheckCircle, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';
import { computeRankingsForPerson } from '@/lib/dating-engine';

export default function RankingsPage() {
  const [profiles, setProfiles] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        setProfiles(data);
        if (data.length > 0) {
          setSelectedPersonId(data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const selectedPerson = profiles.find(p => p.id === selectedPersonId);
  const rankings = selectedPerson ? computeRankingsForPerson(selectedPerson.id, profiles) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Compatibility Leaderboard
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Compatibility Rankings For Every Person
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          For each of the 25 people, the dating harness evaluates all possible pairings across Values, Lifestyle, Intellect, and Conversation Vibe to determine their top fits.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">Calculating rankings for all 25 profiles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Selector of 25 People */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 px-1">
              Select Person ({profiles.length})
            </h2>

            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {profiles.map(person => {
                const isSelected = person.id === selectedPersonId;
                return (
                  <button
                    key={person.id}
                    onClick={() => setSelectedPersonId(person.id)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 border border-rose-500/40 text-white shadow-md'
                        : 'bg-zinc-900/40 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{person.name}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{person.location}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Ranked Matches for the Selected Person */}
          <div className="lg:col-span-3">
            {selectedPerson && (
              <div>
                {/* Active Person Banner */}
                <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedPerson.avatar}
                      alt={selectedPerson.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-rose-500/30"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {selectedPerson.name}
                        <span className="text-xs font-normal text-zinc-400">({selectedPerson.location})</span>
                      </h2>
                      <p className="text-xs text-zinc-400 line-clamp-1">{selectedPerson.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Link
                          href={`/profile/${selectedPerson.id}`}
                          className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          View Full Agent Profile &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Ranked Against</span>
                    <span className="text-lg font-bold text-white">{rankings.length} Candidates</span>
                  </div>
                </div>

                {/* Ranked List */}
                <div className="space-y-3">
                  {rankings.map((match, rankIdx) => (
                    <div
                      key={match.candidate.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        rankIdx === 0
                          ? 'bg-gradient-to-r from-rose-950/40 via-zinc-900/80 to-zinc-900/80 border-rose-500/40 shadow-xl'
                          : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Person Info */}
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                            rankIdx === 0
                              ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
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
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white">
                                {match.candidate.name}
                              </h3>
                              <span className="text-[10px] font-semibold text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                                {match.verdict}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                              {match.candidate.title}
                            </p>
                          </div>
                        </div>

                        {/* Scores & Actions */}
                        <div className="flex items-center gap-6 justify-between md:justify-end">
                          {/* Mini breakdown */}
                          <div className="hidden sm:flex items-center gap-4 text-center">
                            <div>
                              <div className="text-xs font-bold text-zinc-200">{match.breakdown.values}%</div>
                              <div className="text-[9px] text-zinc-500 uppercase">Values</div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-zinc-200">{match.breakdown.lifestyle}%</div>
                              <div className="text-[9px] text-zinc-500 uppercase">Lifestyle</div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-zinc-200">{match.breakdown.intellect}%</div>
                              <div className="text-[9px] text-zinc-500 uppercase">Intellect</div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-zinc-200">{match.breakdown.vibe}%</div>
                              <div className="text-[9px] text-zinc-500 uppercase">Vibe</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-black text-rose-400 leading-tight">
                              {match.score}%
                            </div>
                            <div className="text-[10px] text-zinc-500">Compatibility</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dates?agentA=${selectedPerson.id}&agentB=${match.candidate.id}`}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all hover:scale-105"
                            >
                              <Flame className="w-3.5 h-3.5 fill-current" />
                              Watch Date
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
