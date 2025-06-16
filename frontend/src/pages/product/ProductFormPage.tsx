import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/api';

interface ProductFormState {
  name: string;
  description: string;
  price: string; // Keep as string for form input, convert on submit
  stock: string; // Keep as string for form input, convert on submit
  category: string;
}

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formState, setFormState] = useState<ProductFormState>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProductFormState, string>>>({});

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      apiClient.get(`/products/${id}`)
        .then(response => {
          const { name, description, price, stock, category } = response.data;
          setFormState({
            name: name || '',
            description: description || '',
            price: price?.toString() || '',
            stock: stock?.toString() || '',
            category: category || '',
          });
        })
        .catch(err => {
          setError(err.response?.data?.message || `Failed to fetch product with id ${id}.`);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
    if (fieldErrors[name as keyof ProductFormState]) {
      setFieldErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormState, string>> = {};
    if (!formState.name.trim()) newErrors.name = 'Name is required.';

    const priceVal = parseFloat(formState.price);
    if (isNaN(priceVal) || priceVal < 0) newErrors.price = 'Price must be a non-negative number.';

    const stockVal = parseInt(formState.stock, 10);
    if (isNaN(stockVal) || stockVal < 0) newErrors.stock = 'Stock must be a non-negative integer.';

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setFieldErrors({});

    const productData = {
      name: formState.name,
      description: formState.description,
      price: parseFloat(formState.price),
      stock: parseInt(formState.stock, 10),
      category: formState.category,
    };

    try {
      if (isEditMode) {
        await apiClient.put(`/products/${id}`, productData);
      } else {
        await apiClient.post('/products', productData);
      }
      navigate('/products');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} product.`;
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <p className="text-center text-gray-600 mt-8">Loading product data...</p>;

  return (
    <div className="container p-4 mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
        {isEditMode ? 'Edit Product' : 'Add New Product'}
      </h1>
      {error && <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-md">{error}</div>}
      <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white rounded-lg shadow-md">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formState.name}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${fieldErrors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            id="description"
            value={formState.description}
            onChange={handleChange}
            rows={3}
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            id="price"
            value={formState.price}
            onChange={handleChange}
            step="0.01"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${fieldErrors.price ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
          />
          {fieldErrors.price && <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>}
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
          <input
            type="number"
            name="stock"
            id="stock"
            value={formState.stock}
            onChange={handleChange}
            step="1"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${fieldErrors.stock ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
          />
          {fieldErrors.stock && <p className="mt-1 text-xs text-red-600">{fieldErrors.stock}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            id="category"
            value={formState.category}
            onChange={handleChange}
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3">
            <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
                {loading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Product' : 'Save Product')}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
