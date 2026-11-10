/**
 * MF-1 Script Workflow Service (Creator writes, Reviewer reviews, Admin approves Final Script)
 */
import { apiClient, type ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type {
  FinalReviewScriptInput,
  ProjectScript,
  ReviewScriptInput,
  ScriptVersion,
  SubmitScriptInput,
} from '@/types/script';

const R = API_ROUTES.PRODUCTION;

const localScripts: Record<string, ProjectScript> = {};

function getLocalScript(projectId: string): ProjectScript {
  if (!localScripts[projectId]) {
    localScripts[projectId] = {
      projectId,
      status: 'SUBMITTED',
      currentVersion: 1,
      finalizedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [
        {
          id: `script-ver-${projectId}-1`,
          projectId,
          version: 1,
          content: 'CẢNH 1 — NỘI. PHÒNG LAB TÂN ĐỊNH — ĐÊM\n\nÁnh đèn neon xanh hắt qua khung kính vỡ. Quân (30 tuổi, điều tra viên) khẽ bước vào, tay siết chặt máy quét lượng tử.\n\nQUÂN\n(thì thầm)\nTín hiệu vẫn còn ở đây...\n\nBất chợt, tiếng bước chân kim loại dội lên từ góc hành lang tối.',
          note: 'Bản thảo kịch bản phân cảnh đầu tiên',
          submittedById: 'creator-01',
          submittedBy: {
            id: 'creator-01',
            fullName: 'Lê Minh Tuấn',
            email: 'creator@aicinema.example',
          },
          createdAt: new Date().toISOString(),
        },
      ],
      reviews: [],
    };
  }
  return localScripts[projectId];
}

export const scriptService = {
  getScript: (projectId: string): Promise<ApiResponse<ProjectScript | null>> =>
    apiClient.get<ProjectScript | null>(R.SCRIPT(projectId), {}, () => getLocalScript(projectId)),

  submitVersion: (projectId: string, input: SubmitScriptInput): Promise<ApiResponse<ScriptVersion>> =>
    apiClient.post<ScriptVersion>(R.SCRIPT_SUBMIT(projectId), input, {}, () => {
      const s = getLocalScript(projectId);
      const newVer: ScriptVersion = {
        id: `script-ver-${projectId}-${s.versions.length + 1}`,
        projectId,
        version: s.versions.length + 1,
        content: input.content,
        note: input.note ?? null,
        submittedById: 'creator-me',
        submittedBy: {
          id: 'creator-me',
          fullName: 'Biên Kịch Nội Bộ',
          email: 'creator@aicinema.example',
        },
        createdAt: new Date().toISOString(),
      };
      s.versions.push(newVer);
      s.currentVersion = newVer.version;
      s.status = 'SUBMITTED';
      return newVer;
    }),

  reviewScript: (projectId: string, input: ReviewScriptInput): Promise<ApiResponse<ProjectScript>> =>
    apiClient.post<ProjectScript>(R.SCRIPT_REVIEW(projectId), input, {}, () => {
      const s = getLocalScript(projectId);
      s.status = input.approve ? 'REVIEWER_APPROVED' : 'REVISION_REQUESTED';
      s.reviews.push({
        id: `review-${Date.now()}`,
        projectId,
        version: s.currentVersion,
        stage: 'REVIEWER',
        approved: input.approve,
        comment: input.comment ?? null,
        reviewerId: 'reviewer-me',
        reviewer: {
          id: 'reviewer-me',
          fullName: 'Trần Gia Huy',
          email: 'reviewer@aicinema.example',
        },
        createdAt: new Date().toISOString(),
      });
      return s;
    }),

  finalReviewScript: (projectId: string, input: FinalReviewScriptInput): Promise<ApiResponse<ProjectScript>> =>
    apiClient.post<ProjectScript>(R.SCRIPT_FINAL_REVIEW(projectId), input, {}, () => {
      const s = getLocalScript(projectId);
      s.status = input.approve ? 'FINAL' : 'REVISION_REQUESTED';
      if (input.approve) {
        s.finalizedAt = new Date().toISOString();
      }
      s.reviews.push({
        id: `final-review-${Date.now()}`,
        projectId,
        version: s.currentVersion,
        stage: 'ADMIN',
        approved: input.approve,
        comment: input.comment ?? null,
        reviewerId: 'admin-me',
        reviewer: {
          id: 'admin-me',
          fullName: 'Executive Admin',
          email: 'admin@aicinema.example',
        },
        createdAt: new Date().toISOString(),
      });
      return s;
    }),
};
