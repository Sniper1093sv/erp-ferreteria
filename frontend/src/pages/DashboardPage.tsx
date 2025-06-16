import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

interface StatsData {
  total_orders: number;
  total_sales: number;
  total_products: number;
  total_clients: number;
  total_sellers: number;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<StatsData>('/stats');
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  if (loading) {
    return <p className="p-6 text-center text-gray-600">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="p-6 text-center text-red-600">Error: {error}</p>;
  }

  if (!stats) {
    return <p className="p-6 text-center text-gray-600">No statistics data available.</p>;
  }

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-800 md:text-left">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Total Orders Card */}
        <div className="bg-white shadow rounded-lg p-6 transform transition duration-500 hover:scale-105">
          <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
          <p className="mt-1 text-3xl font-semibold text-indigo-600">{stats.total_orders}</p>
        </div>

        {/* Total Sales Card */}
        <div className="bg-white shadow rounded-lg p-6 transform transition duration-500 hover:scale-105">
          <h3 className="text-lg font-medium text-gray-900">Total Sales</h3>
          <p className="mt-1 text-3xl font-semibold text-green-600">{formatCurrency(stats.total_sales)}</p>
        </div>

        {/* Total Products Card */}
        <div className="bg-white shadow rounded-lg p-6 transform transition duration-500 hover:scale-105">
          <h3 className="text-lg font-medium text-gray-900">Total Products</h3>
          <p className="mt-1 text-3xl font-semibold text-purple-600">{stats.total_products}</p>
        </div>

        {/* Total Clients Card */}
        <div className="bg-white shadow rounded-lg p-6 transform transition duration-500 hover:scale-105">
          <h3 className="text-lg font-medium text-gray-900">Total Clients</h3>
          <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.total_clients}</p>
        </div>

        {/* Total Sellers Card */}
        <div className="bg-white shadow rounded-lg p-6 transform transition duration-500 hover:scale-105">
          <h3 className="text-lg font-medium text-gray-900">Total Sellers</h3>
          <p className="mt-1 text-3xl font-semibold text-teal-600">{stats.total_sellers}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
