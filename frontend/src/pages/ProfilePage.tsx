import React, { useState } from 'react';
import apiClient from '../services/api';
// import { useNavigate } from 'react-router-dom'; // Not strictly needed for just password change

const ProfilePage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false); // To distinguish message type
  const [loading, setLoading] = useState<boolean>(false);
  // const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setIsError(false);

    if (!newPassword) {
      setMessage('New password cannot be empty.');
      setIsError(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsError(true);
      return;
    }
    // Basic password strength check (optional, can be enhanced)
    if (newPassword.length < 6) {
        setMessage('Password must be at least 6 characters long.');
        setIsError(true);
        return;
    }

    setLoading(true);
    try {
      // Assuming the backend /change_password route infers the user from the JWT token
      await apiClient.post('/change_password', { new_password: newPassword });
      setMessage('Password updated successfully!');
      setIsError(false);
      setNewPassword('');
      setConfirmPassword('');
      // Optionally, navigate away or show persistent success
      // navigate('/dashboard'); // Example
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to update password.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-4 mx-auto max-w-lg">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">Change Your Password</h1>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {message && (
            <div className={`p-3 text-sm rounded-md ${isError ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
