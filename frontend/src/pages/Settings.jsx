import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Settings() {
  const { user, token, setUser } = useAuth();
  
  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    profileImage: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
  const [profileLoading, setProfileLoading] = useState(false);

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
  
  // Address state
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', pincode: '', isDefault: false
  });


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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      if (profile.password) {
        formData.append('password', profile.password);
      }
      if (profile.profileImage instanceof File) {
        formData.append('profileImage', profile.profileImage);
      }

      const res = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      setUser(res.data);
      setProfileSuccess('Profile updated successfully!');
      setProfile(p => ({ ...p, password: '' }));
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
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
  
  // Fetch addresses on mount
  useEffect(() => {
    if (!token) return;
    fetchAddresses();
  }, [token]);

  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const res = await api.get('/users/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data);
    } catch (err) {
      setAddressError('Failed to load addresses');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    try {
      const res = await api.post('/users/addresses', newAddress, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data);
      setShowAddressModal(false);
      setNewAddress({ street: '', city: '', state: '', pincode: '', isDefault: false });
    } catch (err) {
      setAddressError('Failed to add address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const res = await api.delete(`/users/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data);
    } catch (err) {
      setAddressError('Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await api.patch(`/users/addresses/${id}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data);
    } catch (err) {
      setAddressError('Failed to set default address');
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
          <button 
            type="submit" 
            disabled={profileLoading}
            className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition font-semibold disabled:opacity-50"
          >
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      {/* Address Management */}
      <section className="mb-10 bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">My Addresses</h2>
          <button 
            onClick={() => setShowAddressModal(true)}
            className="text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition font-bold text-sm"
          >
            + Add Address
          </button>
        </div>

        {addressLoading && <p className="text-gray-500 italic">Loading addresses...</p>}
        {addressError && <p className="text-red-600 text-sm mb-4">{addressError}</p>}

        <div className="grid gap-4">
          {addresses.length === 0 && !addressLoading && (
            <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
               <p className="text-gray-400">No addresses saved yet</p>
            </div>
          )}
          {addresses.map(addr => (
            <div key={addr._id} className={`p-4 rounded-xl border-2 transition-all ${addr.isDefault ? 'border-orange-200 bg-orange-50/30' : 'border-gray-50 hover:border-gray-100'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-800">{addr.street}</p>
                  <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                  {addr.isDefault && <span className="text-[10px] font-black text-orange-600 uppercase mt-1 inline-block">Default Address</span>}
                </div>
                <div className="flex gap-2">
                  {!addr.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Set Default
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showAddressModal && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button 
                onClick={() => setShowAddressModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Add New Address</h3>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Street / House No.</label>
                  <input 
                    className="w-full border rounded-lg px-3 py-2"
                    required
                    value={newAddress.street}
                    onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                    <input 
                      className="w-full border rounded-lg px-3 py-2"
                      required
                      value={newAddress.city}
                      onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                    <input 
                      className="w-full border rounded-lg px-3 py-2"
                      required
                      value={newAddress.state}
                      onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Pincode</label>
                  <input 
                    className="w-full border rounded-lg px-3 py-2"
                    required
                    pattern="[0-9]{6}"
                    value={newAddress.pincode}
                    onChange={e => setNewAddress({...newAddress, pincode: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="isDefault"
                    checked={newAddress.isDefault}
                    onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})}
                  />
                  <label htmlFor="isDefault" className="text-sm font-bold text-gray-700">Set as default address</label>
                </div>
                <button 
                  type="submit" 
                  disabled={addressLoading}
                  className="w-full bg-orange-600 text-white font-black py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 mt-2"
                >
                  {addressLoading ? 'Saving...' : 'Save Address'}
                </button>
              </form>
            </div>
          </div>
        )}
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