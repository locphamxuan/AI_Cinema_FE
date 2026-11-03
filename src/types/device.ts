/** One device the member registered to watch on (MF-4). */
export interface RegisteredDevice {
  id: string;
  name: string;
  /** IOS, ANDROID, WEB or OTHER. */
  platform: string;
  createdAt: string;
  lastSeenAt: string;
  /** This browser / install. */
  current: boolean;
}

/** A live stream of the member that is playing right now. */
export interface LiveStream {
  id: string;
  deviceId: string | null;
  startedAt: string;
  lastHeartbeatAt: string;
  positionSeconds: number;
  episode: {
    id: string;
    title: string;
    episodeNumber: number;
    movieTitle: string;
  };
}

export interface DeviceOverview {
  limits: {
    maxRegisteredDevices: number;
    maxConcurrentStreams: number;
  };
  devices: RegisteredDevice[];
  activeSessions: LiveStream[];
}
