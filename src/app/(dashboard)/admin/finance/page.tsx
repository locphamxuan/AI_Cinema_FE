import { PERMISSION } from '@/lib/permissions';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { SectionTabs } from '@/features/admin/components/SectionTabs';
import { FilmProfitTab } from '@/features/finance/FilmProfitTab';
import { RiskFlagsTab } from '@/features/finance/RiskFlagsTab';

/** MF-5 Financial Dashboard: Admin only (finance:report.read, risk:flag.manage). */
export default function Page() {
  return (
    <PermissionGate permission={PERMISSION.FINANCE_REPORT_READ}>
    <SectionTabs
      title="Tài chính"
      description="Lợi nhuận từng phim (gồm tiền bán tập lẻ và phần chia từ gói Tháng) và các giao dịch Coin cần kiểm tra. Số liệu lấy trực tiếp từ sổ sách hệ thống."
      tabs={[
        { key: 'profit', label: 'Lợi nhuận từng phim', permission: PERMISSION.FINANCE_REPORT_READ, content: <FilmProfitTab /> },
        { key: 'risk', label: 'Giao dịch rủi ro', permission: PERMISSION.RISK_FLAG_MANAGE, content: <RiskFlagsTab /> },
      ]}
    />
    </PermissionGate>
  );
}
