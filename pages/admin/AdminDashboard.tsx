
import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6 text-lighttext dark:text-darktext">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Welcome to the admin panel. From here you can manage the application's content.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/articles" className="block p-6 bg-lightcard dark:bg-darkcard rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold text-primary">Manage Articles</h2>
          <p className="mt-2 text-graytext">Create, edit, and delete news articles.</p>
        </Link>
        <Link to="/admin/categories" className="block p-6 bg-lightcard dark:bg-darkcard rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold text-primary">Manage Categories</h2>
          <p className="mt-2 text-graytext">Add or remove news categories for filtering.</p>
        </Link>
        <Link to="/admin/settings" className="block p-6 bg-lightcard dark:bg-darkcard rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold text-secondary">Manage App Settings</h2>
          <p className="mt-2 text-graytext">Control application-wide settings like social logins.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
