
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getBookmarkedArticles } from '../services/newsService';
import { Article } from '../types';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import NewsCard from '../components/NewsCard';
import { SearchIcon, BookmarkIconFilled } from '../components/Icons';
import { useNavigate } from 'react-router-dom';


const Bookmarks: React.FC = () => {
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const bookmarkedIds = docSnap.data()?.bookmarkedArticles || [];
        if (bookmarkedIds.length > 0) {
            const articles = await getBookmarkedArticles(user.uid);
            setBookmarkedArticles(articles);
        } else {
            setBookmarkedArticles([]);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Failed to listen for bookmark updates:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bookmarks</h1>
        <button onClick={() => navigate('/discover')} className="text-lighttext dark:text-darktext"><SearchIcon className="w-6 h-6" /></button>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedArticles.length > 0 ? (
            bookmarkedArticles.map(article => (
              <NewsCard key={article.id} article={article} variant="horizontal" />
            ))
          ) : (
            <div className="text-center pt-16">
                <BookmarkIconFilled className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="text-graytext mt-4">You have no bookmarked articles yet.</p>
                <p className="text-sm text-gray-400">Tap the bookmark icon on an article to save it.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
