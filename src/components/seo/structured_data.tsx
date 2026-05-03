/**
 * Structured Data (JSON-LD) component for SEO
 * Provides rich search results for Google
 */

import Script from 'next/script';

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description: string;
  sameAs?: string[];
}

interface WebApplicationSchemaProps {
  name: string;
  url: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}

/**
 * Organization structured data
 * Helps Google understand your organization
 */
export function OrganizationSchema({ name, url, logo, description, sameAs = [] }: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs,
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Web Application structured data
 * Helps Google understand your web app
 */
export function WebApplicationSchema({ name, url, description, applicationCategory, operatingSystem, offers }: WebApplicationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    description,
    applicationCategory,
    operatingSystem,
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: offers || {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <Script
      id="webapp-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * FAQ structured data
 * Shows FAQ in search results
 */
export function FAQSchema({ questions }: { questions: Array<{ question: string; answer: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
