import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { triggerDownload } from '../../utils/download';

interface Seller {
  id: number;
  name: string;
  zone?: string;
  phone?: string;
  email?: string;
}

const SellerListPage: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/sellers');
        setSellers(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch sellers.');
        setSellers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sellers</h1>
        <div className="flex items-center space-x-2">
          <Link
            to="/sellers/new"
            className="px-4 py-2 font-medium text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Add New Seller
          </Link>
          <button
            onClick={() => triggerDownload('/export/sellers/pdf', 'sellers.pdf')}
            className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Export to PDF
          </button>
        </div>
      </div>

      {loading && <p className="text-center text-gray-600">Loading sellers...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && sellers.length === 0 && (
        <p className="text-center text-gray-600">No sellers found.</p>
      )}

      {!loading && !error && sellers.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Name</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Zone</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Phone</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Email</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="px-5 py-4 text-sm bg-white">{seller.name}</td>
                  <td className="px-5 py-4 text-sm bg-white">{seller.zone || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm bg-white">{seller.phone || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm bg-white">{seller.email || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm bg-white">
                    <Link
                      to={`/sellers/edit/${seller.id}`}
                      className="text-teal-600 hover:text-teal-900"
                    >
                      Edit
                    </Link>
                    {/* Delete functionality can be added here if needed later */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerListPage;
