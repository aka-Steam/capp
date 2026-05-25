import { withBase } from './config';

export interface NormalizedPhoto {
  src: string;
  alt: string;
}

export interface PhotoInputObject {
  file?: string;
  src?: string;
  url?: string;
  alt?: string;
}

/**
 * @param imageRoot — URL prefix for local files, e.g. `/images/attractions/`
 */
export function normalizePhotos(
  photos: unknown,
  baseUrl: string,
  imageRoot: string,
): NormalizedPhoto[] {
  if (!photos || !Array.isArray(photos)) return [];

  const root = imageRoot.endsWith('/') ? imageRoot : `${imageRoot}/`;

  return photos
    .map((item, index) => {
      if (typeof item === 'string') {
        if (/^https?:\/\//i.test(item)) {
          return { src: item, alt: '' };
        }
        const path = item.startsWith('/') ? item : `${root}${item}`;
        return { src: withBase(path, baseUrl), alt: '' };
      }

      if (item && typeof item === 'object') {
        const o = item as PhotoInputObject;
        if (o.url) {
          return { src: o.url, alt: o.alt ?? '' };
        }
        if (o.src) {
          const path = o.src.startsWith('/') ? o.src : `${root}${o.src}`;
          return { src: withBase(path, baseUrl), alt: o.alt ?? '' };
        }
        if (o.file) {
          const path = `${root}${o.file}`;
          return { src: withBase(path, baseUrl), alt: o.alt ?? '' };
        }
      }

      return null;
    })
    .filter((p): p is NormalizedPhoto => p !== null);
}

export function photosToGalleryHtml(photos: NormalizedPhoto[]): string {
  if (photos.length === 0) return '';
  const items = photos
    .map(
      (p) =>
        `<figure class="photo-gallery__item"><img src="${escapeAttr(p.src)}" alt="${escapeAttr(p.alt)}" loading="lazy" decoding="async" /></figure>`,
    )
    .join('');
  return `<div class="photo-gallery">${items}</div>`;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
