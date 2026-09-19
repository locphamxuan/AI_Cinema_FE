'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { ReviewerDashboardPage } from '@/features/workflow/components/reviewer/ReviewerDashboardPage';

export default function ReviewerProjectWorkspacePage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { setActiveProject } = useWorkflowStore();

  useEffect(() => {
    if (projectId) {
      setActiveProject(projectId);
    }
  }, [projectId, setActiveProject]);

  return <ReviewerDashboardPage />;
}
