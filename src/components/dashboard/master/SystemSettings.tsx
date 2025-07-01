
import React from 'react';
import SystemSettingsUpdater from './SystemSettingsUpdater';

interface SystemSettingsProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const SystemSettings = ({ onBack, onLogout, userData }: SystemSettingsProps) => {
  return (
    <SystemSettingsUpdater
      onBack={onBack}
      onLogout={onLogout}
      userData={userData}
    />
  );
};

export default SystemSettings;
