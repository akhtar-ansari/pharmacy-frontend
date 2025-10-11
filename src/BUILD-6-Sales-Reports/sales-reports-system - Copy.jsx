import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, ShoppingCart, Download, Search, Filter, RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react';
import { salesAPI } from '../services/api';

export default function SalesReportsApp({ appData, setAppData }) {
  const [sales, setSales] = useState([]);
  const [dateRange, setDateRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getAll();
      if (response.success) {
        setSales(response.data);
        showNotification(`✅ Loaded ${response.data.length} sales from database`, 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to load sales: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredSales = useMemo(() => {
    let filtered = [...sales];

    // Filter by date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateRange === 'today') {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(sale => new Date(sale.sale_date) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(sale => new Date(sale.sale_date) >= monthAgo);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer_phone?.includes(searchTerm)
      );
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [sales, dateRange, searchTerm]);

  const stats = useMemo(() => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.final_amount || 0), 0);
    const totalDiscount = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.discount || 0), 0);
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalSales,
      totalRevenue,
      totalDiscount,
      avgSale
    };
  }, [filteredSales]);

  const exportToCSV = () => {
    const headers = ['Invoice', 'Date', 'Customer', 'Phone', 'Items', 'Total Amount', 'Discount', 'Final Amount', 'Payment Method'];
    const csvContent = [
      headers.join(','),
      ...filteredSales.map(sale => [
        sale.invoice_number,
        new Date(sale.sale_date).toLocaleDateString(),
        sale.customer_name || 'Walk-in',
        sale.customer_phone || 'N/A',
        sale.sale_items?.length || 0,
        sale.total_amount,
        sale.discount || 0,
        sale.final_amount,
        sale.payment_method
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showNotification('✅ Sales report exported!', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sales Reports</h1>
                <p className="text-sm text-red-100">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>

            <button
              onClick={loadSales}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Sales"
            value={stats.totalSales}
            icon={ShoppingCart}
            color="bg-blue-600"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            color="bg-green-600"
          />
          <StatCard
            title="Avg Sale Value"
            value={`₹${stats.avgSale.toFixed(2)}`}
            icon={TrendingUp}
            color="bg-purple-600"
          />
          <StatCard
            title="Total Discount"
            value={`₹${stats.totalDiscount.toFixed(2)}`}
            icon={DollarSign}
            color="bg-orange-600"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Sales List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading sales from database...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No sales found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or make your first sale!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <SaleRow key={sale.id} sale={sale} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function SaleRow({ sale }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr 
        onClick={() => setExpanded(!expanded)}
        className="hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">{sale.invoice_number}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {new Date(sale.sale_date).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(sale.created_at).toLocaleTimeString()}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{sale.customer_name || 'Walk-in'}</div>
          <div className="text-xs text-gray-500">{sale.customer_phone || 'N/A'}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {sale.sale_items?.length || 0} items
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-semibold text-gray-900">
            ₹{parseFloat(sale.final_amount).toFixed(2)}
          </div>
          {sale.discount > 0 && (
            <div className="text-xs text-gray-500">
              Discount: ₹{parseFloat(sale.discount).toFixed(2)}
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            sale.payment_method === 'Cash' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {sale.payment_method}
          </span>
        </td>
      </tr>
      {expanded && sale.sale_items && (
        <tr>
          <td colSpan="6" className="px-6 py-4 bg-gray-50">
            <div className="text-sm">
              <p className="font-semibold text-gray-900 mb-2">Sale Items:</p>
              <div className="space-y-1">
                {sale.sale_items.map((item, index) => (
                  <div key={index} className="flex justify-between text-gray-700">
                    <span>
                      {item.medicines?.name || 'Medicine'} × {item.quantity}
                    </span>
                    <span className="font-medium">₹{parseFloat(item.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}