import { useEffect } from 'react';

const SITE_NAME = 'LGT Imprimerie';
const DEFAULT_DESCRIPTION = "Créez des t-shirts et affiches personnalisés avec l'éditeur en ligne LGT Imprimerie. Qualité premium, livraison rapide en France.";
const BASE_URL = 'https://lgt-imprimerie.com';

const useSEO = ({ title, description, path = '' }) => {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const canonicalUrl = `${BASE_URL}${path}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    setMeta('description', metaDescription);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', metaDescription, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('twitter:title', fullTitle, true);
    setMeta('twitter:description', metaDescription, true);
    setLink('canonical', canonicalUrl);
  }, [fullTitle, metaDescription, canonicalUrl]);
};

export default useSEO;
