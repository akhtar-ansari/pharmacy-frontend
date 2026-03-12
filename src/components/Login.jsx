import React, { useState } from 'react';
import { Lock, User, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react';
import { authAPI } from '../services/api';

// MediFlow Logo Component
const MediFlowLogo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pillGradientLogin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0EA5E9" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    {/* Capsule/Pill Shape */}
    <ellipse cx="35" cy="50" rx="25" ry="15" fill="url(#pillGradientLogin)" opacity="0.9"/>
    {/* Medical Cross */}
    <rect x="30" y="45" width="10" height="3" fill="white"/>
    <rect x="33" y="42" width="4" height="9" fill="white"/>
    {/* Flow Lines */}
    <path d="M 60 45 Q 70 40 80 45" stroke="#0EA5E9" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8"/>
    <path d="M 60 50 Q 70 50 80 50" stroke="#06B6D4" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M 60 55 Q 70 60 80 55" stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

export default function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    clientCode: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Attempting login...', formData.clientCode, formData.username);

    try {
      const result = await authAPI.login(formData.clientCode, formData.username, formData.password);
      
      console.log('📥 Login response:', result);

      if (result.success) {
        console.log('✅ Login successful!');
        console.log('💾 Saving token:', result.token);
        console.log('👤 User data:', result.user);
        console.log('🏢 Client data:', result.client);
        
        // Save token and user data
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Save client data
        if (result.client) {
          localStorage.setItem('pms_client_id', result.client.id);
          localStorage.setItem('pms_client_code', result.client.code);
          localStorage.setItem('pms_client_name', result.client.name);
          if (result.client.logo) {
            localStorage.setItem('pms_client_logo', result.client.logo);
          }
          localStorage.setItem('pms_client_tier', result.client.tier || 'basic');
        }
        
        console.log('📞 Calling onLoginSuccess...');
        
        // Call success callback
        onLoginSuccess(result.user);
        
        console.log('✅ Login process complete!');
      } else {
        console.log('❌ Login failed:', result.error);
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('💥 Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'clientCode' ? value.toUpperCase() : value
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
      </div>

      {/* Login Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-2xl">
              <MediFlowLogo size={64} />
            </div>
          </div>
          
          <div className="mb-2">
            <span className="text-2xl font-bold text-gray-800">Pharmacy Management</span>
          </div>

          <p className="text-gray-600 text-sm">
            Powered by{' '}
            <a 
              href="https://arwaenterprises.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Arwa Enterprises
            </a>
          </p>
          <p className="text-gray-400 text-xs mt-1">Sign in to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Login Failed</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client Code Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="clientCode"
                value={formData.clientCode}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="AE1, AE2..."
                required
                maxLength={10}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Enter your company code</p>
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2026{' '}
            <a 
              href="https://arwaenterprises.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Arwa Enterprises
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Pharmacy Management System
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Need help? Contact: connect.arwaenterprises@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
