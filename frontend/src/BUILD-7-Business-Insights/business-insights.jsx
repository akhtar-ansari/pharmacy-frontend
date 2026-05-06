import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Package, RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react';
import { salesAPI, stockAPI, medicinesAPI } from '../services/api';

export default function BusinessInsightsApp({ appData, setAppData }) {
  const [sales, setSales] = useState([]);
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [dateRange, setDateRange] = useState('month');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesRes, stockRes, medicinesRes] = await Promise.all([
        salesAPI.getAll(),
        stockAPI.getAll(),
        medicinesAPI.getAll()
      ]);

      if (salesRes.success) setSales(salesRes.data);
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

  const filteredSales = useMemo(() => {
    const today = new Date();
    let filtered = [...sales];

    if (dateRange === 'today') {
      filtered = filtered.filter(s => {
        const saleDate = new Date(s.sale_date);
        return saleDate.toDateString() === today.toDateString();
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(s => new Date(s.sale_date) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(s => new Date(s.sale_date) >= monthAgo);
    }

    return filtered;
  }, [sales, dateRange]);

  const insights = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + parseFloat(s.final_amount || 0), 0);
    const totalSales = filteredSales.length;
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    let totalProfit = 0;
    filteredSales.forEach(sale => {
      if (sale.sale_items) {
        sale.sale_items.forEach(item => {
          const stockItem = stock.find(s => s.medicine_id === item.medicine_id);
          if (stockItem) {
            const profit = (parseFloat(item.mrp || 0) - parseFloat(stockItem.purchase_price || 0)) * item.quantity;
            totalProfit += profit;
          }
        });
      }
    });

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const medicineSales = {};
    filteredSales.forEach(sale => {
      if (sale.sale_items) {
        sale.sale_items.forEach(item => {
          if (!medicineSales[item.medicine_id]) {
            medicineSales[item.medicine_id] = {
              medicine_id: item.medicine_id,
              quantity: 0,
              revenue: 0
            };
          }
          medicineSales[item.medicine_id].quantity += item.quantity;
          medicineSales[item.medicine_id].revenue += parseFloat(item.total || 0);
        });
      }
    });

    const allTopSelling = Object.values(medicineSales)
      .map(ms => ({
        ...ms,
        medicine: medicines.find(m => m.id === ms.medicine_id)
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const topSelling = allTopSelling.slice(startIndex, startIndex + itemsPerPage);

    const stockValue = stock.reduce((sum, s) => 
      sum + (s.quantity * parseFloat(s.purchase_price || 0)), 0
    );

    const deadStock = stock.filter(s => {
      const hasSales = filteredSales.some(sale => 
        sale.sale_items?.some(item => item.medicine_id === s.medicine_id)
      );
      return !hasSales && s.quantity > 0;
    });

    return {
      totalRevenue,
      totalSales,
      avgSale,
      totalProfit,
      profitMargin,
      topSelling,
      allTopSelling,
      stockValue,
      deadStockCount: deadStock.length,
      deadStockValue: deadStock.reduce((sum, s) => sum + (s.quantity * parseFloat(s.purchase_price || 0)), 0)
    };
  }, [filteredSales, stock, medicines, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Business Insights</h1>
                <p className="text-sm text-purple-100">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>

              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
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
          <MetricCard
            title="Total Revenue"
            value={`₹${insights.totalRevenue.toFixed(0)}`}
            icon={DollarSign}
            color="bg-green-600"
          />
          <MetricCard
            title="Total Profit"
            value={`₹${insights.totalProfit.toFixed(0)}`}
            subtitle={`${insights.profitMargin.toFixed(1)}% margin`}
            icon={TrendingUp}
            color="bg-blue-600"
          />
          <MetricCard
            title="Total Sales"
            value={insights.totalSales}
            subtitle={`₹${insights.avgSale.toFixed(0)} avg`}
            icon={ShoppingCart}
            color="bg-purple-600"
          />
          <MetricCard
            title="Stock Value"
            value={`₹${insights.stockValue.toFixed(0)}`}
            icon={Package}
            color="bg-orange-600"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Best Sellers</h2>
          {insights.topSelling.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales data available</p>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Generic Name</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Units Sold</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {insights.topSelling.map((item, index) => {
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center justify-center w-7 h-7 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                              {startIndex + index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{item.medicine?.name || 'Unknown'}</td>
                          <td className="px-4 py-3 text-gray-600">{item.medicine?.generic_name || '-'}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-700">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-bold text-purple-600">₹{item.revenue.toFixed(0)}</td>
                        </tr>
                      );
                    })}
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
                    Page {currentPage} of {Math.ceil(insights.allTopSelling.length / itemsPerPage) || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(insights.allTopSelling.length / itemsPerPage), prev + 1))}
                    disabled={currentPage >= Math.ceil(insights.allTopSelling.length / itemsPerPage)}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Profitability</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700">Revenue</span>
                <span className="font-bold text-green-600">₹{insights.totalRevenue.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Profit</span>
                <span className="font-bold text-blue-600">₹{insights.totalProfit.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Profit Margin</span>
                <span className="font-bold text-purple-600">{insights.profitMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📦 Inventory Health</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Total Stock Value</span>
                <span className="font-bold text-blue-600">₹{insights.stockValue.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <span className="text-gray-700">Dead Stock Items</span>
                <span className="font-bold text-orange-600">{insights.deadStockCount}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <span className="text-gray-700">Dead Stock Value</span>
                <span className="font-bold text-red-600">₹{insights.deadStockValue.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`${color} p-2 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}