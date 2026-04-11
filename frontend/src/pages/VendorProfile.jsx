import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ServiceCard from '../components/ServiceCard';
import ProductCard from '../components/ProductCard';
import BlogCard from '../components/BlogCard';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  ShoppingBagIcon, 
  NewspaperIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const VendorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        const [vendorRes, servicesRes, productsRes, blogsRes] = await Promise.all([
          api.get(`/users/vendor/${id}`),
          api.get(`/services?vendor=${id}`),
          api.get(`/products?vendor=${id}`),
          api.get(`/blogs?vendor=${id}`)
        ]);
        setVendor(vendorRes.data);
        setServices(servicesRes.data);
        setProducts(productsRes.data);
        setBlogs(blogsRes.data);
      } catch (err) {
        console.error('Error fetching vendor profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Vendor not found</h2>
        <button onClick={() => navigate(-1)} className="text-orange-600 font-bold flex items-center gap-2">
          <ArrowLeftIcon className="h-5 w-5" /> Go Back
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'services', label: 'Services', icon: BriefcaseIcon, count: services.length },
    { id: 'products', label: 'Products', icon: ShoppingBagIcon, count: products.length },
    { id: 'blogs', label: 'Blogs', icon: NewspaperIcon, count: blogs.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Banner */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back
          </button>
          
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 ring-4 ring-orange-50 mr-6">
                {vendor.profileImage ? (
                  <img src={vendor.profileImage} alt={vendor.companyName} className="h-full w-full object-cover rounded-2xl" />
                ) : (
                  <BuildingOfficeIcon className="h-10 w-10" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 mb-1">{vendor.companyName || vendor.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                  {vendor.businessAddress && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {vendor.businessAddress}
                    </div>
                  )}
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                    Verified Provider
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 p-1 rounded-2xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-orange-600 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="min-h-[400px]">
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map(service => (
                <ServiceCard key={service._id} service={service} />
              ))}
              {services.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold">
                  No services found for this vendor.
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
              {products.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold">
                  No products found for this vendor.
                </div>
              )}
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map(blog => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
              {blogs.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold">
                  No blogs found for this vendor.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper check for icon
const CheckCircleIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default VendorProfile;
