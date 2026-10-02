/** Request bodies of the MF-1 API (the backend DTOs). */
import type { AgeRating, LabelType } from './production-enums';
import type { AiDisclosure } from './production-media';

export interface NewEpisodeInput {
  title: string;
  targetDurationSeconds: number;
  /** YYYY-MM-DD, set by the Reviewer; the studio due date cannot be later. */
  milestoneDate: string;
  synopsis?: string;
}

export interface NewSeasonInput {
  title?: string;
  episodes: NewEpisodeInput[];
}

export interface CreateProjectInput {
  title: string;
  ideaDescription: string;
  genreIds: string[];
  defaultLanguage?: string;
  seasons: NewSeasonInput[];
}

export interface UpdateProjectInput {
  title?: string;
  ideaDescription?: string;
  genreIds?: string[];
  defaultLanguage?: string;
  synopsis?: string;
  ageRating?: AgeRating;
  releaseYear?: number;
}

export interface StudioInput {
  studioName: string;
  studioEmail: string;
  studioContact?: string;
}

export interface DueDateInput {
  episodeId: string;
  /** YYYY-MM-DD */
  dueDate: string;
}

export interface MediaMetadataInput {
  proposedLabelType: LabelType;
  submissionNote?: string;
  aiDisclosure: AiDisclosure;
}

export interface ComplianceInput {
  decree142Notice: { result: 'PASS' | 'FAIL'; failureReason?: string };
  contentSafety: { result: 'PASS' | 'FAIL'; failureReason?: string };
  depictsRealPersonOrEvent: boolean;
  realPersonNote?: string;
}
