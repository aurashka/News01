
import React, { useState, useEffect, useCallback } from 'react';
import { getNewsByCategory, searchArticles } from '../services/newsService';
import { Article } from '../types';
import Spinner from '../components/Spinner';
import NewsCard from '../components/NewsCard';
import { SearchIcon, BackIcon } from '../components/Icons';
import { useNavigate } from 'react-router-dom';

const Discover: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setArticles([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await searchArticles(term);
      setArticles(results);
    } catch (error) {
      console.error("Failed to search articles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };
  
  // Fetch initial "all" articles to show something before search
  useEffect(() => {
    const fetchInitial = async () => {
        setLoading(true);
        try {
            const news = await getNewsByCategory('All');
            setArticles(news);
        } catch (error) {
            console.error("Failed to fetch articles:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchInitial();
  }, []);


  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="text-lighttext dark:text-darktext">
            <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Search</h1>
      </header>
      
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          placeholder="Search for news..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-darkcard rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-graytext" />
      </form>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {articles.length > 0 ? (
            articles.map(article => (
              <NewsCard key={article.id} article={article} variant="horizontal" />
            ))
          ) : (
             hasSearched && <p className="text-center text-graytext mt-8">No articles found for "{searchTerm}".</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Discover;
