import { PERMISSION } from '@/lib/permissions';
import { PriceAlertsPanel } from '@/features/admin/components/PriceAlertsPanel';
import { PlatformSettingsPanel } from '@/features/admin/components/PlatformSettingsPanel';
import { SectionTabs } from '@/features/admin/components/SectionTabs';

export default function Page() {
  return (
    <SectionTabs
      title="Cài đặt nền tảng"
      description="Khoảng giá Coin, tỉ giá Token, quảng cáo và các cảnh báo khi giá tập nằm ngoài khoảng."
      tabs={[
        { key: 'general', label: 'Cài đặt chung', permission: PERMISSION.PLATFORM_SETTINGS_MANAGE, content: <PlatformSettingsPanel /> },
        { key: 'price-alerts', label: 'Cảnh báo giá', permission: PERMISSION.PRICE_ALERT_MANAGE, content: <PriceAlertsPanel /> },
      ]}
    />
  );
}
