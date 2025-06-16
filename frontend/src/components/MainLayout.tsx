import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex items-center justify-center h-16 bg-gray-900 text-white">
            <span>My App</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 bg-gray-800">
            <Link to="/dashboard" className="block px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-gray-700">Dashboard</Link>
            <Link to="/clients" className="block px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">Clients</Link>
            <Link to="/sellers" className="block px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">Sellers</Link>
            <Link to="/products" className="block px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">Products</Link>
            <Link to="/orders" className="block px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">Orders</Link>
            <Link to="/profile" className="block px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">Profile</Link>
            {/* Add more links as needed */}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar (optional, could be part of MainLayout or separate) */}
        <header className="flex items-center justify-between p-4 bg-white border-b">
          <div>
            <h1 className="text-xl font-semibold">Page Title</h1>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
