import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/api';

interface ClientFormState {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const ClientFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formState, setFormState] = useState<ClientFormState>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ClientFormState, string>>>({});

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      apiClient.get(`/clients/${id}`)
        .then(response => {
          const { name, email, phone, address } = response.data;
          setFormState({ name, email, phone: phone || '', address: address || '' });
        })
        .catch(err => {
          setError(err.response?.data?.message || `Failed to fetch client with id ${id}.`);
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
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof ClientFormState]) {
      setFieldErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientFormState, string>> = {};
    if (!formState.name.trim()) newErrors.name = 'Name is required.';
    if (!formState.email.trim()) {
        newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
        newErrors.email = 'Email is invalid.';
    }
    // Add other validations as needed (e.g., phone format)
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setFieldErrors({});

    const clientData = { ...formState };

    try {
      if (isEditMode) {
        await apiClient.put(`/clients/${id}`, clientData);
      } else {
        await apiClient.post('/clients', clientData);
      }
      navigate('/clients');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} client.`;
      if (err.response?.data?.errors) { // Assuming backend might send field-specific errors
        setFieldErrors(err.response.data.errors);
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <p className="text-center text-gray-600 mt-8">Loading client data...</p>;

  return (
    <div className="container p-4 mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
        {isEditMode ? 'Edit Client' : 'Add New Client'}
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
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${fieldErrors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formState.email}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${fieldErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={formState.phone}
            onChange={handleChange}
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            name="address"
            id="address"
            value={formState.address}
            onChange={handleChange}
            rows={3}
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3">
            <button
                type="button"
                onClick={() => navigate('/clients')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                {loading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Client' : 'Save Client')}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ClientFormPage;
