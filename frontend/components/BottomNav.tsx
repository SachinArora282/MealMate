'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, Bookmark, User } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/onboarding', label: 'Add', icon: PlusCircle },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50">
      {/* Blur backdrop */}
      <div className="absolute inset-0 backdrop-blur-xl bg-surface-dark/90 border-t border-white/10" />
      <div className="relative flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          const isAdd = label === 'Add';
          return (
            <Link key={href} href={href} className="bottom-nav-item">
              {isAdd ? (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-gradient shadow-orange -mt-6">
                  <Icon size={24} className="text-white" />
                </div>
              ) : (
                <>
                  <div className={`relative p-2 rounded-xl transition-all duration-200 ${isActive ? 'bg-brand-orange/20' : 'hover:bg-white/5'}`}>
                    <Icon
                      size={22}
                      className={`transition-colors duration-200 ${isActive ? 'text-brand-orange' : 'text-white/50'}`}
                    />
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-orange" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-brand-orange' : 'text-white/40'}`}>
                    {label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
      {/* Home indicator */}
      <div className="h-safe-area-inset-bottom bg-surface-dark/90" />
    </nav>
  );
}
