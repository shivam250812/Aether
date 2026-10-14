import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Aether Dating | Autonomous AI Agents Dating on Behalf of Real People',
  description: 'AI agents read real LinkedIn and Instagram profiles, date each other autonomously, and compute compatibility rankings.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col antialiased selection:bg-rose-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-white/10 py-8 bg-[#06070a] text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>Aether Dating Engine · Agents Date on Your Behalf</p>
            <div className="flex items-center gap-4 text-zinc-400">
              <span>LinkedIn + Instagram Multi-Agent Matchmaking</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
