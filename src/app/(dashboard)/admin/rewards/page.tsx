import { AdminPageFrame } from '@/features/admin/components/AdminPageFrame';
import { RewardLadderPanel } from '@/features/billing-admin/components/RewardLadderPanel';
import { RewardWheelPanel } from '@/features/billing-admin/components/RewardWheelPanel';

export default function Page() {
  return (
    <AdminPageFrame>
      <RewardLadderPanel />
      <RewardWheelPanel />
    </AdminPageFrame>
  );
}
