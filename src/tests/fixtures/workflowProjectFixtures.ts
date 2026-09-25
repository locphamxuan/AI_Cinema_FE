import type { ProductionProject } from '@/types/workflow';
import { initialEpisodes, initialProject } from './workflowFixtures';

/** The other projects assigned to the Creator, next to initialProject. */

const mockProjectAncient: ProductionProject = {
  ...initialProject,
  episodes: initialEpisodes.map((ep) =>
    ep.status === 'PLAN_PENDING' ? { ...ep, status: 'IN_PRODUCTION', brief: { ...ep.brief, status: 'IN_PRODUCTION' } } : ep
  ),
  id: 'proj-ancient-02',
  title: 'Huyền Thoại Sơn Tinh Thủy Tinh 2088',
  genre: ['Thần thoại AI', 'Kỹ xảo Visual', 'Hoạt hình 3D'],
  synopsis: 'Tái hiện trận chiến giữa Sơn Tinh và Thủy Tinh trong bối cảnh công nghệ sinh học và kiểm soát thời tiết lượng tử năm 2088.',
  season_count: 2,
  total_episodes: 6,
  total_budget_tokens: 4500,
  allocated_tokens: 1200,
  consumed_tokens: 650,
  deadline: '2026-10-15',
  planned_release_date: '2027-01-10',
  creator_role: 'Đạo diễn Kỹ xảo AI',
  thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
  overall_status: 'CHANGES_REQUESTED',
  active_episode_title: 'Tập 1: Thần Khí Lượng Tử & Lệnh Gọi Sơn Lâm',
  progress_percent: 25,
};

const mockProjectSpace: ProductionProject = {
  ...initialProject,
  id: 'proj-space-03',
  title: 'Hành Trình Sao Vàng: Thiên Hà Mới',
  genre: ['Space Opera', 'Khám phá vũ trụ', 'AI Sci-Fi'],
  synopsis: 'Tàu thám hiểm Việt Nam Star-01 du hành qua lỗ sâu tới hệ hành tinh mới, phát hiện tàn tích của một nền văn minh cổ đại.',
  season_count: 1,
  total_episodes: 4,
  total_budget_tokens: 2800,
  allocated_tokens: 0,
  consumed_tokens: 0,
  deadline: '2026-11-01',
  planned_release_date: '2027-02-20',
  creator_role: 'Trưởng nhóm Kịch bản & Visual Prompt',
  thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  overall_status: 'NOT_STARTED',
  active_episode_title: 'Tập 1: Tín Hiệu Từ Vũ Trụ',
  progress_percent: 0,
};

const mockProjectAgent: ProductionProject = {
  ...initialProject,
  id: 'proj-agent-04',
  title: 'Bóng Đêm Thầm Lặng: AI Agent',
  genre: ['Tình báo', 'Hành động', 'Điệp viên'],
  synopsis: 'Cuộc chiến thầm lặng giữa các điệp viên mạng và tổ chức tội phạm trí tuệ nhân tạo xuyên quốc gia.',
  season_count: 1,
  total_episodes: 3,
  total_budget_tokens: 2000,
  allocated_tokens: 2000,
  consumed_tokens: 1980,
  deadline: '2026-08-15',
  planned_release_date: '2026-09-01',
  creator_role: 'Đạo diễn Sản xuất',
  thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  overall_status: 'COMPLETED',
  active_episode_title: 'Tập 3: Trật Tự Mới (Phim đã phát sóng)',
  progress_percent: 100,
};

export const mockAssignedProjects: ProductionProject[] = [
  initialProject,
  mockProjectAncient,
  mockProjectSpace,
  mockProjectAgent,
];
