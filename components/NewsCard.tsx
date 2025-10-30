
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Article } from '../types';

interface NewsCardProps {
  article: Article;
  variant?: 'horizontal' | 'vertical';
}

const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'vertical' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/article/${article.id}`);
  };

  if (variant === 'horizontal') {
    return (
      <div onClick={handleClick} className="flex items-center space-x-4 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-darkcard/50">
        <img src={article.imageUrl} alt={article.title} className="w-28 h-28 object-cover rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary truncate">{article.category}</p>
          <h3 className="font-bold text-md text-lighttext dark:text-darktext leading-tight line-clamp-2 my-1">{article.title}</h3>
          <div className="flex items-center mt-2 text-xs text-graytext">
            <img src={article.authorImageUrl} alt={article.authorName} className="w-5 h-5 rounded-full mr-2" />
            <span className="truncate">{article.authorName}</span>
            <span className="mx-1.5">&middot;</span>
            <span className="truncate">{new Date(article.createdAt.seconds * 1000).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={handleClick} className="relative w-full h-64 rounded-xl overflow-hidden cursor-pointer shadow-lg group">
      <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-4 text-white">
        <div className="flex items-center text-xs mb-2">
            <div className="flex items-center">
                <img src={article.authorImageUrl} alt={article.authorName} className="w-6 h-6 rounded-full mr-2 border-2 border-white/50" />
                <span className="font-semibold truncate">{article.authorName}</span>
            </div>
        </div>
        <h2 className="text-lg font-bold line-clamp-3 leading-tight">{article.title}</h2>
      </div>
    </div>
  );
};

export default NewsCard;
