import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Package, Calendar, Download, Printer, BarChart3, PieChart, Filter, Search, ChevronDown, ChevronUp, X } from 'lucide-react';

// ==================== MOCK DATA ====================

const SAMPLE_SALES = [
  {
    id: 1,
    date: '2024-10-01',
    items: [
      { medicineId: 1, medicineName: 'Paracetamol', category: 'Analgesic', quantity: 5, mrp: 12.50, purchasePrice: 8.00, total: 62.50 },
      { medicineId: 2, medicineName: 'Crocin', category: 'Antipyretic', quantity: 3, mrp: 15.00, purchasePrice: 10.50, total: 45.00 }
    ],
    totalAmount: 107.50,
    paymentMethod: 'cash'
  },
  {
    id: 2,
    date: '2024-10-01',
    items: [
      { medicineId: 3, medicineName: 'Amoxicillin', category: 'Antibiotic', quantity: 2, mrp: 45.00, purchasePrice: 32.00, total: 90.00 }
    ],
    totalAmount: 90.00,
    paymentMethod: 'gpay'
  },
  {
    id: 3,
    date: '2024-10-02',
    items: [
      { medicineId: 1, medicineName: 'Paracetamol', category: 'Analgesic', quantity: 8, mrp: 12.50, purchasePrice: 8.00, total: 100.00 },
      { medicineId: 4, medicineName: 'Cetirizine', category: 'Antihistamine', quantity: 4, mrp: 18.00, purchasePrice: 12.00, total: 72.00 }
    ],
    totalAmount: 172.00,
    paymentMethod: 'cash'
  },
  {
    id: 4,
    date: '2024-10-02',
    items: [
      { medicineId: 5, medicineName: 'Omeprazole', category: 'Antacid', quantity: 2, mrp: 55.00, purchasePrice: 38.00, total: 110.00 }
    ],
    totalAmount: 110.00,
    paymentMethod: 'gpay'
  },
  {
    id: 5,
    date: '2024-10-03',
    items: [
      { medicineId: 1, medicineName: 'Paracetamol', category: 'Analgesic', quantity: 10, mrp: 12.50, purchasePrice: 8.00, total: 125.00 },
      { medicineId: 2, medicineName: 'Crocin', category: 'Antipyretic', quantity: 6, mrp: 15.00, purchasePrice: 10.50, total: 90.00 },
      { medicineId: 6, medicineName: 'Azithromycin', category: 'Antibiotic', quantity: 1, mrp: 85.00, purchasePrice: 60.00, total: 85.00 }
    ],
    totalAmount: 300.00,
    paymentMethod: 'cash'
  },
  {
    id: 6,
    date: '2024-10-03',
    items: [
      { medicineId: 3, medicineName: 'Amoxicillin', category: 'Antibiotic', quantity: 3, mrp: 45.00, purchasePrice: 32.00, total: 135.00 }
    ],
    totalAmount: 135.00,
    paymentMethod: 'cash'
  },
  {
    id: 7,
    date: '2024-10-04',
    items: [
      { medicineId: 1, medicineName: 'Paracetamol', category: 'Analgesic', quantity: 12, mrp: 12.50, purchasePrice: 8.00, total: 150.00 },
      { medicineId: 4, medicineName: 'Cetirizine', category: 'Antihistamine', quantity: 5, mrp: 18.00, purchasePrice: 12.00, total: 90.00 }
    ],
    totalAmount: 240.00,
    paymentMethod: 'gpay'
  }
];

// ==================== MAIN APP COMPONENT ====================

export default function SalesReportsApp({ appData, setAppData }) {
  const [sales, setSales] = useState(SAMPLE_SALES);
  const [dateRange, setDateRange] = useState('today');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const categories = ['All', ...new Set(sales.flatMap(sale => sale.items.map(item => item.category)))];

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
                <h1 className="text-2xl font-bold text-white">Al Naeima Pharmacy</h1>
                <p className="text-sm text-red-100">BUILD 6 - Sales Reports & Profitability</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {notification && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className={`p-4 rounded-lg flex items-center justify-between ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {notification.message}
            </span>
            <button onClick={() => setNotification(null)} className="text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <SalesDashboard
          sales={sales}
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categories={categories}
          showNotification={showNotification}
        />
      </div>
    </div>
  );
}

// ==================== SALES DASHBOARD ====================

function SalesDashboard({
  sales,
  dateRange,
  setDateRange,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  categories,
  showNotification
}) {
  const getDateRange = () => {
    const today = new Date('2024-10-04');
    let startDate, endDate;

    switch (dateRange) {
      case 'today':
        startDate = endDate = new Date(today);
        break;
      case 'yesterday':
        startDate = endDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date(today);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        endDate = new Date(today);
        break;
      default:
        startDate = endDate = new Date(today);
    }

    return { startDate, endDate };
  };

  const filteredSales = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const dateMatch = saleDate >= startDate && saleDate <= endDate;
      
      return dateMatch;
    });
  }, [sales, dateRange]);

  const medicineAnalysis = useMemo(() => {
    const analysis = {};
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (selectedCategory !== 'All' && item.category !== selectedCategory) return;
        if (searchTerm && !item.medicineName.toLowerCase().includes(searchTerm.toLowerCase())) return;

        if (!analysis[item.medicineName]) {
          analysis[item.medicineName] = {
            medicineName: item.medicineName,
            category: item.category,
            totalQuantity: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            transactions: 0
          };
        }

        const cost = item.quantity * item.purchasePrice;
        const revenue = item.total;
        const profit = revenue - cost;

        analysis[item.medicineName].totalQuantity += item.quantity;
        analysis[item.medicineName].totalRevenue += revenue;
        analysis[item.medicineName].totalCost += cost;
        analysis[item.medicineName].totalProfit += profit;
        analysis[item.medicineName].transactions += 1;
      });
    });

    return Object.values(analysis).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredSales, selectedCategory, searchTerm]);

  const categoryAnalysis = useMemo(() => {
    const analysis = {};
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!analysis[item.category]) {
          analysis[item.category] = {
            category: item.category,
            totalRevenue: 0,
            totalProfit: 0,
            itemCount: 0
          };
        }

        const cost = item.quantity * item.purchasePrice;
        const revenue = item.total;
        const profit = revenue - cost;

        analysis[item.category].totalRevenue += revenue;
        analysis[item.category].totalProfit += profit;
        analysis[item.category].itemCount += item.quantity;
      });
    });

    return Object.values(analysis).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredSales]);

  const stats = {
    totalSales: filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    totalTransactions: filteredSales.length,
    totalProfit: filteredSales.reduce((sum, sale) => {
      const saleProfit = sale.items.reduce((itemSum, item) => {
        const cost = item.quantity * item.purchasePrice;
        return itemSum + (item.total - cost);
      }, 0);
      return sum + saleProfit;
    }, 0),
    totalItems: filteredSales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    ),
    cashSales: filteredSales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.totalAmount, 0),
    gpayS: filteredSales.filter(s => s.paymentMethod === 'gpay').reduce((sum, s) => sum + s.totalAmount, 0)
  };

  const handleExport = () => {
    const csvContent = [
      ['Medicine', 'Category', 'Quantity Sold', 'Revenue', 'Cost', 'Profit', 'Profit %'].join(','),
      ...medicineAnalysis.map(item => [
        item.medicineName,
        item.category,
        item.totalQuantity,
        item.totalRevenue.toFixed(2),
        item.totalCost.toFixed(2),
        item.totalProfit.toFixed(2),
        ((item.totalProfit / item.totalCost) * 100).toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `al_naeima_sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showNotification('Sales report exported successfully!', 'success');
  };

  const handlePrint = () => {
    window.print();
    showNotification('Report ready to print!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Sales"
          value={`₹${stats.totalSales.toFixed(2)}`}
          icon={DollarSign}
          color="green"
          subtitle={`${stats.totalTransactions} transactions`}
        />
        <SummaryCard
          title="Total Profit"
          value={`₹${stats.totalProfit.toFixed(2)}`}
          icon={TrendingUp}
          color="blue"
          subtitle={`${((stats.totalProfit / stats.totalSales) * 100).toFixed(1)}% margin`}
        />
        <SummaryCard
          title="Items Sold"
          value={stats.totalItems}
          icon={Package}
          color="purple"
          subtitle={`Avg ${(stats.totalItems / stats.totalTransactions).toFixed(1)} per sale`}
        />
        <SummaryCard
          title="Payment Split"
          value={`Cash: ₹${stats.cashSales.toFixed(0)}`}
          icon={DollarSign}
          color="orange"
          subtitle={`GPay: ₹${stats.gpayS.toFixed(0)}`}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex gap-2">
            {['today', 'yesterday', 'week', 'month'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  dateRange === range
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicine..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Medicine-wise Analysis Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-red-50">
          <h2 className="text-lg font-bold text-gray-900">Medicine-wise Profitability</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Sold</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit %</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {medicineAnalysis.map((item, index) => (
                <tr key={item.medicineName} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`font-bold ${
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-gray-500' :
                      index === 2 ? 'text-orange-600' :
                      'text-gray-600'
                    }`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.totalQuantity}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">
                    ₹{item.totalRevenue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">₹{item.totalCost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-600">
                    ₹{item.totalProfit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${
                      ((item.totalProfit / item.totalCost) * 100) >= 50 ? 'text-green-600' :
                      ((item.totalProfit / item.totalCost) * 100) >= 30 ? 'text-blue-600' :
                      'text-orange-600'
                    }`}>
                      {((item.totalProfit / item.totalCost) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.transactions}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-red-50 font-bold border-t-2">
              <tr>
                <td colSpan="3" className="px-4 py-3 text-right">TOTAL:</td>
                <td className="px-4 py-3">
                  {medicineAnalysis.reduce((sum, item) => sum + item.totalQuantity, 0)}
                </td>
                <td className="px-4 py-3 text-green-600">
                  ₹{medicineAnalysis.reduce((sum, item) => sum + item.totalRevenue, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  ₹{medicineAnalysis.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-blue-600">
                  ₹{medicineAnalysis.reduce((sum, item) => sum + item.totalProfit, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3" colSpan="2"></td>
              </tr>
            </tfoot>
          </table>

          {medicineAnalysis.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>No sales data for selected period</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Analysis */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-red-50">
          <h2 className="text-lg font-bold text-gray-900">Category-wise Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items Sold</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">% of Total Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categoryAnalysis.map(cat => (
                <tr key={cat.category} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{cat.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{cat.itemCount}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">
                    ₹{cat.totalRevenue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-600">
                    ₹{cat.totalProfit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${(cat.totalRevenue / stats.totalSales) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {((cat.totalRevenue / stats.totalSales) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== SUMMARY CARD ====================

function SummaryCard({ title, value, icon: Icon, color, subtitle }) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600'
  };

  return (
    <div className={`${colors[color]} border-2 rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-8 h-8" />
        <span className="text-sm opacity-80">{title}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-80">{subtitle}</div>
    </div>
  );
}