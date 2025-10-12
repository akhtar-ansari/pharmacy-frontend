import React, { useState, useEffect } from 'react';
import { Package, Plus, Upload, Eye, Trash2, RefreshCw, Calendar, DollarSign, FileText, X, Save, ArrowLeft } from 'lucide-react';
import { stockInvoicesAPI, suppliersAPI, medicinesAPI } from '../services/api';
import * as XLSX from 'xlsx';

export default function StockINApp({ appData, setAppData }) {
  const [view, setView] = useState('list'); // 'list' or 'form' or 'detail'
  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, suppliersRes, medicinesRes] = await Promise.all([
        stockInvoicesAPI.getAll(),
        suppliersAPI.getAll(),
        medicinesAPI.getAll()
      ]);

      if (invoicesRes.success) setInvoices(invoicesRes.data);
      if (suppliersRes.success) setSuppliers(suppliersRes.data);
      if (medicinesRes.success) setMedicines(medicinesRes.data);

      showNotification('✅ Data loaded successfully', 'success');
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

  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    setView('form');
  };

  const handleViewInvoice = async (id) => {
    try {
      const result = await stockInvoicesAPI.getById(id);
      if (result.success) {
        setSelectedInvoice(result.data);
        setView('detail');
      }
    } catch (error) {
      showNotification('❌ Failed to load invoice', 'error');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Delete this invoice? This will remove all related stock entries.')) return;

    try {
      const result = await stockInvoicesAPI.delete(id);
      if (result.success) {
        setInvoices(invoices.filter(inv => inv.id !== id));
        showNotification('✅ Invoice deleted successfully', 'success');
        if (view === 'detail') setView('list');
      }
    } catch (error) {
      showNotification('❌ Failed to delete invoice: ' + error.message, 'error');
    }
  };

  const handleSaveInvoice = async (invoiceData) => {
    try {
      const result = await stockInvoicesAPI.create(invoiceData);
      if (result.success) {
        await loadData();
        setView('list');
        showNotification(`✅ Invoice created with ${invoiceData.items.length} items`, 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to create invoice: ' + error.message, 'error');
    }
  };

  // Route to different views
  if (view === 'form') {
    return (
      <InvoiceForm
        suppliers={suppliers}
        medicines={medicines}
        onSave={handleSaveInvoice}
        onCancel={() => setView('list')}
        showNotification={showNotification}
      />
    );
  }

  if (view === 'detail' && selectedInvoice) {
    return (
      <InvoiceDetail
        invoice={selectedInvoice}
        onBack={() => setView('list')}
        onDelete={handleDeleteInvoice}
      />
    );
  }

  // Default: Invoice List View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Stock IN - Invoices</h1>
                <p className="text-sm text-green-100">
                  {loading ? '⏳ Loading...' : `${invoices.length} invoices`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={handleNewInvoice}
                className="flex items-center gap-2 px-6 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                New Invoice
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className={`p-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-green-600">{invoices.length}</p>
              </div>
              <FileText className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payment</p>
                <p className="text-2xl font-bold text-orange-600">
                  {invoices.filter(inv => inv.payment_status === 'pending').length}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{invoices.reduce((sum, inv) => sum + parseFloat(inv.invoice_amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-purple-600">
                  {invoices.reduce((sum, inv) => sum + (inv.item_count || 0), 0)}
                </p>
              </div>
              <Package className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-lg shadow">
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No invoices yet</p>
              <button
                onClick={handleNewInvoice}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Your First Invoice
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Items</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-900">{invoice.invoice_number}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {invoice.suppliers?.name || '-'}
                        {invoice.suppliers?.company && (
                          <div className="text-xs text-gray-500">{invoice.suppliers.company}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(invoice.invoice_date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        ₹{parseFloat(invoice.invoice_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {invoice.item_count || 0} items
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewInvoice(invoice.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// INVOICE FORM COMPONENT
// ==========================================
function InvoiceForm({ suppliers, medicines, onSave, onCancel, showNotification }) {
  const [formData, setFormData] = useState({
    invoice_number: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    supplier_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    payment_status: 'pending',
    notes: ''
  });

  const [items, setItems] = useState([
    {
      medicine_id: '',
      medicine_name: '',
      quantity: '',
      batch_number: '',
      expiry_date: '',
      purchase_price: ''
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  // Helper function to parse Excel dates
  const parseExcelDate = (excelDate) => {
    if (!excelDate) return '';
    
    // If it's already a string in YYYY-MM-DD format
    if (typeof excelDate === 'string' && excelDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return excelDate;
    }
    
    // If it's an Excel serial number
    if (typeof excelDate === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const excelEpochAsUnixTimestamp = excelEpoch.getTime();
      const missingLeapYearDay = 24 * 60 * 60 * 1000;
      const delta = excelEpochAsUnixTimestamp - missingLeapYearDay;
      const excelTimestampAsUnixTimestamp = delta + excelDate * 24 * 60 * 60 * 1000;
      const date = new Date(excelTimestampAsUnixTimestamp);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse as date string
    try {
      const date = new Date(excelDate);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      return '';
    }
    
    return '';
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Medicine Name': 'Paracetamol',
        'Quantity': '100',
        'Batch Number': 'A123',
        'Expiry Date': '2026-01-15',
        'Purchase Price': '8.50'
      },
      {
        'Medicine Name': 'Aspirin',
        'Quantity': '50',
        'Batch Number': 'B456',
        'Expiry Date': '2026-03-20',
        'Purchase Price': '18.00'
      },
      {
        'Medicine Name': 'Crocin',
        'Quantity': '75',
        'Batch Number': 'C789',
        'Expiry Date': '2025-12-10',
        'Purchase Price': '10.50'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Invoice Template');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 }, // Medicine Name
      { wch: 10 }, // Quantity
      { wch: 15 }, // Batch Number
      { wch: 15 }, // Expiry Date
      { wch: 15 }  // Purchase Price
    ];

    XLSX.writeFile(workbook, 'Stock_Invoice_Template.xlsx');
    showNotification('✅ Template downloaded successfully', 'success');
  };

  const addItem = () => {
    setItems([...items, {
      medicine_id: '',
      medicine_name: '',
      quantity: '',
      batch_number: '',
      expiry_date: '',
      purchase_price: ''
    }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      showNotification('⚠️ Must have at least one item', 'error');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // If medicine is selected, auto-fill name
    if (field === 'medicine_id') {
      const medicine = medicines.find(m => m.id === parseInt(value));
      if (medicine) {
        newItems[index].medicine_name = medicine.name;
        newItems[index].purchase_price = medicine.purchase_price || '';
      }
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.purchase_price || 0));
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (saving) return;

    // Validate
    const validItems = items.filter(item => item.medicine_id && item.quantity);
    
    if (validItems.length === 0) {
      showNotification('⚠️ Please add at least one item with medicine and quantity', 'error');
      return;
    }

    if (!formData.supplier_id) {
      showNotification('⚠️ Please select a supplier', 'error');
      return;
    }

    const invoiceData = {
      ...formData,
      items: validItems
    };

    setSaving(true);
    showNotification('⏳ Saving invoice...', 'success');

    try {
      await onSave(invoiceData);
    } finally {
      setSaving(false);
    }
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          showNotification('❌ Excel file is empty', 'error');
          return;
        }

        showNotification(`⏳ Processing ${jsonData.length} items...`, 'success');

        const uploadedItems = [];
        let createdMedicines = 0;

        for (const row of jsonData) {
          const medicineName = (row['Medicine Name'] || '').trim();
          
          if (!medicineName) continue;

          // Try to find existing medicine
          let medicine = medicines.find(m => 
            m.name.toLowerCase() === medicineName.toLowerCase()
          );

          // If medicine doesn't exist, create it
          if (!medicine) {
            try {
              const newMedicineData = {
                name: medicineName,
                generic_name: '',
                category: 'Tablet',
                type: 'Allopathy',
                manufacturer: '',
                mrp: parseFloat(row['Purchase Price']) || 0,
                purchase_price: parseFloat(row['Purchase Price']) || 0,
                hsn_code: '',
                gst_percentage: 12,
                reorder_level: 50,
                requires_prescription: false,
                description: 'Auto-created from stock invoice'
              };

              const result = await medicinesAPI.create(newMedicineData);
              
              if (result.success) {
                medicine = result.data;
                medicines.push(medicine); // Add to local list
                createdMedicines++;
              } else {
                showNotification(`⚠️ Failed to create medicine: ${medicineName}`, 'error');
                continue;
              }
            } catch (error) {
              showNotification(`❌ Error creating medicine ${medicineName}: ${error.message}`, 'error');
              continue;
            }
          }

          // Add item to upload list
          uploadedItems.push({
            medicine_id: medicine.id,
            medicine_name: medicine.name,
            quantity: row['Quantity'] || '',
            batch_number: row['Batch Number'] || '',
            expiry_date: parseExcelDate(row['Expiry Date']),
            purchase_price: row['Purchase Price'] || ''
          });
        }

        if (uploadedItems.length > 0) {
          setItems(uploadedItems);
          showNotification(
            `✅ Uploaded ${uploadedItems.length} items${createdMedicines > 0 ? ` (${createdMedicines} new medicines created)` : ''}`, 
            'success'
          );
        } else {
          showNotification('⚠️ No valid items found in Excel', 'error');
        }

      } catch (error) {
        showNotification('❌ Failed to parse Excel file: ' + error.message, 'error');
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="p-2 bg-white text-green-600 rounded-lg hover:bg-green-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-white">New Stock Invoice</h1>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <FileText className="w-4 h-4" />
                Download Template
              </button>
              
              <label className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 pb-6 border-b">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.invoice_number}
                onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.company && `- ${s.company}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Medicine *</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Qty *</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Batch</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Expiry</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Total</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                        <td className="px-4 py-2">
                          <select
                            value={item.medicine_id}
                            onChange={(e) => updateItem(index, 'medicine_id', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            <option value="">Select Medicine</option>
                            {medicines.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name} {m.generic_name && `(${m.generic_name})`}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-sm text-center"
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.batch_number}
                            onChange={(e) => updateItem(index, 'batch_number', e.target.value)}
                            className="w-24 px-2 py-1 border rounded text-sm"
                            placeholder="Batch"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            value={item.expiry_date}
                            onChange={(e) => updateItem(index, 'expiry_date', e.target.value)}
                            className="w-36 px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.purchase_price}
                            onChange={(e) => updateItem(index, 'purchase_price', e.target.value)}
                            className="w-24 px-2 py-1 border rounded text-sm text-right"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-sm">
                          ₹{(parseFloat(item.quantity || 0) * parseFloat(item.purchase_price || 0)).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2">
                    <tr>
                      <td colSpan="6" className="px-4 py-3 text-right font-semibold">
                        Total Invoice Amount:
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-lg text-green-600">
                        ₹{calculateTotal().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Any additional notes about this invoice..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
                saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving Invoice...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Invoice
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// INVOICE DETAIL VIEW COMPONENT
// ==========================================
function InvoiceDetail({ invoice, onBack, onDelete }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 bg-white text-green-600 rounded-lg hover:bg-green-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Invoice Details</h1>
                <p className="text-sm text-green-100">{invoice.invoice_number}</p>
              </div>
            </div>

            <button
              onClick={() => onDelete(invoice.id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Delete Invoice
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-4">Invoice Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Invoice Number</p>
                  <p className="text-lg font-bold">{invoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Invoice Date</p>
                  <p className="font-semibold">{new Date(invoice.invoice_date).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.payment_status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-4">Supplier Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Supplier Name</p>
                  <p className="font-semibold">{invoice.suppliers?.name || '-'}</p>
                </div>
                {invoice.suppliers?.company && (
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="font-semibold">{invoice.suppliers.company}</p>
                  </div>
                )}
                {invoice.suppliers?.phone && (
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-semibold">{invoice.suppliers.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Medicine</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Generic Name</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Batch</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Expiry</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items?.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold">{item.medicines?.name}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{item.medicines?.generic_name || '-'}</td>
                      <td className="px-4 py-3 text-center font-semibold">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm">{item.batch_number || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('en-GB') : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">₹{parseFloat(item.purchase_price || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold">₹{parseFloat(item.line_total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2">
                  <tr>
                    <td colSpan="7" className="px-4 py-4 text-right font-semibold text-lg">
                      Total Invoice Amount:
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-xl text-green-600">
                      ₹{parseFloat(invoice.invoice_amount || 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}