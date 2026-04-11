import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  BriefcaseIcon, 
  ShoppingBagIcon, 
  NewspaperIcon, 
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClipboardDocumentCheckIcon,
  ShoppingCartIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('services');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    content: '',
    image: null
  });
  const [productCategories, setProductCategories] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);

  const tabs = [
    { id: 'services', name: 'My Services', icon: BriefcaseIcon },
    { id: 'products', name: 'My Products', icon: ShoppingBagIcon },
    { id: 'bookings', name: 'Manage Bookings', icon: ClipboardDocumentCheckIcon },
    { id: 'orders', name: 'Manage Orders', icon: ShoppingCartIcon },
    { id: 'blogs', name: 'My Blogs', icon: NewspaperIcon }
  ];

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [prodRes, servRes] = await Promise.all([
          api.get('/product-categories'),
          api.get('/service-categories')
        ]);
        setProductCategories(prodRes.data);
        setServiceCategories(servRes.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint;
      if (activeTab === 'bookings') {
        endpoint = '/services/vendor-bookings';
      } else if (activeTab === 'orders') {
        endpoint = '/purchases/vendor-orders';
      } else {
        endpoint = `/${activeTab}/mine`;
      }
      const res = await api.get(endpoint);
      setItems(res.data);
    } catch (err) {
      setError(`Failed to fetch ${activeTab}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const endpoint = activeTab === 'bookings' 
        ? `/services/bookings/${id}/status` 
        : `/purchases/orders/${id}/status`;
      await api.patch(endpoint, { status: newStatus });
      setSuccess('Status updated successfully!');
      fetchItems();
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    if (activeTab === 'blogs') {
      data.append('content', formData.content);
    } else {
      data.append('description', formData.description);
      data.append('price', formData.price);
      if (formData.category) data.append('category', formData.category);
    }
    if (formData.image) data.append('image', formData.image);

    try {
      if (editingItem) {
        await api.put(`/${activeTab}/${editingItem._id}`, data);
        setSuccess('Item updated successfully!');
      } else {
        await api.post(`/${activeTab}`, data);
        setSuccess('Item created successfully!');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      resetForm();
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/${activeTab}/${id}`);
      setSuccess('Item deleted successfully');
      fetchItems();
    } catch (err) {
      setError('Failed to delete item');
    } finally {
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        price: item.price || '',
        category: item.category?._id || item.category || '',
        content: item.content || '',
        image: null
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      content: '',
      image: null
    });
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-50 text-gray-700 border-gray-100';
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'delivered' || s === 'confirmed') return 'bg-green-50 text-green-700 border-green-100';
    if (s === 'pending' || s === 'processing' || s === 'booked') return 'bg-orange-50 text-orange-700 border-orange-100';
    if (s === 'shipped') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (s === 'cancelled') return 'bg-red-50 text-red-700 border-red-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  if (!user?.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <ExclamationCircleIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Approval Pending</h1>
          <p className="text-gray-600">
            Thank you for registering as a vendor! Your account is currently being reviewed by our administrators. 
            Once approved, you'll be able to manage your services and products here.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 transition"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
                Vendor Dashboard
              </h2>
              <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="font-bold text-orange-600 mr-1">{user.companyName}</span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <CheckCircleIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" />
                  Verified Business
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              {['services', 'products', 'blogs'].includes(activeTab) && (
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Add New {activeTab.slice(0, -1)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-8 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition`}
              >
                <tab.icon
                  className={`${
                    activeTab === tab.id ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                  } -ml-0.5 mr-2 h-5 w-5`}
                  aria-hidden="true"
                />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="mt-8">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <ArrowPathIcon className="h-10 w-10 text-orange-600 animate-spin" />
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {['bookings', 'orders'].includes(activeTab) ? (
                /* Bookings and Orders List */
                <ul className="divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <li className="px-4 py-12 text-center text-gray-500">
                      No {activeTab} found for your business yet.
                    </li>
                  ) : (
                    items.map((item) => {
                      const status = item.status?.toLowerCase() || '';
                      return (
                        <li key={item._id} className="hover:bg-gray-50 transition duration-150">
                          <div className="px-4 py-8 sm:px-8">
                            <div className="flex flex-col lg:flex-row gap-6">
                              {/* Visual & Status */}
                              <div className="flex-shrink-0 w-full lg:w-32">
                                <img 
                                  src={(item.service || item.product)?.image || 'https://via.placeholder.com/100'} 
                                  alt="Item" 
                                  className="w-24 h-24 object-cover rounded-2xl shadow-sm border border-gray-100"
                                />
                                <div className={`mt-3 inline-flex px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(item.status)}`}>
                                  {item.status || 'Pending'}
                                </div>
                              </div>
  
                              {/* Details */}
                              <div className="flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                  <div>
                                    <h3 className="text-xl font-bold text-gray-900">{(item.service || item.product)?.title}</h3>
                                    <p className="text-sm font-mono text-gray-500 mt-1 uppercase tracking-tighter">
                                      {(item.service || item.product)?.uni_id} • REF: {item._id.slice(-6)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-black text-gray-900">₹{item.totalAmount}</div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Total Revenue</p>
                                  </div>
                                </div>
  
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Customer Information</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                        <UserIcon className="h-4 w-4 text-orange-500" /> {item.user?.name}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <PhoneIcon className="h-4 w-4 text-gray-400" /> {item.user?.phone}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <EnvelopeIcon className="h-4 w-4 text-gray-400" /> {item.user?.email}
                                      </div>
                                    </div>
                                  </div>
  
                                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Logistics</h4>
                                    <div className="space-y-2 text-sm font-medium text-gray-600">
                                      <div className="flex items-start gap-2">
                                        <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                                        <span>{item.address}, {item.pincode}</span>
                                      </div>
                                      <div className="pl-6 text-gray-400 italic">
                                        {activeTab === 'bookings' ? `Scheduled: ${item.date} at ${item.time}` : `Ordered on: ${new Date(item.createdAt).toLocaleDateString()}`}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
  
                              {/* Actions */}
                              <div className="flex flex-col gap-2 justify-center lg:border-l lg:pl-6">
                                {activeTab === 'bookings' ? (
                                  <>
                                    {status !== 'confirmed' && status !== 'completed' && (
                                      <button 
                                        onClick={() => handleUpdateStatus(item._id, 'Confirmed')}
                                        className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
                                      >
                                        Confirm
                                      </button>
                                    )}
                                    {status === 'confirmed' && (
                                      <button 
                                        onClick={() => handleUpdateStatus(item._id, 'Completed')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                                      >
                                        Complete
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {status === 'processing' && (
                                      <button 
                                        onClick={() => handleUpdateStatus(item._id, 'Shipped')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                                      >
                                        Mark Shipped
                                      </button>
                                    )}
                                    {status === 'shipped' && (
                                      <button 
                                        onClick={() => handleUpdateStatus(item._id, 'Delivered')}
                                        className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
                                      >
                                        Mark Delivered
                                      </button>
                                    )}
                                  </>
                                )}
                                {status !== 'cancelled' && (
                                  <button 
                                    onClick={() => handleUpdateStatus(item._id, 'Cancelled')}
                                    className="px-6 py-2 bg-white text-rose-600 border border-rose-100 rounded-xl text-sm font-bold hover:bg-rose-50 transition"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              ) : (
                /* Services/Products/Blogs/Categories List */
                <ul className="divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <li className="px-4 py-12 text-center text-gray-500">
                      No items found. Start by adding your first {activeTab.slice(0, -1)}!
                    </li>
                  ) : (
                    items.map((item) => (
                      <li key={item._id}>
                        <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                          <div className="flex items-center flex-1 cursor-pointer" onClick={() => openModal(item)}>
                            <div className="flex-shrink-0 h-12 w-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                              {item.image ? (
                                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                              ) : (
                                <BriefcaseIcon className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="text-sm font-medium text-orange-600 truncate">{item.title}</div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <span className="truncate">ID: {item.uni_id}</span>
                                {item.price && <span className="ml-4">₹{item.price}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex space-x-2">
                            <button
                              onClick={() => openModal(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                              title="Edit"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal content */}
          <div className="relative bg-white rounded-xl shadow-2xl transform transition-all w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <h3 className="text-lg leading-6 font-bold text-gray-900 mb-4">
                  {editingItem ? 'Edit' : 'Add New'} {activeTab.slice(0, -1)}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  {activeTab === 'blogs' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Content</label>
                      <textarea
                        name="content"
                        required
                        rows="6"
                        value={formData.content}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          name="description"
                          required
                          rows="3"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                          <input
                            type="number"
                            name="price"
                            required
                            value={formData.price}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Category</label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="">Select Category</option>
                            {(activeTab === 'products' ? productCategories : serviceCategories).map((cat) => (
                              <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-orange-700 focus:outline-none transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

export default VendorDashboard;
