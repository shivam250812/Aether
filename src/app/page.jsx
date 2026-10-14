'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ExternalLink, 
  Heart, 
  Search, 
  ArrowRight, 
  Compass, 
  ShieldCheck, 
  Flame, 
  UserPlus, 
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Live ingestion form state
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        setProfiles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleAddPerson = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl, instagramUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze profile');

      setProfiles(prev => [data, ...prev]);
      setSubmitSuccess(`Successfully synthesized agent for ${data.name}! You can now watch their agent date.`);
      setLinkedinUrl('');
      setInstagramUrl('');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.hobbies.some(h => h.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-white/10 bg-gradient-to-b from-rose-950/20 via-[#090a0f] to-[#090a0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous Agentic Dating Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Where AI Agents Date On <span className="gradient-text">Behalf of Real People</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Feed in a <strong className="text-zinc-200">LinkedIn</strong> and a public <strong className="text-zinc-200">Instagram</strong>. 
            An autonomous agent reads their career, needs, and lifestyle, goes on dates with other agents, and calculates compatibility rankings.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dates"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Flame className="w-4 h-4" />
              Watch Agents Date Live
            </Link>
            <Link
              href="/rankings"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all hover:border-white/20"
            >
              View Match Rankings
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-2xl font-bold text-white">25+</div>
              <div className="text-xs text-zinc-400 mt-1">Real Verified People</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-2xl font-bold text-rose-400">2 Links</div>
              <div className="text-xs text-zinc-400 mt-1">LinkedIn + Instagram</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-zinc-400 mt-1">Autonomous Dating</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-2xl font-bold text-emerald-400">Live</div>
              <div className="text-xs text-zinc-400 mt-1">Chemistry & Rankings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Ingestion Section: Paste Links */}
      <section id="analyze-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white">Try It: Analyze Any Person & Let Their Agent Date</h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mb-6">
            Paste any real public LinkedIn profile and public Instagram link. The harness analyzes both sources, extracts their personality and needs, and lets their agent date the roster immediately.
          </p>

          <form onSubmit={handleAddPerson} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Official LinkedIn URL
              </label>
              <input
                type="url"
                required
                placeholder="https://www.linkedin.com/in/username/"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Public Instagram URL
              </label>
              <input
                type="url"
                required
                placeholder="https://www.instagram.com/username/"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-zinc-500">
                Reads: Needs, Hobbies, Interests, Core Qualities, Dealbreakers
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Agent Reading Profiles...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Synthesize Agent & Add to Pool
                  </>
                )}
              </button>
            </div>
          </form>

          {submitSuccess && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}

          {submitError && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {submitError}
            </div>
          )}
        </div>
      </section>

      {/* Profiles Roster Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-rose-400" />
              The 25 Real People & Their Agents
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Every person is verified with two official links: LinkedIn and public Instagram. Click any profile to inspect the agent&apos;s full analysis.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, hobby, interest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-zinc-400">Loading 25 agent personas and profiles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((person) => (
              <div
                key={person.id}
                className="group relative rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-rose-500/40 p-5 transition-all hover:shadow-xl hover:shadow-rose-950/20 flex flex-col justify-between"
              >
                <div>
                  {/* Top card header */}
                  <div className="flex items-start gap-4">
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover:border-rose-500/50 transition-colors shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white truncate group-hover:text-rose-300 transition-colors">
                        {person.name}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                        {person.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <a
                          href={person.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                        >
                          LinkedIn
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a
                          href={person.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500/20 transition-colors"
                        >
                          Instagram
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Agent summary statement */}
                  <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Agent Analysis Synthesis
                    </div>
                    <p className="text-xs text-zinc-300 line-clamp-2 italic">
                      &quot;{person.agentSummary}&quot;
                    </p>
                  </div>

                  {/* Extracted Needs & Hobbies tags */}
                  <div className="mt-4 space-y-2">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium block mb-1">
                        Core Needs:
                      </span>
                      <p className="text-xs text-zinc-200 line-clamp-1">
                        • {person.needs[0]}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium block mb-1">
                        Hobbies & Passions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {person.hobbies.slice(0, 2).map((hobby, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-zinc-300"
                          >
                            {hobby}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <Link
                    href={`/profile/${person.id}`}
                    className="flex-1 text-center px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
                  >
                    View Analysis
                  </Link>
                  <Link
                    href={`/dates?agentA=${person.id}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600/90 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/20 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    Watch Dating
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
