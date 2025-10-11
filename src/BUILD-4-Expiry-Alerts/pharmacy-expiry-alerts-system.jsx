import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Calendar, Package, RefreshCw, Search, X, CheckCircle, AlertCircle, Download, Trash2 } from 'lucide-react';
import { stockAPI, medicinesAPI } from '../services/api';

export default function ExpiryAlertsApp({ appData, setAppData }) {
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [alertLevel, setAlertLevel] = useState('all');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stockRes, medicinesRes] = await Promise.all([
        stockAPI.getAll(),
        medicinesAPI.getAll()
      ]);

      if (stockRes.success) setStock(stockRes.data);
      if (medicinesRes.success) setMedicines(medicinesRes.data);

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

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800', days: Math.abs(daysUntilExpiry) };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'critical', label: 'Critical (≤30 days)', color: 'bg-red-100 text-red-800', days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 60) {
      return { status: 'warning', label: 'Warning (31-60 days)', color: 'bg-orange-100 text-orange-800', days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 90) {
      return { status: 'caution', label: 'Caution (61-90 days)', color: 'bg-yellow-100 text-yellow-800', days: daysUntilExpiry };
    } else {
      return { status: 'safe', label: 'Safe (>90 days)', color: 'bg-green-100 text-green-800', days: daysUntilExpiry };
    }
  };

  const stockWithExpiry = useMemo(() => {
    return stock.map(item => {
      const medicine = medicines.find(m => m.id === item.medicine_id);
      const expiryStatus = getExpiryStatus(item.expiry_date);
      return {
        ...item,
        medicine,
        expiryStatus
      };
    }).filter(item => item.quantity > 0);
  }, [stock, medicines]);

  const filteredStock = useMemo(() => {
    let filtered = stockWithExpiry;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.medicine?.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(item => item.medicine?.category === categoryFilter);
    }

    if (alertLevel !== 'all') {
      filtered = filtered.filter(item => item.expiryStatus.status === alertLevel);
    }

    return filtered.sort((a, b) => a.expiryStatus.days - b.expiryStatus.days);
  }, [stockWithExpiry, searchTerm, categoryFilter, alertLevel]);

  const paginatedStock = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStock.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStock, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    const expired = stockWithExpiry.filter(s => s.expiryStatus.status === 'expired');
    const critical = stockWithExpiry.filter(s => s.expiryStatus.status === 'critical');
    const warning = stockWithExpiry.filter(s => s.expiryStatus.status === 'warning');
    const caution = stockWithExpiry.filter(s => s.expiryStatus.status === 'caution');

    const expiredValue = expired.reduce((sum, s) => sum + (s.quantity * parseFloat(s.purchase_price || 0)), 0);
    const criticalValue = critical.reduce((sum, s) => sum + (s.quantity * parseFloat(s.purchase_price || 0)), 0);

    return {
      expired: expired.length,
      critical: critical.length,
      warning: warning.length,
      caution: caution.length,
      expiredValue,
      criticalValue,
      totalAtRisk: expired.length + critical.length
    };
  }, [stockWithExpiry]);

  const categories = ['All', ...new Set(medicines.map(m => m.category))];

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this expired stock item?')) return;

    try {
      const result = await stockAPI.delete(id);
      if (result.success) {
        setStock(stock.filter(s => s.id !== id));
        showNotification('✅ Stock item removed successfully', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to remove item: ' + error.message, 'error');
    }
  };

  const exportToCSV = () => {
    const headers = ['Medicine Name', 'Generic Name', 'Batch Number', 'Expiry Date', 'Days Until Expiry', 'Quantity', 'Status', 'Value'];
    const rows = filteredStock.map(item => [
      item.medicine?.name || '',
      item.medicine?.generic_name || '',
      item.batch_number,
      item.expiry_date,
      item.expiryStatus.days,
      item.quantity,
      item.expiryStatus.label,
      (item.quantity * parseFloat(item.purchase_price || 0)).toFixed(2)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expiry-alerts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-red-600 to-orange-600 shadow-lg border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Expiry Alerts</h1>
                <p className="text-sm text-red-100">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
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
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Expired Items</h3>
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
            <p className="text-sm text-gray-500 mt-1">₹{stats.expiredValue.toFixed(0)} value</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Critical (≤30d)</h3>
              <div className="bg-orange-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.critical}</p>
            <p className="text-sm text-gray-500 mt-1">₹{stats.criticalValue.toFixed(0)} value</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Warning (31-60d)</h3>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.warning}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Caution (61-90d)</h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.caution}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search medicine, batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={alertLevel}
              onChange={(e) => setAlertLevel(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Alerts</option>
              <option value="expired">Expired Only</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warning Only</option>
              <option value="caution">Caution Only</option>
            </select>
          </div>

          {paginatedStock.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No items found</p>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Batch</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expiry Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Days Left</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Value</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedStock.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{item.medicine?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">{item.medicine?.generic_name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{item.batch_number}</td>
                        <td className="px-4 py-3 text-gray-900">{item.expiry_date}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${
                            item.expiryStatus.status === 'expired' || item.expiryStatus.status === 'critical' 
                              ? 'text-red-600' 
                              : item.expiryStatus.status === 'warning' 
                              ? 'text-orange-600' 
                              : 'text-gray-600'
                          }`}>
                            {item.expiryStatus.status === 'expired' ? `${item.expiryStatus.days}d ago` : `${item.expiryStatus.days}d`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          ₹{(item.quantity * parseFloat(item.purchase_price || 0)).toFixed(0)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${item.expiryStatus.color}`}>
                            {item.expiryStatus.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.expiryStatus.status === 'expired' && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove expired item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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