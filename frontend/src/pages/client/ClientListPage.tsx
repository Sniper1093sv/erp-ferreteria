import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce'; // Corrected path
import { triggerDownload } from '../../utils/download';

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string; // Optional as per typical client data
  address?: string; // Optional
}

const ClientListPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (debouncedSearchTerm) {
        response = await apiClient.get(`/clients/search?q=${debouncedSearchTerm}`);
      } else {
        response = await apiClient.get('/clients');
      }
      setClients(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch clients.');
      setClients([]); // Clear clients on error
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async (clientId: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await apiClient.delete(`/clients/${clientId}`);
        fetchClients(); // Refetch clients after deletion
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete client.');
      }
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Clients</h1>
        <div className="flex items-center space-x-2">
          <Link
            to="/clients/new"
            className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add New Client
          </Link>
          <button
            onClick={() => triggerDownload('/export/clients/pdf', 'clients.pdf')}
            className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Export to PDF
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full max-w-sm px-4 py-2 text-gray-700 placeholder-gray-500 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {loading && <p className="text-center text-gray-600">Loading clients...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && clients.length === 0 && (
        <p className="text-center text-gray-600">No clients found.</p>
      )}

      {!loading && !error && clients.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Name</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Email</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Phone</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Address</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="px-5 py-4 text-sm bg-white">{client.name}</td>
                  <td className="px-5 py-4 text-sm bg-white">{client.email}</td>
                  <td className="px-5 py-4 text-sm bg-white">{client.phone || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm bg-white">{client.address || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm bg-white">
                    <Link
                      to={`/clients/edit/${client.id}`}
                      className="mr-3 text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
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

export default ClientListPage;
