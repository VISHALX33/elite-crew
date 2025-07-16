import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Settings() {
  // Profile state
  const [profile, setProfile] = useState({
    name: 'Your Name',
    email: 'youremail@example.com',
    password: '',
    profileImage: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Notification state
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    productUpdates: true,
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');

  // Account management
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountMessage, setAccountMessage] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const { token } = useAuth();

  // Handlers
  const handleProfileChange = e => {
    const { name, value, files } = e.target;
    if (name === 'profileImage') {
      setProfile(p => ({ ...p, profileImage: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setProfile(p => ({ ...p, [name]: value }));
    }
  };

  const handleProfileSubmit = e => {
    e.preventDefault();
    setProfileSuccess('Profile updated! (Demo only)');
    setProfileError('');
    // Here you would send the updated profile to your backend
  };

  // Fetch notification preferences on mount
  useEffect(() => {
    if (!token) return;
    setNotifLoading(true);
    api.get('/users/notification-preferences', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setNotifications(res.data))
      .catch(() => setNotifError('Failed to load preferences'))
      .finally(() => setNotifLoading(false));
  }, [token]);

  // Update notification preferences
  const handleNotificationChange = e => {
    const { name, checked } = e.target;
    const updated = { ...notifications, [name]: checked };
    setNotifications(updated);
    setNotifLoading(true);
    setNotifSuccess('');
    setNotifError('');
    api.put('/users/notification-preferences', updated, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setNotifSuccess('Preferences updated!'))
      .catch(() => setNotifError('Failed to update preferences'))
      .finally(() => setNotifLoading(false));
  };

  const handleDeleteAccount = () => {
    setAccountMessage('Account deleted! (Demo only)');
    setShowDeleteConfirm(false);
    // Here you would call your backend to delete the account
  };

  // Download user data
  const handleDownloadData = async () => {
    setDownloadLoading(true);
    setDownloadError('');
    try {
      const res = await api.get('/users/download-data', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my_data.json');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setDownloadError('Failed to download data');
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-orange-600 mb-8 text-center">Settings</h1>
      {/* Profile Settings */}
      <section className="mb-10 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Profile Settings</h2>
        <form className="space-y-4" onSubmit={handleProfileSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={profile.email}
              onChange={handleProfileChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Change Password</label>
            <div className="flex items-center gap-2">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={profile.password}
                onChange={handleProfileChange}
                className="w-full border rounded px-3 py-2"
                placeholder="New Password"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="text-sm text-blue-600 underline">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Profile Picture</label>
            <input
              name="profileImage"
              type="file"
              accept="image/*"
              onChange={handleProfileChange}
              className="w-full"
            />
            {imagePreview && <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full mt-2 object-cover border" />}
          </div>
          {profileSuccess && <div className="text-green-600 text-sm">{profileSuccess}</div>}
          {profileError && <div className="text-red-600 text-sm">{profileError}</div>}
          <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition font-semibold">Save Changes</button>
        </form>
      </section>

      {/* Account Management */}
      <section className="mb-10 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Account Management</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition font-semibold flex-1"
          >
            Delete Account
          </button>
          <button
            onClick={handleDownloadData}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold flex-1"
            disabled={downloadLoading}
          >
            {downloadLoading ? 'Preparing...' : 'Download My Data'}
          </button>
        </div>
        {showDeleteConfirm && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-700 mb-2 font-medium">Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition font-semibold"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {accountMessage && <div className="text-green-600 text-sm mt-4">{accountMessage}</div>}
        {downloadLoading && <div className="text-blue-600 text-sm mt-2">Preparing download...</div>}
        {downloadError && <div className="text-red-600 text-sm mt-2">{downloadError}</div>}
      </section>

      {/* Notification Preferences */}
      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Notification Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="email"
              checked={notifications.email}
              onChange={handleNotificationChange}
              className="h-5 w-5 text-orange-600 border-gray-300 rounded"
            />
            <label className="text-gray-700 font-medium">Email Notifications</label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="sms"
              checked={notifications.sms}
              onChange={handleNotificationChange}
              className="h-5 w-5 text-orange-600 border-gray-300 rounded"
            />
            <label className="text-gray-700 font-medium">SMS Notifications</label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="productUpdates"
              checked={notifications.productUpdates}
              onChange={handleNotificationChange}
              className="h-5 w-5 text-orange-600 border-gray-300 rounded"
            />
            <label className="text-gray-700 font-medium">Product/Service Updates</label>
          </div>
          {notifLoading && <div className="text-blue-600 text-sm">Saving...</div>}
          {notifSuccess && <div className="text-green-600 text-sm">{notifSuccess}</div>}
          {notifError && <div className="text-red-600 text-sm">{notifError}</div>}
        </div>
      </section>
    </div>
  );
} 