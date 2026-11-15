import { PERMISSION } from '@/lib/permissions';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { SectionTabs } from '@/features/admin/components/SectionTabs';
import { FilmProfitTab } from '@/features/finance/FilmProfitTab';
import { RevenueShareTab } from '@/features/finance/RevenueShareTab';
import { RiskFlagsTab } from '@/features/finance/RiskFlagsTab';

/** MF-5 Financial Dashboard: Admin only (finance:report.read, risk:flag.manage). */
export default function Page() {
  return (
    <PermissionGate permission={PERMISSION.FINANCE_REPORT_READ}>
    <SectionTabs
      title="Tài chính"
      description="Lợi nhuận từng phim, phần chia doanh thu gói Tháng và các giao dịch Coin cần kiểm tra. Số liệu lấy trực tiếp từ sổ sách hệ thống."
      tabs={[
        { key: 'profit', label: 'Lợi nhuận & ROI', permission: PERMISSION.FINANCE_REPORT_READ, content: <FilmProfitTab /> },
        { key: 'allocation', label: 'Chia doanh thu gói Tháng', permission: PERMISSION.FINANCE_REPORT_READ, content: <RevenueShareTab /> },
        { key: 'risk', label: 'Giao dịch rủi ro', permission: PERMISSION.RISK_FLAG_MANAGE, content: <RiskFlagsTab /> },
      ]}
    />
    </PermissionGate>
  );
}
