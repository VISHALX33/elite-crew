import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ShoppingBagIcon, 
  WrenchScrewdriverIcon, 
  BookOpenIcon, 
  CalendarDaysIcon,
  CreditCardIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const tabs = [
  { key: 'services', label: 'Services', icon: WrenchScrewdriverIcon },
  { key: 'service-categories', label: 'Service Categories', icon: WrenchScrewdriverIcon },
  { key: 'products', label: 'Products', icon: ShoppingBagIcon },
  { key: 'product-categories', label: 'Product Categories', icon: ShoppingBagIcon },
  { key: 'blogs', label: 'Blogs', icon: BookOpenIcon },
  { key: 'bookings', label: 'Bookings', icon: CalendarDaysIcon },
  { key: 'purchases', label: 'Purchases', icon: CreditCardIcon },
  { key: 'vendors', label: 'Vendors', icon: UsersIcon },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('services');
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [productCategories, setProductCategories] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [tab]);

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      let url = `/${tab}`;
      if (tab === 'bookings') url = '/services/admin/bookings';
      if (tab === 'purchases') url = '/purchases/all-purchases';
      if (tab === 'vendors') url = '/users/admin/vendors';
      
      const res = await api.get(url);
      setItems(res.data);
    } catch (err) {
      console.error(`Failed to fetch ${tab}:`, err);
      setItems([]);
    } finally {
      setFetchLoading(false);
    }
  };

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

  if (!user || (user.role !== 'admin' && user.email !== 'admin@gmail.com')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 p-8 rounded-xl border border-red-100 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-red-500 font-medium">This section is reserved for administrators only.</p>
        </div>
      </div>
    );
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name || '',
        title: item.title || '',
        description: item.description || item.content || '',
        price: item.price || '',
        category: item.category?._id || item.category || '',
        image: ''
      });
    } else {
      setEditingItem(null);
      setForm({ name: '', title: '', description: '', price: '', category: '', image: '' });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setError('');
    setSuccess('');
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm(f => ({ ...f, image: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const isCategory = tab === 'product-categories' || tab === 'service-categories';

    if (!isCategory && tab === 'products' && (!form.title || !form.price || !form.category)) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      if (isCategory) {
        formData.append('name', form.name);
      } else {
        formData.append('title', form.title);
        if (tab === 'blogs') {
          formData.append('content', form.description);
        } else {
          formData.append('description', form.description);
          formData.append('price', Number(form.price));
          if (tab === 'products' || tab === 'services') {
            formData.append('category', form.category);
          }
        }
      }
      if (form.image) formData.append('image', form.image);

      let url = `/${tab}`;
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingItem) {
        await api.put(`${url}/${editingItem._id}`, formData, config);
        setSuccess('Updated successfully!');
      } else {
        await api.post(url, formData, config);
        setSuccess('Created successfully!');
      }

      setTimeout(() => {
        handleCloseModal();
        fetchData();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingItem ? 'update' : 'create'}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/${tab}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const handleApproveVendor = async (id) => {
    try {
      await api.put(`/users/admin/vendors/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update approval status.');
    }
  };

  const renderTable = () => {
    if (fetchLoading) return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );

    if (items.length === 0) return (
      <div className="text-center p-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
        No items found in this category.
      </div>
    );

    const isRecord = tab === 'bookings' || tab === 'purchases';
    const isCategory = tab === 'product-categories' || tab === 'service-categories';

    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {isRecord ? 'Product/Service & Vendor' : isCategory ? 'Category Name' : 'Title/User'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {isRecord ? 'Customer & Logistics' : tab === 'vendors' ? 'Company/Status' : isCategory ? 'Image' : 'Price/Category'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {isRecord ? 'Financial Breakdown' : 'Status/Misc'}
              </th>
              {!isRecord && (
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {item.uni_id || (item.product || item.service)?.uni_id || item._id.substring(0, 8)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {(!isRecord && !isCategory) && item.image && (
                      <img className="h-10 w-10 rounded-lg object-cover mr-3 bg-gray-100" src={item.image} alt="" />
                    )}
                    {isRecord && (item.product || item.service)?.image && (
                      <img className="h-12 w-12 rounded-lg object-cover mr-3 bg-gray-100 shadow-sm" src={(item.product || item.service).image} alt="" />
                    )}
                    <div>
                      <div className="text-sm font-bold text-gray-900">{item.name || item.title || (item.product || item.service)?.title}</div>
                      {isRecord && (
                        <div className="text-xs font-medium text-orange-600 mt-0.5">
                          Provider: {(item.product || item.service)?.vendor?.companyName || 'Unknown Vendor'}
                        </div>
                      )}
                      {!isCategory && !isRecord && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {tab === 'vendors' ? item.email : (item.description || item.content)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {isRecord ? (
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <UsersIcon className="h-3 w-3 text-gray-400" /> {item.user?.name}
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">{item.user?.email} • {item.user?.phone}</div>
                      <div className="text-[10px] text-gray-400 italic">
                        {item.address}, {item.pincode}
                        {item.date && ` • ${item.date} @ ${item.time}`}
                      </div>
                    </div>
                  ) : tab === 'vendors' ? (
                    <div>
                      <div className="font-semibold text-gray-900">{item.companyName}</div>
                      <div className={`text-xs font-bold mt-1 ${item.isApproved ? 'text-green-600' : 'text-orange-500'}`}>
                        {item.isApproved ? 'APPROVED' : 'PENDING'}
                      </div>
                    </div>
                  ) : isCategory ? (
                    item.image ? <img src={item.image} className="h-10 w-20 object-cover rounded shadow-sm" alt="" /> : 'No image'
                  ) : (
                    <div>
                      <div className="font-semibold">{item.price ? `₹${item.price}` : 'Blog'}</div>
                      <div className="text-xs text-gray-500">{item.category?.name || (tab === 'services' ? 'Service' : 'Blog')}</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isRecord ? (
                    <div className="text-right sm:text-left">
                      <div className="text-sm font-black text-gray-900">₹{item.totalAmount}</div>
                      <div className="text-[10px] font-bold text-gray-400 space-x-2">
                        <span>BASE: ₹{Math.round(item.totalAmount / 1.28)}</span>
                        <span>TAX: ₹{Math.round(item.totalAmount - (item.totalAmount / 1.28))}</span>
                      </div>
                      <div className="mt-1">
                         <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                           item.status?.toLowerCase() === 'completed' || item.status?.toLowerCase() === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                           item.status?.toLowerCase() === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                           'bg-orange-50 text-orange-700 border-orange-100'
                         }`}>
                           {item.status || 'Pending'}
                         </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </td>
                {!isRecord && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {tab === 'vendors' ? (
                      <button
                        onClick={() => handleApproveVendor(item._id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${item.isApproved ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                      >
                        {item.isApproved ? 'Suspend' : 'Approve'}
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="text-white bg-blue-500 hover:bg-blue-600 p-2 rounded-lg transition-colors mr-2"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id)}
                          className="text-white bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your platform's content and view user transactions.</p>
        </div>
        
        {tab !== 'bookings' && tab !== 'purchases' && tab !== 'vendors' && (
          <button 
            onClick={() => handleOpenModal()} 
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 shadow-md"
          >
            <PlusIcon className="h-5 w-5" />
            New {tab.charAt(0).toUpperCase() + tab.slice(1, -1)}
          </button>
        )}
      </div>

      {/* Tabs / Navigation */}
      <div className="flex overflow-x-auto pb-4 mb-8 no-scrollbar gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              tab === t.key 
                ? 'bg-white text-orange-600 shadow-md ring-1 ring-orange-100' 
                : 'bg-gray-100 text-gray-600 hover:bg-white hover:shadow-sm'
            }`}
          >
            <t.icon className={`h-5 w-5 ${tab === t.key ? 'text-orange-600' : 'text-gray-400'}`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {renderTable()}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={handleCloseModal} 
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-black mb-6 text-gray-800">
              {editingItem ? 'Edit' : 'Add New'} {tab.charAt(0).toUpperCase() + tab.slice(1, -1)}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {(tab === 'product-categories' || tab === 'service-categories') ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="Enter category name" 
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-0 transition-all outline-none" 
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                  <input 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    required 
                    placeholder="Enter title" 
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-0 transition-all outline-none" 
                  />
                </div>
              )}
              
              {tab !== 'product-categories' && tab !== 'service-categories' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description / Content</label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    required 
                    rows="4"
                    placeholder="Enter content details..." 
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-0 transition-all outline-none" 
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {tab !== 'blogs' && tab !== 'product-categories' && tab !== 'service-categories' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                    <input 
                      name="price" 
                      value={form.price} 
                      onChange={handleChange} 
                      required 
                      type="number" 
                      min="0" 
                      placeholder="500" 
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-0 transition-all outline-none" 
                    />
                  </div>
                )}
                
                {(tab === 'products' || tab === 'services') && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-0 transition-all outline-none bg-white font-medium"
                    >
                      <option value="">Select</option>
                      {(tab === 'products' ? productCategories : serviceCategories).map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Image {editingItem && '(Optional)'}</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl hover:border-orange-400 transition-colors bg-gray-50/50">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-bold text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                        <span>Upload a file</span>
                        <input name="image" type="file" accept="image/*" onChange={handleChange} className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                {form.image && (
                   <p className="mt-2 text-sm text-green-600 font-bold flex items-center gap-1">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                     </svg>
                     Selected: {form.image.name}
                   </p>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-bold border border-red-100">
                   {error}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm font-bold border border-green-100">
                   {success}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-orange-600 to-green-600 py-4 rounded-xl text-white font-black text-lg hover:shadow-xl hover:opacity-90 transition-all disabled:opacity-50 active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                {loading && <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>}
                {loading ? 'Processing...' : (editingItem ? 'Save Changes' : `Create ${tab.charAt(0).toUpperCase() + tab.slice(1, -1)}`)}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

