import React from 'react';
import { SettingsModal } from './SettingsModal';

interface SettingsDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, setIsOpen }) => {
  return <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
};
