import { useState, useEffect, useCallback } from 'react';
import { useLabNet } from '../context/LabNetContext';
import { NetworkMode, MeteredNetworkState } from '../types';

export function useNetworkStatus() {
  const { settings, updateSettings, showToast } = useLabNet();

  const [isBrowserOnline, setIsBrowserOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Monitor physical browser connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsBrowserOnline(true);
      showToast('Wired / Physical network connection restored', 'info');
    };
    const handleOffline = () => {
      setIsBrowserOnline(false);
      showToast('Physical network offline. Operating via local cache & air-gapped storage.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  const meteredState: MeteredNetworkState = settings.meteredNetwork || {
    mode: 'wired_metered',
    isPhysicalOffline: !isBrowserOnline,
    monthlyCapGb: 50,
    usedBandwidthGb: 18.4,
    bandwidthSavedByCacheGb: 48.2,
    localCacheServerUrl: 'http://10.10.1.5:8080/repo/packages',
    localCacheActive: true,
    throttleTelemetryOnMetered: true,
    blockWanPackagesAboveMb: 250,
    lastSyncTimestamp: 'Just now'
  };

  const isMetered = meteredState.mode === 'wired_metered';
  const isAirGapped = meteredState.mode === 'offline_airgapped' || !isBrowserOnline;

  const setNetworkMode = useCallback((mode: NetworkMode) => {
    updateSettings({
      meteredNetwork: {
        ...meteredState,
        mode
      }
    });

    const labels: Record<NetworkMode, string> = {
      unmetered_fiber: 'Switched to Campus High-Speed Fiber (Unmetered WAN)',
      wired_metered: 'Switched to Wired Metered Ethernet (Bandwidth Cap & Local LAN Cache Active)',
      offline_airgapped: 'Switched to Isolated Air-Gapped / Offline Local LAN Mode'
    };

    showToast(labels[mode], mode === 'offline_airgapped' ? 'warning' : 'info');
  }, [meteredState, updateSettings, showToast]);

  const updateMeteredSettings = useCallback((partial: Partial<MeteredNetworkState>) => {
    updateSettings({
      meteredNetwork: {
        ...meteredState,
        ...partial
      }
    });
    showToast('Metered network policies updated', 'success');
  }, [meteredState, updateSettings, showToast]);

  // Record bandwidth consumption during deployments
  const recordBandwidthUsage = useCallback((sizeMb: number, fromLocalCache: boolean) => {
    const sizeGb = sizeMb / 1024;
    if (fromLocalCache) {
      updateSettings({
        meteredNetwork: {
          ...meteredState,
          bandwidthSavedByCacheGb: Number((meteredState.bandwidthSavedByCacheGb + sizeGb).toFixed(2))
        }
      });
    } else {
      updateSettings({
        meteredNetwork: {
          ...meteredState,
          usedBandwidthGb: Number((meteredState.usedBandwidthGb + sizeGb).toFixed(2))
        }
      });
    }
  }, [meteredState, updateSettings]);

  return {
    isBrowserOnline,
    isMetered,
    isAirGapped,
    meteredState,
    setNetworkMode,
    updateMeteredSettings,
    recordBandwidthUsage
  };
}
