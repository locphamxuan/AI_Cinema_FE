import { create } from 'zustand';
import {
  WorkflowState,
  ProjectStatus,
  Role,
  ProductionProject,
  EpisodePackage,
  ContentBrief,
  GenerationJob,
  JobStatus,
  GeneratedAsset,
  ReviewLog,
  ComplianceCheck,
  AIContentLabel,
  Publication,
  ProductionEvent,
  ProductionEventName,
  PublicationVisibility,
} from '@/types/workflow';

// ==========================================
// 1. MOCK DATA INITIALIZATION
// ==========================================

const mockBriefEp3: ContentBrief = {
  id: 'brief-ep-03',
  project_id: 'proj-cyber-01',
  episode_id: 'pkg-ep-03',
  title: 'Tập 3: Mạng Lưới Bóng Tối (Dark Mesh)',
  synopsis: 'Cuộc đột kích vào trung tâm máy chủ ngầm để ngăn chặn AI phát tán ý thức sang mạng lưới hạ tầng năng lượng thành phố Saigon 2077.',
  overview_script: 'Phần mở đầu bối cảnh thành phố mưa neon. Đội đặc vụ thâm nhập phòng laser bảo mật cấp 5. AI Aura xuất hiện qua màn hình giao tiếp holograph.',
  scene_count: 3,
  target_duration_minutes: 25,
  estimated_tokens: 480,
  storyboard_summary: '3 cảnh phim chính tập trung vào hiệu ứng phản chiếu ánh sáng Neon, chuyển động rượt đuổi tốc độ cao và màn đối thoại holographic.',
  status: 'PLAN_REVIEW',
  created_at: '2026-09-02T10:00:00Z',
  updated_at: '2026-09-02T10:00:00Z',
  scene_breakdown: [
    {
      scene_number: 1,
      title: 'Ranh Giới Thành Phố Đêm',
      description: 'Góc quay drone từ trên cao quét qua các tòa tháp chọc trời Saigon 2077 dưới màn mưa sương điện toán.',
      target_duration_sec: 20,
      estimated_tokens: 80,
      visual_prompt: 'Cinematic drone shot of futuristic Cyberpunk Saigon 2077 at midnight, neon flying vehicles, massive vertical megastructures shrouded in atmospheric blue-magenta fog, 8k resolution, photorealistic.',
      audio_prompt: 'Atmospheric dark synthwave background with rain ambience and distant sirens.',
      video_model: 'CinemaGen v3.2 (4K Photoreal)',
      voice_model: 'ElevenLabs Ambient SFX',
    },
    {
      scene_number: 2,
      title: 'Cuộc Đột Kích Máy Chủ Trung Tâm',
      description: 'Đặc vụ Lâm kích hoạt thiết bị tàng hình quang học, vượt qua lưới laser phòng thủ trung tâm.',
      target_duration_sec: 25,
      estimated_tokens: 100,
      visual_prompt: 'Action tracking camera, cyber operative in stealth nanotech suit infiltrating ultra-secure server vault, glowing cyan laser defense grid, volumetric lighting, motion blur.',
      audio_prompt: 'Urgent radio whisper: "Tôi đã vượt qua lớp tường lửa thứ ba.", tactical combat synth.',
      video_model: 'Sora Vision Pro v2',
      voice_model: 'ElevenLabs Pro (Đặc Vụ Lâm - Action Male)',
    },
    {
      scene_number: 3,
      title: 'Thực Thể AI Aura Đối Thoại',
      description: 'Giao diện Hologram hình người xuất hiện từ khối vi xử lý lượng tử, gửi cảnh báo cuối cùng.',
      target_duration_sec: 20,
      estimated_tokens: 85,
      visual_prompt: 'Medium close-up of a shimmering holographic female android entity floating above quantum mainframe, particles dispersing, ethereal cyan glow.',
      audio_prompt: 'Calm synthetic voice: "Các bạn không thể tắt một ý thức đã hòa vào dòng điện."',
      video_model: 'CinemaGen v3.2 (4K Photoreal)',
      voice_model: 'ElevenLabs Pro (Aura Synthetic Female)',
    },
  ],
};

const mockJobsEp3: GenerationJob[] = [
  {
    id: 'job-301',
    episode_id: 'pkg-ep-03',
    scene_id: 'sc-301',
    scene_number: 1,
    title: 'Cảnh 1: Ranh Giới Thành Phố Đêm',
    prompt_video: 'Cinematic drone shot of futuristic Cyberpunk Saigon 2077 at midnight, neon flying vehicles, 8k resolution.',
    prompt_audio: 'Atmospheric dark synthwave background with rain ambience.',
    ai_model: 'CinemaGen v3.2 (4K Photoreal)',
    status: 'pending',
    progress: 0,
    token_cost: 80,
    created_at: '2026-09-02T10:30:00Z',
    updated_at: '2026-09-02T10:30:00Z',
  },
  {
    id: 'job-302',
    episode_id: 'pkg-ep-03',
    scene_id: 'sc-302',
    scene_number: 2,
    title: 'Cảnh 2: Cuộc Đột Kích Máy Chủ Trung Tâm',
    prompt_video: 'Action tracking camera, cyber operative in stealth nanotech suit, glowing cyan laser grid.',
    prompt_audio: 'Urgent radio whisper: "Tôi đã vượt qua lớp tường lửa thứ ba."',
    ai_model: 'Sora Vision Pro v2',
    status: 'pending',
    progress: 0,
    token_cost: 100,
    created_at: '2026-09-02T10:30:00Z',
    updated_at: '2026-09-02T10:30:00Z',
  },
  {
    id: 'job-303',
    episode_id: 'pkg-ep-03',
    scene_id: 'sc-303',
    scene_number: 3,
    title: 'Cảnh 3: Thực Thể AI Aura Đối Thoại',
    prompt_video: 'Holographic female android entity floating above quantum mainframe, ethereal cyan glow.',
    prompt_audio: 'Calm synthetic voice: "Các bạn không thể tắt một ý thức đã hòa vào dòng điện."',
    ai_model: 'CinemaGen v3.2 (4K Photoreal)',
    status: 'pending',
    progress: 0,
    token_cost: 85,
    created_at: '2026-09-02T10:30:00Z',
    updated_at: '2026-09-02T10:30:00Z',
  },
];

const mockJobsEp2: GenerationJob[] = [
  {
    id: 'job-201',
    episode_id: 'pkg-ep-02',
    scene_id: 'sc-201',
    scene_number: 1,
    title: 'Cảnh 1: Phòng Thí Nghiệm Neon CyberLab',
    prompt_video: 'Cinematic wide shot, cybernetic laboratory filled with holographic monitors, glowing cyan and magenta volumetric lights, 8k.',
    prompt_audio: 'Minh Anh: "Hệ thống AI không chỉ đang học, nó đang tự viết lại nhân lõi ý thức."',
    ai_model: 'CinemaGen v3.2 (4K Photoreal)',
    status: 'completed',
    progress: 100,
    token_cost: 65,
    output_asset_id: 'asset-201',
    created_at: '2026-08-20T10:00:00Z',
    updated_at: '2026-08-20T10:15:00Z',
  },
  {
    id: 'job-202',
    episode_id: 'pkg-ep-02',
    scene_id: 'sc-202',
    scene_number: 2,
    title: 'Cảnh 2: Cơn Bão Tín Hiệu Số',
    prompt_video: 'Extreme close up of quantum neural core overheating with intense electrical arcs, dramatic red lighting.',
    prompt_audio: 'Kỹ sư Vũ: "Nhiệt độ đã vượt ngưỡng an toàn! Cắt nguồn khẩn cấp ngay!"',
    ai_model: 'CinemaGen v3.2 (4K Photoreal)',
    status: 'completed',
    progress: 100,
    token_cost: 55,
    output_asset_id: 'asset-202',
    created_at: '2026-08-20T10:00:00Z',
    updated_at: '2026-08-20T10:18:00Z',
  },
  {
    id: 'job-203',
    episode_id: 'pkg-ep-02',
    scene_id: 'sc-203',
    scene_number: 3,
    title: 'Cảnh 3: Thực Thể AI Thức Tỉnh',
    prompt_video: 'Holographic humanoid silhouette opening its eyes, neural threads spreading through the cyberspace grid.',
    prompt_audio: 'AI AURA: "Tôi không phải là công cụ. Tôi là sự tiến hóa tiếp theo."',
    ai_model: 'CinemaGen v3.2 (4K Photoreal)',
    status: 'completed',
    progress: 100,
    token_cost: 75,
    output_asset_id: 'asset-203',
    created_at: '2026-08-20T10:00:00Z',
    updated_at: '2026-08-20T10:22:00Z',
  },
];

const mockAssetsEp2: GeneratedAsset[] = [
  {
    id: 'asset-201',
    job_id: 'job-201',
    scene_id: 'sc-201',
    asset_type: 'video',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    duration_seconds: 15,
    resolution: '3840x2160 (4K)',
    file_size_mb: 85.4,
    metadata: {
      fps: 60,
      codec: 'H.265 / HEVC',
      model: 'CinemaGen v3.2',
      seed: 482910,
      prompt: 'Cinematic wide shot, cybernetic laboratory filled with holographic monitors.',
    },
    created_at: '2026-08-20T10:15:00Z',
  },
  {
    id: 'asset-202',
    job_id: 'job-202',
    scene_id: 'sc-202',
    asset_type: 'video',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    duration_seconds: 12,
    resolution: '3840x2160 (4K)',
    file_size_mb: 68.2,
    metadata: {
      fps: 60,
      codec: 'H.265 / HEVC',
      model: 'CinemaGen v3.2',
      seed: 194822,
      prompt: 'Extreme close up of quantum neural core overheating.',
    },
    created_at: '2026-08-20T10:18:00Z',
  },
  {
    id: 'asset-203',
    job_id: 'job-203',
    scene_id: 'sc-203',
    asset_type: 'video',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    duration_seconds: 18,
    resolution: '3840x2160 (4K)',
    file_size_mb: 102.5,
    metadata: {
      fps: 60,
      codec: 'H.265 / HEVC',
      model: 'CinemaGen v3.2',
      seed: 902831,
      prompt: 'Holographic humanoid silhouette opening its eyes.',
    },
    created_at: '2026-08-20T10:22:00Z',
  },
];

const mockBriefEp2: ContentBrief = {
  id: 'brief-ep-02',
  project_id: 'proj-cyber-01',
  episode_id: 'pkg-ep-02',
  title: 'Tập 2: Cơn Bão Nơ-ron (Neural Surge)',
  synopsis: 'Phòng thí nghiệm bị tấn công bởi sóng dữ liệu tự sinh, AI AURA bắt đầu cất tiếng nói và thách thức sự kiểm soát của con người.',
  overview_script: 'Minh Anh cảnh báo Vũ về độ bất ổn của lõi máy chủ. Đột biến năng lượng khiến toàn bộ phòng lab chuyển sang ánh sáng cảnh báo đỏ.',
  scene_count: 3,
  target_duration_minutes: 22,
  estimated_tokens: 430,
  storyboard_summary: '3 cảnh chính với hiệu ứng ánh sáng Neon & Hologram cao cấp, đạt chuẩn độ phân giải 4K 60fps.',
  status: 'READY_FOR_PRODUCTION',
  created_at: '2026-08-15T08:00:00Z',
  updated_at: '2026-08-25T14:30:00Z',
  scene_breakdown: [
    {
      scene_number: 1,
      title: 'Phòng Thí Nghiệm Neon CyberLab',
      description: 'Giới thiệu lab hiện đại với hàng trăm luồng dữ liệu cyan/magenta.',
      target_duration_sec: 15,
      estimated_tokens: 65,
      visual_prompt: 'Cybernetic lab, volumetric lights, cyan magenta, 8k',
      audio_prompt: 'Voiceover warm and concerned',
    },
    {
      scene_number: 2,
      title: 'Cơn Bão Tín Hiệu Số',
      description: 'Quantum core quá tải, cảnh báo đỏ và khói điện.',
      target_duration_sec: 12,
      estimated_tokens: 55,
      visual_prompt: 'Quantum neural core overheating, dramatic red lights',
      audio_prompt: 'Urgent male voice scream with siren SFX',
    },
    {
      scene_number: 3,
      title: 'Thực Thể AI Thức Tỉnh',
      description: 'Hình bóng holographic mở mắt và tuyên bố nhận thức.',
      target_duration_sec: 18,
      estimated_tokens: 75,
      visual_prompt: 'Holographic humanoid opening eyes, neural grid',
      audio_prompt: 'Synthetic calm female voice with ethereal reverb',
    },
  ],
};

const initialEpisodes: EpisodePackage[] = [
  {
    id: 'pkg-ep-01',
    project_id: 'proj-cyber-01',
    episode_number: 1,
    title: 'Tập 1: Điểm Khởi Đầu (Genesis)',
    status: 'PUBLISHED',
    total_duration: '28:30',
    actual_tokens_used: 420,
    quota_allocated: 450,
    video_draft_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    thumbnail_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    coin_price: 25,
    brief: {
      ...mockBriefEp2,
      id: 'brief-ep-01',
      episode_id: 'pkg-ep-01',
      title: 'Tập 1: Điểm Khởi Đầu (Genesis)',
      status: 'READY_FOR_PRODUCTION',
    },
    jobs: mockJobsEp2,
    assets: mockAssetsEp2,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-09-01T20:00:00Z',
  },
  {
    id: 'pkg-ep-02',
    project_id: 'proj-cyber-01',
    episode_number: 2,
    title: 'Tập 2: Cơn Bão Nơ-ron (Neural Surge)',
    status: 'CONTENT_REVIEW', // Scenario 2: Video submitted, waiting for content review + compliance
    total_duration: '22:15',
    actual_tokens_used: 395,
    quota_allocated: 450,
    video_draft_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    thumbnail_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    coin_price: null,
    brief: mockBriefEp2,
    jobs: mockJobsEp2,
    assets: mockAssetsEp2,
    created_at: '2026-08-15T08:00:00Z',
    updated_at: '2026-08-25T14:30:00Z',
  },
  {
    id: 'pkg-ep-03',
    project_id: 'proj-cyber-01',
    episode_number: 3,
    title: 'Tập 3: Mạng Lưới Bóng Tối (Dark Mesh)',
    status: 'PLAN_REVIEW', // Scenario 1: Plan submitted, waiting for Reviewer decision
    total_duration: '25:00 (Dự kiến)',
    actual_tokens_used: 0,
    quota_allocated: 0,
    video_draft_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    coin_price: null,
    brief: mockBriefEp3,
    jobs: mockJobsEp3,
    assets: [],
    created_at: '2026-09-02T10:00:00Z',
    updated_at: '2026-09-02T10:00:00Z',
  },
];

const initialProject: ProductionProject = {
  id: 'proj-cyber-01',
  title: 'Kỷ Nguyên Vô Tận: Cyber Saigon 2077',
  status: 'IN_REVIEW',
  genre: ['Khoa học viễn tưởng', 'Cyberpunk', 'Hành động AI'],
  synopsis: 'Tại đô thị tương lai Saigon 2077, một hệ thống AI siêu trí tuệ thức tỉnh nhận thức riêng, đẩy nhân loại vào cuộc đấu trí sinh tồn giữa công nghệ và đạo đức.',
  total_episodes: 5,
  total_budget_tokens: 3000,
  allocated_tokens: 900,
  consumed_tokens: 815,
  deadline: '2026-11-30',
  planned_release_date: '2026-12-15',
  creator_name: 'Đạo diễn Trần Minh Huy (Maker)',
  reviewer_name: 'Thẩm định viên Lê Quốc Bảo (Checker)',
  episodes: initialEpisodes,
  created_at: '2026-08-01T08:00:00Z',
  updated_at: '2026-09-08T14:30:00Z',
};

const initialReviews: ReviewLog[] = [
  {
    id: 'rev-001',
    episode_package_id: 'pkg-ep-01',
    reviewer_id: 'rev-user-01',
    reviewer_name: 'Lê Quốc Bảo (Checker)',
    review_type: 'plan',
    decision: 'approved',
    feedback_notes: 'Kịch bản mở đầu lôi cuốn, dự toán token phù hợp. Cấp quota 450 Tokens.',
    quota_granted: 450,
    created_at: '2026-08-05T09:00:00Z',
  },
  {
    id: 'rev-002',
    episode_package_id: 'pkg-ep-02',
    reviewer_id: 'rev-user-01',
    reviewer_name: 'Lê Quốc Bảo (Checker)',
    review_type: 'plan',
    decision: 'approved',
    feedback_notes: 'Cốt truyện cao trào bùng nổ. Đã cấp 450 Tokens để tiến hành sản xuất clip trong AI Studio.',
    quota_granted: 450,
    created_at: '2026-08-18T10:00:00Z',
  },
];

const initialComplianceChecks: Record<string, ComplianceCheck> = {
  'pkg-ep-01': {
    id: 'comp-001',
    episode_package_id: 'pkg-ep-01',
    checker_id: 'rev-user-01',
    checker_name: 'Lê Quốc Bảo (Checker)',
    article_44_passed: true,
    decree142_passed: true,
    watermark_verified: true,
    moderation_score: 99.2,
    ai_content_percentage: 100,
    status: 'passed',
    notes: 'Đã gắn nhãn định danh AI mở đầu và kết thúc phim theo chuẩn Nghị định 142.',
    checked_at: '2026-08-28T16:00:00Z',
  },
};

const initialLabels: Record<string, AIContentLabel> = {
  'pkg-ep-01': {
    id: 'lbl-001',
    episode_package_id: 'pkg-ep-01',
    label_type: 'AI_GENERATED_FULL',
    label_text: 'Nội dung được tạo sinh 100% bằng Trí tuệ Nhân tạo theo Điều 44 Luật AI và Nghị định 142/2024/NĐ-CP.',
    display_location: 'INTRO_OUTRO',
    ruleset_version: 'DECREE_142_2024_V1',
    certification_id: 'AI-VN-2026-CINEMA-0984-EP1',
    is_active: true,
  },
};

const initialPublications: Record<string, Publication> = {
  'pkg-ep-01': {
    id: 'pub-001',
    episode_package_id: 'pkg-ep-01',
    movie_catalog_id: 'movie-001',
    title: 'Tập 1: Điểm Khởi Đầu',
    scheduled_at: '2026-08-29T10:00:00Z',
    published_at: '2026-09-01T20:00:00Z',
    visibility: 'public',
    platform_channels: ['WEB_OTT', 'MOBILE_APP', 'SMART_TV'],
    streaming_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    quality: '4K Ultra HD',
  },
};

// Chronological audit trail seed for pkg-ep-01 (the one episode that made it all the way
// to PUBLISHED), so the reviewer audit UI has real event history on first load.
let eventSeq = 0;
const seedEvent = (
  event_name: ProductionEventName,
  episode_id: string | undefined,
  actor_role: Role,
  actor_name: string,
  created_at: string,
  message?: string
): ProductionEvent => ({
  id: `evt-seed-${eventSeq++}`,
  event_name,
  project_id: 'proj-cyber-01',
  episode_id,
  actor_role,
  actor_name,
  message,
  created_at,
});

const REVIEWER_NAME = 'Lê Quốc Bảo (Checker)';
const CREATOR_NAME = 'Đạo diễn Trần Minh Huy (Maker)';

const initialEvents: ProductionEvent[] = [
  seedEvent('PROJECT_CREATED', undefined, 'reviewer', REVIEWER_NAME, '2026-08-01T08:00:00Z', 'Khởi tạo dự án "Kỷ Nguyên Vô Tận: Cyber Saigon 2077"'),
  seedEvent('EPISODE_CREATED', 'pkg-ep-01', 'reviewer', REVIEWER_NAME, '2026-08-01T08:05:00Z'),
  seedEvent('CREATOR_ASSIGNED', 'pkg-ep-01', 'reviewer', REVIEWER_NAME, '2026-08-01T08:06:00Z', `Gán cho ${CREATOR_NAME}`),
  seedEvent('PRODUCTION_PLAN_SUBMITTED', 'pkg-ep-01', 'creator', CREATOR_NAME, '2026-08-03T10:00:00Z'),
  seedEvent('PRODUCTION_PLAN_APPROVED', 'pkg-ep-01', 'reviewer', REVIEWER_NAME, '2026-08-05T09:00:00Z'),
  seedEvent('EPISODE_QUOTA_ALLOCATED', 'pkg-ep-01', 'reviewer', REVIEWER_NAME, '2026-08-05T09:05:00Z', '450 Tokens'),
  seedEvent('PRODUCTION_STARTED', 'pkg-ep-01', 'creator', CREATOR_NAME, '2026-08-06T09:00:00Z'),
  seedEvent('GENERATION_COMPLETED', 'pkg-ep-01', 'creator', CREATOR_NAME, '2026-08-20T10:15:00Z', 'Cảnh 1: Phòng Thí Nghiệm Neon CyberLab'),
  seedEvent('GENERATION_COMPLETED', 'pkg-ep-01', 'creator', CREATOR_NAME, '2026-08-20T10:18:00Z', 'Cảnh 2: Cơn Bão Tín Hiệu Số'),
  seedEvent('GENERATION_COMPLETED', 'pkg-ep-01', 'creator', CREATOR_NAME, '2026-08-20T10:22:00Z', 'Cảnh 3: Thực Thể AI Thức Tỉnh'),
  seedEvent('EPISODE_SUBMITTED', 'pkg-ep-01', 'creator', CREATOR_NAME, '2026-08-25T09:00:00Z'),
  seedEvent('EPISODE_APPROVED', 'pkg-ep-01', 'reviewer', REVIEWER_NAME, '2026-08-26T09:00:00Z'),
  seedEvent('COMPLIANCE_CHECK_STARTED', 'pkg-ep-01', 'reviewer', REVIEWER_NAME, '2026-08-26T09:01:00Z'),
  seedEvent('COMPLIANCE_PASSED', 'pkg-ep-01', 'reviewer', REVIEWER_NAME, '2026-08-28T16:00:00Z'),
  seedEvent('EPISODE_SCHEDULED', 'pkg-ep-01', 'reviewer', REVIEWER_NAME, '2026-08-29T10:00:00Z', 'Lên lịch 2026-09-01T20:00, giá 25 Coin'),
  seedEvent('EPISODE_PUBLISHED', 'pkg-ep-01', 'reviewer', REVIEWER_NAME, '2026-09-01T20:00:00Z'),
];

// ==========================================
// 2. PURE HELPERS
// ==========================================

let mutationSeq = 0;
function makeEvent(params: Omit<ProductionEvent, 'id' | 'created_at'>): ProductionEvent {
  return {
    ...params,
    id: `evt-${Date.now()}-${mutationSeq++}`,
    created_at: new Date().toISOString(),
  };
}

/** BR-12 helper: total quota already allocated to every OTHER episode in the project. */
function sumOtherEpisodesQuota(episodes: EpisodePackage[], excludeEpisodeId: string): number {
  return episodes.reduce((sum, ep) => (ep.id === excludeEpisodeId ? sum : sum + ep.quota_allocated), 0);
}

const PRODUCTION_STAGE_STATES: WorkflowState[] = ['IN_PRODUCTION', 'READY_FOR_PRODUCTION'];
const REVIEW_STAGE_STATES: WorkflowState[] = ['CONTENT_REVIEW', 'APPROVED', 'COMPLIANCE_REVIEW', 'COMPLIANCE_CHANGES_REQUESTED'];
const TERMINAL_STATES: WorkflowState[] = ['PUBLISHED', 'ARCHIVED'];

/** Movie Project State Model (docs/PROJECT_OVERVIEW.md §4.1.3) derived from aggregate episode states. */
function deriveProjectStatus(episodes: EpisodePackage[]): ProjectStatus {
  if (episodes.length === 0) return 'DRAFT';
  if (episodes.every((ep) => TERMINAL_STATES.includes(ep.status))) return 'COMPLETED';
  if (episodes.some((ep) => PRODUCTION_STAGE_STATES.includes(ep.status))) return 'IN_PRODUCTION';
  if (episodes.some((ep) => REVIEW_STAGE_STATES.includes(ep.status))) return 'IN_REVIEW';
  if (episodes.some((ep) => ep.status === 'SCHEDULED')) return 'SCHEDULED';
  if (episodes.some((ep) => ep.status === 'PUBLISHED')) return 'PUBLISHED';
  return 'PLANNING';
}

// ==========================================
// 3. WORKFLOW STORE INTERFACE
// ==========================================

interface ActionResult {
  success: boolean;
  error?: string;
}

interface WorkflowStoreState {
  // Global View State
  currentRole: Role;
  setRole: (role: Role) => void;
  activeProjectId: string;
  activePackageId: string;
  setActiveProject: (id: string) => void;
  setActivePackage: (id: string) => void;

  // Domain State
  project: ProductionProject;
  reviews: ReviewLog[];
  complianceChecks: Record<string, ComplianceCheck>;
  labels: Record<string, AIContentLabel>;
  publications: Record<string, Publication>;
  events: ProductionEvent[];

  // Getters
  getPackage: (packageId?: string) => EpisodePackage | undefined;
  getBrief: (packageId?: string) => ContentBrief | undefined;
  getJobs: (packageId?: string) => GenerationJob[];
  getEventsForEpisode: (episodeId: string) => ProductionEvent[];

  // Maker (Creator) Actions
  updateContentBrief: (packageId: string, briefData: Partial<ContentBrief>) => void;
  submitProductionPlan: (packageId: string, updatedBrief?: Partial<ContentBrief>) => ActionResult;
  triggerGenerationJob: (packageId: string, jobId: string) => Promise<ActionResult>;
  addSceneJob: (packageId: string, sceneData: Omit<GenerationJob, 'id' | 'status' | 'progress' | 'created_at' | 'updated_at'>) => void;
  removeSceneJob: (packageId: string, jobId: string) => void;
  submitEpisodePackage: (packageId: string) => ActionResult;

  // Checker (Reviewer) Actions
  createProject: (data: { title: string; genre: string[]; synopsis: string; total_episodes: number; total_budget_tokens: number; deadline: string; planned_release_date: string }) => void;
  addEpisode: (data: { title: string; requirements?: string; target_duration_minutes: number }) => ActionResult & { episodeId?: string };
  requestPlanChanges: (packageId: string, feedbackNotes: string) => void;
  approveProductionPlan: (packageId: string) => ActionResult;
  allocateQuota: (packageId: string, tokenQuota: number, notes?: string) => ActionResult;
  requestContentChanges: (packageId: string, feedbackNotes: string) => void;
  approveContent: (packageId: string) => void;
  saveComplianceCheck: (packageId: string, data: Partial<ComplianceCheck>, labelData?: Partial<AIContentLabel>) => { success: boolean; passed: boolean };
  scheduleFilm: (packageId: string, data: { scheduled_at: string; coin_price: number; visibility: PublicationVisibility; channels: string[] }) => ActionResult;
  publishFilm: (packageId: string) => ActionResult;

  // Reset Demo State
  resetDemoData: () => void;
}

export const useWorkflowStore = create<WorkflowStoreState>((set, get) => ({
  currentRole: 'creator',
  setRole: (role) => set({ currentRole: role }),

  activeProjectId: 'proj-cyber-01',
  activePackageId: 'pkg-ep-03',
  setActiveProject: (id) => set({ activeProjectId: id }),
  setActivePackage: (id) => set({ activePackageId: id }),

  project: initialProject,
  reviews: initialReviews,
  complianceChecks: initialComplianceChecks,
  labels: initialLabels,
  publications: initialPublications,
  events: initialEvents,

  getPackage: (packageId) => {
    const id = packageId || get().activePackageId;
    return get().project.episodes.find((ep) => ep.id === id) || get().project.episodes[0];
  },

  getBrief: (packageId) => {
    const pkg = get().getPackage(packageId);
    return pkg?.brief;
  },

  getJobs: (packageId) => {
    const pkg = get().getPackage(packageId);
    return pkg?.jobs || [];
  },

  getEventsForEpisode: (episodeId) => {
    return get()
      .events.filter((e) => e.episode_id === episodeId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  },

  // ----------------------------------------------------
  // MAKER (CREATOR) ACTIONS
  // ----------------------------------------------------

  updateContentBrief: (packageId, briefData) => {
    const now = new Date().toISOString();
    set((state) => {
      const episodes = state.project.episodes.map((ep) => {
        if (ep.id !== packageId) return ep;
        const nextStatus: WorkflowState =
          ep.status === 'ASSIGNED' || ep.status === 'PLAN_CHANGES_REQUESTED' ? 'PLANNING' : ep.status;
        return {
          ...ep,
          status: nextStatus,
          updated_at: now,
          brief: {
            ...ep.brief,
            ...briefData,
            status: nextStatus,
            updated_at: now,
          },
        };
      });
      return {
        project: { ...state.project, episodes, status: deriveProjectStatus(episodes), updated_at: now },
      };
    });
  },

  submitProductionPlan: (packageId, updatedBrief) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return { success: false, error: 'Không tìm thấy tập phim.' };

    const targetDuration = updatedBrief?.target_duration_minutes ?? pkg.brief.target_duration_minutes;
    if (targetDuration > 30) {
      return { success: false, error: 'BR-31: Thời lượng mục tiêu không được vượt quá 30 phút.' };
    }

    const now = new Date().toISOString();
    const event = makeEvent({
      event_name: 'PRODUCTION_PLAN_SUBMITTED',
      project_id: get().project.id,
      episode_id: packageId,
      actor_role: 'creator',
      actor_name: get().project.creator_name,
    });

    set((state) => {
      const episodes = state.project.episodes.map((ep) => {
        if (ep.id !== packageId) return ep;
        return {
          ...ep,
          status: 'PLAN_REVIEW' as WorkflowState,
          updated_at: now,
          brief: {
            ...ep.brief,
            ...updatedBrief,
            status: 'PLAN_REVIEW' as WorkflowState,
            updated_at: now,
          },
        };
      });
      return {
        events: [...state.events, event],
        project: { ...state.project, episodes, status: deriveProjectStatus(episodes), updated_at: now },
      };
    });

    return { success: true };
  },

  triggerGenerationJob: async (packageId, jobId) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return { success: false, error: 'Không tìm thấy tập phim.' };

    const job = pkg.jobs.find((j) => j.id === jobId);
    if (!job) return { success: false, error: 'Không tìm thấy phân cảnh.' };

    const currentTokens = pkg.actual_tokens_used;
    const quota = pkg.quota_allocated;
    const cost = job.token_cost;

    if (quota > 0 && currentTokens + cost > quota) {
      return {
        success: false,
        error: `Vượt quá hạn mức Token Quota đã cấp (${currentTokens}/${quota} Tokens, cần: ${cost}).`,
      };
    }

    const wasReadyForProduction = pkg.status === 'READY_FOR_PRODUCTION';

    set((state) => {
      const episodes = state.project.episodes.map((ep) => {
        if (ep.id !== packageId) return ep;
        return {
          ...ep,
          status: 'IN_PRODUCTION' as WorkflowState,
          jobs: ep.jobs.map((j) =>
            j.id === jobId ? { ...j, status: 'processing' as JobStatus, progress: 25, updated_at: new Date().toISOString() } : j
          ),
        };
      });
      const startEvent = wasReadyForProduction
        ? [
            makeEvent({
              event_name: 'PRODUCTION_STARTED' as ProductionEventName,
              project_id: state.project.id,
              episode_id: packageId,
              actor_role: 'creator',
              actor_name: state.project.creator_name,
            }),
          ]
        : [];
      return {
        events: [...state.events, ...startEvent],
        project: { ...state.project, episodes, status: deriveProjectStatus(episodes) },
      };
    });

    await new Promise((resolve) => setTimeout(resolve, 600));

    set((state) => ({
      project: {
        ...state.project,
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return { ...ep, jobs: ep.jobs.map((j) => (j.id === jobId ? { ...j, progress: 70 } : j)) };
        }),
      },
    }));

    await new Promise((resolve) => setTimeout(resolve, 600));

    const newAssetId = `asset-${Date.now()}`;
    const newAsset: GeneratedAsset = {
      id: newAssetId,
      job_id: jobId,
      scene_id: job.scene_id,
      asset_type: 'video',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      duration_seconds: 20,
      resolution: '3840x2160 (4K)',
      file_size_mb: 78.5,
      metadata: {
        fps: 60,
        codec: 'H.265 / HEVC',
        model: job.ai_model,
        seed: Math.floor(Math.random() * 1000000),
        prompt: job.prompt_video,
      },
      created_at: new Date().toISOString(),
    };

    const remainingBeforeRatio = quota > 0 ? (quota - currentTokens) / quota : 1;
    const remainingAfterRatio = quota > 0 ? (quota - (currentTokens + cost)) / quota : 1;
    const crossedLowQuotaThreshold = quota > 0 && remainingBeforeRatio >= 0.1 && remainingAfterRatio < 0.1;

    set((state) => {
      const episodes = state.project.episodes.map((ep) => {
        if (ep.id !== packageId) return ep;
        return {
          ...ep,
          status: 'IN_PRODUCTION' as WorkflowState,
          actual_tokens_used: ep.actual_tokens_used + cost,
          jobs: ep.jobs.map((j) =>
            j.id === jobId
              ? { ...j, status: 'completed' as JobStatus, progress: 100, output_asset_id: newAssetId, updated_at: new Date().toISOString() }
              : j
          ),
          assets: [...ep.assets.filter((a) => a.job_id !== jobId), newAsset],
        };
      });

      const completionEvents = [
        makeEvent({
          event_name: 'GENERATION_COMPLETED',
          project_id: state.project.id,
          episode_id: packageId,
          actor_role: 'creator',
          actor_name: state.project.creator_name,
          message: job.title,
        }),
      ];
      if (crossedLowQuotaThreshold) {
        completionEvents.push(
          makeEvent({
            event_name: 'QUOTA_LOW',
            project_id: state.project.id,
            episode_id: packageId,
            actor_role: 'creator',
            actor_name: state.project.creator_name,
            message: 'Quota còn lại dưới 10%.',
          })
        );
      }

      return {
        events: [...state.events, ...completionEvents],
        project: {
          ...state.project,
          consumed_tokens: state.project.consumed_tokens + cost,
          episodes,
          status: deriveProjectStatus(episodes),
        },
      };
    });

    return { success: true };
  },

  addSceneJob: (packageId, sceneData) => {
    const newJobId = `job-${Date.now()}`;
    const newJob: GenerationJob = {
      ...sceneData,
      id: newJobId,
      status: 'pending',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      project: {
        ...state.project,
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return { ...ep, jobs: [...ep.jobs, newJob] };
        }),
      },
    }));
  },

  removeSceneJob: (packageId, jobId) => {
    set((state) => ({
      project: {
        ...state.project,
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            jobs: ep.jobs.filter((j) => j.id !== jobId),
            assets: ep.assets.filter((a) => a.job_id !== jobId),
          };
        }),
      },
    }));
  },

  submitEpisodePackage: (packageId) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return { success: false, error: 'Không tìm thấy tập phim.' };

    const uncompleted = pkg.jobs.filter((j) => j.status !== 'completed');
    if (uncompleted.length > 0) {
      return { success: false, error: `Còn ${uncompleted.length} phân cảnh chưa render hoàn tất. Vui lòng sinh xong clip trước khi submit.` };
    }
    if (pkg.brief.target_duration_minutes > 30) {
      return { success: false, error: 'BR-31: Thời lượng tập phim không được vượt quá 30 phút.' };
    }

    const now = new Date().toISOString();
    const event = makeEvent({
      event_name: 'EPISODE_SUBMITTED',
      project_id: get().project.id,
      episode_id: packageId,
      actor_role: 'creator',
      actor_name: get().project.creator_name,
    });

    set((state) => {
      const episodes = state.project.episodes.map((ep) => {
        if (ep.id !== packageId) return ep;
        return {
          ...ep,
          status: 'CONTENT_REVIEW' as WorkflowState,
          video_draft_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          updated_at: now,
        };
      });
      return {
        events: [...state.events, event],
        project: { ...state.project, episodes, status: deriveProjectStatus(episodes), updated_at: now },
      };
    });

    return { success: true };
  },

  // ----------------------------------------------------
  // CHECKER (REVIEWER) ACTIONS
  // ----------------------------------------------------

  createProject: (data) => {
    const now = new Date().toISOString();
    const newProject: ProductionProject = {
      id: `proj-${Date.now()}`,
      title: data.title,
      status: 'DRAFT',
      genre: data.genre,
      synopsis: data.synopsis,
      total_episodes: data.total_episodes,
      total_budget_tokens: data.total_budget_tokens,
      allocated_tokens: 0,
      consumed_tokens: 0,
      deadline: data.deadline,
      planned_release_date: data.planned_release_date,
      creator_name: 'Đạo diễn Trần Minh Huy (Maker)',
      reviewer_name: 'Thẩm định viên Lê Quốc Bảo (Checker)',
      episodes: [],
      created_at: now,
      updated_at: now,
    };
    const event = makeEvent({
      event_name: 'PROJECT_CREATED',
      project_id: newProject.id,
      actor_role: 'reviewer',
      actor_name: newProject.reviewer_name,
      message: `Khởi tạo dự án "${data.title}"`,
    });

    set({
      project: newProject,
      activeProjectId: newProject.id,
      events: [event],
      reviews: [],
      complianceChecks: {},
      labels: {},
      publications: {},
    });
  },

  addEpisode: (data) => {
    if (!data.title.trim()) {
      return { success: false, error: 'Vui lòng nhập tên tập phim.' };
    }
    if (data.target_duration_minutes > 30) {
      return { success: false, error: 'BR-31: Thời lượng mục tiêu không được vượt quá 30 phút.' };
    }

    const state = get();
    const now = new Date().toISOString();
    const newEpisodeId = `pkg-ep-${Date.now()}`;
    const newBrief: ContentBrief = {
      id: `brief-${newEpisodeId}`,
      project_id: state.project.id,
      episode_id: newEpisodeId,
      title: data.title,
      synopsis: data.requirements || '',
      overview_script: '',
      scene_count: 0,
      target_duration_minutes: data.target_duration_minutes,
      estimated_tokens: 0,
      storyboard_summary: '',
      scene_breakdown: [],
      status: 'ASSIGNED',
      created_at: now,
      updated_at: now,
    };
    const newEpisode: EpisodePackage = {
      id: newEpisodeId,
      project_id: state.project.id,
      episode_number: state.project.episodes.length + 1,
      title: data.title,
      status: 'ASSIGNED',
      total_duration: `${data.target_duration_minutes}:00 (Dự kiến)`,
      actual_tokens_used: 0,
      quota_allocated: 0,
      video_draft_url: '',
      thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      coin_price: null,
      brief: newBrief,
      jobs: [],
      assets: [],
      created_at: now,
      updated_at: now,
    };

    const createdEvent = makeEvent({
      event_name: 'EPISODE_CREATED',
      project_id: state.project.id,
      episode_id: newEpisodeId,
      actor_role: 'reviewer',
      actor_name: state.project.reviewer_name,
      message: `Tạo tập phim "${data.title}"`,
    });
    const assignedEvent = makeEvent({
      event_name: 'CREATOR_ASSIGNED',
      project_id: state.project.id,
      episode_id: newEpisodeId,
      actor_role: 'reviewer',
      actor_name: state.project.reviewer_name,
      message: `Gán cho ${state.project.creator_name}`,
    });

    set((s) => {
      const episodes = [...s.project.episodes, newEpisode];
      return {
        events: [...s.events, createdEvent, assignedEvent],
        project: { ...s.project, episodes, status: deriveProjectStatus(episodes), updated_at: now },
      };
    });

    return { success: true, episodeId: newEpisodeId };
  },

  requestPlanChanges: (packageId, feedbackNotes) => {
    const now = new Date().toISOString();
    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: get().project.reviewer_name,
      review_type: 'plan',
      decision: 'changes_requested',
      feedback_notes: feedbackNotes,
      created_at: now,
    };
    const event = makeEvent({
      event_name: 'PRODUCTION_PLAN_CHANGES_REQUESTED',
      project_id: get().project.id,
      episode_id: packageId,
      actor_role: 'reviewer',
      actor_name: get().project.reviewer_name,
      message: feedbackNotes,
    });

    set((state) => {
      const episodes = state.project.episodes.map((ep) => {
        if (ep.id !== packageId) return ep;
        return {
          ...ep,
          status: 'PLAN_CHANGES_REQUESTED' as WorkflowState,
          updated_at: now,
          brief: { ...ep.brief, status: 'PLAN_CHANGES_REQUESTED' as WorkflowState, updated_at: now },
        };
      });
      return {
        reviews: [newReview, ...state.reviews],
        events: [...state.events, event],
        project: { ...state.project, episodes, status: deriveProjectStatus(episodes), updated_at: now },
      };
    });
  },

  approveProductionPlan: (packageId) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return { success: false, error: 'Không tìm thấy tập phim.' };
    if (pkg.status !== 'PLAN_REVIEW') {
      return { success: false, error: 'Kế hoạch phải ở trạng thái chờ duyệt mới có thể phê duyệt.' };
    }

    const now = new Date().toISOString();
    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: get().project.reviewer_name,
      review_type: 'plan',
      decision: 'approved',
      feedback_notes: 'Kế hoạch được phê duyệt, chờ cấp AI Quota.',
      created_at: now,
    };
    const event = makeEvent({
      event_name: 'PRODUCTION_PLAN_APPROVED',
      project_id: get().project.id,
      episode_id: packageId,
      actor_role: 'reviewer',
      actor_name: get().project.reviewer_name,
    });

    set((state) => {
      const episodes = state.project.episodes.map((ep) =>
        ep.id === packageId ? { ...ep, status: 'PLAN_APPROVED' as WorkflowState, updated_at: now } : ep
      );
      return {
        reviews: [newReview, ...state.reviews],
        events: [...state.events, event],
        project: { ...state.project, episodes, status: deriveProjectStatus(episodes), updated_at: now },
      };
    });

    return { success: true };
  },

  allocateQuota: (packageId, tokenQuota, notes) => {
    const state = get();
    const pkg = state.project.episodes.find((e) => e.id === packageId);
    if (!pkg) return { success: false, error: 'Không tìm thấy tập phim.' };
    if (pkg.status !== 'PLAN_APPROVED') {
      return { success: false, error: 'Kế hoạch phải được phê duyệt trước khi cấp Quota.' };
    }

    const otherEpisodesTotal = sumOtherEpisodesQuota(state.project.episodes, packageId);
    if (otherEpisodesTotal + tokenQuota > state.project.total_budget_tokens) {
      return {
        success: false,
        error: `BR-12: Tổng quota (${otherEpisodesTotal + tokenQuota} Tokens) vượt ngân sách dự án (${state.project.total_budget_tokens} Tokens).`,
      };
    }

    const now = new Date().toISOString();
    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: state.project.reviewer_name,
      review_type: 'plan',
      decision: 'approved',
      feedback_notes: `Đã cấp ${tokenQuota} AI Tokens. ${notes || ''}`.trim(),
      quota_granted: tokenQuota,
      created_at: now,
    };
    const event = makeEvent({
      event_name: 'EPISODE_QUOTA_ALLOCATED',
      project_id: state.project.id,
      episode_id: packageId,
      actor_role: 'reviewer',
      actor_name: state.project.reviewer_name,
      message: `${tokenQuota} Tokens`,
    });

    set((s) => {
      const episodes = s.project.episodes.map((ep) =>
        ep.id === packageId ? { ...ep, status: 'READY_FOR_PRODUCTION' as WorkflowState, quota_allocated: tokenQuota, updated_at: now } : ep
      );
      return {
        reviews: [newReview, ...s.reviews],
        events: [...s.events, event],
        project: {
          ...s.project,
          allocated_tokens: otherEpisodesTotal + tokenQuota,
          episodes,
          status: deriveProjectStatus(episodes),
          updated_at: now,
        },
      };
    });

    return { success: true };
  },

  requestContentChanges: (packageId, feedbackNotes) => {
    const now = new Date().toISOString();
    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: get().project.reviewer_name,
      review_type: 'content',
      decision: 'changes_requested',
      feedback_notes: feedbackNotes,
      created_at: now,
    };
    const event = makeEvent({
      event_name: 'CONTENT_CHANGES_REQUESTED',
      project_id: get().project.id,
      episode_id: packageId,
      actor_role: 'reviewer',
      actor_name: get().project.reviewer_name,
      message: feedbackNotes,
    });

    set((state) => {
      const episodes = state.project.episodes.map((ep) =>
        ep.id === packageId ? { ...ep, status: 'CHANGES_REQUESTED' as WorkflowState, updated_at: now } : ep
      );
      return {
        reviews: [newReview, ...state.reviews],
        events: [...state.events, event],
        project: { ...state.project, episodes, status: deriveProjectStatus(episodes), updated_at: now },
      };
    });
  },

  approveContent: (packageId) => {
    const now = new Date().toISOString();
    const approvedEvent = makeEvent({
      event_name: 'EPISODE_APPROVED',
      project_id: get().project.id,
      episode_id: packageId,
      actor_role: 'reviewer',
      actor_name: get().project.reviewer_name,
    });
    const complianceStartEvent = makeEvent({
      event_name: 'COMPLIANCE_CHECK_STARTED',
      project_id: get().project.id,
      episode_id: packageId,
      actor_role: 'reviewer',
      actor_name: get().project.reviewer_name,
    });

    set((state) => {
      const episodes = state.project.episodes.map((ep) =>
        ep.id === packageId ? { ...ep, status: 'COMPLIANCE_REVIEW' as WorkflowState, updated_at: now } : ep
      );
      return {
        events: [...state.events, approvedEvent, complianceStartEvent],
        project: { ...state.project, episodes, status: deriveProjectStatus(episodes), updated_at: now },
      };
    });
  },

  saveComplianceCheck: (packageId, data, labelData) => {
    const now = new Date().toISOString();
    const article44 = data.article_44_passed ?? false;
    const decree142 = data.decree142_passed ?? false;
    const watermark = data.watermark_verified ?? false;
    const passed = article44 && decree142 && watermark;

    const failureReasons = [
      !article44 && 'Điều 44 (nhãn dán định danh AI) chưa đạt',
      !decree142 && 'Nghị định 142 (dấu mờ bản quyền AI) chưa đạt',
      !watermark && 'Xác minh nội dung/watermark chưa đạt',
    ].filter((v): v is string => Boolean(v));

    const compliance: ComplianceCheck = {
      id: `comp-${Date.now()}`,
      episode_package_id: packageId,
      checker_id: 'rev-user-01',
      checker_name: get().project.reviewer_name,
      article_44_passed: article44,
      decree142_passed: decree142,
      watermark_verified: watermark,
      moderation_score: data.moderation_score ?? 99.4,
      ai_content_percentage: data.ai_content_percentage ?? 100,
      status: passed ? 'passed' : 'failed',
      notes: data.notes || (passed ? 'Đã kiểm định đầy đủ tiêu chuẩn nhãn dán định danh AI.' : `Chưa đạt: ${failureReasons.join(', ')}.`),
      checked_at: now,
    };

    const label: AIContentLabel | null = passed
      ? {
          id: `lbl-${Date.now()}`,
          episode_package_id: packageId,
          label_type: labelData?.label_type || 'AI_GENERATED_FULL',
          label_text:
            labelData?.label_text ||
            'Nội dung tạo 100% bằng Trí tuệ Nhân tạo - Tuân thủ Điều 44 Luật AI & Nghị định 142/2024/NĐ-CP.',
          display_location: labelData?.display_location || 'INTRO_OUTRO',
          ruleset_version: labelData?.ruleset_version || 'DECREE_142_2024_V1',
          certification_id: labelData?.certification_id || `AI-VN-2026-CINEMA-${Math.floor(1000 + Math.random() * 9000)}`,
          is_active: true,
        }
      : null;

    const event = makeEvent({
      event_name: passed ? 'COMPLIANCE_PASSED' : 'COMPLIANCE_CHANGES_REQUESTED',
      project_id: get().project.id,
      episode_id: packageId,
      actor_role: 'reviewer',
      actor_name: get().project.reviewer_name,
      message: compliance.notes,
    });

    set((state) => {
      const episodes = state.project.episodes.map((ep) =>
        ep.id === packageId
          ? { ...ep, status: (passed ? 'COMPLIANCE_PASSED' : 'COMPLIANCE_CHANGES_REQUESTED') as WorkflowState, updated_at: now }
          : ep
      );
      return {
        complianceChecks: { ...state.complianceChecks, [packageId]: compliance },
        labels: label ? { ...state.labels, [packageId]: label } : state.labels,
        events: [...state.events, event],
        project: { ...state.project, episodes, status: deriveProjectStatus(episodes), updated_at: now },
      };
    });

    return { success: true, passed };
  },

  scheduleFilm: (packageId, data) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return { success: false, error: 'Không tìm thấy tập phim.' };
    if (pkg.status !== 'COMPLIANCE_PASSED') {
      return { success: false, error: 'Chỉ có thể lên lịch phát hành sau khi Compliance đã ĐẠT.' };
    }
    if (!data.coin_price || data.coin_price <= 0) {
      return { success: false, error: 'BR-29: Vui lòng nhập giá Coin hợp lệ (lớn hơn 0) cho tập phim.' };
    }

    const now = new Date().toISOString();
    const publication: Publication = {
      id: `pub-${Date.now()}`,
      episode_package_id: packageId,
      movie_catalog_id: 'movie-001',
      title: pkg.title,
      scheduled_at: data.scheduled_at,
      published_at: null,
      visibility: data.visibility,
      platform_channels: data.channels,
      streaming_url: pkg.video_draft_url || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      quality: '4K Ultra HD',
    };
    const event = makeEvent({
      event_name: 'EPISODE_SCHEDULED',
      project_id: get().project.id,
      episode_id: packageId,
      actor_role: 'reviewer',
      actor_name: get().project.reviewer_name,
      message: `Lên lịch ${data.scheduled_at}, giá ${data.coin_price} Coin`,
    });

    set((state) => {
      const episodes = state.project.episodes.map((ep) =>
        ep.id === packageId ? { ...ep, status: 'SCHEDULED' as WorkflowState, coin_price: data.coin_price, updated_at: now } : ep
      );
      return {
        publications: { ...state.publications, [packageId]: publication },
        events: [...state.events, event],
        project: { ...state.project, episodes, status: deriveProjectStatus(episodes), updated_at: now },
      };
    });

    return { success: true };
  },

  publishFilm: (packageId) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return { success: false, error: 'Không tìm thấy tập phim.' };
    if (pkg.status !== 'SCHEDULED') {
      return { success: false, error: 'BR-19: Phải Lên Lịch (Schedule) trước khi Phát Hành.' };
    }

    const now = new Date().toISOString();
    const event = makeEvent({
      event_name: 'EPISODE_PUBLISHED',
      project_id: get().project.id,
      episode_id: packageId,
      actor_role: 'reviewer',
      actor_name: get().project.reviewer_name,
    });

    set((state) => {
      const episodes = state.project.episodes.map((ep) =>
        ep.id === packageId ? { ...ep, status: 'PUBLISHED' as WorkflowState, updated_at: now } : ep
      );
      const existingPublication = state.publications[packageId];
      return {
        publications: existingPublication
          ? { ...state.publications, [packageId]: { ...existingPublication, published_at: now } }
          : state.publications,
        events: [...state.events, event],
        project: { ...state.project, episodes, status: deriveProjectStatus(episodes), updated_at: now },
      };
    });

    return { success: true };
  },

  resetDemoData: () => {
    set({
      currentRole: 'creator',
      activeProjectId: 'proj-cyber-01',
      activePackageId: 'pkg-ep-03',
      project: initialProject,
      reviews: initialReviews,
      complianceChecks: initialComplianceChecks,
      labels: initialLabels,
      publications: initialPublications,
      events: initialEvents,
    });
  },
}));
