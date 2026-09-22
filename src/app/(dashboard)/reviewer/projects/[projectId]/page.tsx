'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { ReviewerWorkspacePage } from '@/features/workflow/components/reviewer/ReviewerWorkspacePage';

export default function ReviewerProjectWorkspacePage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { setActiveProject } = useWorkflowStore();

  useEffect(() => {
    if (projectId) {
      setActiveProject(projectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the URL param itself changes
  }, [projectId]);

  return <ReviewerWorkspacePage />;
}
