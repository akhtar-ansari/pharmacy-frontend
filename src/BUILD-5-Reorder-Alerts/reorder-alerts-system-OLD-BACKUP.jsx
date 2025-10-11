import React, { useState, useMemo } from 'react';
import { ShoppingBag, TrendingUp, Clock, Package, Search, Filter, Calendar, CheckCircle, AlertTriangle, Download, Printer, Building2, Phone, X } from 'lucide-react';

// ==================== MOCK DATA ====================

const SAMPLE_STOCK = [
  {
    id: 1,
    medicineId: 1,
    medicineName: 'Paracetamol',
    genericName: 'Acetaminophen',
    company: 'Cipla Ltd',
    category: 'Analgesic',
    supplier: 'MediSupply Distributors',
    currentStock: 35,
    minStockLevel: 50,
    maxStockLevel: 300,
    avgDailySales: 8,
    lastOrderDate: '2024-09-15',
    lastOrderQuantity: 250,
    leadTimeDays: 5,
    unitPrice: 12.50,
    purchasePrice: 8.00
  },
  {
    id: 2,
    medicineId: 2,
    medicineName: 'Crocin',
    genericName: 'Paracetamol',
    company: 'GSK',
    category: 'Antipyretic',
    supplier: 'PharmaCare Wholesalers',
    currentStock: 18,
    minStockLevel: 40,
    maxStockLevel: 200,
    avgDailySales: 5,
    lastOrderDate: '2024-09-20',
    lastOrderQuantity: 150,
    leadTimeDays: 7,
    unitPrice: 15.00,
    purchasePrice: 10.50
  },
  {
    id: 3,
    medicineId: 3,
    medicineName: 'Amoxicillin',
    genericName: 'Amoxicillin Trihydrate',
    company: 'Sun Pharma',
    category: 'Antibiotic',
    supplier: 'MediSupply Distributors',
    currentStock: 12,
    minStockLevel: 30,
    maxStockLevel: 150,
    avgDailySales: 3,
    lastOrderDate: '2024-09-25',
    lastOrderQuantity: 100,
    leadTimeDays: 5,
    unitPrice: 45.00,
    purchasePrice: 32.00
  },
  {
    id: 4,
    medicineId: 4,
    medicineName: 'Cetirizine',
    genericName: 'Cetirizine Hydrochloride',
    company: 'Dr. Reddy\'s',
    category: 'Antihistamine',
    supplier: 'HealthPlus Suppliers',
    currentStock: 120,
    minStockLevel: 50,
    maxStockLevel: 250,
    avgDailySales: 4,
    lastOrderDate: '2024-08-10',
    lastOrderQuantity: 200,
    leadTimeDays: 10,
    unitPrice: 18.00,
    purchasePrice: 12.00
  },
  {
    id: 5,
    medicineId: 5,
    medicineName: 'Omeprazole',
    genericName: 'Omeprazole',
    company: 'Lupin',
    category: 'Antacid',
    supplier: 'PharmaCare Wholesalers',
    currentStock: 8,
    minStockLevel: 40,
    maxStockLevel: 200,
    avgDailySales: 6,
    lastOrderDate: '2024-09-28',
    lastOrderQuantity: 180,
    leadTimeDays: 7,
    unitPrice: 55.00,
    purchasePrice: 38.00
  },
  {
    id: 6,
    medicineId: 6,
    medicineName: 'Azithromycin',
    genericName: 'Azithromycin',
    company: 'Cipla Ltd',
    category: 'Antibiotic',
    supplier: 'MediSupply Distributors',
    currentStock: 5,
    minStockLevel: 25,
    maxStockLevel: 100,
    avgDailySales: 2,
    lastOrderDate: '2024-09-18',
    lastOrderQuantity: 80,
    leadTimeDays: 5,
    unitPrice: 85.00,
    purchasePrice: 60.00
  },
  {
    id: 7,
    medicineId: 7,
    medicineName: 'Metformin',
    genericName: 'Metformin HCl',
    company: 'Sun Pharma',
    category: 'Antidiabetic',
    supplier: 'HealthPlus Suppliers',
    currentStock: 22,
    minStockLevel: 60,
    maxStockLevel: 300,
    avgDailySales: 10,
    lastOrderDate: '2024-09-10',
    lastOrderQuantity: 250,
    leadTimeDays: 10,
    unitPrice: 8.50,
    purchasePrice: 5.50
  }
];

const SAMPLE_SUPPLIERS = [
  { id: 1, name: 'MediSupply Distributors', contact: '9876543210', leadTime: 5, minOrder: 5000 },
  { id: 2, name: 'PharmaCare Wholesalers', contact: '9876543211', leadTime: 7, minOrder: 3000 },
  { id: 3, name: 'HealthPlus Suppliers', contact: '9876543212', leadTime: 10, minOrder: 4000 }
];

// ==================== MAIN APP COMPONENT ====================

export default function ReorderAlertsApp({ appData, setAppData }) {
  const [stock, setStock] = useState(SAMPLE_STOCK);
  const [suppliers, setSuppliers] = useState(SAMPLE_SUPPLIERS);
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllCritical = (criticalIds) => {
    setSelectedItems(criticalIds);
  };

  const categories = ['All', ...new Set(stock.map(item => item.category))];
  const supplierNames = ['All', ...new Set(stock.map(item => item.supplier))];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reorder Alerts & Automation</h1>
                <p className="text-sm text-gray-500">BUILD 5 - Smart Inventory Replenishment</p>
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
        {!showOrderSummary ? (
          <ReorderDashboard
            stock={stock}
            suppliers={suppliers}
            selectedSupplier={selectedSupplier}
            setSelectedSupplier={setSelectedSupplier}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categories={categories}
            supplierNames={supplierNames}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems} 
            toggleItemSelection={toggleItemSelection}
            selectAllCritical={selectAllCritical}
            onGenerateOrder={() => setShowOrderSummary(true)}
            showNotification={showNotification}
          />
        ) : (
          <OrderSummary
            stock={stock}
            suppliers={suppliers}
            selectedItems={selectedItems}
            onBack={() => setShowOrderSummary(false)}
            showNotification={showNotification}
          />
        )}
      </div>
    </div>
  );
}

// ==================== REORDER DASHBOARD ====================

function ReorderDashboard({
  stock,
  suppliers,
  selectedSupplier,
  setSelectedSupplier,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  categories,
  supplierNames,
  selectedItems,
  setSelectedItems,
  toggleItemSelection,
  selectAllCritical,
  onGenerateOrder,
  showNotification
}) {
  const analyzedStock = useMemo(() => {
    return stock.map(item => {
      const daysOfStock = item.avgDailySales > 0 
        ? Math.floor(item.currentStock / item.avgDailySales) 
        : 999;
      
      const safetyStock = Math.ceil(item.avgDailySales * item.leadTimeDays * 1.5);
      const reorderPoint = safetyStock + Math.ceil(item.avgDailySales * item.leadTimeDays);
      const suggestedOrderQty = item.maxStockLevel - item.currentStock;
      
      let urgency = 'safe';
      if (item.currentStock <= 0) urgency = 'outofstock';
      else if (daysOfStock <= item.leadTimeDays) urgency = 'critical';
      else if (item.currentStock <= item.minStockLevel) urgency = 'low';
      else if (item.currentStock <= reorderPoint) urgency = 'reorder';

      const estimatedCost = suggestedOrderQty * item.purchasePrice;
      const estimatedRevenue = suggestedOrderQty * item.unitPrice;
      const estimatedProfit = estimatedRevenue - estimatedCost;

      return {
        ...item,
        daysOfStock,
        safetyStock,
        reorderPoint,
        suggestedOrderQty,
        urgency,
        estimatedCost,
        estimatedRevenue,
        estimatedProfit
      };
    });
  }, [stock]);

  const filteredStock = useMemo(() => {
    return analyzedStock.filter(item => {
      const matchesSupplier = selectedSupplier === 'All' || item.supplier === selectedSupplier;
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = 
        item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.genericName.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSupplier && matchesCategory && matchesSearch;
    });
  }, [analyzedStock, selectedSupplier, selectedCategory, searchTerm]);

  const sortedStock = useMemo(() => {
    return [...filteredStock].sort((a, b) => {
      const urgencyOrder = { outofstock: 0, critical: 1, low: 2, reorder: 3, safe: 4 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }, [filteredStock]);

  const stats = {
    outOfStock: filteredStock.filter(item => item.urgency === 'outofstock').length,
    critical: filteredStock.filter(item => item.urgency === 'critical').length,
    low: filteredStock.filter(item => item.urgency === 'low').length,
    reorder: filteredStock.filter(item => item.urgency === 'reorder').length,
    totalValue: selectedItems.reduce((sum, id) => {
      const item = analyzedStock.find(i => i.id === id);
      return sum + (item?.estimatedCost || 0);
    }, 0)
  };

  const criticalItems = sortedStock.filter(item => 
    item.urgency === 'outofstock' || item.urgency === 'critical' || item.urgency === 'low'
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="OUT OF STOCK" count={stats.outOfStock} color="red" icon={AlertTriangle} />
        <StatCard title="CRITICAL (<7 days)" count={stats.critical} color="orange" icon={Clock} />
        <StatCard title="LOW STOCK" count={stats.low} color="yellow" icon={TrendingUp} />
        <StatCard title="REORDER POINT" count={stats.reorder} color="blue" icon={Package} />
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicines..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {supplierNames.map(sup => (
              <option key={sup} value={sup}>{sup}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => selectAllCritical(criticalItems.map(i => i.id))}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Select All Critical ({criticalItems.length})
          </button>
          <button
            onClick={() => setSelectedItems([])}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear Selection
          </button>
          {selectedItems.length > 0 && (
            <button
              onClick={onGenerateOrder}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Generate Order ({selectedItems.length} items) - ₹{stats.totalValue.toFixed(2)}
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(sortedStock.map(i => i.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    checked={selectedItems.length === sortedStock.length && sortedStock.length > 0}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days of Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min/Max</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suggested Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Profit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedStock.map(item => (
                <ReorderRow
                  key={item.id}
                  item={item}
                  selected={selectedItems.includes(item.id)}
                  onToggle={() => toggleItemSelection(item.id)}
                />
              ))}
            </tbody>
          </table>

          {sortedStock.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>No medicines found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== REORDER ROW ====================

function ReorderRow({ item, selected, onToggle }) {
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'outofstock':
        return <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">OUT OF STOCK</span>;
      case 'critical':
        return <span className="px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">CRITICAL</span>;
      case 'low':
        return <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full">LOW</span>;
      case 'reorder':
        return <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">REORDER</span>;
      default:
        return <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">SAFE</span>;
    }
  };

  const getRowColor = (urgency) => {
    switch (urgency) {
      case 'outofstock': return 'bg-red-50';
      case 'critical': return 'bg-orange-50';
      case 'low': return 'bg-yellow-50';
      case 'reorder': return 'bg-blue-50';
      default: return '';
    }
  };

  return (
    <tr className={`hover:bg-gray-100 ${getRowColor(item.urgency)} ${selected ? 'ring-2 ring-indigo-500' : ''}`}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4"
        />
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {getUrgencyBadge(item.urgency)}
      </td>
      <td className="px-4 py-3">
        <div className="font-semibold text-gray-900">{item.medicineName}</div>
        <div className="text-sm text-gray-500">{item.genericName}</div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.supplier}</td>
      <td className="px-4 py-3">
        <span className={`text-lg font-bold ${item.currentStock <= item.minStockLevel ? 'text-red-600' : 'text-gray-900'}`}>
          {item.currentStock}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-sm font-bold ${
          item.daysOfStock <= item.leadTimeDays ? 'text-red-600' :
          item.daysOfStock <= 14 ? 'text-orange-600' :
          'text-gray-600'
        }`}>
          {item.daysOfStock} days
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {item.minStockLevel} / {item.maxStockLevel}
      </td>
      <td className="px-4 py-3">
        <span className="text-lg font-bold text-indigo-600">
          {item.suggestedOrderQty}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
        ₹{item.estimatedCost.toFixed(2)}
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-green-600">
        ₹{item.estimatedProfit.toFixed(2)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {item.leadTimeDays} days
      </td>
    </tr>
  );
}

// ==================== ORDER SUMMARY ====================

function OrderSummary({ stock, suppliers, selectedItems, onBack, showNotification }) {
  const selectedStock = stock.filter(item => selectedItems.includes(item.id));
  
  const ordersBySupplier = useMemo(() => {
    const grouped = {};
    selectedStock.forEach(item => {
      const suggestedQty = item.maxStockLevel - item.currentStock;
      const cost = suggestedQty * item.purchasePrice;
      
      if (!grouped[item.supplier]) {
        grouped[item.supplier] = {
          supplier: item.supplier,
          items: [],
          totalCost: 0,
          totalProfit: 0
        };
      }
      
      grouped[item.supplier].items.push({
        ...item,
        orderQty: suggestedQty,
        cost: cost,
        profit: (suggestedQty * item.unitPrice) - cost
      });
      
      grouped[item.supplier].totalCost += cost;
      grouped[item.supplier].totalProfit += (suggestedQty * item.unitPrice) - cost;
    });
    
    return Object.values(grouped);
  }, [selectedStock]);

  const grandTotal = ordersBySupplier.reduce((sum, order) => sum + order.totalCost, 0);
  const grandProfit = ordersBySupplier.reduce((sum, order) => sum + order.totalProfit, 0);

  const handlePrint = () => {
    window.print();
    showNotification('Order list ready to print!', 'success');
  };

  const handleDownload = () => {
    const csvContent = [
      ['Supplier', 'Medicine', 'Generic Name', 'Quantity', 'Unit Price', 'Total Cost'].join(','),
      ...selectedStock.map(item => [
        item.supplier,
        item.medicineName,
        item.genericName,
        item.maxStockLevel - item.currentStock,
        item.purchasePrice,
        (item.maxStockLevel - item.currentStock) * item.purchasePrice
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reorder_list_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showNotification('Order list downloaded!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="text-sm text-indigo-600 mb-1">Total Items</div>
            <div className="text-3xl font-bold text-indigo-900">{selectedStock.length}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600 mb-1">Total Order Cost</div>
            <div className="text-3xl font-bold text-orange-900">₹{grandTotal.toFixed(2)}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Expected Profit</div>
            <div className="text-3xl font-bold text-green-900">₹{grandProfit.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {ordersBySupplier.map((order, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4 pb-4 border-b">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{order.supplier}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{order.items.length} items</span>
                <span>•</span>
                <span>Total: ₹{order.totalCost.toFixed(2)}</span>
                <span>•</span>
                <span className="text-green-600 font-semibold">Profit: ₹{order.totalProfit.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{suppliers.find(s => s.name === order.supplier)?.contact}</span>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Generic Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expected Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.items.map((item, itemIdx) => (
                <tr key={itemIdx}>
                  <td className="px-4 py-3 font-semibold text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.genericName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.currentStock}</td>
                  <td className="px-4 py-3 text-lg font-bold text-indigo-600">{item.orderQty}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">₹{item.purchasePrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{item.cost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">₹{item.profit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td colSpan="5" className="px-4 py-3 text-right">Supplier Total:</td>
                <td className="px-4 py-3">₹{order.totalCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-green-600">₹{order.totalProfit.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ))}
    </div>
  );
}

// ==================== STAT CARD ====================

function StatCard({ title, count, color, icon: Icon }) {
  const colors = {
    red: 'bg-red-50 border-red-200 text-red-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600'
  };

  return (
    <div className={`${colors[color]} border-2 rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-8 h-8" />
        <span className="text-4xl font-bold">{count}</span>
      </div>
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}