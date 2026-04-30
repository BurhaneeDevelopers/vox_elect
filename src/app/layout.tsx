import type { Metadata } from 'next';
import { providers as Providers } from '@/components/ui/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoxElect — Your AI Election Guide',
  description:
    'Meet Elara, your civic companion. Ask anything about elections, voting, candidates, and civic processes. Powered by Google Gemini.',
  keywords: [
    'elections',
    'voting',
    'civic education',
    'voter registration',
    'election guide',
    'AI chatbot',
    'Google Gemini',
  ],
  openGraph: {
    title: 'VoxElect — Your AI Election Guide',
    description:
      'Meet Elara, your civic companion. Ask anything about elections, voting, and civic processes.',
    type: 'website',
  },
};

export default function root_layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
