import React, { createContext, useContext, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { SCOPES } from 'common/shortcut-scopes';

import { Settings } from './settings';

interface SettingsContextType {
  isOpen: boolean;
  openSettings: (defaultPage?: string) => void;
  closeSettings: () => void;
  defaultPage?: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultPage, setDefaultPage] = useState<string | undefined>(undefined);

  const openSettings = (page?: string) => {
    setDefaultPage(page);
    setIsOpen(true);
  };

  const closeSettings = () => {
    setIsOpen(false);
    setDefaultPage(undefined);
  };

  useHotkeys(
    [`g+s`],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event) => {
      switch (event.key) {
        case 's':
          openSettings();
      }
    },
    {
      scopes: [SCOPES.Global],
    },
  );

  return (
    <SettingsContext.Provider
      value={{
        isOpen,
        openSettings,
        closeSettings,
        defaultPage,
      }}
    >
      {children}
      {isOpen && (
        <Settings open={isOpen} setOpen={setIsOpen} defaultPage={defaultPage} />
      )}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
};
