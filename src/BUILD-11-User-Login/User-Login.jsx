import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Eye, EyeOff, Shield, AlertCircle, CheckCircle, X } from 'lucide-react';
import { authAPI } from '../services/api';

// Get current user from localStorage
const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

// MediFlow Logo Component
const MediFlowLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pillGradientUM" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0EA5E9" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    <ellipse cx="35" cy="50" rx="25" ry="15" fill="url(#pillGradientUM)" opacity="0.9"/>
    <rect x="30" y="45" width="10" height="3" fill="white"/>
    <rect x="33" y="42" width="4" height="9" fill="white"/>
    <path d="M 60 45 Q 70 40 80 45" stroke="#0EA5E9" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8"/>
    <path d="M 60 50 Q 70 50 80 50" stroke="#06B6D4" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M 60 55 Q 70 60 80 55" stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

export default function UserManagementApp() {
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'pharmacist',
    phone: '',
    is_active: true
  });

  // Load users on mount
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await authAPI.getAllUsers();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      showNotification('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Check if user is admin - AFTER all hooks
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access user management.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🔍 Form Data:', formData);
    console.log('📝 Editing User?', editingUser ? 'YES' : 'NO');

    try {
      if (editingUser) {
        // Update user - exclude password field
        const { password, ...updateData } = formData;
        console.log('📤 Sending UPDATE:', updateData);
        
        const result = await authAPI.updateUser(editingUser.id, updateData);
        
        if (result.success) {
          showNotification('User updated successfully!');
          loadUsers();
          resetForm();
        }
      } else {
        // Create new user - require password
        console.log('🔐 Password value:', formData.password);
        console.log('🔐 Password length:', formData.password?.length);
        
        if (!formData.password || formData.password.length < 6) {
          showNotification('Password must be at least 6 characters', 'error');
          return;
        }

        console.log('📤 Sending CREATE:', formData);
        
        const result = await authAPI.createUser(formData);
        
        console.log('✅ Result:', result);
        
        if (result.success) {
          showNotification('User created successfully!');
          loadUsers();
          resetForm();
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      showNotification(error.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't prefill password
      full_name: user.full_name,
      role: user.role,
      phone: user.phone || '',
      is_active: user.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      try {
        const result = await authAPI.deleteUser(user.id);
        
        if (result.success) {
          showNotification('User deleted successfully!');
          loadUsers();
        }
      } catch (error) {
        showNotification(error.message || 'Delete failed', 'error');
      }
    }
  };

  const handleResetPassword = async (user) => {
    const newPassword = prompt(`Enter new password for ${user.username}:`);
    
    if (newPassword && newPassword.length >= 6) {
      try {
        const result = await authAPI.resetPassword(user.id, newPassword);
        
        if (result.success) {
          showNotification('Password reset successfully!');
        }
      } catch (error) {
        showNotification(error.message || 'Password reset failed', 'error');
      }
    } else if (newPassword) {
      showNotification('Password must be at least 6 characters', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'pharmacist',
      phone: '',
      is_active: true
    });
    setEditingUser(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-700',
      pharmacist: 'bg-blue-100 text-blue-700',
      cashier: 'bg-green-100 text-green-700'
    };
    return badges[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <MediFlowLogo size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-white">MediFlow</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">PMS</span>
                </div>
                <h1 className="text-lg font-semibold text-white">User Management</h1>
                <p className="text-xs text-purple-100">
                  {loading ? '⏳ Loading...' : `${users.length} users`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* User Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      disabled={editingUser}
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+966-XXX-XXX-XXXX"
                    />
                  </div>

                  {/* Password - Only show when creating new user */}
                  {!editingUser && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password * (minimum 6 characters)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required={!editingUser}
                          minLength={6}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Password will be securely hashed before storing
                      </p>
                    </div>
                  )}

                  {/* Show note when editing */}
                  {editingUser && (
                    <div className="col-span-2">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          💡 To change password, use the "Reset Password" button (🛡️) in the user list
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="cashier">Cashier</option>
                    </select>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active User
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-3">
                        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No users found. Click "Add User" to create one.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">{user.email}</div>
                          {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}