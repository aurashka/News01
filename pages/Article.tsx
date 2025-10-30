
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getArticleById, toggleBookmark, getUserBookmarks } from '../services/newsService';
import { summarizeArticle } from '../services/geminiService';
import { Article as ArticleType } from '../types';
import Spinner from '../components/Spinner';
import { BackIcon, BookmarkIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const fetchArticleData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const articleData = await getArticleById(id);
      setArticle(articleData);
      
      if (user) {
        const bookmarks = await getUserBookmarks(user.uid);
        if (bookmarks.includes(id)) {
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch article data:", error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchArticleData();
  }, [fetchArticleData]);

  const handleToggleBookmark = async () => {
    if (!user) {
        navigate('/login', { state: { from: location } });
        return;
    }
    if (!id) return;
    await toggleBookmark(user.uid, id);
    setIsBookmarked(!isBookmarked);
  };

  const handleSummarize = async () => {
    if (!article) return;
    setIsSummarizing(true);
    setSummary('');
    try {
        const result = await summarizeArticle(article.content);
        setSummary(result);
    } catch (error) {
        setSummary('Failed to generate summary.');
    } finally {
        setIsSummarizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-lightbg dark:bg-darkbg">
        <Spinner />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold">Article not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary">Go Back</button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-80">
        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="bg-black/30 p-2 rounded-full text-white">
            <BackIcon className="w-6 h-6" />
          </button>
          <button onClick={handleToggleBookmark} className="bg-black/30 p-2 rounded-full text-white">
            <BookmarkIcon className={`w-6 h-6 transition-colors ${isBookmarked ? 'fill-current text-yellow-400' : 'stroke-current'}`} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
            <span className="bg-primary text-white text-sm font-semibold px-2 py-1 rounded">{article.category}</span>
            <h1 className="text-white text-2xl font-bold mt-2">{article.title}</h1>
        </div>
      </div>
      
      <div className="p-4 space-y-4 pb-8">
        <div className="flex items-center">
            <img src={article.authorImageUrl} alt={article.authorName} className="w-10 h-10 rounded-full mr-3" />
            <div>
                <p className="font-bold text-lighttext dark:text-darktext">{article.authorName}</p>
                <p className="text-sm text-graytext">{new Date(article.createdAt.seconds * 1000).toLocaleDateString()}</p>
            </div>
        </div>

        <button 
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50"
        >
            {isSummarizing ? 'Summarizing with AI...' : '✨ Summarize with AI'}
        </button>

        {summary && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">AI Summary</h3>
                <div className="text-sm text-blue-700 dark:text-blue-200 whitespace-pre-wrap">{summary}</div>
            </div>
        )}

        <p className="text-base leading-relaxed text-lighttext dark:text-gray-300 whitespace-pre-wrap">
            {article.content}
        </p>
      </div>
    </div>
  );
};

export default Article;
