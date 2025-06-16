import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { triggerDownload } from '../../utils/download';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
}

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (debouncedSearchTerm) {
        response = await apiClient.get(`/products/search?q=${debouncedSearchTerm}`);
      } else {
        response = await apiClient.get('/products');
      }
      setProducts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiClient.delete(`/products/${productId}`);
        fetchProducts(); // Refetch products after deletion
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete product.');
      }
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <div className="flex items-center space-x-2">
          <Link
            to="/products/new"
            className="px-4 py-2 font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Add New Product
          </Link>
          <button
            onClick={() => triggerDownload('/export/products/pdf', 'products.pdf')}
            className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Export to PDF
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full max-w-sm px-4 py-2 text-gray-700 placeholder-gray-500 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
      </div>

      {loading && <p className="text-center text-gray-600">Loading products...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="text-center text-gray-600">No products found.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Name</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Price</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Stock</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Category</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="px-5 py-4 text-sm bg-white">{product.name}</td>
                  <td className="px-5 py-4 text-sm bg-white">${product.price.toFixed(2)}</td>
                  <td className="px-5 py-4 text-sm bg-white">{product.stock}</td>
                  <td className="px-5 py-4 text-sm bg-white">{product.category || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm bg-white">
                    <Link
                      to={`/products/edit/${product.id}`}
                      className="mr-3 text-green-600 hover:text-green-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
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

export default ProductListPage;
