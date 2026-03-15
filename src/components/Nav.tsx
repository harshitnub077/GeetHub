import Link from 'next/link';
import { Guitar } from 'lucide-react';

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between lg:max-w-6xl">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Guitar className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">Geethub</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/songs" className="hover:text-foreground transition-colors">Songbook</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Explore</Link>
          <a href="https://github.com/harshitnub077" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
        </div>
      </div>
    </nav>
  );
}
