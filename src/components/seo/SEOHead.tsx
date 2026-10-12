import React, { useEffect } from 'react';
import { SEO_CONFIG, SEOMetadata } from '../../config/seo';

interface SEOHeadProps {
  configKey?: keyof typeof SEO_CONFIG;
  customSEO?: Partial<SEOMetadata>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ configKey = 'home', customSEO }) => {
  const baseSEO = SEO_CONFIG[configKey] || SEO_CONFIG.home;
  const seo = { ...baseSEO, ...customSEO };

  useEffect(() => {
    // Set document title
    document.title = seo.title;

    // Helper to update or create meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('description', seo.description);
    setMetaTag('keywords', seo.keywords);
    setMetaTag('og:title', seo.ogTitle, true);
    setMetaTag('og:description', seo.ogDescription, true);
    setMetaTag('og:type', seo.ogType, true);
    setMetaTag('robots', 'index, follow');

    // Set canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}${seo.canonicalPath}`);

    // Set JSON-LD Schema.org Structured Data
    let schemaScript = document.querySelector('script[data-schema="kilifa-hotel"]');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.setAttribute('data-schema', 'kilifa-hotel');
      document.head.appendChild(schemaScript);
    }
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Hotel',
      name: 'Kilifa Suites',
      description: seo.description,
      url: window.location.origin,
      telephone: '+2207001234',
      priceRange: 'D 2,500',
      currenciesAccepted: 'GMD',
      paymentAccepted: 'Cash, Mobile Money (Wave, Afrimoney), Credit Card, Bank Transfer',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Main Highway Link, Tabokoto Area',
        addressLocality: 'Soma',
        addressRegion: 'Lower River Region',
        addressCountry: 'GM',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 13.4333,
        longitude: -15.5333,
      },
      containsPlace: [
        {
          '@type': 'HotelRoom',
          name: 'Executive Suite',
          numberOfRooms: 12,
          occupancy: {
            '@type': 'QuantitativeValue',
            maxValue: 4,
          },
          offers: {
            '@type': 'Offer',
            price: '2500',
            priceCurrency: 'GMD',
            availability: 'https://schema.org/InStock',
          },
        },
      ],
    };
    schemaScript.textContent = JSON.stringify(structuredData);
  }, [seo]);

  return null;
};
