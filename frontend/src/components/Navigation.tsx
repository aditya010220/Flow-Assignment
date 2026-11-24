'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: 'dashboard' },
    { href: '/scans/new', label: 'New Scan', icon: 'add_circle' },
    { href: '/history', label: 'History', icon: 'history' },
    { href: '/how-scores-work', label: 'Rubric', icon: 'description' },
  ];

  return (
    <header className="border-b border-black/15 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-black font-bold text-lg tracking-tight">
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              account_tree
            </span>
            <span>FlowLens</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-black/70 hover:text-black hover:bg-black/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/scans/new"
            className="flex items-center gap-1.5 bg-black text-white px-3.5 py-1.5 rounded text-sm font-medium hover:bg-black/85 transition"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              add
            </span>
            <span>Run Audit</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
