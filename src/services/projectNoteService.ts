/**
 * MF-1 Step 1: Idea and Direction Notes Service (Admin & Creator alignment)
 */
import { apiClient, type ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { ProjectNote, SendProjectNoteInput } from '@/types/projectNote';

const R = API_ROUTES.PRODUCTION;

const localNotes: Record<string, ProjectNote[]> = {};

function getLocalNotes(projectId: string): ProjectNote[] {
  if (!localNotes[projectId]) {
    localNotes[projectId] = [
      {
        id: `note-${projectId}-1`,
        projectId,
        senderId: 'admin-01',
        sender: {
          id: 'admin-01',
          fullName: 'Ban Điều Hành Admin',
          email: 'admin@aicinema.example',
          role: 'ADMIN',
        },
        message: 'Dự án này sàn muốn tập trung vào phong cách Cyberpunk pha trộn kiến trúc Sài Gòn xưa. Creator lưu ý tạo phân cảnh có chiều sâu ánh sáng neon và âm thanh ambient nhé.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: `note-${projectId}-2`,
        projectId,
        senderId: 'creator-01',
        sender: {
          id: 'creator-01',
          fullName: 'Lê Minh Tuấn',
          email: 'creator@aicinema.example',
          role: 'CREATOR',
        },
        message: 'Đã nhận định hướng từ Admin! Em sẽ lên concept art chợ Bến Thành và cầu Ba Son năm 2077 và nộp kịch bản phân cảnh 2 tập đầu vào ngày mai.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ];
  }
  return localNotes[projectId];
}

export const projectNoteService = {
  listNotes: (projectId: string): Promise<ApiResponse<ProjectNote[]>> =>
    apiClient.get<ProjectNote[]>(R.PROJECT_NOTES(projectId), {}, () => getLocalNotes(projectId)),

  sendNote: (projectId: string, input: SendProjectNoteInput): Promise<ApiResponse<ProjectNote>> =>
    apiClient.post<ProjectNote>(R.PROJECT_NOTES(projectId), input, {}, () => {
      const notes = getLocalNotes(projectId);
      const newNote: ProjectNote = {
        id: `note-${projectId}-${Date.now()}`,
        projectId,
        senderId: 'current-user',
        sender: {
          id: 'current-user',
          fullName: 'Tôi',
          email: 'me@aicinema.example',
          role: 'CREATOR',
        },
        message: input.message,
        createdAt: new Date().toISOString(),
      };
      notes.push(newNote);
      return newNote;
    }),
};
