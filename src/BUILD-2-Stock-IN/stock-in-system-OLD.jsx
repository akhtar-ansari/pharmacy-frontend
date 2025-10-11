import React, { useState, useMemo } from 'react';
import { Plus, Search, Save, X, CheckCircle, AlertCircle, Printer, Package, Calendar, Barcode, Building2, ShoppingBag, Check, Minus, FileText, Trash2, Edit2 } from 'lucide-react';

// ==================== MOCK DATA ====================

const SAMPLE_MEDICINES = [
  { id: 1, name: 'Paracetamol', genericName: 'Acetaminophen', company: 'Cipla Ltd', packSize: '10 tablets', barcode: 'MED-000001' },
  { id: 2, name: 'Crocin', genericName: 'Paracetamol', company: 'GSK', packSize: '15 tablets', barcode: 'MED-000002' },
  { id: 3, name: 'Amoxicillin', genericName: 'Amoxicillin Trihydrate', company: 'Sun Pharma', packSize: '10 capsules', barcode: 'MED-000003' },
  { id: 4, name: 'Cetirizine', genericName: 'Cetirizine Hydrochloride', company: 'Dr. Reddy\'s', packSize: '10 tablets', barcode: 'MED-000004' },
  { id: 5, name: 'Omeprazole', genericName: 'Omeprazole', company: 'Lupin', packSize: '14 capsules', barcode: 'MED-000005' }
];

const SAMPLE_SUPPLIERS = [
  { id: 1, name: 'MediSupply Distributors', contact: '9876543210', address: 'Market Road, Jeddah' },
  { id: 2, name: 'PharmaCare Wholesalers', contact: '9876543211', address: 'Central Market, Jeddah' },
  { id: 3, name: 'HealthPlus Suppliers', contact: '9876543212', address: 'Medical Street, Jeddah' }
];

const SAMPLE_STOCK_INS = [
  {
    id: 1,
    invoiceNumber: 'INV-2024-001',
    supplier: 'MediSupply Distributors',
    date: '2024-10-01',
    items: [
      { medicineId: 1, medicineName: 'Paracetamol', batchNumber: 'PCM-2024-A1', expiryDate: '12/2025', quantity: 100, mrp: 12.50, purchasePrice: 8.00, discount: 5, gst: 12, verified: true, shortQuantity: 0 }
    ],
    totalAmount: 856.80,
    status: 'completed'
  }
];

// ==================== MAIN APP COMPONENT ====================

export default function StockInApp({ appData, setAppData }) {
  const [view, setView] = useState('list');
  const [stockIns, setStockIns] = useState(SAMPLE_STOCK_INS);
  const [suppliers, setSuppliers] = useState(SAMPLE_SUPPLIERS);
  const [medicines, setMedicines] = useState(SAMPLE_MEDICINES);
  const [editingStockIn, setEditingStockIn] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const saveStockIn = (stockInData) => {
    if (editingStockIn) {
      setStockIns(stockIns.map(si => si.id === stockInData.id ? stockInData : si));
      showNotification('Stock IN updated successfully!', 'success');
    } else {
      const newStockIn = {
        ...stockInData,
        id: stockIns.length > 0 ? Math.max(...stockIns.map(si => si.id)) + 1 : 1,
        status: 'completed'
      };
      setStockIns([...stockIns, newStockIn]);
      showNotification('Stock IN saved successfully!', 'success');
    }
    setEditingStockIn(null);
    setView('list');
  };

  const deleteStockIn = (id) => {
    if (window.confirm('Are you sure you want to delete this Stock IN entry?')) {
      setStockIns(stockIns.filter(si => si.id !== id));
      showNotification('Stock IN deleted successfully!', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Stock IN System</h1>
                <p className="text-sm text-gray-500">BUILD 2 - Receive Supplier Deliveries</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <div className="text-sm text-gray-500">Total Stock INs</div>
                <div className="text-2xl font-bold text-green-600">{stockIns.length}</div>
              </div>
              
              <button
                onClick={() => setView('new')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Stock IN
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
              <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {notification.message}
              </span>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {view === 'list' && (
          <StockInList
            stockIns={stockIns}
            onEdit={(stockIn) => {
              setEditingStockIn(stockIn);
              setView('edit');
            }}
            onDelete={deleteStockIn}
            onNew={() => setView('new')}
          />
        )}

        {(view === 'new' || view === 'edit') && (
          <StockInForm
            stockIn={editingStockIn}
            suppliers={suppliers}
            medicines={medicines}
            onSave={saveStockIn}
            onCancel={() => {
              setEditingStockIn(null);
              setView('list');
            }}
            isEdit={view === 'edit'}
          />
        )}
      </div>
    </div>
  );
}

// ==================== STOCK IN LIST ====================

function StockInList({ stockIns, onEdit, onDelete, onNew }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStockIns = useMemo(() => {
    return stockIns.filter(si => 
      si.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      si.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stockIns, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Stock IN History</h2>
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Stock IN
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice number or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredStockIns.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No stock IN entries found</p>
          <p className="text-gray-400 text-sm mb-4">Start by receiving your first supplier delivery</p>
          <button
            onClick={onNew}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create First Stock IN
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStockIns.map(stockIn => (
            <StockInCard
              key={stockIn.id}
              stockIn={stockIn}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== STOCK IN CARD ====================

function StockInCard({ stockIn, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{stockIn.invoiceNumber}</h3>
              <span className={`px-3 py-1 text-xs rounded-full ${
                stockIn.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {stockIn.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{stockIn.supplier}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(stockIn.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{stockIn.items.length} items</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Total Amount</div>
            <div className="text-2xl font-bold text-green-600">₹{stockIn.totalAmount.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </button>
          <button
            onClick={() => onEdit(stockIn)}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(stockIn.id)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {expanded && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Items Received</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Medicine</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Batch</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Expiry</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">MRP</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Purchase</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stockIn.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.medicineName}</td>
                      <td className="px-4 py-2 text-sm font-mono text-gray-600">{item.batchNumber}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{item.expiryDate}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">₹{item.mrp.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">₹{item.purchasePrice.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        {item.verified ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">✓ Verified</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pending</span>
                        )}
                      </td>
                    </tr>
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

// ==================== STOCK IN FORM ====================

function StockInForm({ stockIn, suppliers, medicines, onSave, onCancel, isEdit }) {
  const [formData, setFormData] = useState(stockIn || {
    invoiceNumber: '',
    supplier: suppliers[0]?.name || '',
    date: new Date().toISOString().split('T')[0],
    items: []
  });

  const [currentItem, setCurrentItem] = useState({
    medicineId: '',
    medicineName: '',
    batchNumber: '',
    expiryDate: '',
    quantity: '',
    mrp: '',
    purchasePrice: '',
    discount: 0,
    gst: 12,
    verified: false,
    shortQuantity: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showMedicineSearch, setShowMedicineSearch] = useState(false);

  const filteredMedicines = useMemo(() => {
    return medicines.filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [medicines, searchTerm]);

  const selectMedicine = (medicine) => {
    setCurrentItem({
      ...currentItem,
      medicineId: medicine.id,
      medicineName: medicine.name,
      company: medicine.company,
      packSize: medicine.packSize
    });
    setShowMedicineSearch(false);
    setSearchTerm('');
  };

  const addItem = () => {
    if (!currentItem.medicineId || !currentItem.batchNumber || !currentItem.expiryDate || !currentItem.quantity) {
      alert('Please fill all required fields');
      return;
    }

    setFormData({
      ...formData,
      items: [...formData.items, { ...currentItem }]
    });

    setCurrentItem({
      medicineId: '',
      medicineName: '',
      batchNumber: '',
      expiryDate: '',
      quantity: '',
      mrp: '',
      purchasePrice: '',
      discount: 0,
      gst: 12,
      verified: false,
      shortQuantity: 0
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const toggleVerified = (index) => {
    const updated = [...formData.items];
    updated[index].verified = !updated[index].verified;
    setFormData({ ...formData, items: updated });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const basePrice = item.quantity * item.purchasePrice;
      const afterDiscount = basePrice - (basePrice * item.discount / 100);
      const withGst = afterDiscount + (afterDiscount * item.gst / 100);
      return total + withGst;
    }, 0);
  };

  const handleSave = () => {
    if (!formData.invoiceNumber || !formData.supplier || formData.items.length === 0) {
      alert('Please fill invoice number, supplier, and add at least one item');
      return;
    }

    onSave({
      ...formData,
      totalAmount: calculateTotal()
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit Stock IN' : 'New Stock IN Entry'}
          </h2>
          <button onClick={onCancel} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., INV-2024-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Items</h3>

        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Medicine <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={currentItem.medicineName || searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowMedicineSearch(true);
                }}
                onFocus={() => setShowMedicineSearch(true)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Search by name, generic name, or barcode..."
              />
            </div>

            {showMedicineSearch && searchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredMedicines.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No medicines found</div>
                ) : (
                  filteredMedicines.map(medicine => (
                    <button
                      key={medicine.id}
                      onClick={() => selectMedicine(medicine)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{medicine.name}</div>
                      <div className="text-sm text-gray-500">{medicine.genericName} - {medicine.company}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {currentItem.medicineId && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentItem.batchNumber}
                    onChange={(e) => setCurrentItem({ ...currentItem, batchNumber: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., PCM-2024-A1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry (MM/YYYY) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentItem.expiryDate}
                    onChange={(e) => setCurrentItem({ ...currentItem, expiryDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="12/2025"
                    maxLength="7"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || '' })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Qty (if any)
                  </label>
                  <input
                    type="number"
                    value={currentItem.shortQuantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, shortQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MRP <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={currentItem.mrp}
                      onChange={(e) => setCurrentItem({ ...currentItem, mrp: parseFloat(e.target.value) || '' })}
                      className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="12.50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={currentItem.purchasePrice}
                      onChange={(e) => setCurrentItem({ ...currentItem, purchasePrice: parseFloat(e.target.value) || '' })}
                      className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="8.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentItem.discount}
                    onChange={(e) => setCurrentItem({ ...currentItem, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentItem.gst}
                    onChange={(e) => setCurrentItem({ ...currentItem, gst: parseFloat(e.target.value) || 12 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="12"
                  />
                </div>
              </div>

              <button
                onClick={addItem}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Item to Invoice
              </button>
            </>
          )}
        </div>
      </div>

      {formData.items.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Added ({formData.items.length})</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Medicine</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">MRP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">GST</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Verify</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {formData.items.map((item, index) => {
                  const basePrice = item.quantity * item.purchasePrice;
                  const afterDiscount = basePrice - (basePrice * item.discount / 100);
                  const total = afterDiscount + (afterDiscount * item.gst / 100);
                  
                  return (
                    <tr key={index} className={item.verified ? 'bg-green-50' : ''}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.medicineName}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.batchNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.expiryDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.quantity}
                        {item.shortQuantity > 0 && (
                          <span className="text-red-600 ml-1">(-{item.shortQuantity})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">₹{item.mrp.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">₹{item.purchasePrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.discount}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.gst}%</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleVerified(index)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.verified ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {formData.items.filter(i => i.verified).length} of {formData.items.length} items verified
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Total Invoice Amount</div>
                <div className="text-3xl font-bold text-green-600">₹{calculateTotal().toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              {isEdit ? 'Update Stock IN' : 'Save Stock IN'}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}