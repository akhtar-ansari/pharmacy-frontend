import React, { useState, useEffect, useMemo } from 'react';
import { PackagePlus, Search, Plus, Edit2, Trash2, X, CheckCircle, AlertCircle, RefreshCw, Download, Calendar, Filter } from 'lucide-react';
import { stockAPI, medicinesAPI, suppliersAPI } from '../services/api';

export default function StockINApp({ appData, setAppData }) {
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setTimeout(() => setNotification(null), 3000);
  };

  const stockWithDetails = useMemo(() => {
    return stock.map(item => ({
      ...item,
      medicine: medicines.find(m => m.id === item.medicine_id),
      supplier: suppliers.find(s => s.id === item.supplier_id)
    })).filter(item => item.medicine);
  }, [stock, medicines, suppliers]);

  const categories = ['All', ...new Set(medicines.map(m => m.category).filter(Boolean))];
  const supplierNames = ['All', ...new Set(suppliers.map(s => s.name).filter(Boolean))];

  const filteredStock = useMemo(() => {
    let filtered = stockWithDetails;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.medicine?.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (supplierFilter !== 'All') {
      filtered = filtered.filter(item => item.supplier?.name === supplierFilter);
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(item => item.medicine?.category === categoryFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter(item => new Date(item.purchase_date) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(item => new Date(item.purchase_date) <= new Date(dateTo));
    }

    return filtered.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));
  }, [stockWithDetails, searchTerm, supplierFilter, categoryFilter, dateFrom, dateTo]);

  const paginatedStock = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStock.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStock, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    const totalItems = stock.length;
    const totalQuantity = stock.reduce((sum, s) => sum + s.quantity, 0);
    const totalValue = stock.reduce((sum, s) => sum + (s.quantity * parseFloat(s.purchase_price || 0)), 0);
    const uniqueMedicines = new Set(stock.map(s => s.medicine_id)).size;

    return {
      totalItems,
      totalQuantity,
      totalValue,
      uniqueMedicines
    };
  }, [stock]);

  const handleAdd = () => {
    setEditingStock(null);
    setShowForm(true);
  };

  const handleEdit = (stockItem) => {
    setEditingStock(stockItem);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock entry?')) return;

    try {
      const result = await stockAPI.delete(id);
      if (result.success) {
        setStock(stock.filter(s => s.id !== id));
        showNotification('✅ Stock entry deleted successfully', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to delete stock: ' + error.message, 'error');
    }
  };

const handleSave = async (stockData) => {
  try {
    // Clean the data - convert empty strings to null for numeric and date fields
    const cleanedData = {
      ...stockData,
      medicine_id: stockData.medicine_id === '' ? null : parseInt(stockData.medicine_id),
      supplier_id: stockData.supplier_id === '' ? null : parseInt(stockData.supplier_id),
      quantity: stockData.quantity === '' ? 0 : parseInt(stockData.quantity),
      purchase_price: stockData.purchase_price === '' ? null : parseFloat(stockData.purchase_price),
      mrp: stockData.mrp === '' ? null : parseFloat(stockData.mrp),
      purchase_date: stockData.purchase_date === '' ? null : stockData.purchase_date,
      expiry_date: stockData.expiry_date === '' ? null : stockData.expiry_date,
      manufacturing_date: stockData.manufacturing_date === '' ? null : stockData.manufacturing_date, // ADD THIS LINE
      batch_number: stockData.batch_number || null,
    };

    if (editingStock) {
      const result = await stockAPI.update(editingStock.id, cleanedData);
      if (result.success) {
        setStock(stock.map(s => s.id === editingStock.id ? result.data : s));
        showNotification('✅ Stock updated successfully', 'success');
      }
    } else {
      const result = await stockAPI.create(cleanedData);
      if (result.success) {
        setStock([...stock, result.data]);
        showNotification('✅ Stock added successfully', 'success');
      }
    }
    setShowForm(false);
    setEditingStock(null);
  } catch (error) {
    showNotification('❌ Failed to save stock: ' + error.message, 'error');
  }
};

  const exportToCSV = () => {
    const headers = ['Purchase Date', 'Medicine Name', 'Batch Number', 'Quantity', 'Purchase Price', 'MRP', 'Expiry Date', 'Supplier', 'Total Value'];
    const rows = filteredStock.map(item => [
      item.purchase_date,
      item.medicine?.name || '',
      item.batch_number,
      item.quantity,
      item.purchase_price,
      item.mrp,
      item.expiry_date,
      item.supplier?.name || '',
      (item.quantity * parseFloat(item.purchase_price || 0)).toFixed(2)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-in-${dateFrom || 'all'}-to-${dateTo || 'all'}.csv`;
    a.click();
  };

  if (showForm) {
    return (
      <StockForm
        stockItem={editingStock}
        medicines={medicines}
        suppliers={suppliers}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingStock(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <PackagePlus className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Stock IN Management</h1>
                <p className="text-sm text-emerald-100">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Stock
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

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Stock Entries</h3>
              <div className="bg-emerald-100 p-2 rounded-lg">
                <PackagePlus className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.totalItems}</p>
            <p className="text-sm text-gray-500 mt-1">Batches recorded</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Quantity</h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.totalQuantity}</p>
            <p className="text-sm text-gray-500 mt-1">Units in stock</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Stock Value</h3>
              <div className="bg-purple-100 p-2 rounded-lg">
                <PackagePlus className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-600">₹{stats.totalValue.toFixed(0)}</p>
            <p className="text-sm text-gray-500 mt-1">Total investment</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Unique Medicines</h3>
              <div className="bg-orange-100 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.uniqueMedicines}</p>
            <p className="text-sm text-gray-500 mt-1">Different SKUs</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search medicine or batch number..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={supplierFilter}
                onChange={(e) => {
                  setSupplierFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {supplierNames.map(sup => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear dates
                </button>
              )}
            </div>
          </div>

          {paginatedStock.length === 0 ? (
            <div className="text-center py-12">
              <PackagePlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No stock entries found</p>
              <button
                onClick={handleAdd}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add Your First Stock Entry
              </button>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Purchase Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Batch Number</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Purchase Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">MRP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expiry Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedStock.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{item.purchase_date}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{item.medicine?.name}</p>
                            <p className="text-sm text-gray-600">{item.medicine?.generic_name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{item.batch_number}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-900">₹{parseFloat(item.purchase_price || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{parseFloat(item.mrp || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-900">{item.expiry_date}</td>
                        <td className="px-4 py-3 text-gray-700">{item.supplier?.name || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit stock"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete stock"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
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
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredStock.length)} to {Math.min(currentPage * itemsPerPage, filteredStock.length)} of {filteredStock.length}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm font-medium">
                    {currentPage} / {Math.ceil(filteredStock.length / itemsPerPage) || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredStock.length / itemsPerPage), prev + 1))}
                    disabled={currentPage >= Math.ceil(filteredStock.length / itemsPerPage)}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StockForm({ stockItem, medicines, suppliers, onSave, onCancel }) {
  const [formData, setFormData] = useState(stockItem || {
    medicine_id: '',
    supplier_id: '',
    batch_number: '',
    quantity: '',
    purchase_price: '',
    mrp: '',
    purchase_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    manufacturing_date: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.medicine_id || !formData.quantity || !formData.purchase_price) {
      alert('Please fill in required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {stockItem ? 'Edit Stock Entry' : 'Add New Stock'}
            </h2>
            <button onClick={onCancel} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicine <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.medicine_id}
                  onChange={(e) => {
                    const medicine = medicines.find(m => m.id === parseInt(e.target.value));
                    setFormData({ 
                      ...formData, 
                      medicine_id: e.target.value,
                      mrp: medicine?.mrp || '',
                      purchase_price: medicine?.purchase_price || ''
                    });
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select Medicine</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} - {m.generic_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || '' })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MRP <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturing Date
                </label>
                <input
                  type="date"
                  value={formData.manufacturing_date}
                  onChange={(e) => setFormData({ ...formData, manufacturing_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                {stockItem ? 'Update Stock' : 'Add Stock'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}