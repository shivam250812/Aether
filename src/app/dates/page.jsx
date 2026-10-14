'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  Heart, 
  Flame, 
  Play, 
  RotateCcw, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Coffee, 
  MapPin, 
  Eye, 
  Loader2 
} from 'lucide-react';

function DateSimulatorContent() {
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  const [agentAId, setAgentAId] = useState('');
  const [agentBId, setAgentBId] = useState('');
  const [venue, setVenue] = useState('Specialty Pour-Over Bar & Quiet Cafe');

  const [dateData, setDateData] = useState(null);
  const [isDating, setIsDating] = useState(false);
  const [visibleTurns, setVisibleTurns] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        setProfiles(data);
        const queryA = searchParams.get('agentA');
        const queryB = searchParams.get('agentB');

        const initialA = (queryA && data.find(p => p.id === queryA)) ? queryA : data[0]?.id;
        const initialB = (queryB && data.find(p => p.id === queryB)) ? queryB : data[1]?.id;

        setAgentAId(initialA || '');
        setAgentBId(initialB || '');
        setLoadingProfiles(false);

        // Auto trigger initial date simulation
        if (initialA && initialB) {
          runSimulation(initialA, initialB, 'Specialty Pour-Over Bar & Quiet Cafe');
        }
      })
      .catch(err => {
        console.error(err);
        setLoadingProfiles(false);
      });
  }, [searchParams]);

  const runSimulation = async (aId, bId, venueName) => {
    setIsDating(true);
    setVisibleTurns(0);
    try {
      const res = await fetch('/api/date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentAId: aId, agentBId: bId, venue: venueName })
      });
      const data = await res.json();
      setDateData(data);
      // Reveal all turns or animate
      setVisibleTurns(data.dialogue.length);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDating(false);
    }
  };

  const handleStartSim = () => {
    if (agentAId === agentBId) {
      alert("Please select two different agents to date!");
      return;
    }
    runSimulation(agentAId, agentBId, venue);
  };

  const agentA = profiles.find(p => p.id === agentAId);
  const agentB = profiles.find(p => p.id === agentBId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-3">
          <Flame className="w-3.5 h-3.5" />
          Autonomous Dating Harness
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Watch The Agents Date Each Other
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          The agents date autonomously on their behalf. Inspect real conversational back-and-forth, internal thoughts, chemistry calculation, and match verdict.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10 shadow-xl mb-8 backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Agent A */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Select Agent A
            </label>
            <select
              value={agentAId}
              onChange={(e) => setAgentAId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>

          {/* Agent B */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Select Agent B
            </label>
            <select
              value={agentBId}
              onChange={(e) => setAgentBId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>

          {/* Date Venue */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Select Date Venue
            </label>
            <select
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="Specialty Pour-Over Bar & Quiet Cafe" className="bg-zinc-900 text-white">Specialty Pour-Over Bar & Quiet Cafe</option>
              <option value="Sunset Architectural Walk & Lookout" className="bg-zinc-900 text-white">Sunset Architectural Walk & Lookout</option>
              <option value="Dimly Lit Natural Wine & Tapas Bar" className="bg-zinc-900 text-white">Dimly Lit Natural Wine & Tapas Bar</option>
              <option value="Modern Art Gallery & Rooftop Terrace" className="bg-zinc-900 text-white">Modern Art Gallery & Rooftop Terrace</option>
              <option value="Matcha Lounge & Notebook Brainstorm" className="bg-zinc-900 text-white">Matcha Lounge & Notebook Brainstorm</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Coffee className="w-4 h-4 text-rose-400" />
            <span>Setting: <strong>{venue}</strong></span>
          </div>

          <button
            onClick={handleStartSim}
            disabled={isDating || loadingProfiles}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isDating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Agents Simulating Date...
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 fill-current" />
                Simulate Date Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Date In Progress / Results */}
      {agentA && agentB && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Date Transcript & Dialogue */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header with 2 Person Avatars */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={agentA.avatar}
                  alt={agentA.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400";
                  }}
                  className="w-12 h-12 rounded-xl object-cover border border-rose-500/40"
                />
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    {agentA.name}
                    <span className="text-[10px] text-rose-400 font-mono">(Agent A)</span>
                  </div>
                  <div className="text-xs text-zinc-400 line-clamp-1">{agentA.title}</div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                VS
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="text-sm font-bold text-white flex items-center justify-end gap-1.5">
                    <span className="text-[10px] text-pink-400 font-mono">(Agent B)</span>
                    {agentB.name}
                  </div>
                  <div className="text-xs text-zinc-400 line-clamp-1">{agentB.title}</div>
                </div>
                <img
                  src={agentB.avatar}
                  alt={agentB.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400";
                  }}
                  className="w-12 h-12 rounded-xl object-cover border border-pink-500/40"
                />
              </div>
            </div>

            {/* Conversation Dialogue */}
            <div className="rounded-2xl bg-zinc-950/60 border border-white/10 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                  Live Date Conversation Transcript
                </span>
                <span className="text-[11px] text-zinc-500">
                  {dateData?.dialogue?.length || 0} Turns Completed
                </span>
              </div>

              {isDating ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-zinc-300">Agents are conversing over coffee & testing chemistry...</p>
                </div>
              ) : dateData?.dialogue ? (
                <div className="space-y-6">
                  {dateData.dialogue.slice(0, visibleTurns).map((turn, i) => {
                    const isAgentA = turn.speakerId === agentA.id;
                    const speaker = isAgentA ? agentA : agentB;

                    return (
                      <div
                        key={i}
                        className={`flex gap-3.5 ${isAgentA ? 'flex-row' : 'flex-row-reverse'}`}
                      >
                        <img
                          src={speaker.avatar}
                          alt={speaker.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400";
                          }}
                          className="w-9 h-9 rounded-xl object-cover border border-white/10 flex-shrink-0 mt-1"
                        />

                        <div className={`max-w-[82%] space-y-2 ${isAgentA ? 'items-start' : 'items-end'}`}>
                          {/* Inner Agent Monologue (Thought) */}
                          <div className={`p-2.5 rounded-xl text-[11px] font-mono leading-relaxed border ${
                            isAgentA
                              ? 'bg-rose-950/30 border-rose-500/20 text-rose-300'
                              : 'bg-pink-950/30 border-pink-500/20 text-pink-300'
                          }`}>
                            <span className="font-bold flex items-center gap-1 mb-0.5">
                              <Eye className="w-3 h-3" />
                              {speaker.name}&apos;s Agent Thought:
                            </span>
                            &quot;{turn.thought}&quot;
                          </div>

                          {/* Spoken Message Bubble */}
                          <div className={`p-4 rounded-2xl text-xs sm:text-sm text-white shadow-md leading-relaxed ${
                            isAgentA 
                              ? 'bg-zinc-900 border border-white/10 rounded-tl-sm' 
                              : 'bg-zinc-800 border border-white/10 rounded-tr-sm'
                          }`}>
                            <div className="text-[10px] font-bold text-zinc-400 mb-1">
                              {turn.speakerName}
                            </div>
                            {turn.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Column: Chemistry Score & Analysis Breakdown */}
          {dateData && (
            <div className="space-y-6">
              {/* Main Score Card */}
              <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10 relative overflow-hidden text-center shadow-xl">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Date Chemistry Verdict
                </div>
                <div className="text-5xl font-black gradient-text my-2">
                  {dateData.compatibility.score}%
                </div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  {dateData.compatibility.verdict}
                </div>

                {/* Score breakdown bars */}
                <div className="mt-6 space-y-3 text-left">
                  <div>
                    <div className="flex justify-between text-xs text-zinc-300 mb-1">
                      <span>Shared Values & Morals</span>
                      <span className="font-bold">{dateData.compatibility.breakdown.values}%</span>
                    </div>
                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${dateData.compatibility.breakdown.values}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-zinc-300 mb-1">
                      <span>Lifestyle & Rhythm</span>
                      <span className="font-bold">{dateData.compatibility.breakdown.lifestyle}%</span>
                    </div>
                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${dateData.compatibility.breakdown.lifestyle}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-zinc-300 mb-1">
                      <span>Intellectual Chemistry</span>
                      <span className="font-bold">{dateData.compatibility.breakdown.intellect}%</span>
                    </div>
                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: `${dateData.compatibility.breakdown.intellect}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-zinc-300 mb-1">
                      <span>Conversation Vibe</span>
                      <span className="font-bold">{dateData.compatibility.breakdown.vibe}%</span>
                    </div>
                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${dateData.compatibility.breakdown.vibe}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Green Flags Detected */}
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                  <CheckCircle2 className="w-4 h-4" />
                  Green Flags Detected
                </div>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {dateData.greenFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Watchout considerations */}
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  Agent Watchout Notes
                </div>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {dateData.watchouts.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <Link
                  href="/rankings"
                  className="inline-block text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  View Global Compatibility Rankings &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DateSimulatorPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-zinc-400">Loading Date Simulator...</div>}>
      <DateSimulatorContent />
    </Suspense>
  );
}
