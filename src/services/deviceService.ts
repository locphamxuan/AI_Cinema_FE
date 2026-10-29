import { apiClient, ApiResponse } from './apiClient';
import { deviceKey } from './playbackService';
import type { DeviceOverview } from '@/types/device';

/** MF-4: the member's registered devices and live streams, and actions that free a stream slot. */
export const deviceService = {
  /** X-Device-Id lets the BE flag this browser as the current device. */
  overview(): Promise<ApiResponse<DeviceOverview>> {
    return apiClient.get<DeviceOverview>('/devices', {
      headers: { 'X-Device-Id': deviceKey() },
    });
  },

  /** Remove a registered device and end what it is playing. */
  remove(deviceId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/devices/${deviceId}`);
  },

  /** End one live stream so another device can play. */
  endStream(sessionId: string): Promise<ApiResponse<null>> {
    return apiClient.post<null>(`/devices/sessions/${sessionId}/end`, {});
  },
};
