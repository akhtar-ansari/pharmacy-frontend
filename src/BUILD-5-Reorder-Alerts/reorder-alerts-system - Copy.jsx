import React, { useState, useMemo, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, Search, RefreshCw, CheckCircle, AlertCircle, X, ShoppingCart } from 'lucide-react';
import { stockAPI, medicinesAPI, suppliersAPI } from '../services/api';

export default function ReorderAlertsApp({ appData, setAppData }) {
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
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

  // Group stock by medicine and calculate totals
  const groupedStock = useMemo(() => {
    const grouped = {};
    
    stock.forEach(item => {
      const medicine = medicines.find(m => m.id === item.medicine_id);
      if (!medicine) return;

      if (!grouped[item.medicine_id]) {
        grouped[item.medicine_id] = {
          medicine_id: item.medicine_id,
          medicine: medicine,
          total_quantity: 0,
          batches: [],
          min_stock: 20, // Default minimum
          max_stock: 100 // Default maximum
        };
      }

      grouped[item.medicine_id].total_quantity += item.quantity || 0;
      grouped[item.medicine_id].batches.push(item);
    });

    return Object.values(grouped).map(item => {
      const stockPercent = (item.total_quantity / item.max_stock) * 100;
      
      let status = 'safe';
      if (item.total_quantity === 0) status = 'out_of_stock';
      else if (stockPercent <= 25) status = 'critical';
      else if (stockPercent <= 50) status = 'low';
      else if (stockPercent <= 75) status = 'reorder';

      const reorderQty = Math.max(0, item.max_stock - item.total_quantity);

      return {
        ...item,
        stock_percent: stockPercent,
        status: status,
        reorder_quantity: reorderQty,
        estimated_cost: reorderQty * parseFloat(item.batches[0]?.purchase_price || 0)
      };
    });
  }, [stock, medicines]);

  const categories = useMemo(() => {
    const cats = new Set(groupedStock.map(item => item.medicine?.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [groupedStock]);

  const filteredStock = useMemo(() => {
    return groupedStock.filter(item => {
      const matchesSearch = 
        item.medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.medicine?.generic_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'All' || item.medicine?.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      const order = { out_of_stock: 0, critical: 1, low: 2, reorder: 3, safe: 4 };
      return order[a.status] - order[b.status];
    });
  }, [groupedStock, searchTerm, filterCategory]);

  const stats = useMemo(() => {
    const outOfStock = groupedStock.filter(i => i.status === 'out_of_stock');
    const critical = groupedStock.filter(i => i.status === 'critical');
    const low = groupedStock.filter(i => i.status === 'low');
    const reorder = groupedStock.filter(i => i.status === 'reorder');

    return {
      outOfStock: outOfStock.length,
      critical: critical.length,
      low: low.length,
      reorder: reorder.length,
      totalValue: [...outOfStock, ...critical, ...low].reduce((sum, i) => sum + i.estimated_cost, 0)
    };
  }, [groupedStock]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <Package className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Reorder Alerts</h1>
                <p className="text-sm text-indigo-100">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
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
        {/* Critical Alert */}
        {(stats.outOfStock > 0 || stats.critical > 0) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900">⚠️ URGENT: Stock Action Required!</h3>
                <p className="text-red-700 mt-1">
                  {stats.outOfStock > 0 && `${stats.outOfStock} item(s) out of stock. `}
                  {stats.critical > 0 && `${stats.critical} item(s) critically low (≤25% stock).`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">OUT OF STOCK</h3>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">CRITICAL (≤25%)</h3>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.critical}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">LOW (≤50%)</h3>
              <TrendingDown className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.low}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">REORDER (≤75%)</h3>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.reorder}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading stock from database...</p>
          </div>
        ) : filteredStock.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No stock items found</p>
            <p className="text-gray-400 text-sm">All items are well stocked!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStock.map(item => (
              <ReorderCard key={item.medicine_id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReorderCard({ item }) {
  const getStatusColor = () => {
    switch (item.status) {
      case 'out_of_stock':
        return 'border-red-500 bg-red-50';
      case 'critical':
        return 'border-orange-500 bg-orange-50';
      case 'low':
        return 'border-yellow-500 bg-yellow-50';
      case 'reorder':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-green-500 bg-green-50';
    }
  };

  const getStatusText = () => {
    switch (item.status) {
      case 'out_of_stock':
        return 'OUT OF STOCK';
      case 'critical':
        return 'CRITICAL - Order Now';
      case 'low':
        return 'LOW STOCK';
      case 'reorder':
        return 'Reorder Point';
      default:
        return 'Good Stock';
    }
  };

  return (
    <div className={`rounded-lg shadow hover:shadow-md transition-shadow p-6 border-l-4 ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.medicine?.name}</h3>
              <p className="text-sm text-gray-600">{item.medicine?.generic_name}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              item.status === 'out_of_stock' ? 'bg-red-100 text-red-700' :
              item.status === 'critical' ? 'bg-orange-100 text-orange-700' :
              item.status === 'low' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {getStatusText()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Stock</p>
              <p className={`font-bold text-lg ${
                item.status === 'out_of_stock' ? 'text-red-600' : 'text-gray-900'
              }`}>
                {item.total_quantity}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stock Level</p>
              <p className="font-semibold text-gray-900">{item.stock_percent.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Min / Max</p>
              <p className="font-semibold text-gray-900">{item.min_stock} / {item.max_stock}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reorder Qty</p>
              <p className="font-bold text-indigo-600 text-lg">{item.reorder_quantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Est. Cost</p>
              <p className="font-semibold text-gray-900">₹{item.estimated_cost.toFixed(0)}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  item.status === 'out_of_stock' ? 'bg-red-500' :
                  item.status === 'critical' ? 'bg-orange-500' :
                  item.status === 'low' ? 'bg-yellow-500' :
                  item.status === 'reorder' ? 'bg-blue-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, item.stock_percent)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}