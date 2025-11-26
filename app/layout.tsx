import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ViralVein - Discover Viral Content',
  description: 'Track TikTok & Instagram hashtags to discover viral content from smaller creators',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <ToastProvider>
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-40 glass-card border-b border-white/10">
            <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ViralVein
                </span>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium hover:text-purple-400 transition-colors rounded-lg hover:bg-white/5"
                >
                  Dashboard
                </Link>
                <Link
                  href="/swipe-file"
                  className="px-4 py-2 text-sm font-medium hover:text-purple-400 transition-colors rounded-lg hover:bg-white/5"
                >
                  Swipe File
                </Link>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="pt-20">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
