/** The Admin's film management: hearts, plays and Coin earned per movie and episode, by genre. */
import type { FilmFigures, FilmGenreTab } from '@/types/film-report';
import { apiClient } from './apiClient';

export const filmReportService = {
  genres: () => apiClient.get<FilmGenreTab[]>('/admin/films/genres'),
  movies: (genreId: string) => apiClient.get<FilmFigures[]>(`/admin/films?genreId=${encodeURIComponent(genreId)}`),
};