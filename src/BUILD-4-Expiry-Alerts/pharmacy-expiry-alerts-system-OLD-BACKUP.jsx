import React, { useState, useMemo } from 'react';
import { AlertTriangle, AlertCircle, Clock, Package, TrendingDown, Search, Filter, ChevronDown, ChevronUp, X, Settings, Save } from 'lucide-react';

// ==================== MOCK DATA ====================

const SAMPLE_STOCK = [
  {
    id: 1,
    medicineId: 1,
    medicineName: 'Paracetamol',
    genericName: 'Acetaminophen',
    company: 'Cipla Ltd',
    category: 'Analgesic',
    barcode: 'MED-000001',
    minStockLevel: 50,
    maxStockLevel: 300,
    batches: [
      { batchNumber: 'PCM-2024-A1', expiryDate: '10/2024', quantity: 20, mrp: 12.50, purchasePrice: 8.00 },
      { batchNumber: 'PCM-2024-B1', expiryDate: '11/2024', quantity: 15, mrp: 12.50, purchasePrice: 8.00 },
      { batchNumber: 'PCM-2024-C1', expiryDate: '01/2025', quantity: 30, mrp: 12.50, purchasePrice: 8.00 },
      { batchNumber: 'PCM-2025-A1', expiryDate: '06/2025', quantity: 80, mrp: 13.00, purchasePrice: 8.50 }
    ]
  },
  {
    id: 2,
    medicineId: 2,
    medicineName: 'Crocin',
    genericName: 'Paracetamol',
    company: 'GSK',
    category: 'Antipyretic',
    barcode: 'MED-000002',
    minStockLevel: 40,
    maxStockLevel: 200,
    batches: [
      { batchNumber: 'CRO-2024-X1', expiryDate: '12/2024', quantity: 25, mrp: 15.00, purchasePrice: 10.50 }
    ]
  },
  {
    id: 3,
    medicineId: 3,
    medicineName: 'Amoxicillin',
    genericName: 'Amoxicillin Trihydrate',
    company: 'Sun Pharma',
    category: 'Antibiotic',
    barcode: 'MED-000003',
    minStockLevel: 30,
    maxStockLevel: 150,
    batches: [
      { batchNumber: 'AMX-2024-P1', expiryDate: '03/2025', quantity: 15, mrp: 45.00, purchasePrice: 32.00 }
    ]
  },
  {
    id: 4,
    medicineId: 4,
    medicineName: 'Cetirizine',
    genericName: 'Cetirizine Hydrochloride',
    company: 'Dr. Reddy\'s',
    category: 'Antihistamine',
    barcode: 'MED-000004',
    minStockLevel: 50,
    maxStockLevel: 250,
    batches: [
      { batchNumber: 'CET-2025-A1', expiryDate: '09/2025', quantity: 120, mrp: 18.00, purchasePrice: 12.00 }
    ]
  },
  {
    id: 5,
    medicineId: 5,
    medicineName: 'Omeprazole',
    genericName: 'Omeprazole',
    company: 'Lupin',
    category: 'Antacid',
    barcode: 'MED-000005',
    minStockLevel: 40,
    maxStockLevel: 200,
    batches: [
      { batchNumber: 'OME-2024-Z1', expiryDate: '09/2024', quantity: 5, mrp: 55.00, purchasePrice: 38.00 },
      { batchNumber: 'OME-2024-Y1', expiryDate: '11/2024', quantity: 10, mrp: 55.00, purchasePrice: 38.00 }
    ]
  },
  {
    id: 6,
    medicineId: 6,
    medicineName: 'Azithromycin',
    genericName: 'Azithromycin',
    company: 'Cipla Ltd',
    category: 'Antibiotic',
    barcode: 'MED-000006',
    minStockLevel: 25,
    maxStockLevel: 100,
    batches: [
      { batchNumber: 'AZI-2024-A1', expiryDate: '10/2024', quantity: 8, mrp: 85.00, purchasePrice: 60.00 }
    ]
  }
];

// ==================== MAIN APP COMPONENT ====================

export default function ExpiryAlertsApp({ appData, setAppData }) {
  const [stock, setStock] = useState(SAMPLE_STOCK);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLevels, setEditingLevels] = useState(null);
  const [notification, setNotification] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateStockLevels = (medicineId, minLevel, maxLevel) => {
    setStock(stock.map(item =>
      item.id === medicineId ? { ...item, minStockLevel: minLevel, maxStockLevel: maxLevel } : item
    ));
    setEditingLevels(null);
    showNotification('Stock levels updated successfully!', 'success');
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = ['All', ...new Set(stock.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Expiry & Stock Alerts</h1>
                <p className="text-sm text-gray-500">BUILD 4 - Never Sell Expired Medicines</p>
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
        <AlertsTable
          stock={stock}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categories={categories}
          editingLevels={editingLevels}
          setEditingLevels={setEditingLevels}
          onUpdateLevels={updateStockLevels}
          expandedRows={expandedRows}
          toggleRow={toggleRow}
        />
      </div>
    </div>
  );
}

// ==================== ALERTS TABLE ====================

function AlertsTable({ stock, selectedCategory, setSelectedCategory, searchTerm, setSearchTerm, categories, editingLevels, setEditingLevels, onUpdateLevels, expandedRows, toggleRow }) {
  const parseExpiryDate = (expiryStr) => {
    const [month, year] = expiryStr.split('/');
    return new Date(parseInt('20' + year), parseInt(month) - 1);
  };

  const analyzedStock = useMemo(() => {
    const today = new Date();
    
    return stock.map(item => {
      const totalQty = item.batches.reduce((sum, b) => sum + b.quantity, 0);
      
      const batchAnalysis = item.batches.map(batch => {
        const expiryDate = parseExpiryDate(batch.expiryDate);
        const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        let status = 'safe';
        if (daysUntilExpiry < 0) status = 'expired';
        else if (daysUntilExpiry <= 30) status = 'critical';
        else if (daysUntilExpiry <= 60) status = 'warning';
        else if (daysUntilExpiry <= 90) status = 'caution';
        
        return {
          ...batch,
          daysUntilExpiry,
          status
        };
      });

      const hasExpired = batchAnalysis.some(b => b.status === 'expired');
      const hasCritical = batchAnalysis.some(b => b.status === 'critical');
      const hasWarning = batchAnalysis.some(b => b.status === 'warning');
      const hasCaution = batchAnalysis.some(b => b.status === 'caution');
      const isLowStock = totalQty <= item.minStockLevel;
      
      let alertLevel = 'safe';
      if (hasExpired) alertLevel = 'expired';
      else if (hasCritical || isLowStock) alertLevel = 'critical';
      else if (hasWarning) alertLevel = 'warning';
      else if (hasCaution) alertLevel = 'caution';

      const oldestBatch = batchAnalysis.length > 0 
        ? batchAnalysis.reduce((oldest, current) => 
            current.daysUntilExpiry < oldest.daysUntilExpiry ? current : oldest
          )
        : null;

      return {
        ...item,
        totalQty,
        batchAnalysis,
        alertLevel,
        hasExpired,
        hasCritical,
        hasWarning,
        hasCaution,
        isLowStock,
        oldestBatch
      };
    });
  }, [stock]);

  const filteredStock = useMemo(() => {
    return analyzedStock.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = 
        item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [analyzedStock, selectedCategory, searchTerm]);

  const sortedStock = useMemo(() => {
    return [...filteredStock].sort((a, b) => {
      const priorityOrder = { expired: 0, critical: 1, warning: 2, caution: 3, safe: 4 };
      return priorityOrder[a.alertLevel] - priorityOrder[b.alertLevel];
    });
  }, [filteredStock]);

  const stats = {
    expired: filteredStock.filter(item => item.alertLevel === 'expired').length,
    critical: filteredStock.filter(item => item.alertLevel === 'critical' && !item.hasExpired).length,
    warning: filteredStock.filter(item => item.alertLevel === 'warning').length,
    lowStock: filteredStock.filter(item => item.isLowStock).length
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AlertStatCard title="EXPIRED" count={stats.expired} icon={X} color="red" description="Must be removed" />
        <AlertStatCard title="CRITICAL (<30 days)" count={stats.critical} icon={AlertTriangle} color="orange" description="Urgent attention" />
        <AlertStatCard title="WARNING (30-60 days)" count={stats.warning} icon={AlertCircle} color="yellow" description="Monitor closely" />
        <AlertStatCard title="LOW STOCK" count={stats.lowStock} icon={TrendingDown} color="blue" description="Need to reorder" />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicines..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min/Max</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Need to Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oldest Batch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedStock.map(item => (
                <React.Fragment key={item.id}>
                  <TableRow
                    item={item}
                    expanded={expandedRows[item.id]}
                    onToggle={() => toggleRow(item.id)}
                    editingLevels={editingLevels}
                    setEditingLevels={setEditingLevels}
                    onUpdateLevels={onUpdateLevels}
                  />
                  {expandedRows[item.id] && (
                    <tr className="bg-gray-50">
                      <td colSpan="10" className="px-4 py-4">
                        <BatchesTable batches={item.batchAnalysis} />
                      </td>
                    </tr>
                  )}
                  {editingLevels === item.id && (
                    <tr className="bg-blue-50">
                      <td colSpan="10" className="px-4 py-4">
                        <EditLevelsForm
                          item={item}
                          onSave={(min, max) => onUpdateLevels(item.id, min, max)}
                          onCancel={() => setEditingLevels(null)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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

// ==================== TABLE ROW ====================

function TableRow({ item, expanded, onToggle, editingLevels, setEditingLevels }) {
  const getAlertBadge = (alertLevel) => {
    switch (alertLevel) {
      case 'expired':
        return <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">EXPIRED</span>;
      case 'critical':
        return <span className="px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">CRITICAL</span>;
      case 'warning':
        return <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full">WARNING</span>;
      case 'caution':
        return <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">CAUTION</span>;
      default:
        return <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">SAFE</span>;
    }
  };

  const getStatusText = (batch) => {
    if (!batch) return '-';
    if (batch.status === 'expired') return 'EXPIRED!';
    return `${batch.daysUntilExpiry} days`;
  };

  const getRowColor = (alertLevel) => {
    switch (alertLevel) {
      case 'expired': return 'bg-red-50';
      case 'critical': return 'bg-orange-50';
      case 'warning': return 'bg-yellow-50';
      case 'caution': return 'bg-blue-50';
      default: return '';
    }
  };

  return (
    <tr className={`hover:bg-gray-100 ${getRowColor(item.alertLevel)}`}>
      <td className="px-4 py-3 whitespace-nowrap">
        {getAlertBadge(item.alertLevel)}
        {item.isLowStock && (
          <span className="block mt-1 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
            LOW STOCK
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="font-semibold text-gray-900">{item.medicineName}</div>
        <div className="text-sm text-gray-500">{item.genericName}</div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.company}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`text-lg font-bold ${item.isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
          {item.totalQty}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {item.minStockLevel} / {item.maxStockLevel}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-lg font-bold text-orange-600">
          {Math.max(0, item.maxStockLevel - item.totalQty)}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-mono text-gray-900">
        {item.oldestBatch ? (
          <>
            <div>{item.oldestBatch.batchNumber}</div>
            <div className="text-xs text-gray-500">{item.oldestBatch.expiryDate}</div>
          </>
        ) : '-'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`text-sm font-bold ${
          item.oldestBatch?.status === 'expired' ? 'text-red-600' :
          item.oldestBatch?.status === 'critical' ? 'text-orange-600' :
          item.oldestBatch?.status === 'warning' ? 'text-yellow-600' :
          'text-gray-600'
        }`}>
          {getStatusText(item.oldestBatch)}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex gap-2">
          <button
            onClick={onToggle}
            className="p-1 text-gray-600 hover:bg-gray-200 rounded"
            title="View Batches"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setEditingLevels(item.id)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Edit Levels"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ==================== BATCHES TABLE ====================

function BatchesTable({ batches }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-orange-100 text-orange-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'caution': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (batch) => {
    if (batch.status === 'expired') return 'EXPIRED';
    return `${batch.daysUntilExpiry} days left`;
  };

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-3">Batch Details ({batches.length} batches)</h4>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch Number</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">MRP</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Purchase Price</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {batches.map((batch, idx) => (
            <tr key={idx} className={getStatusColor(batch.status)}>
              <td className="px-3 py-2 font-mono text-sm">{batch.batchNumber}</td>
              <td className="px-3 py-2 text-sm font-semibold">{batch.expiryDate}</td>
              <td className="px-3 py-2 text-sm font-semibold">{batch.quantity}</td>
              <td className="px-3 py-2 text-sm">₹{batch.mrp.toFixed(2)}</td>
              <td className="px-3 py-2 text-sm">₹{batch.purchasePrice.toFixed(2)}</td>
              <td className="px-3 py-2 text-sm font-bold">{getStatusText(batch)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== EDIT LEVELS FORM ====================

function EditLevelsForm({ item, onSave, onCancel }) {
  const [minLevel, setMinLevel] = useState(item.minStockLevel);
  const [maxLevel, setMaxLevel] = useState(item.maxStockLevel);

  return (
    <div className="max-w-2xl">
      <h4 className="font-semibold text-gray-900 mb-4">Edit Stock Levels - {item.medicineName}</h4>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Level</label>
          <input
            type="number"
            value={minLevel}
            onChange={(e) => setMinLevel(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Level</label>
          <input
            type="number"
            value={maxLevel}
            onChange={(e) => setMaxLevel(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(minLevel, maxLevel)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ==================== ALERT STAT CARD ====================

function AlertStatCard({ title, count, icon: Icon, color, description }) {
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
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
}