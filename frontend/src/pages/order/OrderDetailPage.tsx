import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { Order, OrderDetail, Client, Seller, Product } from '../../interfaces';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  // To store full product info for display
  const [productsInfo, setProductsInfo] = useState<Record<number, Product>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!id) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch main order data
        const orderResponse = await apiClient.get<Order>(`/orders/${id}`);
        setOrder(orderResponse.data);

        // Fetch order details (line items)
        const detailsResponse = await apiClient.get<OrderDetail[]>(`/orders/${id}/details`);
        setOrderDetails(detailsResponse.data);

        // Fetch related data (client, seller, products for all details)
        if (orderResponse.data) {
          const clientRes = await apiClient.get<Client>(`/clients/${orderResponse.data.client_id}`);
          setClient(clientRes.data);
          const sellerRes = await apiClient.get<Seller>(`/sellers/${orderResponse.data.seller_id}`);
          setSeller(sellerRes.data);

          // Fetch all unique products in the order details
          const productIds = [...new Set(detailsResponse.data.map(d => d.product_id))];
          const productPromises = productIds.map(pid => apiClient.get<Product>(`/products/${pid}`));
          const productResults = await Promise.all(productPromises);

          const productsMap: Record<number, Product> = {};
          productResults.forEach(res => {
            productsMap[res.data.id] = res.data;
          });
          setProductsInfo(productsMap);
        }

      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id]);

  if (loading) return <p className="text-center text-gray-600 mt-8">Loading order details...</p>;
  if (error) return <p className="text-center text-red-600 mt-8">{error}</p>;
  if (!order) return <p className="text-center text-gray-600 mt-8">Order not found.</p>;

  return (
    <div className="container p-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Order Details: #{order.id}</h1>
        <Link
            to="/orders"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
            Back to Orders List
        </Link>
      </div>

      <div className="p-6 mb-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-700">Order Summary</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
          <p><strong>Client:</strong> {client ? `${client.name} (ID: ${order.client_id})` : `ID: ${order.client_id}`}</p>
          <p><strong>Seller:</strong> {seller ? `${seller.name} (ID: ${order.seller_id})` : `ID: ${order.seller_id}`}</p>
          <p className="md:col-span-2"><strong>Total Amount:</strong> <span className="font-bold text-green-600">${order.total.toFixed(2)}</span></p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <h2 className="p-5 text-xl font-semibold text-gray-700 border-b">Products in this Order</h2>
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Product Name</th>
              <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Product ID</th>
              <th className="px-5 py-3 text-xs font-semibold tracking-wider text-right text-gray-600 uppercase">Quantity</th>
              <th className="px-5 py-3 text-xs font-semibold tracking-wider text-right text-gray-600 uppercase">Unit Price</th>
              <th className="px-5 py-3 text-xs font-semibold tracking-wider text-right text-gray-600 uppercase">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map((detail) => {
              const product = productsInfo[detail.product_id];
              const subtotal = detail.quantity * detail.unit_price;
              return (
                <tr key={detail.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="px-5 py-4 text-sm bg-white">{product?.name || 'Loading...'}</td>
                  <td className="px-5 py-4 text-sm bg-white">{detail.product_id}</td>
                  <td className="px-5 py-4 text-sm text-right bg-white">{detail.quantity}</td>
                  <td className="px-5 py-4 text-sm text-right bg-white">${detail.unit_price.toFixed(2)}</td>
                  <td className="px-5 py-4 text-sm text-right bg-white">${subtotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-semibold text-gray-700 bg-gray-50">
                <td colSpan={4} className="px-5 py-3 text-sm text-right uppercase">Total Order Amount</td>
                <td className="px-5 py-3 text-sm text-right">${order.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default OrderDetailPage;
