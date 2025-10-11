import React, { useState, useEffect, useMemo } from 'react';
import { User, Lock, LogOut, UserPlus, Edit2, Trash2, Eye, EyeOff, Shield, Users, Settings, CheckCircle, AlertCircle, X, Save, Key, Activity, Clock, Search, RefreshCw } from 'lucide-react';
import { usersAPI } from '../services/api';

// Role permissions (kept the same)
const ROLE_PERMISSIONS = {
  'Owner': {
    modules: ['all'],
    canManageUsers: true,
    canViewReports: true,
    canEditPrices: true,
    canDeleteData: true,
    color: 'from-purple-600 to-pink-600',
    icon: Shield
  },
  'Pharmacist': {
    modules: ['medicines', 'stock-in', 'pos', 'expiry', 'reorder', 'barcode'],
    canManageUsers: false,
    canViewReports: true,
    canEditPrices: true,
    canDeleteData: false,
    color: 'from-blue-600 to-indigo-600',
    icon: User
  },
  'Cashier': {
    modules: ['pos', 'barcode'],
    canManageUsers: false,
    canViewReports: false,
    canEditPrices: false,
    canDeleteData: false,
    color: 'from-green-600 to-emerald-600',
    icon: User
  },
  'Stock Manager': {
    modules: ['medicines', 'stock-in', 'expiry', 'reorder', 'barcode', 'suppliers'],
    canManageUsers: false,
    canViewReports: true,
    canEditPrices: false,
    canDeleteData: false,
    color: 'from-orange-600 to-red-600',
    icon: User
  },
  'Viewer': {
    modules: ['medicines', 'sales', 'insights', 'barcode'],
    canManageUsers: false,
    canViewReports: true,
    canEditPrices: false,
    canDeleteData: false,
    color: 'from-gray-600 to-slate-600',
    icon: Eye
  }
};

// ==================== MAIN APP COMPONENT ====================

export default function UserLoginApp({ appData, setAppData }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await usersAPI.getAll();
      if (result.success) {
        setUsers(result.data);
        showNotification('✅ Data loaded from database', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = async (username, password) => {
    const user = users.find(u => u.username === username && u.password === password && u.status === 'active');
    
    if (user) {
      const updatedUser = {
        ...user,
        last_login: new Date().toISOString()
      };
      
      try {
        await usersAPI.update(user.id, updatedUser);
        setUsers(users.map(u => u.id === user.id ? updatedUser : u));
        setCurrentUser(updatedUser);
        setView('dashboard');
        showNotification(`Welcome back, ${user.full_name}!`, 'success');
      } catch (error) {
        showNotification('Login successful but failed to update login time', 'error');
      }
    } else {
      showNotification('Invalid username or password', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    showNotification('Logged out successfully', 'success');
  };

const addUser = async (userData) => {
  try {
    const cleanedData = {
      ...userData,
      username: userData.username || null,
      password: userData.password || null,
      full_name: userData.full_name || null,
      email: userData.email || null,
      phone: userData.phone || null,
      role: userData.role || 'Cashier',
      status: userData.status || 'active',
      created_date: new Date().toISOString().split('T')[0],
      last_login: null
    };
    
    const result = await usersAPI.create(cleanedData);
    if (result.success) {
      setUsers([...users, result.data]);
      showNotification('User added successfully!', 'success');
    }
  } catch (error) {
    showNotification('Failed to add user: ' + error.message, 'error');
  }
};

const updateUser = async (userData) => {
  try {
    const cleanedData = {
      ...userData,
      username: userData.username || null,
      full_name: userData.full_name || null,
      email: userData.email || null,
      phone: userData.phone || null,
      role: userData.role || 'Cashier',
      status: userData.status || 'active',
    };
    
    const result = await usersAPI.update(userData.id, cleanedData);
    if (result.success) {
      setUsers(users.map(u => u.id === userData.id ? result.data : u));
      if (currentUser && currentUser.id === userData.id) {
        setCurrentUser(result.data);
      }
      showNotification('User updated successfully!', 'success');
    }
  } catch (error) {
    showNotification('Failed to update user: ' + error.message, 'error');
  }
};

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const result = await usersAPI.delete(userId);
        if (result.success) {
          setUsers(users.filter(u => u.id !== userId));
          showNotification('User deleted successfully!', 'success');
        }
      } catch (error) {
        showNotification('Failed to delete user: ' + error.message, 'error');
      }
    }
  };

  const changePassword = async (userId, newPassword) => {
    try {
      const user = users.find(u => u.id === userId);
      const result = await usersAPI.update(userId, { ...user, password: newPassword });
      if (result.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, password: newPassword } : u));
        showNotification('Password changed successfully!', 'success');
      }
    } catch (error) {
      showNotification('Failed to change password: ' + error.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {!currentUser ? (
        <LoginScreen onLogin={handleLogin} loading={loading} />
      ) : (
        <>
          <header className="bg-white shadow-md border-b-2 border-indigo-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`bg-gradient-to-r ${ROLE_PERMISSIONS[currentUser.role].color} p-3 rounded-xl shadow-lg`}>
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      User Management System
                    </h1>
                    <p className="text-sm text-gray-500">
                      {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Logged in as</p>
                    <p className="font-bold text-gray-900">{currentUser.full_name}</p>
                    <p className={`text-xs px-2 py-0.5 rounded-full inline-block bg-gradient-to-r ${ROLE_PERMISSIONS[currentUser.role].color} text-white`}>
                      {currentUser.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {notification && (
            <div className="max-w-7xl mx-auto px-4 mt-4">
              <div className={`p-4 rounded-lg flex items-center justify-between ${
                notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {notification.message}
                  </span>
                </div>
                <button onClick={() => setNotification(null)} className="text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-6">
              <div className="flex gap-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Activity },
                  { id: 'profile', label: 'My Profile', icon: User },
                  ...(ROLE_PERMISSIONS[currentUser.role].canManageUsers ? [
                    { id: 'users', label: 'Manage Users', icon: Users },
                    { id: 'add-user', label: 'Add User', icon: UserPlus }
                  ] : [])
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setView(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      view === tab.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {view === 'dashboard' && (
              <UserDashboard currentUser={currentUser} users={users} />
            )}

            {view === 'profile' && (
              <UserProfile 
                user={currentUser} 
                onUpdate={updateUser}
                onChangePassword={(newPassword) => changePassword(currentUser.id, newPassword)}
              />
            )}

            {view === 'users' && ROLE_PERMISSIONS[currentUser.role].canManageUsers && (
              <UserManagement
                users={users}
                currentUser={currentUser}
                onUpdate={updateUser}
                onDelete={deleteUser}
                onChangePassword={changePassword}
              />
            )}

            {view === 'add-user' && ROLE_PERMISSIONS[currentUser.role].canManageUsers && (
              <AddUserForm
                onAdd={addUser}
                onCancel={() => setView('users')}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ==================== LOGIN SCREEN ====================

function LoginScreen({ onLogin, loading }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = () => {
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Al Naeima Pharmacy
          </h1>
          <p className="text-gray-600">Pharmacy Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-indigo-600 hover:text-indigo-700">
                Forgot password?
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2">Demo Credentials:</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>Owner:</strong> admin / admin123</p>
              <p><strong>Pharmacist:</strong> pharmacist1 / pharma123</p>
              <p><strong>Cashier:</strong> cashier1 / cash123</p>
              <p><strong>Stock Manager:</strong> stock1 / stock123</p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Secure access powered by Supabase
        </p>
      </div>
    </div>
  );
}

// ==================== USER DASHBOARD ====================

function UserDashboard({ currentUser, users }) {
  const permissions = ROLE_PERMISSIONS[currentUser.role];
  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-r ${permissions.color} rounded-xl shadow-lg p-8 text-white`}>
        <h2 className="text-3xl font-bold mb-2">Welcome, {currentUser.full_name}!</h2>
        <p className="text-white text-opacity-90">You're logged in as {currentUser.role}</p>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Last login: {currentUser.last_login ? new Date(currentUser.last_login).toLocaleString() : 'Never'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Your Role</p>
              <p className="text-2xl font-bold text-gray-900">{currentUser.role}</p>
            </div>
            <permissions.icon className="w-12 h-12 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Inactive Users</p>
              <p className="text-2xl font-bold text-orange-600">{inactiveUsers}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Permissions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PermissionItem label="Manage Users" allowed={permissions.canManageUsers} />
          <PermissionItem label="View Reports" allowed={permissions.canViewReports} />
          <PermissionItem label="Edit Prices" allowed={permissions.canEditPrices} />
          <PermissionItem label="Delete Data" allowed={permissions.canDeleteData} />
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-2">Accessible Modules:</h4>
          <div className="flex flex-wrap gap-2">
            {permissions.modules[0] === 'all' ? (
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                All Modules
              </span>
            ) : (
              permissions.modules.map(module => (
                <span key={module} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                  {module.replace('-', ' ')}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PermissionItem({ label, allowed }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-700">{label}</span>
      {allowed ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <X className="w-5 h-5 text-red-600" />
      )}
    </div>
  );
}

// ==================== USER PROFILE ====================

function UserProfile({ user, onUpdate, onChangePassword }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [changingPassword, setChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdate = () => {
    onUpdate(formData);
    setEditing(false);
  };

  const handlePasswordChange = () => {
    if (oldPassword !== user.password) {
      alert('Current password is incorrect');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    onChangePassword(newPassword);
    setChangingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className={`bg-gradient-to-r ${ROLE_PERMISSIONS[user.role].color} p-6`}>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{user.full_name}</h2>
              <p className="text-white text-opacity-90">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!editing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InfoField label="Username" value={user.username} />
                <InfoField label="Email" value={user.email} />
                <InfoField label="Phone" value={user.phone} />
                <InfoField label="Role" value={user.role} />
                <InfoField label="Status" value={user.status} />
                <InfoField label="Member Since" value={user.created_date} />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setChangingPassword(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                >
                  <Key className="w-5 h-5" />
                  Change Password
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {changingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handlePasswordChange}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                >
                  Update Password
                </button>
                <button
                  onClick={() => setChangingPassword(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}

// ==================== USER MANAGEMENT WITH PAGINATION ====================

function UserManagement({ users, currentUser, onUpdate, onDelete, onChangePassword }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'All' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or username..."
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Roles</option>
            {Object.keys(ROLE_PERMISSIONS).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-bold text-gray-900">All Users ({filteredUsers.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{user.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${ROLE_PERMISSIONS[user.role].color} text-white`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => onDelete(user.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border rounded-lg text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm font-medium">
              {currentPage} / {Math.ceil(filteredUsers.length / itemsPerPage) || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), prev + 1))}
              disabled={currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={(updatedUser) => {
            onUpdate(updatedUser);
            setEditingUser(null);
          }}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}

// ==================== EDIT USER MODAL ====================

function EditUserModal({ user, onSave, onClose }) {
  const [formData, setFormData] = useState(user);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {Object.keys(ROLE_PERMISSIONS).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== ADD USER FORM ====================

function AddUserForm({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'Cashier',
    email: '',
    phone: '',
    status: 'active'
  });

  const handleSubmit = () => {
    if (!formData.username || !formData.password || !formData.full_name) {
      alert('Please fill all required fields');
      return;
    }
    onAdd(formData);
    onCancel();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Add New User</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Ahmed Al-Rashid"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="ahmed123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-600">*</span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Minimum 6 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="ahmed@pharmacy.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="+966 555 000 0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {Object.keys(ROLE_PERMISSIONS).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}