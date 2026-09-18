'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { CreatorDashboardPage } from '@/features/workflow/components/creator/CreatorDashboardPage';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { setActiveProject } = useWorkflowStore();

  useEffect(() => {
    if (projectId) {
      setActiveProject(projectId);
    }
  }, [projectId, setActiveProject]);

  return <CreatorDashboardPage />;
}
