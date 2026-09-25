import { create } from 'zustand';

// Device management belongs to MF-4 and has no backend API yet, so the list is
// still seeded locally. Replace `mockUserDevices` with GET /api/devices once it exists.
export interface UserDevice {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'tv';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrentDevice: boolean;
}

const mockUserDevices: UserDevice[] = [
  {
    id: 'dev-01',
    deviceName: 'MacBook Pro M3 Max 16"',
    deviceType: 'desktop',
    browser: 'Google Chrome 128.0',
    os: 'macOS Sonoma',
    ipAddress: '113.161.72.45',
    location: 'Quận 1, TP. Hồ Chí Minh',
    lastActive: 'Đang hoạt động',
    isCurrentDevice: true,
  },
  {
    id: 'dev-02',
    deviceName: 'iPhone 15 Pro Max',
    deviceType: 'mobile',
    browser: 'Ứng dụng AI Cinema iOS',
    os: 'iOS 18.1',
    ipAddress: '14.169.84.102',
    location: 'Quận 7, TP. Hồ Chí Minh',
    lastActive: '25 phút trước',
    isCurrentDevice: false,
  },
  {
    id: 'dev-03',
    deviceName: 'Samsung Neo QLED 4K 65"',
    deviceType: 'tv',
    browser: 'AI Cinema SmartTV App',
    os: 'Tizen OS 7.0',
    ipAddress: '115.78.23.190',
    location: 'Cầu Giấy, Hà Nội',
    lastActive: 'Hôm qua lúc 21:40',
    isCurrentDevice: false,
  },
  {
    id: 'dev-04',
    deviceName: 'iPad Pro M2 12.9"',
    deviceType: 'tablet',
    browser: 'Safari Mobile 18.0',
    os: 'iPadOS 18.0',
    ipAddress: '118.69.191.12',
    location: 'Hải Châu, Đà Nẵng',
    lastActive: '3 ngày trước',
    isCurrentDevice: false,
  },
];

interface DeviceState {
  devices: UserDevice[];
  revokeDevice: (deviceId: string) => void;
  revokeAllOtherDevices: () => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: mockUserDevices,

  revokeDevice: (deviceId) => set((state) => ({ devices: state.devices.filter((d) => d.id !== deviceId) })),

  revokeAllOtherDevices: () => set((state) => ({ devices: state.devices.filter((d) => d.isCurrentDevice) })),
}));
