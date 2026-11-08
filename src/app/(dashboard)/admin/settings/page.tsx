import { PERMISSION } from '@/lib/permissions';
import { PriceAlertsPanel } from '@/features/admin/components/PriceAlertsPanel';
import { PlatformSettingsPanel } from '@/features/admin/components/PlatformSettingsPanel';
import { SectionTabs } from '@/features/admin/components/SectionTabs';

export default function Page() {
  return (
    <SectionTabs
      title="Cài đặt nền tảng"
      description="Khoảng giá Coin nạp, định giá tập phim, quảng cáo và các chính sách phát sóng."
      tabs={[
        { key: 'general', label: 'Cài đặt chung', permission: PERMISSION.PLATFORM_SETTINGS_MANAGE, content: <PlatformSettingsPanel /> },
        { key: 'price-alerts', label: 'Cảnh báo giá', permission: PERMISSION.PRICE_ALERT_MANAGE, content: <PriceAlertsPanel /> },
      ]}
    />
  );
}
