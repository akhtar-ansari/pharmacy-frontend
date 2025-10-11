import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Target, Package, Download, Calendar, Filter, Award, AlertCircle, DollarSign, Activity } from 'lucide-react';

// ==================== MOCK SALES DATA ====================

const SAMPLE_SALES = [
  // October data
  { id: 1, date: '2024-10-01', medicineId: 1, medicineName: 'Paracetamol', category: 'Analgesic', quantity: 25, revenue: 312.50, cost: 200.00, profit: 112.50 },
  { id: 2, date: '2024-10-01', medicineId: 2, medicineName: 'Crocin', category: 'Antipyretic', quantity: 15, revenue: 225.00, cost: 157.50, profit: 67.50 },
  { id: 3, date: '2024-10-01', medicineId: 3, medicineName: 'Amoxicillin', category: 'Antibiotic', quantity: 8, revenue: 360.00, cost: 256.00, profit: 104.00 },
  
  { id: 4, date: '2024-10-02', medicineId: 1, medicineName: 'Paracetamol', category: 'Analgesic', quantity: 30, revenue: 375.00, cost: 240.00, profit: 135.00 },
  { id: 5, date: '2024-10-02', medicineId: 4, medicineName: 'Cetirizine', category: 'Antihistamine', quantity: 20, revenue: 360.00, cost: 240.00, profit: 120.00 },
  { id: 6, date: '2024-10-02', medicineId: 5, medicineName: 'Omeprazole', category: 'Antacid', quantity: 12, revenue: 660.00, cost: 456.00, profit: 204.00 },
  
  { id: 7, date: '2024-10-03', medicineId: 1, medicineName: 'Paracetamol', category: 'Analgesic', quantity: 35, revenue: 437.50, cost: 280.00, profit: 157.50 },
  { id: 8, date: '2024-10-03', medicineId: 2, medicineName: 'Crocin', category: 'Antipyretic', quantity: 18, revenue: 270.00, cost: 189.00, profit: 81.00 },
  { id: 9, date: '2024-10-03', medicineId: 6, medicineName: 'Azithromycin', category: 'Antibiotic', quantity: 5, revenue: 425.00, cost: 300.00, profit: 125.00 },
  
  { id: 10, date: '2024-10-04', medicineId: 1, medicineName: 'Paracetamol', category: 'Analgesic', quantity: 40, revenue: 500.00, cost: 320.00, profit: 180.00 },
  { id: 11, date: '2024-10-04', medicineId: 4, medicineName: 'Cetirizine', category: 'Antihistamine', quantity: 22, revenue: 396.00, cost: 264.00, profit: 132.00 },
  { id: 12, date: '2024-10-04', medicineId: 7, medicineName: 'Metformin', category: 'Antidiabetic', quantity: 30, revenue: 255.00, cost: 165.00, profit: 90.00 },
  
  // September data for comparison
  { id: 13, date: '2024-09-25', medicineId: 1, medicineName: 'Paracetamol', category: 'Analgesic', quantity: 20, revenue: 250.00, cost: 160.00, profit: 90.00 },
  { id: 14, date: '2024-09-26', medicineId: 1, medicineName: 'Paracetamol', category: 'Analgesic', quantity: 18, revenue: 225.00, cost: 144.00, profit: 81.00 },
  { id: 15, date: '2024-09-27', medicineId: 2, medicineName: 'Crocin', category: 'Antipyretic', quantity: 12, revenue: 180.00, cost: 126.00, profit: 54.00 },
  { id: 16, date: '2024-09-28', medicineId: 3, medicineName: 'Amoxicillin', category: 'Antibiotic', quantity: 6, revenue: 270.00, cost: 192.00, profit: 78.00 },
  { id: 17, date: '2024-09-29', medicineId: 4, medicineName: 'Cetirizine', category: 'Antihistamine', quantity: 15, revenue: 270.00, cost: 180.00, profit: 90.00 },
  { id: 18, date: '2024-09-30', medicineId: 5, medicineName: 'Omeprazole', category: 'Antacid', quantity: 10, revenue: 550.00, cost: 380.00, profit: 170.00 },
];

// ==================== MAIN APP COMPONENT ====================

export default function BusinessInsightsApp({ appData, setAppData }) {
  const [sales, setSales] = useState(SAMPLE_SALES);
  const [timeRange, setTimeRange] = useState('thisMonth');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [analysisType, setAnalysisType] = useState('bestsellers');

  const categories = ['All', ...new Set(sales.map(s => s.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="bg-white shadow-md border-b-2 border-purple-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Business Insights & Analytics
                </h1>
                <p className="text-sm text-gray-500">BUILD 7 - Make Data-Driven Decisions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <InsightsDashboard
          sales={sales}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          analysisType={analysisType}
          setAnalysisType={setAnalysisType}
        />
      </div>
    </div>
  );
}

// ==================== INSIGHTS DASHBOARD ====================

function InsightsDashboard({
  sales,
  timeRange,
  setTimeRange,
  selectedCategory,
  setSelectedCategory,
  categories,
  analysisType,
  setAnalysisType
}) {
  const getDateRange = () => {
    const today = new Date('2024-10-04');
    let startDate, endDate = new Date(today);

    switch (timeRange) {
      case 'thisWeek':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'thisMonth':
        startDate = new Date(today);
        startDate.setDate(1);
        break;
      case 'lastMonth':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'last3Months':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(1);
    }

    return { startDate, endDate };
  };

  const filteredSales = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const dateMatch = saleDate >= startDate && saleDate <= endDate;
      const categoryMatch = selectedCategory === 'All' || sale.category === selectedCategory;
      
      return dateMatch && categoryMatch;
    });
  }, [sales, timeRange, selectedCategory]);

  // Aggregate sales by medicine
  const medicineAnalysis = useMemo(() => {
    const analysis = {};
    
    filteredSales.forEach(sale => {
      if (!analysis[sale.medicineName]) {
        analysis[sale.medicineName] = {
          medicineName: sale.medicineName,
          category: sale.category,
          totalQuantity: 0,
          totalRevenue: 0,
          totalProfit: 0,
          transactions: 0
        };
      }

      analysis[sale.medicineName].totalQuantity += sale.quantity;
      analysis[sale.medicineName].totalRevenue += sale.revenue;
      analysis[sale.medicineName].totalProfit += sale.profit;
      analysis[sale.medicineName].transactions += 1;
    });

    return Object.values(analysis);
  }, [filteredSales]);

  // Best sellers
  const bestSellers = useMemo(() => {
    return [...medicineAnalysis]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }, [medicineAnalysis]);

  // Slow movers
  const slowMovers = useMemo(() => {
    return [...medicineAnalysis]
      .sort((a, b) => a.totalQuantity - b.totalQuantity)
      .slice(0, 10);
  }, [medicineAnalysis]);

  // ABC Analysis
  const abcAnalysis = useMemo(() => {
    const sorted = [...medicineAnalysis].sort((a, b) => b.totalRevenue - a.totalRevenue);
    const totalRevenue = sorted.reduce((sum, item) => sum + item.totalRevenue, 0);
    
    let cumulative = 0;
    return sorted.map(item => {
      cumulative += item.totalRevenue;
      const percentage = (cumulative / totalRevenue) * 100;
      
      let classification = 'C';
      if (percentage <= 80) classification = 'A';
      else if (percentage <= 95) classification = 'B';
      
      return {
        ...item,
        classification,
        revenuePercentage: (item.totalRevenue / totalRevenue) * 100
      };
    });
  }, [medicineAnalysis]);

  // Trending analysis - compare with previous period
  const trendingAnalysis = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    const periodDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);
    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);

    const currentPeriod = {};
    const previousPeriod = {};

    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      
      if (saleDate >= startDate && saleDate <= endDate) {
        if (!currentPeriod[sale.medicineName]) {
          currentPeriod[sale.medicineName] = { quantity: 0, revenue: 0 };
        }
        currentPeriod[sale.medicineName].quantity += sale.quantity;
        currentPeriod[sale.medicineName].revenue += sale.revenue;
      }
      
      if (saleDate >= previousStartDate && saleDate <= previousEndDate) {
        if (!previousPeriod[sale.medicineName]) {
          previousPeriod[sale.medicineName] = { quantity: 0, revenue: 0 };
        }
        previousPeriod[sale.medicineName].quantity += sale.quantity;
        previousPeriod[sale.medicineName].revenue += sale.revenue;
      }
    });

    const trends = [];
    Object.keys(currentPeriod).forEach(medicineName => {
      const current = currentPeriod[medicineName];
      const previous = previousPeriod[medicineName] || { quantity: 0, revenue: 0 };
      
      const quantityChange = previous.quantity > 0 
        ? ((current.quantity - previous.quantity) / previous.quantity) * 100 
        : 100;
      
      trends.push({
        medicineName,
        currentQuantity: current.quantity,
        previousQuantity: previous.quantity,
        change: quantityChange,
        currentRevenue: current.revenue,
        trend: quantityChange > 10 ? 'up' : quantityChange < -10 ? 'down' : 'stable'
      });
    });

    return trends.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [sales, timeRange]);

  const stats = {
    totalRevenue: filteredSales.reduce((sum, s) => sum + s.revenue, 0),
    totalProfit: filteredSales.reduce((sum, s) => sum + s.profit, 0),
    totalTransactions: filteredSales.length,
    avgTransactionValue: filteredSales.length > 0 
      ? filteredSales.reduce((sum, s) => sum + s.revenue, 0) / filteredSales.length 
      : 0,
    profitMargin: filteredSales.reduce((sum, s) => sum + s.revenue, 0) > 0
      ? (filteredSales.reduce((sum, s) => sum + s.profit, 0) / filteredSales.reduce((sum, s) => sum + s.revenue, 0)) * 100
      : 0
  };

  const exportToCSV = () => {
    let data = [];
    let filename = '';

    switch (analysisType) {
      case 'bestsellers':
        data = bestSellers;
        filename = 'bestsellers';
        break;
      case 'slowmovers':
        data = slowMovers;
        filename = 'slowmovers';
        break;
      case 'abc':
        data = abcAnalysis;
        filename = 'abc_analysis';
        break;
      case 'trending':
        data = trendingAnalysis;
        filename = 'trending';
        break;
    }

    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(item => Object.values(item).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="from-green-500 to-emerald-600"
          subtitle={`${stats.totalTransactions} transactions`}
        />
        <MetricCard
          title="Total Profit"
          value={`₹${stats.totalProfit.toFixed(2)}`}
          icon={TrendingUp}
          color="from-blue-500 to-indigo-600"
          subtitle={`${stats.profitMargin.toFixed(1)}% margin`}
        />
        <MetricCard
          title="Avg Transaction"
          value={`₹${stats.avgTransactionValue.toFixed(2)}`}
          icon={Activity}
          color="from-purple-500 to-pink-600"
          subtitle="per sale"
        />
        <MetricCard
          title="Products Analyzed"
          value={medicineAnalysis.length}
          icon={Package}
          color="from-orange-500 to-red-600"
          subtitle={`${categories.length - 1} categories`}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            {['thisWeek', 'thisMonth', 'lastMonth', 'last3Months'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'thisWeek' ? 'This Week' :
                 range === 'thisMonth' ? 'This Month' :
                 range === 'lastMonth' ? 'Last Month' :
                 'Last 3 Months'}
              </button>
            ))}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-auto"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t">
          {[
            { id: 'bestsellers', label: 'Best Sellers', icon: Award },
            { id: 'slowmovers', label: 'Slow Movers', icon: AlertCircle },
            { id: 'abc', label: 'ABC Analysis', icon: Target },
            { id: 'trending', label: 'Trending', icon: Activity }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setAnalysisType(type.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                analysisType === type.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Content */}
      {analysisType === 'bestsellers' && (
        <BestSellersView data={bestSellers} />
      )}

      {analysisType === 'slowmovers' && (
        <SlowMoversView data={slowMovers} />
      )}

      {analysisType === 'abc' && (
        <ABCAnalysisView data={abcAnalysis} />
      )}

      {analysisType === 'trending' && (
        <TrendingView data={trendingAnalysis} />
      )}
    </div>
  );
}

// ==================== BEST SELLERS VIEW ====================

function BestSellersView({ data }) {
  const maxRevenue = Math.max(...data.map(d => d.totalRevenue));

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Top 10 Best Sellers</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">Medicines generating the highest revenue</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item.medicineName} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  #{index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.medicineName}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">₹{item.totalRevenue.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{item.totalQuantity} units sold</div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(item.totalRevenue / maxRevenue) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-gray-600">{item.transactions} transactions</span>
                    <span className="font-semibold text-blue-600">
                      Profit: ₹{item.totalProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== SLOW MOVERS VIEW ====================

function SlowMoversView({ data }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">Slow Moving Stock</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">Medicines with lowest sales - consider promotions or discounts</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Sold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((item, index) => (
              <tr key={item.medicineName} className="hover:bg-orange-50">
                <td className="px-6 py-4">
                  <span className="font-bold text-orange-600">#{index + 1}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{item.medicineName}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-orange-600">{item.totalQuantity}</span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  ₹{item.totalRevenue.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.transactions}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                    {item.totalQuantity < 10 ? 'Promote/Discount' : 'Monitor'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== ABC ANALYSIS VIEW ====================

function ABCAnalysisView({ data }) {
  const aItems = data.filter(d => d.classification === 'A');
  const bItems = data.filter(d => d.classification === 'B');
  const cItems = data.filter(d => d.classification === 'C');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">ABC Analysis</h2>
            <p className="text-sm text-gray-600">Pareto principle: Focus on high-value items</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ABCCard
            classification="A"
            title="Class A - High Value"
            count={aItems.length}
            description="Top 80% of revenue"
            color="from-green-500 to-emerald-600"
            textColor="text-green-700"
            bgColor="bg-green-50"
          />
          <ABCCard
            classification="B"
            title="Class B - Medium Value"
            count={bItems.length}
            description="Next 15% of revenue"
            color="from-blue-500 to-indigo-600"
            textColor="text-blue-700"
            bgColor="bg-blue-50"
          />
          <ABCCard
            classification="C"
            title="Class C - Low Value"
            count={cItems.length}
            description="Last 5% of revenue"
            color="from-orange-500 to-red-600"
            textColor="text-orange-700"
            bgColor="bg-orange-50"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% of Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((item, index) => (
                <tr key={item.medicineName} className={`hover:bg-gray-50 ${
                  item.classification === 'A' ? 'bg-green-50' :
                  item.classification === 'B' ? 'bg-blue-50' :
                  'bg-orange-50'
                }`}>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                      item.classification === 'A' ? 'bg-green-200 text-green-800' :
                      item.classification === 'B' ? 'bg-blue-200 text-blue-800' :
                      'bg-orange-200 text-orange-800'
                    }`}>
                      {item.classification}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{item.medicineName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ₹{item.totalRevenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.classification === 'A' ? 'bg-green-600' :
                            item.classification === 'B' ? 'bg-blue-600' :
                            'bg-orange-600'
                          }`}
                          style={{ width: `${Math.min(item.revenuePercentage * 2, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {item.revenuePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.totalQuantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.classification === 'A' ? 'Always stock' :
                     item.classification === 'B' ? 'Moderate stock' :
                     'Minimize stock'}
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

// ==================== TRENDING VIEW ====================

function TrendingView({ data }) {
  const trending = data.filter(d => d.trend === 'up').slice(0, 5);
  const declining = data.filter(d => d.trend === 'down').slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Trending Up 📈</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Growing in popularity</p>
        </div>

        <div className="p-6 space-y-4">
          {trending.map((item, index) => (
            <div key={item.medicineName} className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">{item.medicineName}</h3>
                <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full font-bold">
                  +{item.change.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Previous: {item.previousQuantity} → Current: {item.currentQuantity}
                </span>
                <span className="font-semibold text-green-600">
                  ₹{item.currentRevenue.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Declining 📉</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Needs attention</p>
        </div>

        <div className="p-6 space-y-4">
          {declining.map((item, index) => (
            <div key={item.medicineName} className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">{item.medicineName}</h3>
                <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full font-bold">
                  {item.change.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Previous: {item.previousQuantity} → Current: {item.currentQuantity}
                </span>
                <span className="font-semibold text-red-600">
                  ₹{item.currentRevenue.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== METRIC CARD ====================

function MetricCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

// ==================== ABC CARD ====================

function ABCCard({ classification, title, count, description, color, textColor, bgColor }) {
  return (
    <div className={`${bgColor} rounded-xl p-6 border-2 border-opacity-20`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${color} flex items-center justify-center`}>
          <span className="text-2xl font-bold text-white">{classification}</span>
        </div>
        <span className={`text-3xl font-bold ${textColor}`}>{count}</span>
      </div>
      <h3 className={`font-bold ${textColor} mb-1`}>{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}