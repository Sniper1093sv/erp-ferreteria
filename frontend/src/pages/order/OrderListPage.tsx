import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { Order, Client, Seller } from '../../interfaces'; // Assuming interfaces are in one file
import { triggerDownload } from '../../utils/download';

const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search parameters
  const [searchClientId, setSearchClientId] = useState('');
  const [searchSellerId, setSearchSellerId] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // For populating client/seller names - ideally backend would provide this
  const [clients, setClients] = useState<Client[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  const fetchOrdersAndRelatedData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch orders
      const queryParams = new URLSearchParams();
      if (searchClientId) queryParams.append('client_id', searchClientId);
      if (searchSellerId) queryParams.append('seller_id', searchSellerId);
      if (searchDate) queryParams.append('date', searchDate);

      const endpoint = queryParams.toString() ? `/orders/search?${queryParams.toString()}` : '/orders';
      const ordersResponse = await apiClient.get(endpoint);

      // Fetch clients and sellers for display - this is a temporary workaround
      // Ideally, the /orders endpoint would return populated client/seller names or objects
      const clientsResponse = await apiClient.get('/clients');
      setClients(clientsResponse.data);
      const sellersResponse = await apiClient.get('/sellers');
      setSellers(sellersResponse.data);

      // Map client/seller names to orders
      const populatedOrders = ordersResponse.data.map((order: Order) => ({
        ...order,
        clientName: clientsResponse.data.find((c: Client) => c.id === order.client_id)?.name || 'Unknown Client',
        sellerName: sellersResponse.data.find((s: Seller) => s.id === order.seller_id)?.name || 'Unknown Seller',
      }));
      setOrders(populatedOrders);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [searchClientId, searchSellerId, searchDate]);

  useEffect(() => {
    fetchOrdersAndRelatedData();
  }, [fetchOrdersAndRelatedData]);

  const handleSearch = () => {
    fetchOrdersAndRelatedData();
  };

  const handleResetSearch = () => {
    setSearchClientId('');
    setSearchSellerId('');
    setSearchDate('');
    // fetchOrdersAndRelatedData will be called by useEffect due to state changes if search was active
    // If not, trigger manually or adjust logic
    if (!searchClientId && !searchSellerId && !searchDate) {
        fetchOrdersAndRelatedData(); // fetch all if already cleared
    }
  };


  const handleDelete = async (orderId: number) => {
    if (window.confirm('Are you sure you want to delete this order? This may also delete associated order details.')) {
      try {
        await apiClient.delete(`/orders/${orderId}`);
        fetchOrdersAndRelatedData(); // Refetch orders
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete order.');
      }
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/orders/new"
            className="px-4 py-2 font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add New Order
          </Link>
          <button
            onClick={() => triggerDownload('/export/orders/pdf', 'orders.pdf')}
            className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Export to PDF
          </button>
          <button
            onClick={() => triggerDownload('/export/orders', 'orders.xlsx')}
            className="px-4 py-2 font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Export to Excel
          </button>
        </div>
      </div>

      {/* Search Form */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input
            type="text"
            placeholder="Client ID"
            value={searchClientId}
            onChange={(e) => setSearchClientId(e.target.value)}
            className="block w-full px-3 py-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <input
            type="text"
            placeholder="Seller ID"
            value={searchSellerId}
            onChange={(e) => setSearchSellerId(e.target.value)}
            className="block w-full px-3 py-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <input
            type="date"
            placeholder="Date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="block w-full px-3 py-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSearch}
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
             <button
              onClick={handleResetSearch}
              className="w-full px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="text-center text-gray-600">Loading orders...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-center text-gray-600">No orders found.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Order ID</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Client</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Seller</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Date</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-right text-gray-600 uppercase">Total</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="px-5 py-4 text-sm bg-white">{order.id}</td>
                  <td className="px-5 py-4 text-sm bg-white">{(order as any).clientName || order.client_id}</td>
                  <td className="px-5 py-4 text-sm bg-white">{(order as any).sellerName || order.seller_id}</td>
                  <td className="px-5 py-4 text-sm bg-white">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-sm text-right bg-white">${order.total.toFixed(2)}</td>
                  <td className="px-5 py-4 text-sm bg-white whitespace-nowrap">
                    <Link
                      to={`/orders/view/${order.id}`}
                      className="mr-3 text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    <Link
                      to={`/orders/edit/${order.id}`}
                      className="mr-3 text-yellow-600 hover:text-yellow-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(order.id)}
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

export default OrderListPage;
