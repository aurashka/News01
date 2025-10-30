
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AppSettings } from '../types';

const SETTINGS_COLLECTION = 'settings';
const LOGIN_OPTIONS_DOC = 'loginOptions';

export const getSettings = async (): Promise<AppSettings> => {
    const docRef = doc(db, SETTINGS_COLLECTION, LOGIN_OPTIONS_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as AppSettings;
    }
    // Return default settings if document doesn't exist
    return {
        showGoogleLogin: true,
        showAppleLogin: true,
    };
};

export const updateSettings = async (settings: Partial<AppSettings>): Promise<void> => {
    const docRef = doc(db, SETTINGS_COLLECTION, LOGIN_OPTIONS_DOC);
    // Use setDoc with merge: true to create or update the document
    await setDoc(docRef, settings, { merge: true });
};
