'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Users, Sparkles, Trophy, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '25 Profiles', icon: Users },
    { href: '/dates', label: 'Agents Dating', icon: Sparkles },
    { href: '/rankings', label: 'Rankings', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090a0f]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Aether <span className="text-rose-400 font-mono text-sm px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">Agent Dating</span>
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/#analyze-form"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Person</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
