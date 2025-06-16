import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold">Home Page</h2>
      <p>Welcome to the application!</p>
      <p>
        <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
          Login
        </Link>
        {' | '}
        <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-500">
          Dashboard (Protected)
        </Link>
      </p>
    </div>
  );
};

export default HomePage;
