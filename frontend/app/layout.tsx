import type { Metadata } from 'next';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'MealMate – Find Your Next Favourite Dish',
  description: 'Discover authentic local food spots, hidden street food vendors, and regional dishes near you. Search by dish, not just restaurant.',
  themeColor: '#FF6B35',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  manifest: '/manifest.json',
  openGraph: {
    title: 'MealMate',
    description: 'Dish-first food discovery platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface-darker text-white antialiased">
        <AuthProvider>
          <main className="mobile-frame min-h-screen relative">
            {children}
          </main>
          <div className="mobile-frame">
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
