
import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../services/settingsService';
import { AppSettings } from '../../types';
import Spinner from '../../components/Spinner';

const ManageSettings: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const currentSettings = await getSettings();
            setSettings(currentSettings);
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleToggle = async (option: keyof AppSettings) => {
        if (!settings) return;
        const newSettings = { ...settings, [option]: !settings[option] };
        setSettings(newSettings);
        await updateSettings(newSettings);
    };

    if (loading || !settings) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    const ToggleSwitch = ({ label, isEnabled, onToggle }: { label: string, isEnabled: boolean, onToggle: () => void }) => (
        <div className="flex items-center justify-between p-4 bg-lightcard dark:bg-darkcard rounded-lg shadow-sm">
            <span className="font-semibold text-lg">{label}</span>
            <button
                onClick={onToggle}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">App Settings</h1>
            <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">Login Options</h2>
                <p className="text-graytext">Control which social login providers are available to users on the Login and Sign Up pages.</p>
                <ToggleSwitch 
                    label="Show Google Login" 
                    isEnabled={settings.showGoogleLogin} 
                    onToggle={() => handleToggle('showGoogleLogin')} 
                />
                <ToggleSwitch 
                    label="Show Apple Login" 
                    isEnabled={settings.showAppleLogin} 
                    onToggle={() => handleToggle('showAppleLogin')}
                />
            </div>
        </div>
    );
};

export default ManageSettings;
