import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import AddressSelector from '../components/AddressSelector.jsx';

export default function Register() {
  const { register, verifyEmailOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    companyName: '',
    businessAddress: '',
    aadharPhoto: null,
    gstCertificate: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.role === 'vendor' && (!formData.companyName || !formData.businessAddress || !formData.aadharPhoto || !formData.gstCertificate)) {
      setError('Please provide your company details and upload required documents (Aadhar & GST)');
      return;
    }

    if (!formData.phone) {
      setError('Phone number is mandatory');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });
      const res = await register(data);
      if (res?.requiresVerification) {
        setStep('otp');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyEmailOtp(formData.email, otp);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      await resendOtp(formData.email);
      alert('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
        {/* Header */}
        <div className="bg-orange-600 p-6 text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-14 w-14 mx-auto text-white mb-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
            />
          </svg>
          <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
          <p className="text-orange-100">Join elite-crew today!</p>
        </div>

        {/* Form */}
        {step === 'form' ? (
          <form onSubmit={handleRegister} className="p-6 md:p-8">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, role: 'user' }))}
                  className={`py-2 px-4 rounded-lg font-bold border-2 transition ${formData.role === 'user' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                >
                  User
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, role: 'vendor' }))}
                  className={`py-2 px-4 rounded-lg font-bold border-2 transition ${formData.role === 'vendor' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                >
                  Vendor
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  name="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  className="w-full px-4 py-2 border border-blue-200 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-orange-500 transition"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="e.g. +919876543210"
                />
              </div>

              {formData.role === 'vendor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      name="companyName"
                      className="w-full px-4 py-2 border border-blue-200 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-orange-500 transition"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Acme Services Ltd"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                    <AddressSelector 
                      value={formData.businessAddress}
                      onChange={(data) => setFormData(prev => ({ 
                        ...prev, 
                        businessAddress: data.address,
                      }))}
                      placeholder="Search for business address..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Photo</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setFormData(f => ({ ...f, aadharPhoto: e.target.files[0] }))}
                        className="w-full text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST Certificate</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setFormData(f => ({ ...f, gstCertificate: e.target.files[0] }))}
                        className="w-full text-xs"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full mt-6 bg-orange-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-orange-600 hover:text-orange-500 hover:underline"
              >
                Sign in here
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="p-6 md:p-8 text-center">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg text-left">
                <p className="font-medium">{error}</p>
              </div>
            )}
            <div className="mb-6">
               <h3 className="text-xl font-bold text-gray-900 mb-2">Verify your email</h3>
               <p className="text-gray-500 text-sm">We've sent a 6-digit code to <strong>{formData.email}</strong></p>
            </div>
            <div className="mb-6 max-w-[200px] mx-auto">
              <input 
                type="text" 
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl font-mono tracking-widest px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-orange-500 transition"
                placeholder="000000"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-gray-900 text-white py-4 px-4 rounded-xl font-black hover:bg-gray-800 transition shadow-lg shadow-gray-200"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button 
               type="button"
               onClick={handleResendOtp}
               className="mt-6 text-sm font-bold text-gray-400 hover:text-orange-600 transition"
            >
               Didn't receive the code? <span className="underline">Resend</span>
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-xs text-gray-500">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}