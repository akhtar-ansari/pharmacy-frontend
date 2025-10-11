import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, AlertCircle, TrendingDown, Package, RefreshCw, Search, X, CheckCircle, Download, ShoppingCart, Truck } from 'lucide-react';
import { stockAPI, medicinesAPI, suppliersAPI } from '../services/api';

export default function ReorderAlertsApp({ appData, setAppData }) {
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [alertLevel, setAlertLevel] = useState('all');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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

  const getStockLevel = (currentQty, reorderLevel) => {
    const percentage = (currentQty / reorderLevel) * 100;
    
    if (currentQty === 0) {
      return { status: 'out', label: 'Out of Stock', color: 'bg-red-100 text-red-800', level: 'critical' };
    } else if (percentage <= 25) {
      return { status: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800', level: 'critical' };
    } else if (percentage <= 50) {
      return { status: 'low', label: 'Low Stock', color: 'bg-orange-100 text-orange-800', level: 'warning' };
    } else if (percentage <= 75) {
      return { status: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800', level: 'caution' };
    } else {
      return { status: 'good', label: 'Good Stock', color: 'bg-green-100 text-green-800', level: 'safe' };
    }
  };

  const aggregatedStock = useMemo(() => {
    const stockByMedicine = {};
    
    stock.forEach(item => {
      if (!stockByMedicine[item.medicine_id]) {
        stockByMedicine[item.medicine_id] = {
          medicine_id: item.medicine_id,
          totalQuantity: 0,
          batches: []
        };
      }
      stockByMedicine[item.medicine_id].totalQuantity += item.quantity;
      stockByMedicine[item.medicine_id].batches.push(item);
    });

    return Object.values(stockByMedicine).map(item => {
      const medicine = medicines.find(m => m.id === item.medicine_id);
      const reorderLevel = medicine?.reorder_level || 50;
      const stockLevel = getStockLevel(item.totalQuantity, reorderLevel);
      const reorderQty = Math.max(0, reorderLevel * 2 - item.totalQuantity);
      const supplier = suppliers.find(s => s.id === medicine?.preferred_supplier_id);

      return {
        ...item,
        medicine,
        reorderLevel,
        stockLevel,
        reorderQty,
        supplier,
        estimatedCost: reorderQty * parseFloat(medicine?.purchase_price || 0)
      };
    }).filter(item => item.medicine);
  }, [stock, medicines, suppliers]);

  const filteredStock = useMemo(() => {
    let filtered = aggregatedStock;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.medicine?.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(item => item.medicine?.category === categoryFilter);
    }

    if (supplierFilter !== 'All') {
      filtered = filtered.filter(item => item.supplier?.name === supplierFilter);
    }

    if (alertLevel !== 'all') {
      filtered = filtered.filter(item => {
        if (alertLevel === 'out') return item.stockLevel.status === 'out';
        if (alertLevel === 'critical') return item.stockLevel.level === 'critical';
        if (alertLevel === 'warning') return item.stockLevel.level === 'warning';
        return true;
      });
    }

    return filtered.sort((a, b) => a.totalQuantity - b.totalQuantity);
  }, [aggregatedStock, searchTerm, categoryFilter, supplierFilter, alertLevel]);

  const paginatedStock = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStock.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStock, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    const outOfStock = aggregatedStock.filter(s => s.stockLevel.status === 'out');
    const critical = aggregatedStock.filter(s => s.stockLevel.level === 'critical');
    const lowStock = aggregatedStock.filter(s => s.stockLevel.level === 'warning');
    
    const totalReorderValue = critical.reduce((sum, s) => sum + s.estimatedCost, 0);

    return {
      outOfStock: outOfStock.length,
      critical: critical.length,
      lowStock: lowStock.length,
      totalReorderValue,
      needsAttention: outOfStock.length + critical.length
    };
  }, [aggregatedStock]);

  const categories = ['All', ...new Set(medicines.map(m => m.category))];
  const supplierNames = ['All', ...new Set(suppliers.map(s => s.name))];

  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllCritical = () => {
    const criticalIds = filteredStock
      .filter(s => s.stockLevel.level === 'critical')
      .map(s => s.medicine_id);
    setSelectedItems(criticalIds);
  };

  const generatePurchaseOrder = () => {
    const orderItems = filteredStock.filter(item => selectedItems.includes(item.medicine_id));
    if (orderItems.length === 0) {
      showNotification('⚠️ Please select items to order', 'error');
      return;
    }
    setShowOrderSummary(true);
  };

  const exportToCSV = () => {
    const headers = ['Medicine Name', 'Generic Name', 'Current Stock', 'Reorder Level', 'Reorder Qty', 'Status', 'Supplier', 'Estimated Cost'];
    const rows = filteredStock.map(item => [
      item.medicine?.name || '',
      item.medicine?.generic_name || '',
      item.totalQuantity,
      item.reorderLevel,
      item.reorderQty,
      item.stockLevel.label,
      item.supplier?.name || 'N/A',
      item.estimatedCost.toFixed(2)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reorder-alerts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (showOrderSummary) {
    return <OrderSummary 
      items={filteredStock.filter(item => selectedItems.includes(item.medicine_id))}
      onBack={() => setShowOrderSummary(false)}
      onConfirm={() => {
        showNotification('✅ Purchase order generated successfully!', 'success');
        setShowOrderSummary(false);
        setSelectedItems([]);
      }}
    />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <ShoppingBag className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Reorder Alerts & Automation</h1>
                <p className="text-sm text-indigo-100">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
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
              <h3 className="text-sm font-medium text-gray-600">Out of Stock</h3>
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
            <p className="text-sm text-gray-500 mt-1">Immediate action needed</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Critical Stock</h3>
              <div className="bg-orange-100 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.critical}</p>
            <p className="text-sm text-gray-500 mt-1">Order soon</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Low Stock</h3>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.lowStock}</p>
            <p className="text-sm text-gray-500 mt-1">Monitor closely</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Reorder Value</h3>
              <div className="bg-indigo-100 p-2 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-indigo-600">₹{stats.totalReorderValue.toFixed(0)}</p>
            <p className="text-sm text-gray-500 mt-1">Estimated cost</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search medicine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {supplierNames.map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>

            <select
              value={alertLevel}
              onChange={(e) => setAlertLevel(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Items</option>
              <option value="out">Out of Stock</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Low Stock Only</option>
            </select>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={selectAllCritical}
              className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
            >
              Select All Critical
            </button>
            {selectedItems.length > 0 && (
              <>
                <span className="text-sm text-gray-600">{selectedItems.length} items selected</span>
                <button
                  onClick={generatePurchaseOrder}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  Generate Purchase Order
                </button>
              </>
            )}
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
                      <th className="px-4 py-3 text-center">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Current Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Reorder Level</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Suggested Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Est. Cost</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedStock.map((item) => (
                      <tr key={item.medicine_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.medicine_id)}
                            onChange={() => toggleItemSelection(item.medicine_id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{item.medicine?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">{item.medicine?.generic_name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${
                            item.stockLevel.status === 'out' || item.stockLevel.level === 'critical'
                              ? 'text-red-600'
                              : item.stockLevel.level === 'warning'
                              ? 'text-orange-600'
                              : 'text-gray-900'
                          }`}>
                            {item.totalQuantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">{item.reorderLevel}</td>
                        <td className="px-4 py-3 text-right font-semibold text-indigo-600">{item.reorderQty}</td>
                        <td className="px-4 py-3 text-gray-700">{item.supplier?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{item.estimatedCost.toFixed(0)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${item.stockLevel.color}`}>
                            {item.stockLevel.label}
                          </span>
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

function OrderSummary({ items, onBack, onConfirm }) {
  const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalItems = items.reduce((sum, item) => sum + item.reorderQty, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchase Order Summary</h2>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map(item => (
                  <tr key={item.medicine_id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.medicine?.name}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{item.reorderQty}</td>
                    <td className="px-4 py-3 text-gray-700">{item.supplier?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{item.estimatedCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2">
                <tr>
                  <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{totalItems} items</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right font-bold text-indigo-600 text-xl">₹{totalCost.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}