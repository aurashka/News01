
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    localStorage.setItem('hasVisited', 'true');
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-lightbg dark:bg-darkbg p-8 text-center text-lighttext dark:text-darktext">
      <div className="w-full flex justify-end">
        <button 
          onClick={() => handleNavigation('/home')}
          className="bg-primary/10 text-primary font-semibold py-2 px-5 rounded-full"
        >
          Skip
        </button>
      </div>
      
      <div className="flex-grow flex items-center justify-center -mt-16">
         <img src="https://storage.googleapis.com/aistudio-hosting/news-onboarding.png" alt="News Illustration" className="w-80 h-80 object-contain" />
      </div>
      
      <div className="w-full">
        <h2 className="text-3xl font-bold">Read the articles you want anywhere</h2>
        <p className="text-graytext mt-4 mb-8">Stay informed on the go with our mobile app. Access breaking news, in-depth analysis, and personalized content anytime, anywhere.</p>
        <button
          onClick={() => handleNavigation('/signup')}
          className="w-full bg-primary text-white font-bold py-4 px-4 rounded-full hover:bg-red-600 transition duration-300 shadow-lg shadow-primary/30"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
