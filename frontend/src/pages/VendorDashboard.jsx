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
      {/* Premium Header */}
      <div className="relative bg-gray-900 pt-16 pb-24 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <BriefcaseIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
                    Vendor <span className="text-orange-500">Hub</span>
                  </h2>
                  <p className="text-gray-400 font-medium">Powering <span className="text-white">{user.companyName}</span></p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-0 md:ml-4">
              {['services', 'products', 'blogs'].includes(activeTab) && (
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center px-6 py-3 border-0 rounded-2xl shadow-xl shadow-orange-900/20 text-sm font-black text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 transform hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5 stroke-[3]" aria-hidden="true" />
                  Add New {activeTab.slice(0, -1)}
                </button>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.15] transition-all group">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Business Status</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-ping" />
                <span className="text-xl font-black text-white">Active</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.15] transition-all">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Verification</p>
              <div className="flex items-center gap-2 text-xl font-black text-white">
                <CheckCircleIcon className="h-6 w-6 text-green-400" /> Verified
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.15] transition-all">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Current Focus</p>
              <div className="text-xl font-black text-white capitalize">{activeTab}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-amber-500 rounded-[2rem] p-6 shadow-xl shadow-orange-900/20 hover:scale-[1.02] transition-all">
              <p className="text-sm font-bold text-white/70 uppercase tracking-widest mb-1">Manage</p>
              <div className="text-xl font-black text-white">Your Operations</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-20">
        <div className="relative z-10">
          {/* Modern Navigation Tabs */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200 p-2 border border-gray-100/50 backdrop-blur-xl mb-10">
            <nav className="flex flex-wrap md:flex-nowrap gap-2" aria-label="Tabs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-[1.5rem] text-sm font-black transition-all duration-500
                      ${isActive 
                        ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/20 scale-[1.02]' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <tab.icon
                      className={`h-5 w-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}
                      aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">{tab.name}</span>
                    {isActive && (
                      <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Messages */}
          <div className="space-y-4 mb-8">
            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <ExclamationCircleIcon className="h-5 w-5 text-rose-500" />
                <p className="text-sm font-bold text-rose-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                <p className="text-sm font-bold text-emerald-700">{success}</p>
              </div>
            )}
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-gray-100/50">
              <div className="relative">
                <div className="h-16 w-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin" />
                <ArrowPathIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-orange-600 animate-pulse" />
              </div>
              <p className="mt-4 text-gray-500 font-bold tracking-widest uppercase text-xs">Syncing your data...</p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-[3rem] border border-white p-2 shadow-2xl shadow-gray-200/50 overflow-hidden">
              {['bookings', 'orders'].includes(activeTab) ? (
                /* Bookings and Orders List */
                <ul className="divide-y divide-gray-50">
                  {items.length === 0 ? (
                    <li className="px-8 py-32 text-center">
                      <div className="h-24 w-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-200">
                        <ClipboardDocumentCheckIcon className="h-12 w-12" />
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 mb-2">Clean Slate</h3>
                      <p className="text-gray-400 font-medium max-w-xs mx-auto">New requests will show up here. Stay tuned for your next big win!</p>
                    </li>
                  ) : (
                    items.map((item) => (
                      <li key={item._id} className="hover:bg-gray-50/50 transition-all duration-500 group">
                        <div className="px-8 py-10 sm:px-12">
                          <div className="flex flex-col lg:flex-row gap-10">
                            {/* Visual & Status */}
                            <div className="flex-shrink-0 w-full lg:w-40 text-center lg:text-left">
                              <div className="relative inline-block group/img">
                                <img 
                                  src={(item.service || item.product)?.image || 'https://via.placeholder.com/200'} 
                                  alt="Item" 
                                  className="w-32 lg:w-40 h-32 lg:h-40 object-cover rounded-[2.5rem] shadow-2xl transform group-hover/img:scale-105 transition-all duration-700"
                                />
                                <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-black/5" />
                              </div>
                              <div className={`mt-6 inline-flex px-4 py-2 rounded-xl text-[10px] font-black border uppercase tracking-[0.2em] shadow-sm ${getStatusColor(item.status)}`}>
                                {item.status || 'Pending'}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 flex flex-col justify-center">
                              <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                                <div>
                                  <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-3">{(item.service || item.product)?.title}</h3>
                                  <p className="text-xs font-black text-orange-600 flex items-center gap-2 uppercase tracking-widest">
                                    <span className="h-2 w-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                                    Account #{item._id.slice(-6)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-4xl font-black text-gray-900 tracking-tighter">₹{item.totalAmount}</div>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Net Revenue</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100/50 transition-colors group-hover:bg-white">
                                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">Customer Profile</h4>
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm font-black text-gray-900">
                                      <div className="h-10 w-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                                        <UserIcon className="h-5 w-5" />
                                      </div>
                                      {item.user?.name}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                                      <PhoneIcon className="h-5 w-5 opacity-40" /> {item.user?.phone}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                                      <EnvelopeIcon className="h-5 w-5 opacity-40" /> {item.user?.email}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100/50 transition-colors group-hover:bg-white">
                                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">Job Logistics</h4>
                                  <div className="space-y-4 text-sm font-bold text-gray-700">
                                    <div className="flex items-start gap-4">
                                      <MapPinIcon className="h-5 w-5 text-gray-300 mt-0.5" />
                                      <span>{item.address}, {item.pincode}</span>
                                    </div>
                                    <div className="pl-9 text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] bg-orange-50/50 py-2 rounded-lg text-center border border-orange-100/50">
                                      {activeTab === 'bookings' ? `📅 ${item.date} @ ${item.time}` : `🛒 ORDERED: ${new Date(item.createdAt).toLocaleDateString()}`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Control */}
                            <div className="flex flex-col gap-3 justify-center lg:border-l lg:border-gray-100/50 lg:pl-10">
                              {activeTab === 'bookings' ? (
                                <>
                                  {(item.status?.toLowerCase() !== 'confirmed' && item.status?.toLowerCase() !== 'completed' && item.status?.toLowerCase() !== 'cancelled') && (
                                    <button 
                                      onClick={() => handleUpdateStatus(item._id, 'Confirmed')}
                                      className="w-full lg:w-48 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
                                    >
                                      Accept Job
                                    </button>
                                  )}
                                  {item.status?.toLowerCase() === 'confirmed' && (
                                    <button 
                                      onClick={() => handleUpdateStatus(item._id, 'Completed')}
                                      className="w-full lg:w-48 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 active:scale-95"
                                    >
                                      Finish Job
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  {item.status?.toLowerCase() === 'processing' && (
                                    <button 
                                      onClick={() => handleUpdateStatus(item._id, 'Shipped')}
                                      className="w-full lg:w-48 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                                    >
                                      Ship Now
                                    </button>
                                  )}
                                  {item.status?.toLowerCase() === 'shipped' && (
                                    <button 
                                      onClick={() => handleUpdateStatus(item._id, 'Delivered')}
                                      className="w-full lg:w-48 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
                                    >
                                      Mark Delivered
                                    </button>
                                  )}
                                </>
                              )}
                              {(item.status?.toLowerCase() !== 'cancelled' && item.status?.toLowerCase() !== 'completed' && item.status?.toLowerCase() !== 'delivered') && (
                                <button 
                                  onClick={() => handleUpdateStatus(item._id, 'Cancelled')}
                                  className="w-full lg:w-48 py-4 bg-white text-rose-600 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 transition-all active:scale-95"
                                >
                                  Decline
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              ) : (
                /* Premium Grid for Content types */
                <div className="p-10">
                  {items.length === 0 ? (
                    <div className="py-24 text-center">
                      <div className="h-32 w-32 bg-gray-50 rounded-[3rem] flex items-center justify-center mx-auto mb-8 text-gray-200">
                        <PlusIcon className="h-16 w-16" />
                      </div>
                      <h3 className="text-3xl font-black text-gray-900 mb-4">No content found</h3>
                      <p className="text-gray-400 font-medium mb-10 max-w-sm mx-auto">Market your business by adding your first {activeTab.slice(0, -1)}. It only takes a minute!</p>
                      <button 
                        onClick={() => openModal()}
                        className="bg-gray-900 text-white px-12 py-5 rounded-[2rem] font-black text-sm hover:bg-gray-800 transition-all shadow-2xl shadow-gray-200 active:scale-95"
                      >
                        Create Your First {activeTab.slice(0, -1)}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      {items.map((item) => (
                        <div key={item._id} className="group relative bg-white rounded-[3rem] border border-gray-100 p-5 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-3">
                          <div className="aspect-[5/4] rounded-[2.5rem] overflow-hidden mb-8 relative shadow-inner">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-200">
                                <BriefcaseIcon className="h-20 w-20" />
                              </div>
                            )}
                            <div className="absolute inset-x-4 bottom-4 flex gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                              <button
                                onClick={() => openModal(item)}
                                className="flex-1 h-14 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl flex items-center justify-center text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="h-14 w-14 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white transition-all"
                              >
                                <TrashIcon className="h-6 w-6" />
                              </button>
                            </div>
                            {item.price && (
                              <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-md px-5 py-2.5 rounded-2xl text-white font-black text-lg tracking-tighter">
                                ₹{item.price}
                              </div>
                            )}
                          </div>
                          <div className="px-3 pb-3 text-center lg:text-left">
                            <h4 className="text-2xl font-black text-gray-900 mb-3 truncate group-hover:text-orange-600 transition-colors tracking-tight">{item.title}</h4>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                #{item.uni_id}
                              </span>
                              <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Ultra-Blur Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-950/40 backdrop-blur-md transition-opacity duration-500" 
            onClick={() => setIsModalOpen(false)}
          />

          {/* Premium Glass Modal */}
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-500 scale-100 opacity-100">
              <div className="p-8 pb-4 border-b border-gray-100/50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {editingItem ? 'Edit' : 'Create New'} <span className="text-orange-600">{activeTab.slice(0, -1)}</span>
                  </h3>
                  <p className="text-sm font-medium text-gray-500">Provide the details to showcase your business</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
                >
                  <PlusIcon className="h-6 w-6 rotate-45 stroke-[2.5]" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder={`e.g. Master ${activeTab.slice(0, -1)} ...`}
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50/50 border-0 ring-1 ring-gray-200 rounded-2xl p-4 text-gray-900 font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                    />
                  </div>

                  {activeTab === 'blogs' ? (
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Content</label>
                      <textarea
                        name="content"
                        required
                        rows="10"
                        placeholder="Write your story here..."
                        value={formData.content}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50/50 border-0 ring-1 ring-gray-200 rounded-2xl p-4 text-gray-900 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Price */}
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Price (₹)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                            <input
                              type="number"
                              name="price"
                              required
                              value={formData.price}
                              onChange={handleInputChange}
                              className="w-full bg-gray-50/50 border-0 ring-1 ring-gray-200 rounded-2xl p-4 pl-8 text-gray-900 font-black focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                            />
                          </div>
                        </div>
                        
                        {/* Category */}
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Category</label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50/50 border-0 ring-1 ring-gray-200 rounded-2xl p-4 text-gray-900 font-bold appearance-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                          >
                            <option value="">Select Category</option>
                            {(activeTab === 'products' ? productCategories : serviceCategories).map((cat) => (
                              <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Description</label>
                        <textarea
                          name="description"
                          required
                          rows="4"
                          placeholder="Describe your offering in detail..."
                          value={formData.description}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50/50 border-0 ring-1 ring-gray-200 rounded-2xl p-4 text-gray-900 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </>
                  )}

                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Featured Image</label>
                    <div className="relative group/upload">
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-gray-50/50 hover:bg-orange-50/30 hover:border-orange-200 transition-all cursor-pointer overflow-hidden">
                        {formData.image ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                              <p className="text-white font-black text-xs uppercase tracking-widest">Change Image</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <PlusIcon className="w-10 h-10 text-gray-400 group-hover/upload:text-orange-500 transition-colors mb-2" />
                            <p className="text-sm text-gray-400 font-bold group-hover/upload:text-orange-600">
                              Upload Featured Image
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleInputChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100/50">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-white py-4 px-6 border border-gray-200 rounded-2xl text-sm font-black text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Dismiss
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-gray-900 py-4 px-6 rounded-2xl text-sm font-black text-white hover:bg-gray-800 shadow-xl shadow-gray-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : (editingItem ? 'Save Changes' : `Launch ${activeTab.slice(0, -1)}`)}
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
