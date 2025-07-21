import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const tabs = [
  { key: 'services', label: 'Services' },
  { key: 'products', label: 'Products' },
  { key: 'blogs', label: 'Blogs' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('services');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (tab === 'products') {
      api.get('/product-categories', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => setCategories(res.data))
        .catch(() => setCategories([]));
    }
  }, [tab]);

  if (!user || user.email !== 'admin@gmail.com') {
    return <div className="max-w-xl mx-auto mt-20 text-center text-red-600 text-xl font-bold">Access Denied: Admins Only</div>;
  }

  const handleOpenModal = () => {
    setForm({ title: '', description: '', price: '', category: '', image: '' });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
    if (tab === 'products' && (!form.title || !form.price || !form.category)) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      if (tab === 'blogs') {
        formData.append('content', form.description); // send as 'content'
      } else {
      formData.append('description', form.description);
        formData.append('price', Number(form.price));
        if (tab === 'products') {
          formData.append('category', form.category);
        }
      }
      if (form.image) formData.append('image', form.image);
      let url = '/services';
      if (tab === 'products') url = '/products';
      if (tab === 'blogs') url = '/blogs';
      await api.post(url, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Created successfully!');
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        // Optionally: refresh list here
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel</h1>
      <div className="flex justify-center gap-4 mb-8">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded font-semibold transition ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded shadow p-6">
        {tab === 'services' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Services</h2>
              <button onClick={handleOpenModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">+ New Service</button>
            </div>
            <div className="text-gray-500">(Service list and CRUD forms go here)</div>
          </>
        )}
        {tab === 'products' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Products</h2>
              <button onClick={handleOpenModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">+ New Product</button>
            </div>
            <div className="text-gray-500">(Product list and CRUD forms go here)</div>
          </>
        )}
        {tab === 'blogs' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Blogs</h2>
              <button onClick={handleOpenModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">+ New Blog</button>
            </div>
            <div className="text-gray-500">(Blog list and CRUD forms go here)</div>
          </>
        )}
      </div>
      {/* Modal for Create New */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl">&times;</button>
            <h2 className="text-xl font-bold mb-4">Add New {tab.charAt(0).toUpperCase() + tab.slice(1, -1)}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Title" className="w-full border rounded px-3 py-2" />
              <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Description" className="w-full border rounded px-3 py-2" />
              {tab !== 'blogs' && (
                <input name="price" value={form.price} onChange={handleChange} required type="number" min="0" placeholder="Price" className="w-full border rounded px-3 py-2" />
              )}
              {tab === 'products' && (
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              )}
              <input name="image" type="file" accept="image/*" onChange={handleChange} className="w-full" />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full">{loading ? 'Saving...' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
