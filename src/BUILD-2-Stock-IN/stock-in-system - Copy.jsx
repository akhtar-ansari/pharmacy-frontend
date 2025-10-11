import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Package, Building2, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';
import { stockAPI, medicinesAPI, suppliersAPI } from '../services/api';

// ==================== MAIN APP COMPONENT ====================

export default function StockInApp({ appData, setAppData }) {
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [view, setView] = useState('list');
  const [editingStock, setEditingStock] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stockRes, medicinesRes, suppliersRes] = await Promise.all([
        stockAPI.getAll(),
        medicinesAPI.getAll(),
        suppliersAPI.getAll()
      ]);

      if (stockRes.success) setStock(stockRes.data);
      if (medicinesRes.success) setMedicines(medicinesRes.data);
      if (suppliersRes.success) setSuppliers(suppliersRes.data);

      showNotification('✅ Data loaded from database', 'success');
    } catch (error) {
      showNotification('❌ Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addStock = async (stockData) => {
    try {
      setLoading(true);
      const response = await stockAPI.add(stockData);
      
      if (response.success) {
        await loadData(); // Reload to get updated data
        setView('list');
        showNotification('✅ Stock added to database successfully!', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to add stock: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (stockData) => {
    try {
      setLoading(true);
      const response = await stockAPI.update(stockData.id, stockData);
      
      if (response.success) {
        await loadData();
        setEditingStock(null);
        setView('list');
        showNotification('✅ Stock updated in database!', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to update stock: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteStock = async (id) => {
    if (window.confirm('⚠️ Delete this stock entry from database?')) {
      try {
        setLoading(true);
        const response = await stockAPI.delete(id);
        
        if (response.success) {
          await loadData();
          showNotification('✅ Stock deleted from database!', 'success');
        }
      } catch (error) {
        showNotification('❌ Failed to delete stock: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Stock IN System</h1>
                <p className="text-sm text-green-600 font-medium">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="text-right mr-4">
                <div className="text-sm text-gray-500">Total Stock Entries</div>
                <div className="text-2xl font-bold text-green-600">{stock.length}</div>
              </div>
              
              <button
                onClick={() => setView('add')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                New Stock IN
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
          <StockList
            stock={stock}
            medicines={medicines}
            suppliers={suppliers}
            onEdit={(item) => {
              setEditingStock(item);
              setView('edit');
            }}
            onDelete={deleteStock}
            loading={loading}
          />
        )}

        {(view === 'add' || view === 'edit') && (
          <StockForm
            stock={editingStock}
            medicines={medicines}
            suppliers={suppliers}
            onSave={view === 'add' ? addStock : updateStock}
            onCancel={() => {
              setEditingStock(null);
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

// ==================== STOCK LIST ====================

function StockList({ stock, medicines, suppliers, onEdit, onDelete, loading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStock = stock.filter(item => {
    const medicine = medicines.find(m => m.id === item.medicine_id);
    const supplier = suppliers.find(s => s.id === item.supplier_id);
    
    return (
      medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by medicine name, batch number, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading stock from database...</p>
        </div>
      ) : filteredStock.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No stock entries found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredStock.map(item => {
            const medicine = medicines.find(m => m.id === item.medicine_id);
            const supplier = suppliers.find(s => s.id === item.supplier_id);
            
            return (
              <StockCard
                key={item.id}
                stock={item}
                medicine={medicine}
                supplier={supplier}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== STOCK CARD ====================

function StockCard({ stock, medicine, supplier, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border-l-4 border-green-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{medicine?.name || 'Unknown Medicine'}</h3>
          <p className="text-sm text-gray-600">{medicine?.generic_name}</p>
          
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Batch Number</p>
              <p className="font-semibold text-gray-900">{stock.batch_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiry Date</p>
              <p className="font-semibold text-gray-900">{stock.expiry_date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="font-semibold text-green-600">{stock.quantity} units</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Supplier</p>
              <p className="font-semibold text-gray-900">{supplier?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">MRP</p>
              <p className="font-semibold text-gray-900">₹{stock.mrp}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Purchase Price</p>
              <p className="font-semibold text-gray-900">₹{stock.purchase_price}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(stock)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Package className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(stock.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== STOCK FORM ====================

function StockForm({ stock, medicines, suppliers, onSave, onCancel, isEdit, loading }) {
  const [formData, setFormData] = useState(stock || {
    medicine_id: medicines[0]?.id || '',
    batch_number: '',
    expiry_date: '',
    quantity: '',
    mrp: '',
    purchase_price: '',
    supplier_id: suppliers[0]?.id || '',
    received_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isEdit ? '✏️ Edit Stock' : '➕ Add New Stock'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medicine *</label>
            <select
              required
              value={formData.medicine_id}
              onChange={(e) => setFormData({...formData, medicine_id: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Medicine</option>
              {medicines.map(med => (
                <option key={med.id} value={med.id}>{med.name} - {med.generic_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
            <select
              required
              value={formData.supplier_id}
              onChange={(e) => setFormData({...formData, supplier_id: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Supplier</option>
              {suppliers.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number *</label>
            <input
              type="text"
              required
              value={formData.batch_number}
              onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., PCM-2024-A1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
            <input
              type="text"
              required
              value={formData.expiry_date}
              onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="MM/YYYY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
            <input
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">MRP (₹) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.mrp}
              onChange={(e) => setFormData({...formData, mrp: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 12.50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.purchase_price}
              onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 8.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Received Date *</label>
            <input
              type="date"
              required
              value={formData.received_date}
              onChange={(e) => setFormData({...formData, received_date: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Stock' : 'Add Stock')}
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