import { describe, it, expect } from 'vitest';
import { movieService } from '@/services/movieService';

describe('Movie Service (src/services/movieService.ts)', () => {
  it('fetches all movies', async () => {
    const res = await movieService.getMovies();
    expect(res.success).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  });

  it('fetches movie by id', async () => {
    const res = await movieService.getMovieById('movie-001');
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.id).toBe('movie-001');
  });

  it('fetches episode versions history with AI model metadata', async () => {
    const res = await movieService.getEpisodeVersions('movie-001', 'ep-001');
    expect(res.success).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0]).toHaveProperty('aiModel');
    expect(res.data[0]).toHaveProperty('versionNumber');
    expect(res.data[0]).toHaveProperty('changelog');
  });

  it('fetches Article 44 AI compliance metadata', async () => {
    const res = await movieService.getComplianceInfo('movie-001');
    expect(res.success).toBe(true);
    expect(res.data).toHaveProperty('complianceArticle');
    expect(res.data).toHaveProperty('moderationScore');
    expect(res.data).toHaveProperty('disclaimer');
  });
});
