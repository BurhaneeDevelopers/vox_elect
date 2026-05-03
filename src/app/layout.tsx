import type { Metadata } from 'next';
import Script from 'next/script';
import { providers as Providers } from '@/components/ui/providers';
import { OrganizationSchema, WebApplicationSchema } from '@/components/seo/structured_data';
import { GOOGLE_ANALYTICS_ID } from '@/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  title: 'Elora — AI Election Guide | Non-Partisan Voting Information',
  description:
    'Meet Elora, your AI-powered civic companion. Get accurate, non-partisan information about elections, voting processes, candidates, and civic education. Powered by Google Gemini.',
  keywords: [
    'elections',
    'voting',
    'civic education',
    'voter registration',
    'election guide',
    'AI chatbot',
    'Google Gemini',
    'non-partisan',
    'voter information',
    'polling places',
    'ballot information',
    'election calendar',
    'civic engagement',
    'democracy',
    'voting rights',
  ],
  authors: [{ name: 'Taheri Developers' }],
  creator: 'Taheri Developers',
  publisher: 'Taheri Developers',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://elora.app',
    siteName: 'Elora',
    title: 'Elora — AI Election Guide | Non-Partisan Voting Information',
    description:
      'Get accurate, non-partisan information about elections, voting, and civic processes. AI-powered civic education chatbot with location-based personalization.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Elora — Your AI Election Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elora — AI Election Guide',
    description:
      'Get accurate, non-partisan information about elections, voting, and civic processes.',
    images: ['/og-image.png'],
    creator: '@elora_app',
  },
  alternates: {
    canonical: 'https://elora.app',
  },
  category: 'Civic Education',
};

export default function root_layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
        
        {/* Structured Data for SEO */}
        <OrganizationSchema
          name="Elora"
          url="https://elora.app"
          description="AI-powered civic companion providing accurate, non-partisan information about elections, voting, and civic education."
          sameAs={['https://twitter.com/elora_app']}
        />
        <WebApplicationSchema
          name="Elora — AI Election Guide"
          url="https://elora.app"
          description="Get accurate, non-partisan information about elections, voting, and civic processes. AI-powered civic education chatbot with location-based personalization."
          applicationCategory="EducationalApplication"
          operatingSystem="Any"
        />
        
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
