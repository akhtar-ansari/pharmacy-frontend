import React, { useState, useEffect, useMemo } from 'react';
import { Pill, Plus, Search, Edit2, Trash2, X, CheckCircle, AlertCircle, RefreshCw, Download, Filter, Upload, FileSpreadsheet } from 'lucide-react';
import { medicinesAPI } from '../services/api';
import * as XLSX from 'xlsx';

export default function MedicineDatabaseApp({ appData, setAppData }) {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [uploadProgress, setUploadProgress] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await medicinesAPI.getAll();
      if (result.success) {
        setMedicines(result.data);
        showNotification('✅ Data loaded from database', 'success');
      }
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

  const categories = ['All', ...new Set(medicines.map(m => m.category).filter(Boolean))];
  const types = ['All', ...new Set(medicines.map(m => m.type).filter(Boolean))];

  const filteredMedicines = useMemo(() => {
    let filtered = medicines;

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter(m => m.type === typeFilter);
    }

    return filtered.sort((a, b) => a.name?.localeCompare(b.name));
  }, [medicines, searchTerm, categoryFilter, typeFilter]);

  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedicines, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    return {
      total: medicines.length,
      categories: new Set(medicines.map(m => m.category).filter(Boolean)).size,
      manufacturers: new Set(medicines.map(m => m.manufacturer).filter(Boolean)).size,
      prescription: medicines.filter(m => m.requires_prescription).length
    };
  }, [medicines]);

  const handleAdd = () => {
    setEditingMedicine(null);
    setShowForm(true);
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;

    try {
      const result = await medicinesAPI.delete(id);
      if (result.success) {
        setMedicines(medicines.filter(m => m.id !== id));
        showNotification('✅ Medicine deleted successfully', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to delete medicine: ' + error.message, 'error');
    }
  };

  const handleSave = async (medicineData) => {
    try {
      // Clean the data
      const cleanedData = {
        ...medicineData,
        mrp: medicineData.mrp === '' ? null : parseFloat(medicineData.mrp),
        purchase_price: medicineData.purchase_price === '' ? null : parseFloat(medicineData.purchase_price),
        gst_percentage: medicineData.gst_percentage === '' ? 12 : parseInt(medicineData.gst_percentage),
        reorder_level: medicineData.reorder_level === '' ? 50 : parseInt(medicineData.reorder_level),
      };

      if (editingMedicine) {
        const result = await medicinesAPI.update(editingMedicine.id, cleanedData);
        if (result.success) {
          setMedicines(medicines.map(m => m.id === editingMedicine.id ? result.data : m));
          showNotification('✅ Medicine updated successfully', 'success');
        }
      } else {
        const result = await medicinesAPI.create(cleanedData);
        if (result.success) {
          setMedicines([...medicines, result.data]);
          showNotification('✅ Medicine added successfully', 'success');
        }
      }
      setShowForm(false);
      setEditingMedicine(null);
    } catch (error) {
      showNotification('❌ Failed to save medicine: ' + error.message, 'error');
    }
  };

  // BULK UPLOAD FUNCTIONS
  const downloadTemplate = () => {
    const template = [
      {
        'Medicine Name*': 'Paracetamol',
        'Generic Name': 'Acetaminophen',
        'Category': 'Tablet',
        'Type': 'Allopathy',
        'Manufacturer': 'Cipla Ltd',
        'MRP*': '12.50',
        'Purchase Price': '8.00',
        'HSN Code': '3004',
        'GST %': '12',
        'Reorder Level': '50',
        'Requires Prescription': 'No',
        'Description': 'Pain reliever'
      },
      {
        'Medicine Name*': 'Aspirin',
        'Generic Name': 'Acetylsalicylic Acid',
        'Category': 'Tablet',
        'Type': 'Allopathy',
        'Manufacturer': 'Bayer',
        'MRP*': '25.00',
        'Purchase Price': '18.00',
        'HSN Code': '3004',
        'GST %': '12',
        'Reorder Level': '30',
        'Requires Prescription': 'Yes',
        'Description': 'Blood thinner'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicines Template');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
      { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 12 },
      { wch: 8 }, { wch: 15 }, { wch: 20 }, { wch: 30 }
    ];

    XLSX.writeFile(workbook, 'Medicine_Upload_Template.xlsx');
    showNotification('✅ Template downloaded successfully', 'success');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadProgress({ total: 0, success: 0, failed: 0, errors: [] });
      
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

          setUploadProgress({ total: jsonData.length, success: 0, failed: 0, errors: [] });

          let successCount = 0;
          let failedCount = 0;
          const errors = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            try {
              // Validate required fields
              if (!row['Medicine Name*'] || !row['MRP*']) {
                throw new Error('Medicine Name and MRP are required');
              }

              // Map Excel columns to database fields
              const medicineData = {
                name: row['Medicine Name*'],
                generic_name: row['Generic Name'] || '',
                category: row['Category'] || 'Tablet',
                type: row['Type'] || 'Allopathy',
                manufacturer: row['Manufacturer'] || '',
                mrp: parseFloat(row['MRP*']) || 0,
                purchase_price: parseFloat(row['Purchase Price']) || 0,
                hsn_code: row['HSN Code'] || '',
                gst_percentage: parseInt(row['GST %']) || 12,
                reorder_level: parseInt(row['Reorder Level']) || 50,
                requires_prescription: (row['Requires Prescription'] || '').toLowerCase() === 'yes',
                description: row['Description'] || ''
              };

              const result = await medicinesAPI.create(medicineData);
              
              if (result.success) {
                successCount++;
                setMedicines(prev => [...prev, result.data]);
              } else {
                throw new Error(result.error || 'Failed to create medicine');
              }
            } catch (error) {
              failedCount++;
              errors.push(`Row ${i + 2}: ${row['Medicine Name*'] || 'Unknown'} - ${error.message}`);
            }

            setUploadProgress({
              total: jsonData.length,
              success: successCount,
              failed: failedCount,
              errors: errors
            });
          }

          if (successCount > 0) {
            showNotification(`✅ Successfully imported ${successCount} medicines`, 'success');
          }
          if (failedCount > 0) {
            showNotification(`⚠️ ${failedCount} medicines failed to import. Check details.`, 'error');
          }

          // Keep upload progress visible for 10 seconds
          setTimeout(() => setUploadProgress(null), 10000);
          
        } catch (error) {
          showNotification('❌ Failed to parse Excel file: ' + error.message, 'error');
          setUploadProgress(null);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      showNotification('❌ Failed to upload file: ' + error.message, 'error');
      setUploadProgress(null);
    }

    // Reset file input
    event.target.value = '';
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Generic Name', 'Category', 'Type', 'Manufacturer', 'MRP', 'Purchase Price', 'HSN Code', 'Requires Prescription'];
    const rows = filteredMedicines.map(m => [
      m.name || '',
      m.generic_name || '',
      m.category || '',
      m.type || '',
      m.manufacturer || '',
      m.mrp || '',
      m.purchase_price || '',
      m.hsn_code || '',
      m.requires_prescription ? 'Yes' : 'No'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicines-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (showForm) {
    return (
      <MedicineForm
        medicine={editingMedicine}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingMedicine(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <Pill className="w-8 h-8 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Medicine Database</h1>
                <p className="text-sm text-cyan-100">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                title="Download Excel Template"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Download Template
              </button>

              <label className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-2 bg-white text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Medicine
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
            <button onClick={() => setNotification(null)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {uploadProgress && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Records:</span>
                <span className="font-semibold">{uploadProgress.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Successfully Imported:</span>
                <span className="font-semibold text-green-600">{uploadProgress.success}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Failed:</span>
                <span className="font-semibold text-red-600">{uploadProgress.failed}</span>
              </div>
              
              {uploadProgress.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-red-600 mb-2">Errors:</h4>
                  <div className="bg-red-50 p-3 rounded max-h-40 overflow-y-auto">
                    {uploadProgress.errors.map((error, idx) => (
                      <div key={idx} className="text-xs text-red-700 mb-1">{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Medicines</p>
                <p className="text-2xl font-bold text-cyan-600">{stats.total}</p>
              </div>
              <Pill className="w-10 h-10 text-cyan-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-blue-600">{stats.categories}</p>
              </div>
              <Filter className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Manufacturers</p>
                <p className="text-2xl font-bold text-purple-600">{stats.manufacturers}</p>
              </div>
              <div className="w-10 h-10 bg-purple-600 opacity-20 rounded-full" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prescription Required</p>
                <p className="text-2xl font-bold text-orange-600">{stats.prescription}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, generic name, or manufacturer..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {paginatedMedicines.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No medicines found</p>
              <button
                onClick={handleAdd}
                className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Add Your First Medicine
              </button>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Generic Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Manufacturer</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">MRP</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Purchase</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Rx</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedMedicines.map((medicine) => (
                      <tr key={medicine.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-cyan-100 p-2 rounded-lg">
                              <Pill className="w-4 h-4 text-cyan-600" />
                            </div>
                            <span className="font-semibold text-gray-900">{medicine.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{medicine.generic_name || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {medicine.category || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{medicine.type || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{medicine.manufacturer || '-'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{parseFloat(medicine.mrp || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">₹{parseFloat(medicine.purchase_price || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          {medicine.requires_prescription ? (
                            <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">Rx</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(medicine)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit medicine"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(medicine.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete medicine"
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

              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
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
                  <span className="text-sm text-gray-600">entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm font-medium">
                    {currentPage} / {Math.ceil(filteredMedicines.length / itemsPerPage) || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredMedicines.length / itemsPerPage), prev + 1))}
                    disabled={currentPage >= Math.ceil(filteredMedicines.length / itemsPerPage)}
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

function MedicineForm({ medicine, onSave, onCancel }) {
  const [formData, setFormData] = useState(medicine || {
    name: '',
    generic_name: '',
    category: 'Tablet',
    type: 'Allopathy',
    manufacturer: '',
    mrp: '',
    purchase_price: '',
    hsn_code: '',
    gst_percentage: 12,
    reorder_level: 50,
    requires_prescription: false,
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mrp) {
      alert('Please fill in required fields: Name and MRP');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {medicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h2>
            <button onClick={onCancel} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicine Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generic Name
                </label>
                <input
                  type="text"
                  value={formData.generic_name}
                  onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Cream">Cream</option>
                  <option value="Drops">Drops</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Powder">Powder</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Allopathy">Allopathy</option>
                  <option value="Ayurvedic">Ayurvedic</option>
                  <option value="Homeopathy">Homeopathy</option>
                  <option value="Unani">Unani</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MRP <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HSN Code
                </label>
                <input
                  type="text"
                  value={formData.hsn_code}
                  onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST %
                </label>
                <select
                  value={formData.gst_percentage}
                  onChange={(e) => setFormData({ ...formData, gst_percentage: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reorder Level
                </label>
                <input
                  type="number"
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requires_prescription"
                checked={formData.requires_prescription}
                onChange={(e) => setFormData({ ...formData, requires_prescription: e.target.checked })}
                className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500"
              />
              <label htmlFor="requires_prescription" className="text-sm font-medium text-gray-700">
                Requires Prescription
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="Additional information about the medicine..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 font-semibold transition-colors"
              >
                {medicine ? 'Update Medicine' : 'Add Medicine'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}