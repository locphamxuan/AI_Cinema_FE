import { PERMISSION } from '@/lib/permissions';
import { PriceAlertsPanel } from '@/features/admin/components/PriceAlertsPanel';
import { PlatformSettingsPanel } from '@/features/admin/components/PlatformSettingsPanel';
import { SectionTabs } from '@/features/admin/components/SectionTabs';

export default function Page() {
  return (
    <SectionTabs
      title="Cài đặt nền tảng"
      description="Hạn mức nạp Coin, khoảng giá tập phim, quảng cáo và quy định phát hành."
      tabs={[
        { key: 'general', label: 'Cài đặt chung', permission: PERMISSION.PLATFORM_SETTINGS_MANAGE, content: <PlatformSettingsPanel /> },
        { key: 'price-alerts', label: 'Cảnh báo giá', permission: PERMISSION.PRICE_ALERT_MANAGE, content: <PriceAlertsPanel /> },
      ]}
    />
  );
}
