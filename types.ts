
import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role?: 'user' | 'admin';
  bookmarkedArticles?: string[];
}

export interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  category: string;
  authorName: string;
  authorImageUrl: string;
  createdAt: Timestamp;
  isBreaking?: boolean;
}

export interface Category {
    id: string;
    name: string;
}

export interface AppSettings {
    showGoogleLogin: boolean;
    showAppleLogin: boolean;
}
