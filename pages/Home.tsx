
import React, { useState, useEffect } from 'react';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { seedDummyData } from '../services/newsService';
import { Article, Category } from '../types';
import Spinner from '../components/Spinner';
import NewsCard from '../components/NewsCard';
import { BellIcon, SearchIcon } from '../components/Icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [recommendedNews, setRecommendedNews] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const performInitialSeed = async () => {
        await seedDummyData();
        setInitialLoad(false);
    };
    performInitialSeed();
  }, []);

  useEffect(() => {
    if (initialLoad) return;

    setLoading(true);

    // Listener for Breaking News
    const breakingQuery = query(collection(db, 'articles'), where("isBreaking", "==", true), limit(5));
    const unsubBreaking = onSnapshot(breakingQuery, snapshot => {
      setBreakingNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
      setLoading(false);
    });

    // Listener for Categories
    const catQuery = query(collection(db, 'categories'), orderBy('name'));
    const unsubCategories = onSnapshot(catQuery, snapshot => {
        const fetchedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories([{id: 'all', name: 'All'}, ...fetchedCategories]);
    });

    return () => {
      unsubBreaking();
      unsubCategories();
    };
  }, [initialLoad]);

  useEffect(() => {
    if (initialLoad) return;

    // Listener for Recommended News based on category
    let recommendedQuery;
    if (selectedCategory.toLowerCase() === 'all') {
        recommendedQuery = query(collection(db, 'articles'), orderBy("createdAt", "desc"));
    } else {
        recommendedQuery = query(collection(db, 'articles'), where("category", "==", selectedCategory), orderBy("createdAt", "desc"));
    }
    
    const unsubRecommended = onSnapshot(recommendedQuery, snapshot => {
        const allCategoryNews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
        setRecommendedNews(allCategoryNews.filter(a => !a.isBreaking));
    });

    return () => unsubRecommended();

  }, [selectedCategory, initialLoad]);

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-3">
          <img 
            src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`} 
            alt="Profile" 
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="text-graytext text-sm">Welcome back,</p>
            <h1 className="font-bold text-lg">{user?.displayName || 'User'}!</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
            <button className="text-lighttext dark:text-darktext relative p-2 bg-gray-100 dark:bg-darkcard rounded-full">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary ring-2 ring-lightbg dark:ring-darkbg"></span>
            </button>
        </div>
      </header>

      <div className="px-4">
        <div onClick={() => navigate('/discover')} className="relative cursor-pointer">
            <div className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-darkcard rounded-full text-graytext pointer-events-none">
              Search for news...
            </div>
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-graytext" />
        </div>
      </div>

      {(loading && !breakingNews.length) ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <>
          <section>
            <div className="flex justify-between items-center mb-4 px-4">
              <h2 className="text-xl font-bold">Breaking News</h2>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/discover'); }} className="text-sm text-primary font-semibold">View all</a>
            </div>
            {breakingNews.length > 0 ? (
                <div className="flex overflow-x-auto space-x-4 pl-4 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
                    {breakingNews.map(article => (
                        <div key={article.id} className="flex-shrink-0 w-11/12 md:w-1/2" style={{ scrollSnapAlign: 'start' }}>
                            <NewsCard article={article} />
                        </div>
                    ))}
                     <div className="flex-shrink-0 w-1"></div>
                </div>
            ) : <p className="px-4">No breaking news available.</p>}
          </section>

          <section>
             <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                <div className="flex space-x-3">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                        selectedCategory === category.name
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 dark:bg-darkcard text-lighttext dark:text-darktext'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            <div className="space-y-4 px-4 mt-4">
              {recommendedNews.map(article => (
                <NewsCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
