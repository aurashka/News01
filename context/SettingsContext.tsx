
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AppSettings } from '../types';

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
}

const defaultSettings: AppSettings = {
  showGoogleLogin: true,
  showAppleLogin: true,
};

const SettingsContext = createContext<SettingsContextType>({ settings: defaultSettings, loading: true });

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'loginOptions');
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      } else {
        // If settings don't exist, use default
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching settings:", error);
      setSettings(defaultSettings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
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
