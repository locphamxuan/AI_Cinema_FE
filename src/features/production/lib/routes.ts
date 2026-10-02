import type { WebRole } from '@/lib/permissions';

/** Production lives under /creator for Content Creators and under /reviewer for Reviewers and the Admin. */
export type ProductionBase = '/creator' | '/reviewer';

export function productionBaseFor(role: WebRole | undefined): ProductionBase {
  return role === 'creator' ? '/creator' : '/reviewer';
}

export function baseFromPath(pathname: string): ProductionBase {
  return pathname.startsWith('/creator') ? '/creator' : '/reviewer';
}

export const productionPaths = {
  list: (base: ProductionBase) => `${base}/projects`,
  project: (base: ProductionBase, movieId: string, tab?: string) =>
    `${base}/projects/${movieId}${tab ? `?tab=${tab}` : ''}`,
  episode: (base: ProductionBase, movieId: string, episodeId: string) => `${base}/projects/${movieId}/episodes/${episodeId}`,
};

/**
 * Turns the link a backend notification carries (`/projects/:id/episodes/:id`, `/projects/:id/studio`,
 * `/admin/price-alerts`, …) into a page of this web app for the signed-in role.
 */
export function notificationHref(link: string | null, role: WebRole | undefined): string | null {
  if (!link) return null;
  if (link.startsWith('/admin/price-alerts')) return '/admin?tab=price-alerts';
  if (link === '/tokens') return '/reviewer/tokens';
  const match = /^\/projects\/([^/?#]+)(?:\/(episodes)\/([^/?#]+)|\/([a-z-]+))?/.exec(link);
  if (!match) return link.startsWith('/') ? link : null;
  const [, movieId, , episodeId, section] = match;
  const base = productionBaseFor(role);
  if (episodeId) return productionPaths.episode(base, movieId, episodeId);
  const tab = section === 'change-requests' ? 'changes' : section;
  return productionPaths.project(base, movieId, tab);
}
