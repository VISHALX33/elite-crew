import { useState } from 'react';
import api from '../utils/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/contact', form);
      setSuccess(res.data.message || 'Message sent!');
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-orange-600 mb-4 text-center">Contact Us</h1>
      <p className="text-gray-600 mb-8 text-center">We'd love to hear from you! Fill out the form below or reach us directly at <a href="mailto:support@elitecrew.com" className="text-blue-600 underline">support@elitecrew.com</a>.</p>
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-8">
        {/* Contact Info */}
        <div className="flex-1 mb-8 md:mb-0">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-3 text-gray-700">
            <div><span className="font-medium">Email:</span> support@elitecrew.com</div>
            <div><span className="font-medium">Phone:</span> +91 98765 43210</div>
            <div><span className="font-medium">Address:</span> 123 Elite Street, Mumbai, India</div>
          </div>
        </div>
        {/* Contact Form */}
        <form className="flex-1 space-y-4" onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Your Name"
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Your Email"
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            placeholder="Your Message"
            className="w-full border rounded px-3 py-2 min-h-[120px]"
          />
          <button
            type="submit"
            className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition w-full font-semibold"
            disabled={submitted}
          >
            {submitted ? 'Message Sent!' : 'Send Message'}
          </button>
          {success && <div className="text-green-600 text-center mt-2">{success}</div>}
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
} 