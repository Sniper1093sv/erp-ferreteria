import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/api';

interface SellerFormState {
  name: string;
  zone: string;
  phone: string;
  email: string;
}

const SellerFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formState, setFormState] = useState<SellerFormState>({
    name: '',
    zone: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SellerFormState, string>>>({});

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      apiClient.get(`/sellers/${id}`)
        .then(response => {
          const { name, zone, phone, email } = response.data;
          setFormState({
            name: name || '',
            zone: zone || '',
            phone: phone || '',
            email: email || ''
          });
        })
        .catch(err => {
          setError(err.response?.data?.message || `Failed to fetch seller with id ${id}.`);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
    if (fieldErrors[name as keyof SellerFormState]) {
      setFieldErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SellerFormState, string>> = {};
    if (!formState.name.trim()) newErrors.name = 'Name is required.';
    if (formState.email.trim() && !/\S+@\S+\.\S+/.test(formState.email)) {
        newErrors.email = 'Email is invalid.';
    }
    // Add other validations as needed
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setFieldErrors({});

    const sellerData = { ...formState };

    try {
      if (isEditMode) {
        await apiClient.put(`/sellers/${id}`, sellerData);
      } else {
        await apiClient.post('/sellers', sellerData);
      }
      navigate('/sellers');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} seller.`;
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <p className="text-center text-gray-600 mt-8">Loading seller data...</p>;

  return (
    <div className="container p-4 mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
        {isEditMode ? 'Edit Seller' : 'Add New Seller'}
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
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${fieldErrors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'}`}
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="zone" className="block text-sm font-medium text-gray-700">Zone</label>
          <input
            type="text"
            name="zone"
            id="zone"
            value={formState.zone}
            onChange={handleChange}
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={formState.phone}
            onChange={handleChange}
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formState.email}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${fieldErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'}`}
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
        </div>

        <div className="flex justify-end space-x-3">
            <button
                type="button"
                onClick={() => navigate('/sellers')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            >
                {loading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Seller' : 'Save Seller')}
            </button>
        </div>
      </form>
    </div>
  );
};

export default SellerFormPage;
