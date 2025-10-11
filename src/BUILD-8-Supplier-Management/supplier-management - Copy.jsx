import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2, Edit2, Trash2, X, CheckCircle, AlertCircle, RefreshCw, Phone, Mail, MapPin } from 'lucide-react';
import { suppliersAPI } from '../services/api';

export default function SupplierManagementApp({ appData, setAppData }) {
  const [suppliers, setSuppliers] = useState([]);
  const [view, setView] = useState('list');
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await suppliersAPI.getAll();
      if (response.success) {
        setSuppliers(response.data);
        showNotification(`✅ Loaded ${response.data.length} suppliers from database`, 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to load suppliers: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addSupplier = async (supplierData) => {
    try {
      setLoading(true);
      const response = await suppliersAPI.add(supplierData);
      
      if (response.success) {
        setSuppliers([...suppliers, response.data]);
        setView('list');
        showNotification('✅ Supplier saved to database!', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to add supplier: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async (supplierData) => {
    try {
      setLoading(true);
      const response = await suppliersAPI.update(supplierData.id, supplierData);
      
      if (response.success) {
        setSuppliers(suppliers.map(s => s.id === supplierData.id ? response.data : s));
        setEditingSupplier(null);
        setView('list');
        showNotification('✅ Supplier updated in database!', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to update supplier: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (id) => {
    if (window.confirm('⚠️ Delete this supplier from database?')) {
      try {
        setLoading(true);
        const response = await suppliersAPI.delete(id);
        
        if (response.success) {
          setSuppliers(suppliers.filter(s => s.id !== id));
          showNotification('✅ Supplier deleted from database!', 'success');
        }
      } catch (error) {
        showNotification('❌ Failed to delete supplier: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
                <p className="text-sm text-green-600 font-medium">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadSuppliers}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="text-right mr-4">
                <div className="text-sm text-gray-500">Active Suppliers</div>
                <div className="text-2xl font-bold text-indigo-600">{suppliers.filter(s => s.status === 'active').length}</div>
              </div>
              
              <button
                onClick={() => setView('add')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Supplier
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
              <span className={notification.type === 'success' ? 'text-green-800 font-medium' : 'text-red-800 font-medium'}>
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
        {view === 'list' && (
          <SupplierList
            suppliers={filteredSuppliers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onEdit={(supplier) => {
              setEditingSupplier(supplier);
              setView('edit');
            }}
            onDelete={deleteSupplier}
            loading={loading}
          />
        )}

        {(view === 'add' || view === 'edit') && (
          <SupplierForm
            supplier={editingSupplier}
            onSave={view === 'add' ? addSupplier : updateSupplier}
            onCancel={() => {
              setEditingSupplier(null);
              setView('list');
            }}
            isEdit={view === 'edit'}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

function SupplierList({ suppliers, searchTerm, setSearchTerm, onEdit, onDelete, loading }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, contact person, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading suppliers from database...</p>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No suppliers found</p>
          <p className="text-gray-400 text-sm">Add your first supplier to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {suppliers.map(supplier => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SupplierCard({ supplier, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border-l-4 border-indigo-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              supplier.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {supplier.status}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{supplier.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{supplier.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{supplier.city}</span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Contact:</span> {supplier.contact_person}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(supplier)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(supplier.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SupplierForm({ supplier, onSave, onCancel, isEdit, loading }) {
  const [formData, setFormData] = useState(supplier || {
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    payment_terms: 30,
    credit_limit: 50000,
    gst_number: '',
    rating: 4.0,
    status: 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isEdit ? '✏️ Edit Supplier' : '➕ Add New Supplier'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., MediSupply Distributors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
            <input
              type="text"
              required
              value={formData.contact_person}
              onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Ahmed Al-Rashid"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="+966 555 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="supplier@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Riyadh"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
            <input
              type="text"
              value={formData.gst_number}
              onChange={(e) => setFormData({...formData, gst_number: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., GST-001"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="2"
              placeholder="Full address..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms (days)</label>
            <input
              type="number"
              value={formData.payment_terms}
              onChange={(e) => setFormData({...formData, payment_terms: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Credit Limit (₹)</label>
            <input
              type="number"
              value={formData.credit_limit}
              onChange={(e) => setFormData({...formData, credit_limit: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="4.0"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Supplier' : 'Add Supplier')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}