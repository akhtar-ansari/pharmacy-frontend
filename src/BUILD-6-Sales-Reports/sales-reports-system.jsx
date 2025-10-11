import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, TrendingUp, DollarSign, Package, Calendar, Search, Download, RefreshCw, CheckCircle, AlertCircle, X, FileText } from 'lucide-react';
import { salesAPI, medicinesAPI, stockAPI } from '../services/api';

export default function SalesReportsApp({ appData, setAppData }) {
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [stock, setStock] = useState([]);
  const [reportType, setReportType] = useState('summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
      const [salesRes, medicinesRes, stockRes] = await Promise.all([
        salesAPI.getAll(),
        medicinesAPI.getAll(),
        stockAPI.getAll()
      ]);

      if (salesRes.success) setSales(salesRes.data);
      if (medicinesRes.success) setMedicines(medicinesRes.data);
      if (stockRes.success) setStock(stockRes.data);

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

  const filteredSales = useMemo(() => {
    let filtered = [...sales];

    if (dateFrom) {
      filtered = filtered.filter(s => new Date(s.sale_date) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(s => new Date(s.sale_date) <= new Date(dateTo));
    }

    return filtered;
  }, [sales, dateFrom, dateTo]);

  const summaryStats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + parseFloat(s.final_amount || 0), 0);
    const totalSales = filteredSales.length;
    const totalDiscount = filteredSales.reduce((sum, s) => sum + parseFloat(s.discount_amount || 0), 0);
    const totalGST = filteredSales.reduce((sum, s) => sum + parseFloat(s.gst_amount || 0), 0);

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

    return {
      totalRevenue,
      totalSales,
      totalDiscount,
      totalGST,
      totalProfit,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      avgSale: totalSales > 0 ? totalRevenue / totalSales : 0
    };
  }, [filteredSales, stock]);

  const medicineWiseSales = useMemo(() => {
    const medicineSales = {};
    
    filteredSales.forEach(sale => {
      if (sale.sale_items) {
        sale.sale_items.forEach(item => {
          if (!medicineSales[item.medicine_id]) {
            medicineSales[item.medicine_id] = {
              medicine_id: item.medicine_id,
              quantity: 0,
              revenue: 0,
              profit: 0
            };
          }
          medicineSales[item.medicine_id].quantity += item.quantity;
          medicineSales[item.medicine_id].revenue += parseFloat(item.total || 0);

          const stockItem = stock.find(s => s.medicine_id === item.medicine_id);
          if (stockItem) {
            const profit = (parseFloat(item.mrp || 0) - parseFloat(stockItem.purchase_price || 0)) * item.quantity;
            medicineSales[item.medicine_id].profit += profit;
          }
        });
      }
    });

    return Object.values(medicineSales)
      .map(ms => ({
        ...ms,
        medicine: medicines.find(m => m.id === ms.medicine_id)
      }))
      .filter(ms => ms.medicine)
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales, medicines, stock]);

  const stockOnHand = useMemo(() => {
    const stockByMedicine = {};
    
    stock.forEach(item => {
      if (!stockByMedicine[item.medicine_id]) {
        stockByMedicine[item.medicine_id] = {
          medicine_id: item.medicine_id,
          totalQuantity: 0,
          totalValue: 0,
          batches: 0
        };
      }
      stockByMedicine[item.medicine_id].totalQuantity += item.quantity;
      stockByMedicine[item.medicine_id].totalValue += item.quantity * parseFloat(item.purchase_price || 0);
      stockByMedicine[item.medicine_id].batches += 1;
    });

    return Object.values(stockByMedicine)
      .map(item => ({
        ...item,
        medicine: medicines.find(m => m.id === item.medicine_id)
      }))
      .filter(item => item.medicine && item.totalQuantity > 0)
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [stock, medicines]);

  const filteredReportData = useMemo(() => {
    let data = reportType === 'medicine-wise' ? medicineWiseSales : stockOnHand;

    if (searchTerm) {
      data = data.filter(item =>
        item.medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.medicine?.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  }, [reportType, medicineWiseSales, stockOnHand, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReportData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReportData, currentPage, itemsPerPage]);

  const exportToExcel = () => {
    let headers, rows;

    if (reportType === 'summary') {
      headers = ['Metric', 'Value'];
      rows = [
        ['Total Revenue', `₹${summaryStats.totalRevenue.toFixed(2)}`],
        ['Total Sales', summaryStats.totalSales],
        ['Total Profit', `₹${summaryStats.totalProfit.toFixed(2)}`],
        ['Profit Margin', `${summaryStats.profitMargin.toFixed(2)}%`],
        ['Average Sale', `₹${summaryStats.avgSale.toFixed(2)}`],
        ['Total Discount', `₹${summaryStats.totalDiscount.toFixed(2)}`],
        ['Total GST', `₹${summaryStats.totalGST.toFixed(2)}`]
      ];
    } else if (reportType === 'medicine-wise') {
      headers = ['Medicine Name', 'Generic Name', 'Quantity Sold', 'Revenue', 'Profit'];
      rows = filteredReportData.map(item => [
        item.medicine?.name || '',
        item.medicine?.generic_name || '',
        item.quantity,
        item.revenue.toFixed(2),
        item.profit.toFixed(2)
      ]);
    } else {
      headers = ['Medicine Name', 'Generic Name', 'Stock Quantity', 'Batches', 'Stock Value'];
      rows = filteredReportData.map(item => [
        item.medicine?.name || '',
        item.medicine?.generic_name || '',
        item.totalQuantity,
        item.batches,
        item.totalValue.toFixed(2)
      ]);
    }

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${dateFrom || 'all'}-to-${dateTo || 'all'}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <BarChart className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sales Reports & Analytics</h1>
                <p className="text-sm text-purple-100">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
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
        <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="summary">Summary Report</option>
              <option value="medicine-wise">Medicine-Wise Sales</option>
              <option value="stock-on-hand">Stock On Hand</option>
            </select>
          </div>

          {reportType !== 'stock-on-hand' && (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
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
                  Clear
                </button>
              )}
            </>
          )}

          {reportType !== 'summary' && (
            <div className="flex-1 relative ml-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}
        </div>

        {reportType === 'summary' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600">₹{summaryStats.totalRevenue.toFixed(0)}</p>
                <p className="text-sm text-gray-500 mt-1">{summaryStats.totalSales} transactions</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Profit</h3>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-600">₹{summaryStats.totalProfit.toFixed(0)}</p>
                <p className="text-sm text-gray-500 mt-1">{summaryStats.profitMargin.toFixed(1)}% margin</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Avg Sale Value</h3>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <BarChart className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-600">₹{summaryStats.avgSale.toFixed(0)}</p>
                <p className="text-sm text-gray-500 mt-1">Per transaction</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total GST</h3>
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-orange-600">₹{summaryStats.totalGST.toFixed(0)}</p>
                <p className="text-sm text-gray-500 mt-1">Tax collected</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total Discount Given</span>
                  <span className="font-bold text-gray-900">₹{summaryStats.totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Gross Revenue</span>
                  <span className="font-bold text-gray-900">₹{(summaryStats.totalRevenue + summaryStats.totalDiscount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Net Revenue</span>
                  <span className="font-bold text-gray-900">₹{summaryStats.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Cost of Goods Sold</span>
                  <span className="font-bold text-gray-900">₹{(summaryStats.totalRevenue - summaryStats.totalProfit).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'medicine-wise' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Medicine-Wise Sales Report</h3>
            
            {paginatedData.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No sales data found</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Generic Name</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Qty Sold</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Profit</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedData.map((item, index) => {
                        const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        return (
                          <tr key={item.medicine_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-600">{startIndex + index + 1}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">{item.medicine?.name}</td>
                            <td className="px-4 py-3 text-gray-600">{item.medicine?.generic_name}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-bold text-green-600">₹{item.revenue.toFixed(0)}</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-600">₹{item.profit.toFixed(0)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-purple-600">{margin.toFixed(1)}%</td>
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
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredReportData.length)} to {Math.min(currentPage * itemsPerPage, filteredReportData.length)} of {filteredReportData.length}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">
                      {currentPage} / {Math.ceil(filteredReportData.length / itemsPerPage) || 1}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredReportData.length / itemsPerPage), prev + 1))}
                      disabled={currentPage >= Math.ceil(filteredReportData.length / itemsPerPage)}
                      className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {reportType === 'stock-on-hand' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Stock On Hand Report</h3>
            
            {paginatedData.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No stock data found</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Generic Name</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Stock Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Batches</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Stock Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedData.map((item, index) => {
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        return (
                          <tr key={item.medicine_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-600">{startIndex + index + 1}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">{item.medicine?.name}</td>
                            <td className="px-4 py-3 text-gray-600">{item.medicine?.generic_name}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">{item.totalQuantity}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{item.batches}</td>
                            <td className="px-4 py-3 text-right font-bold text-green-600">₹{item.totalValue.toFixed(0)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 font-bold text-gray-900">Total</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {filteredReportData.reduce((sum, item) => sum + item.totalQuantity, 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {filteredReportData.reduce((sum, item) => sum + item.batches, 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">
                          ₹{filteredReportData.reduce((sum, item) => sum + item.totalValue, 0).toFixed(0)}
                        </td>
                      </tr>
                    </tfoot>
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
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredReportData.length)} to {Math.min(currentPage * itemsPerPage, filteredReportData.length)} of {filteredReportData.length}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">
                      {currentPage} / {Math.ceil(filteredReportData.length / itemsPerPage) || 1}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredReportData.length / itemsPerPage), prev + 1))}
                      disabled={currentPage >= Math.ceil(filteredReportData.length / itemsPerPage)}
                      className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}