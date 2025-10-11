import React, { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Clock, Package, Search, RefreshCw, CheckCircle, X, XCircle } from 'lucide-react';
import { stockAPI, medicinesAPI } from '../services/api';

export default function ExpiryAlertsApp({ appData, setAppData }) {
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setTimeout(() => setNotification(null), 4000);
  };

  // Analyze stock with expiry info
  const analyzedStock = useMemo(() => {
    return stock.map(item => {
      const medicine = medicines.find(m => m.id === item.medicine_id);
      
      // Parse expiry date (MM/YYYY format)
      const [month, year] = (item.expiry_date || '').split('/');
      const expiryDate = new Date(parseInt('20' + year), parseInt(month) - 1);
      const today = new Date();
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status = 'safe';
      if (diffDays < 0) status = 'expired';
      else if (diffDays <= 30) status = 'critical';
      else if (diffDays <= 90) status = 'warning';

      return {
        ...item,
        medicine: medicine,
        daysUntilExpiry: diffDays,
        status: status
      };
    }).filter(item => item.quantity > 0); // Only show items with stock
  }, [stock, medicines]);

  const categories = useMemo(() => {
    const cats = new Set(analyzedStock.map(item => item.medicine?.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [analyzedStock]);

  const filteredStock = useMemo(() => {
    return analyzedStock.filter(item => {
      const matchesSearch = 
        item.medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.medicine?.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batch_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'All' || item.medicine?.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [analyzedStock, searchTerm, filterCategory]);

  const stats = useMemo(() => {
    const expired = analyzedStock.filter(i => i.status === 'expired');
    const critical = analyzedStock.filter(i => i.status === 'critical');
    const warning = analyzedStock.filter(i => i.status === 'warning');

    return {
      expired: expired.length,
      expiredValue: expired.reduce((sum, i) => sum + (i.quantity * parseFloat(i.purchase_price || 0)), 0),
      critical: critical.length,
      criticalValue: critical.reduce((sum, i) => sum + (i.quantity * parseFloat(i.purchase_price || 0)), 0),
      warning: warning.length,
      warningValue: warning.reduce((sum, i) => sum + (i.quantity * parseFloat(i.purchase_price || 0)), 0)
    };
  }, [analyzedStock]);

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
        {/* Critical Alert Banner */}
        {(stats.expired > 0 || stats.critical > 0) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900">⚠️ URGENT ACTION REQUIRED!</h3>
                <p className="text-red-700 mt-1">
                  {stats.expired > 0 && `${stats.expired} expired item(s) must be removed immediately. `}
                  {stats.critical > 0 && `${stats.critical} item(s) expiring within 30 days.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">EXPIRED</h3>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
            <p className="text-sm text-gray-500 mt-1">Value: ₹{stats.expiredValue.toFixed(0)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">CRITICAL (≤30 days)</h3>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.critical}</p>
            <p className="text-sm text-gray-500 mt-1">Value: ₹{stats.criticalValue.toFixed(0)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">WARNING (≤90 days)</h3>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.warning}</p>
            <p className="text-sm text-gray-500 mt-1">Value: ₹{stats.warningValue.toFixed(0)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines, batch numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading stock from database...</p>
          </div>
        ) : filteredStock.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No stock items found</p>
            <p className="text-gray-400 text-sm">All clear or adjust your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStock.map(item => (
              <ExpiryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExpiryCard({ item }) {
  const getStatusColor = () => {
    switch (item.status) {
      case 'expired':
        return 'border-red-500 bg-red-50';
      case 'critical':
        return 'border-orange-500 bg-orange-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-green-500 bg-green-50';
    }
  };

  const getStatusIcon = () => {
    switch (item.status) {
      case 'expired':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'critical':
        return <AlertCircle className="w-6 h-6 text-orange-600" />;
      case 'warning':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
  };

  const getStatusText = () => {
    if (item.daysUntilExpiry < 0) {
      return `EXPIRED ${Math.abs(item.daysUntilExpiry)} days ago`;
    } else if (item.daysUntilExpiry === 0) {
      return 'EXPIRES TODAY';
    } else {
      return `${item.daysUntilExpiry} days until expiry`;
    }
  };

  return (
    <div className={`rounded-lg shadow hover:shadow-md transition-shadow p-6 border-l-4 ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.medicine?.name || 'Unknown'}</h3>
              <p className="text-sm text-gray-600">{item.medicine?.generic_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500">Batch Number</p>
              <p className="font-semibold text-gray-900">{item.batch_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiry Date</p>
              <p className="font-semibold text-gray-900">{item.expiry_date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="font-semibold text-gray-900">{item.quantity} units</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Value</p>
              <p className="font-semibold text-gray-900">₹{(item.quantity * parseFloat(item.purchase_price || 0)).toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              item.status === 'expired' ? 'bg-red-100 text-red-700' :
              item.status === 'critical' ? 'bg-orange-100 text-orange-700' :
              item.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {getStatusText()}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
              {item.medicine?.category || 'Uncategorized'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}