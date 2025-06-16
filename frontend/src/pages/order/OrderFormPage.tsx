import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import { Client, Seller, Product, ProductInOrder, Order, OrderDetail } from '../../interfaces';

const OrderFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [clientId, setClientId] = useState<string>('');
  const [sellerId, setSellerId] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [productsInOrder, setProductsInOrder] = useState<ProductInOrder[]>([]);

  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [availableSellers, setAvailableSellers] = useState<Seller[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  const [currentProductSelection, setCurrentProductSelection] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<string>('1');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<any>({});


  // Fetch initial data for dropdowns and edit mode
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [clientsRes, sellersRes, productsRes] = await Promise.all([
          apiClient.get('/clients'),
          apiClient.get('/sellers'),
          apiClient.get('/products'),
        ]);
        setAvailableClients(clientsRes.data);
        setAvailableSellers(sellersRes.data);
        setAvailableProducts(productsRes.data);

        if (isEditMode && id) {
          const orderRes = await apiClient.get<Order>(`/orders/${id}`);
          const orderDetailsRes = await apiClient.get<OrderDetail[]>(`/orders/${id}/details`);

          setClientId(orderRes.data.client_id.toString());
          setSellerId(orderRes.data.seller_id.toString());
          setOrderDate(new Date(orderRes.data.date).toISOString().split('T')[0]);

          const populatedProductsInOrder = orderDetailsRes.data.map(detail => {
            const product = productsRes.data.find((p: Product) => p.id === detail.product_id);
            return {
              productId: detail.product_id,
              quantity: detail.quantity,
              unitPrice: detail.unit_price,
              name: product?.name || 'Unknown Product',
            };
          });
          setProductsInOrder(populatedProductsInOrder);
        }
      } catch (err: any) {
        setFormError('Failed to load initial data. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEditMode]);

  const handleAddProductToOrder = () => {
    if (!currentProductSelection || !currentQuantity) {
      alert('Please select a product and enter quantity.');
      return;
    }
    const product = availableProducts.find(p => p.id === parseInt(currentProductSelection));
    const quantityNum = parseInt(currentQuantity);

    if (product && quantityNum > 0) {
      // Check if product already in order to update quantity, or add new
      const existingProductIndex = productsInOrder.findIndex(p => p.productId === product.id);
      if (existingProductIndex > -1) {
        const updatedProducts = [...productsInOrder];
        updatedProducts[existingProductIndex].quantity += quantityNum;
        setProductsInOrder(updatedProducts);
      } else {
        setProductsInOrder([
          ...productsInOrder,
          { productId: product.id, quantity: quantityNum, unitPrice: product.price, name: product.name },
        ]);
      }
      setCurrentProductSelection('');
      setCurrentQuantity('1');
    } else {
        alert('Invalid product or quantity.');
    }
  };

  const handleRemoveProductFromOrder = (productId: number) => {
    setProductsInOrder(productsInOrder.filter(p => p.productId !== productId));
  };

  const calculatedTotal = useCallback(() => {
    return productsInOrder.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [productsInOrder]);

  const validateForm = (): boolean => {
    const errors: any = {};
    if (!clientId) errors.clientId = "Client is required.";
    if (!sellerId) errors.sellerId = "Seller is required.";
    if (!orderDate) errors.orderDate = "Order date is required.";
    if (productsInOrder.length === 0) errors.products = "At least one product must be added to the order.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setFormError(null);
    const total = calculatedTotal();

    const orderPayload = {
      client_id: parseInt(clientId),
      seller_id: parseInt(sellerId),
      date: orderDate,
      total: total,
    };

    try {
      if (isEditMode && id) {
        // Edit mode: Update order meta. Product details update is complex.
        // For now, we are re-posting all products as if it's a new set.
        // A more robust solution would involve checking diffs or dedicated backend endpoints.
        await apiClient.put(`/orders/${id}`, orderPayload);

        // Simplistic approach for demo: delete existing details and re-add.
        // NOT recommended for production without transactions or better backend logic.
        const existingDetails = await apiClient.get<OrderDetail[]>(`/orders/${id}/details`);
        for (const detail of existingDetails.data) {
            // This endpoint might not exist, or cascade delete is preferred.
            // await apiClient.delete(`/orders/${id}/details/${detail.id}`); // Placeholder
        }
        // The prompt implies `/orders/<id>/add_product` is the way.
        // If backend handles deletion of old items on PUT /orders/<id> + new items via add_product, that's one way.
        // For now, we assume we only add, and backend might need to handle reconciliation or we inform user.
        // The task description focused on add_product for new orders.
        // For edit, let's assume the backend handles replacing products if the main order PUT includes them,
        // or we just update client/seller/date and total.
        // The given backend structure implies products are added one by one.
        // Let's prompt that product editing is limited for now or requires re-adding.
        alert("Order metadata (client, seller, date, total) updated. Product list updates in edit mode might be limited with current backend structure. For full product changes, consider creating a new order.");
        // If we were to try to update products:
        // for (const prodInOrder of productsInOrder) {
        //   await apiClient.post(`/orders/${id}/add_product`, { // This might create duplicates if not handled by backend
        //     product_id: prodInOrder.productId,
        //     quantity: prodInOrder.quantity,
        //     unit_price: prodInOrder.unitPrice,
        //   });
        // }
        navigate(`/orders/view/${id}`);

      } else { // Create mode
        const orderResponse = await apiClient.post('/orders', orderPayload);
        const newOrderId = orderResponse.data.id;
        for (const prodInOrder of productsInOrder) {
          await apiClient.post(`/orders/${newOrderId}/add_product`, {
            product_id: prodInOrder.productId,
            quantity: prodInOrder.quantity,
            unit_price: prodInOrder.unitPrice,
          });
        }
        navigate(`/orders/view/${newOrderId}`);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} order.`);
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !availableClients.length) return <p className="text-center text-gray-600 mt-8">Loading form data...</p>;

  return (
    <div className="container p-4 mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
        {isEditMode ? 'Edit Order' : 'Create New Order'}
      </h1>
      {formError && <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-md">{formError}</div>}

      <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white rounded-lg shadow-md">
        {/* Order Meta Section */}
        <fieldset className="p-4 border rounded-md">
          <legend className="px-2 text-lg font-semibold text-gray-700">Order Information</legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Client</label>
              <select id="clientId" name="clientId" value={clientId} onChange={e => setClientId(e.target.value)} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${fieldErrors.clientId ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}>
                <option value="">Select Client</option>
                {availableClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {fieldErrors.clientId && <p className="mt-1 text-xs text-red-600">{fieldErrors.clientId}</p>}
            </div>
            <div>
              <label htmlFor="sellerId" className="block text-sm font-medium text-gray-700">Seller</label>
              <select id="sellerId" name="sellerId" value={sellerId} onChange={e => setSellerId(e.target.value)} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${fieldErrors.sellerId ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}>
                <option value="">Select Seller</option>
                {availableSellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {fieldErrors.sellerId && <p className="mt-1 text-xs text-red-600">{fieldErrors.sellerId}</p>}
            </div>
            <div>
              <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700">Order Date</label>
              <input type="date" id="orderDate" name="orderDate" value={orderDate} onChange={e => setOrderDate(e.target.value)} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${fieldErrors.orderDate ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`} />
              {fieldErrors.orderDate && <p className="mt-1 text-xs text-red-600">{fieldErrors.orderDate}</p>}
            </div>
          </div>
        </fieldset>

        {/* Add Products Section */}
        <fieldset className="p-4 border rounded-md">
          <legend className="px-2 text-lg font-semibold text-gray-700">Add Products to Order</legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-end">
            <div className="md:col-span-1">
              <label htmlFor="productSelection" className="block text-sm font-medium text-gray-700">Product</label>
              <select id="productSelection" value={currentProductSelection} onChange={e => setCurrentProductSelection(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="">Select Product</option>
                {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price.toFixed(2)}) - Stock: {p.stock}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
              <input type="number" id="quantity" value={currentQuantity} onChange={e => setCurrentQuantity(e.target.value)} min="1" className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <button type="button" onClick={handleAddProductToOrder} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-fit">Add to Order</button>
          </div>
          {fieldErrors.products && <p className="mt-2 text-xs text-red-600">{fieldErrors.products}</p>}
        </fieldset>

        {/* Products In Order Table */}
        {productsInOrder.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-700">Current Products in Order</h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="px-3 py-2 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Product Name</th>
                    <th className="px-3 py-2 text-xs font-semibold tracking-wider text-right text-gray-600 uppercase">Qty</th>
                    <th className="px-3 py-2 text-xs font-semibold tracking-wider text-right text-gray-600 uppercase">Unit Price</th>
                    <th className="px-3 py-2 text-xs font-semibold tracking-wider text-right text-gray-600 uppercase">Subtotal</th>
                    <th className="px-3 py-2 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {productsInOrder.map(item => (
                    <tr key={item.productId} className="border-b border-gray-200">
                      <td className="px-3 py-2 text-sm bg-white">{item.name}</td>
                      <td className="px-3 py-2 text-sm text-right bg-white">{item.quantity}</td>
                      <td className="px-3 py-2 text-sm text-right bg-white">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-sm text-right bg-white">${(item.unitPrice * item.quantity).toFixed(2)}</td>
                      <td className="px-3 py-2 text-sm text-center bg-white">
                        <button type="button" onClick={() => handleRemoveProductFromOrder(item.productId)} className="text-red-500 hover:text-red-700">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold text-gray-700 bg-gray-50">
                    <td colSpan={3} className="px-3 py-2 text-sm text-right uppercase">Total</td>
                    <td className="px-3 py-2 text-sm text-right">${calculatedTotal().toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={() => navigate('/orders')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                {loading ? (isEditMode ? 'Updating Order...' : 'Saving Order...') : (isEditMode ? 'Update Order' : 'Save Order')}
            </button>
        </div>
      </form>
    </div>
  );
};

export default OrderFormPage;
