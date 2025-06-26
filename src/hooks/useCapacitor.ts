
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useCapacitor = () => {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<string>('web');

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    setPlatform(Capacitor.getPlatform());
  }, []);

  return {
    isNative,
    platform,
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
    isWeb: platform === 'web'
  };
};
