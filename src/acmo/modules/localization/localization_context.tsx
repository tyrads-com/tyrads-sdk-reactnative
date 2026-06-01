import React, { createContext, useContext, useState, useEffect } from 'react';
import LocalizationService from '../../core/services/localization_service';

interface LocalizationContextProps {
  t: (key: string, args?: Record<string, string | number>) => string;
  changeLanguage: (lang: string) => Promise<void>;
  currentLanguage: string;
}

const LocalizationContext = createContext<LocalizationContextProps>({
  t: (key) => key,
  changeLanguage: async () => {},
  currentLanguage: 'en',
});

let _updateLanguage: ((lang: string) => void) | null = null;
let _pendingLanguage: string | null = null;

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const service = LocalizationService.getInstance();

  useEffect(() => {
    _updateLanguage = setCurrentLanguage;
    if (_pendingLanguage) {
      setCurrentLanguage(_pendingLanguage);
      _pendingLanguage = null;
    }
  }, []);

  const changeLanguage = async (lang: string) => {
    await service.changeLanguage(lang);
    setCurrentLanguage(lang);
  };

  const t = (key: string, args?: Record<string, string | number>) => service.translate(key, args);

  return (
    <LocalizationContext.Provider value={{ t, changeLanguage, currentLanguage }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);

export const updateProviderLanguage = async (lang: string) => {
  const service = LocalizationService.getInstance();
  await service.init(lang);
  if (_updateLanguage) {
    _updateLanguage(lang);
  } else {
    _pendingLanguage = lang;
  }
};

export const changeProviderLanguage = async (lang: string) => {
  const service = LocalizationService.getInstance();
  await service.changeLanguage(lang);
  if (_updateLanguage) {
    _updateLanguage(lang);
  } else {
    _pendingLanguage = lang;
  }
};
