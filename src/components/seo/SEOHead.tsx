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

    // Clean up title on unmount if needed
  }, [seo]);

  return null;
};
