import type { Plugin } from 'vite';
import { BRAND_LOGO_IMAGE_URL } from './shared/site-seo';

/**
 * Keep the built document's social preview pointed at Burem's canonical logo.
 */
export function metaImagesPlugin(): Plugin {
  return {
    name: 'vite-plugin-meta-images',
    transformIndexHtml(html) {
      log('[meta-images] keeping Burem logo image:', BRAND_LOGO_IMAGE_URL);

      html = html.replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/g,
        `<meta property="og:image" content="${BRAND_LOGO_IMAGE_URL}" />`
      );

      html = html.replace(
        /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/g,
        `<meta name="twitter:image" content="${BRAND_LOGO_IMAGE_URL}" />`
      );

      return html;
    },
  };
}

function log(...args: any[]): void {
  if (process.env.NODE_ENV === 'production') {
    console.log(...args);
  }
}
