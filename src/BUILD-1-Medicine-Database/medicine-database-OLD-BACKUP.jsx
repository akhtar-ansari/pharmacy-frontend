import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Download, Upload, Package, List, Filter, Barcode, Building2, Pill, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// ==================== INITIAL DATA ====================

const INITIAL_CATEGORIES = [
  'Analgesic', 'Antibiotic', 'Antacid', 'Antidiabetic', 'Antihypertensive',
  'Antihistamine', 'Antipyretic', 'Antiviral', 'Cardiovascular', 'Dermatology',
  'Gastrointestinal', 'Respiratory', 'Vitamins & Supplements', 'Surgical Items',
  'Baby Care', 'Personal Care', 'Other'
];

const SAMPLE_MEDICINES = [
  {
    id: 1,
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    company: 'Cipla Ltd',
    category: 'Analgesic',
    packSize: '10 tablets',
    mrp: 12.50,
    purchasePrice: 8.00,
    barcode: 'MED-000001',
    addedDate: '2024-10-01'
  },
  {
    id: 2,
    name: 'Crocin',
    genericName: 'Paracetamol',
    company: 'GSK',
    category: 'Antipyretic',
    packSize: '15 tablets',
    mrp: 15.00,
    purchasePrice: 10.50,
    barcode: 'MED-000002',
    addedDate: '2024-10-01'
  },
  {
    id: 3,
    name: 'Amoxicillin',
    genericName: 'Amoxicillin Trihydrate',
    company: 'Sun Pharma',
    category: 'Antibiotic',
    packSize: '10 capsules',
    mrp: 45.00,
    purchasePrice: 32.00,
    barcode: 'MED-000003',
    addedDate: '2024-10-02'
  },
  {
    id: 4,
    name: 'Cetirizine',
    genericName: 'Cetirizine Hydrochloride',
    company: 'Dr. Reddy\'s',
    category: 'Antihistamine',
    packSize: '10 tablets',
    mrp: 18.00,
    purchasePrice: 12.00,
    barcode: 'MED-000004',
    addedDate: '2024-10-02'
  },
  {
    id: 5,
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    company: 'Lupin',
    category: 'Antacid',
    packSize: '14 capsules',
    mrp: 55.00,
    purchasePrice: 38.00,
    barcode: 'MED-000005',
    addedDate: '2024-10-03'
  }
];

// ==================== MAIN APP COMPONENT ====================

export default function MedicineDatabaseApp({ appData, setAppData }) {
  const [medicines, setMedicines] = useState(SAMPLE_MEDICINES);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const generateBarcode = () => {
    const maxId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) : 0;
    return `MED-${String(maxId + 1).padStart(6, '0')}`;
  };

  const addMedicine = (medicineData) => {
    const newMedicine = {
      ...medicineData,
      id: medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1,
      barcode: generateBarcode(),
      addedDate: new Date().toISOString().split('T')[0]
    };
    setMedicines([...medicines, newMedicine]);
    setView('list');
    showNotification('Medicine added successfully!', 'success');
  };

  const updateMedicine = (medicineData) => {
    setMedicines(medicines.map(m => m.id === medicineData.id ? medicineData : m));
    setEditingMedicine(null);
    setView('list');
    showNotification('Medicine updated successfully!', 'success');
  };

  const deleteMedicine = (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      setMedicines(medicines.filter(m => m.id !== id));
      showNotification('Medicine deleted successfully!', 'success');
    }
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter(medicine => {
      const matchesSearch = 
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.barcode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'All' || medicine.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [medicines, searchTerm, filterCategory]);

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedicines, currentPage]);

  const exportToCSV = () => {
    const headers = ['Name', 'Generic Name', 'Company', 'Category', 'Pack Size', 'MRP', 'Purchase Price', 'Barcode'];
    const csvContent = [
      headers.join(','),
      ...medicines.map(m => [
        m.name,
        m.genericName,
        m.company,
        m.category,
        m.packSize,
        m.mrp,
        m.purchasePrice,
        m.barcode
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicines_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showNotification('Medicines exported successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medicine Database</h1>
                <p className="text-sm text-gray-500">BUILD 1 - Village Pharmacy PMS</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <div className="text-sm text-gray-500">Total Medicines</div>
                <div className="text-2xl font-bold text-blue-600">{medicines.length}</div>
              </div>
              
              <button
                onClick={() => setView('add')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
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
            <button
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {view === 'list' && (
          <MedicineList
            medicines={paginatedMedicines}
            allMedicines={filteredMedicines}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={categories}
            onEdit={(medicine) => {
              setEditingMedicine(medicine);
              setView('edit');
            }}
            onDelete={deleteMedicine}
            onExport={exportToCSV}
            onImport={() => setView('import')}
            onManageCategories={() => setShowCategoryManager(true)}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            totalItems={filteredMedicines.length}
          />
        )}

        {view === 'add' && (
          <MedicineForm
            onSubmit={addMedicine}
            onCancel={() => setView('list')}
            categories={categories}
          />
        )}

        {view === 'edit' && editingMedicine && (
          <MedicineForm
            medicine={editingMedicine}
            onSubmit={updateMedicine}
            onCancel={() => {
              setEditingMedicine(null);
              setView('list');
            }}
            categories={categories}
            isEdit
          />
        )}

        {view === 'import' && (
          <ImportMedicines
            onImport={(importedMedicines) => {
              setMedicines([...medicines, ...importedMedicines]);
              setView('list');
              showNotification(`${importedMedicines.length} medicines imported successfully!`, 'success');
            }}
            onCancel={() => setView('list')}
            categories={categories}
          />
        )}
      </div>

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          setCategories={setCategories}
          onClose={() => setShowCategoryManager(false)}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}

// ==================== MEDICINE LIST ====================

function MedicineList({
  medicines,
  allMedicines,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  categories,
  onEdit,
  onDelete,
  onExport,
  onImport,
  onManageCategories,
  currentPage,
  totalPages,
  setCurrentPage,
  totalItems
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, generic name, company, or barcode..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4 pt-4 border-t">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={onImport}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
          <button
            onClick={onManageCategories}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Package className="w-4 h-4" />
            Manage Categories
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {medicines.length === 0 ? 0 : ((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalItems)} of {totalItems} {totalItems === 1 ? 'medicine' : 'medicines'}
        </p>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {medicines.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No medicines found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <MedicineTable
          medicines={medicines}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

// ==================== MEDICINE TABLE ====================

function MedicineTable({ medicines, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pack Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {medicines.map(medicine => (
              <tr key={medicine.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{medicine.name}</div>
                  <div className="text-sm text-gray-500">{medicine.genericName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.company}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {medicine.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.packSize}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹{medicine.mrp.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{medicine.purchasePrice.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                  ₹{(medicine.mrp - medicine.purchasePrice).toFixed(2)}
                  <div className="text-xs text-gray-500">
                    ({(((medicine.mrp - medicine.purchasePrice) / medicine.purchasePrice) * 100).toFixed(1)}%)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{medicine.barcode}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(medicine)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(medicine.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
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
    </div>
  );
}

// ==================== MEDICINE FORM ====================

function MedicineForm({ medicine, onSubmit, onCancel, categories, isEdit = false }) {
  const [formData, setFormData] = useState(medicine || {
    name: '',
    genericName: '',
    company: '',
    category: categories[0],
    packSize: '',
    mrp: '',
    purchasePrice: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Medicine name is required';
    if (!formData.genericName.trim()) newErrors.genericName = 'Generic name is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.packSize.trim()) newErrors.packSize = 'Pack size is required';
    if (!formData.mrp || formData.mrp <= 0) newErrors.mrp = 'Valid MRP is required';
    if (!formData.purchasePrice || formData.purchasePrice <= 0) newErrors.purchasePrice = 'Valid purchase price is required';
    if (parseFloat(formData.purchasePrice) >= parseFloat(formData.mrp)) newErrors.purchasePrice = 'Purchase price must be less than MRP';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        ...formData,
        mrp: parseFloat(formData.mrp),
        purchasePrice: parseFloat(formData.purchasePrice)
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Edit Medicine' : 'Add New Medicine'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicine Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder="e.g., Paracetamol"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generic Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.genericName}
              onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.genericName ? 'border-red-500' : ''
              }`}
              placeholder="e.g., Acetaminophen"
            />
            {errors.genericName && <p className="text-red-600 text-sm mt-1">{errors.genericName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company/Manufacturer <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.company ? 'border-red-500' : ''
              }`}
              placeholder="e.g., Cipla Ltd"
            />
            {errors.company && <p className="text-red-600 text-sm mt-1">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pack Size <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.packSize}
              onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.packSize ? 'border-red-500' : ''
              }`}
              placeholder="e.g., 10 tablets, 100ml"
            />
            {errors.packSize && <p className="text-red-600 text-sm mt-1">{errors.packSize}</p>}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MRP (Maximum Retail Price) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.mrp ? 'border-red-500' : ''
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.mrp && <p className="text-red-600 text-sm mt-1">{errors.mrp}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price (Your Cost) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.purchasePrice ? 'border-red-500' : ''
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.purchasePrice && <p className="text-red-600 text-sm mt-1">{errors.purchasePrice}</p>}
            </div>
          </div>

          {formData.mrp && formData.purchasePrice && parseFloat(formData.mrp) > parseFloat(formData.purchasePrice) && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Expected profit per unit:</span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{(parseFloat(formData.mrp) - parseFloat(formData.purchasePrice)).toFixed(2)}
                  <span className="text-sm text-gray-600 ml-2">
                    ({(((parseFloat(formData.mrp) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice)) * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {isEdit && medicine.barcode && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Barcode</h3>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Barcode className="w-6 h-6 text-gray-600" />
              <span className="font-mono text-lg text-gray-900">{medicine.barcode}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-6 border-t">
          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            {isEdit ? 'Update Medicine' : 'Add Medicine'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== IMPORT MEDICINES ====================

function ImportMedicines({ onImport, onCancel, categories }) {
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState(null);

  const downloadTemplate = () => {
    const template = [
      ['Medicine Name', 'Generic Name', 'Company', 'Category', 'Pack Size', 'MRP', 'Purchase Price'],
      ['Paracetamol', 'Acetaminophen', 'Cipla Ltd', 'Analgesic', '10 tablets', '12.50', '8.00'],
      ['Crocin', 'Paracetamol', 'GSK', 'Antipyretic', '15 tablets', '15.00', '10.50']
    ];
    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medicine_import_template.csv';
    a.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          const mappedData = jsonData.map((row, index) => ({
            id: Date.now() + index,
            name: row['Medicine Name'] || row['Name'] || '',
            genericName: row['Generic Name'] || row['Generic'] || '',
            company: row['Company'] || row['Manufacturer'] || '',
            category: row['Category'] || categories[0],
            packSize: row['Pack Size'] || row['Pack'] || '',
            mrp: parseFloat(row['MRP'] || 0),
            purchasePrice: parseFloat(row['Purchase Price'] || row['Price'] || 0),
            barcode: `MED-${String(Date.now() + index).slice(-6)}`,
            addedDate: new Date().toISOString().split('T')[0]
          }));

          setPreview(mappedData);
          setImporting(false);
        } catch (err) {
          setError('Error parsing file. Please check the format.');
          setImporting(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('Error reading file. Please try again.');
      setImporting(false);
    }
  };

  const handleImport = () => {
    onImport(preview);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Import Medicines from Excel</h2>
        <button onClick={onCancel} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Excel Format Instructions:</h3>
          <p className="text-sm text-blue-800 mb-2">Your Excel file should have these columns:</p>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li>Medicine Name (required)</li>
            <li>Generic Name (required)</li>
            <li>Company or Manufacturer (required)</li>
            <li>Category</li>
            <li>Pack Size (e.g., 10 tablets)</li>
            <li>MRP (number)</li>
            <li>Purchase Price (number)</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Need a template?</h3>
              <p className="text-sm text-green-800">Download our Excel template with proper column headers</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Excel File (.xlsx, .xls)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {importing && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Processing file...</p>
          </div>
        )}

        {preview.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Preview ({preview.length} medicines found)
            </h3>
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Generic</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Company</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">MRP</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preview.slice(0, 10).map((med, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{med.name}</td>
                      <td className="px-4 py-2 text-sm">{med.genericName}</td>
                      <td className="px-4 py-2 text-sm">{med.company}</td>
                      <td className="px-4 py-2 text-sm">₹{med.mrp.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm">₹{med.purchasePrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 10 && (
              <p className="text-sm text-gray-500 mt-2">Showing first 10 of {preview.length} medicines</p>
            )}
          </div>
        )}

        {preview.length > 0 && (
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleImport}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Import {preview.length} Medicines
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== CATEGORY MANAGER ====================

function CategoryManager({ categories, setCategories, onClose, showNotification }) {
  const [newCategory, setNewCategory] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
      showNotification('Category added successfully!', 'success');
    }
  };

  const deleteCategory = (index) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter((_, i) => i !== index));
      showNotification('Category deleted successfully!', 'success');
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditValue(categories[index]);
  };

  const saveEdit = () => {
    if (editValue.trim() && !categories.includes(editValue.trim())) {
      const updated = [...categories];
      updated[editingIndex] = editValue.trim();
      setCategories(updated);
      setEditingIndex(null);
      setEditValue('');
      showNotification('Category updated successfully!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Manage Categories</h2>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add New Category</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                placeholder="Enter category name..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Existing Categories ({categories.length})</h3>
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <span className="text-gray-900">{category}</span>
                  )}
                  <div className="flex gap-2">
                    {editingIndex === index ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(index)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}