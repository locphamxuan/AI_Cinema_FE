import { AdminPageFrame } from '@/features/admin/components/AdminPageFrame';
import { KnowledgeBasePanel } from '@/features/admin/components/KnowledgeBasePanel';

export default function AdminKnowledgePage() {
  return (
    <AdminPageFrame>
      <KnowledgeBasePanel />
    </AdminPageFrame>
  );
}
