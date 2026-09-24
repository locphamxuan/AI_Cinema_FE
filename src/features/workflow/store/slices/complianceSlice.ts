import type { StateCreator } from 'zustand';
import { ComplianceCheck, AIContentLabel, Publication } from '@/types/workflow';
import type { ComplianceSlice, WorkflowStoreState } from '../types';
import { withProjectUpdate } from './projectRoster';
import { workflowService } from '@/services/workflowService';
import {
  EMPTY_COMPLIANCE_CHECKS,
  EMPTY_LABELS,
  EMPTY_PUBLICATIONS,
} from '../emptyState';

export const createComplianceSlice: StateCreator<WorkflowStoreState, [], [], ComplianceSlice> = (set, get) => ({
  complianceChecks: EMPTY_COMPLIANCE_CHECKS,
  labels: EMPTY_LABELS,
  publications: EMPTY_PUBLICATIONS,

  saveComplianceCheck: (packageId, data, labelData) => {
    // A failed check must go back to the Creator (request changes), never be recorded as passed.
    if (data.article_44_passed === false || data.decree142_passed === false || data.watermark_verified === false) return;

    const compliance: ComplianceCheck = {
      id: `comp-${Date.now()}`,
      episode_package_id: packageId,
      checker_id: 'rev-user-01',
      checker_name: 'Lê Quốc Bảo',
      article_44_passed: data.article_44_passed ?? true,
      decree142_passed: data.decree142_passed ?? true,
      watermark_verified: data.watermark_verified ?? true,
      moderation_score: data.moderation_score ?? 99.4,
      ai_content_percentage: data.ai_content_percentage ?? 100,
      status: 'passed',
      notes: data.notes || 'Đã kiểm định đầy đủ tiêu chuẩn nhãn dán định danh AI.',
      checked_at: new Date().toISOString(),
    };

    const label: AIContentLabel = {
      id: `lbl-${Date.now()}`,
      episode_package_id: packageId,
      label_type: labelData?.label_type || 'AI_GENERATED_FULL',
      label_text: labelData?.label_text || 'Nội dung tạo 100% bằng Trí tuệ Nhân tạo - Tuân thủ Điều 44 Luật AI & Nghị định 142/2024/NĐ-CP.',
      display_location: labelData?.display_location || 'INTRO_OUTRO',
      ruleset_version: labelData?.ruleset_version || 'DECREE_142_2024_V1',
      certification_id: labelData?.certification_id || `AI-VN-2026-CINEMA-${Math.floor(1000 + Math.random() * 9000)}`,
      is_active: true,
    };

    set((state) => ({
      complianceChecks: {
        ...state.complianceChecks,
        [packageId]: compliance,
      },
      labels: {
        ...state.labels,
        [packageId]: label,
      },
      ...withProjectUpdate(state, (project) => ({
        ...project,
        updated_at: new Date().toISOString(),
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'COMPLIANCE_PASSED',
            updated_at: new Date().toISOString(),
          };
        }),
      })),
    }));
  },

  scheduleAndPublish: (packageId, data) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return;

    const publication: Publication = {
      id: `pub-${Date.now()}`,
      episode_package_id: packageId,
      movie_catalog_id: 'movie-001',
      title: pkg.title,
      scheduled_at: data.scheduled_at,
      published_at: new Date().toISOString(),
      visibility: data.visibility,
      platform_channels: data.channels,
      streaming_url: pkg.video_draft_url || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      quality: '4K Ultra HD',
    };

    // Trigger backend publication flow
    workflowService.createPublication(packageId, {
      packageId,
      publishedById: '1deebe95-e8ca-49aa-bd4d-c44489f9964f',
      scheduledAt: data.scheduled_at,
    }).then((res) => {
      if (res.success && res.data?.id) {
        workflowService.publishEpisode(res.data.id).catch((e) => console.warn('Publish episode API call:', e));
      }
    }).catch((e) => console.warn('Create publication API call:', e));

    set((state) => ({
      publications: {
        ...state.publications,
        [packageId]: publication,
      },
      ...withProjectUpdate(state, (project) => {
        const episodes = project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return { ...ep, status: 'PUBLISHED' as const, updated_at: new Date().toISOString() };
        });
        const allPublished = episodes.every((ep) => ep.status === 'PUBLISHED');
        return {
          ...project,
          episodes,
          overall_status: allPublished ? 'COMPLETED' : project.overall_status,
          progress_percent: allPublished ? 100 : project.progress_percent,
          updated_at: new Date().toISOString(),
        };
      }),
    }));
  },
});
