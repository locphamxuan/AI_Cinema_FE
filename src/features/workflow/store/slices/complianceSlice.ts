import type { StateCreator } from 'zustand';
import type { ComplianceSlice, WorkflowStoreState } from '../types';
import { workflowService } from '@/services/workflowService';
import { MANUAL_COMPLIANCE_CHECKS } from '@/features/workflow/components/reviewer/audit/ComplianceStation';
import { toast } from '@/components/ui/Toast';
import { apiResult } from './apiResult';

const AI_LABEL_TEXT = 'Nội dung được tạo hoàn toàn bằng trí tuệ nhân tạo theo Điều 44 Luật AI và Nghị định 142/2024/NĐ-CP.';

export const createComplianceSlice: StateCreator<WorkflowStoreState, [], [], ComplianceSlice> = (_set, get) => {
  const reload = () => get().loadProject(get().activeProjectId);

  return {
    passCompliance: async (packageId, checks, labelDisplayLocation) => {
      // A failed check goes back to the Creator through "request changes", never recorded as passed.
      if (MANUAL_COMPLIANCE_CHECKS.some((c) => !checks[c.type])) return false;
      const pkg = get().getPackage(packageId);
      const pkgId = pkg?.package_id;
      if (!pkg || !pkgId) return false;

      const policies = await apiResult(workflowService.listPolicies(), 'Không tải được chính sách');
      const policy = policies?.data.find((p) => p.isActive);
      if (!policy) {
        if (policies) toast.error('Thiếu chính sách', 'Chưa có chính sách gắn nhãn AI nào đang hiệu lực.');
        return false;
      }

      // BR-42 order: label, then every check, then approve — the backend refuses to approve a
      // package that is not compliant. Steps already done on an earlier attempt are skipped.
      if (!pkg.is_labelled) {
        const label = await apiResult(
          workflowService.createAiContentLabel(pkgId, {
            labelType: 'AI_GENERATED',
            labelText: AI_LABEL_TEXT,
            displayLocation: labelDisplayLocation,
            policyId: policy.id,
          }),
          'Không gắn được nhãn AI'
        );
        if (!label) return reload().then(() => false);
      }

      if (!pkg.is_compliant) {
        const recorded = await apiResult(
          workflowService.recordComplianceReview(pkgId, {
            policyId: policy.id,
            checks: MANUAL_COMPLIANCE_CHECKS.map((c) => ({ checkType: c.type, result: 'PASS' })),
          }),
          'Không lưu được kết quả kiểm định'
        );
        if (!recorded || recorded.verdict !== 'PASS') return reload().then(() => false);
      }

      // The catalog only accepts a package whose latest review is APPROVED.
      const review = await apiResult(workflowService.createReview(pkgId), 'Không tạo được phiên duyệt');
      const approved =
        review && (await apiResult(workflowService.decideReview(review.id, { decision: 'APPROVED' }), 'Không duyệt được bản dựng'));
      await reload();
      return Boolean(approved);
    },

    publishEpisode: async (packageId, scheduledAt) => {
      const pkg = get().getPackage(packageId);
      if (!pkg?.package_id) return false;

      let episodeId = pkg.catalog_episode_id;
      if (!episodeId) {
        const movie = await apiResult(workflowService.createCatalog(pkg.package_id), 'Không đưa được vào danh mục');
        episodeId = movie?.episodes.find((e) => e.currentPackageId === pkg.package_id)?.id;
        if (!episodeId) return reload().then(() => false);
      }

      const publication = await apiResult(
        workflowService.createPublication(episodeId, { packageId: pkg.package_id, scheduledAt }),
        'Không tạo được lịch phát hành'
      );
      if (!publication) return reload().then(() => false);

      // A future time is left to the backend scheduler, which puts the episode live then.
      if (scheduledAt && new Date(scheduledAt) > new Date()) {
        await reload();
        return true;
      }
      const published = await apiResult(workflowService.publish(publication.id), 'Không phát hành được');
      await reload();
      return published !== null;
    },
  };
};
