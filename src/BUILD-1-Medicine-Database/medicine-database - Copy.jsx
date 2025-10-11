import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { medicinesAPI } from '../services/api';

// ==================== MAIN APP COMPONENT ====================

export default function MedicineDatabaseApp({ appData, setAppData }) {
  const [medicines, setMedicines] = useState([]);
  const [categories] = useState([
    'Analgesic', 'Antibiotic', 'Antacid', 'Antidiabetic', 'Antihypertensive',
    'Antihistamine', 'Antipyretic', 'Antiviral', 'Cardiovascular', 'Dermatology',
    'Gastrointestinal', 'Respiratory', 'Vitamins & Supplements', 'Surgical Items',
    'Baby Care', 'Personal Care', 'Other'
  ]);
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load medicines from backend when component mounts
  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicinesAPI.getAll();
      if (response.success) {
        setMedicines(response.data);
        showNotification(`✅ Loaded ${response.data.length} medicines from database`, 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to load medicines: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addMedicine = async (medicineData) => {
    try {
      setLoading(true);
      const response = await medicinesAPI.add(medicineData);
      
      if (response.success) {
        setMedicines([...medicines, response.data]);
        setView('list');
        showNotification('✅ Medicine saved to database successfully!', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to add medicine: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateMedicine = async (medicineData) => {
    try {
      setLoading(true);
      const response = await medicinesAPI.update(medicineData.id, medicineData);
      
      if (response.success) {
        setMedicines(medicines.map(m => m.id === medicineData.id ? response.data : m));
        setEditingMedicine(null);
        setView('list');
        showNotification('✅ Medicine updated in database!', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to update medicine: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteMedicine = async (id) => {
    if (window.confirm('⚠️ Delete this medicine from database permanently?')) {
      try {
        setLoading(true);
        const response = await medicinesAPI.delete(id);
        
        if (response.success) {
          setMedicines(medicines.filter(m => m.id !== id));
          showNotification('✅ Medicine deleted from database!', 'success');
        }
      } catch (error) {
        showNotification('❌ Failed to delete medicine: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter(medicine => {
      const matchesSearch = 
        medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'All' || medicine.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [medicines, searchTerm, filterCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medicine Database</h1>
                <p className="text-sm text-green-600 font-medium">
                  {loading ? '⏳ Loading...' : '✅ Connected to Supabase Database'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadMedicines}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Refresh from database"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="text-right mr-4">
                <div className="text-sm text-gray-500">Total Medicines</div>
                <div className="text-2xl font-bold text-blue-600">{medicines.length}</div>
              </div>
              
              <button
                onClick={() => setView('add')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {view === 'list' && (
          <MedicineList
            medicines={filteredMedicines}
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
            loading={loading}
          />
        )}

        {(view === 'add' || view === 'edit') && (
          <MedicineForm
            medicine={editingMedicine}
            categories={categories}
            onSave={view === 'add' ? addMedicine : updateMedicine}
            onCancel={() => {
              setEditingMedicine(null);
              setView('list');
            }}
            isEdit={view === 'edit'}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

// ==================== MEDICINE LIST ====================

function MedicineList({ medicines, searchTerm, setSearchTerm, filterCategory, setFilterCategory, categories, onEdit, onDelete, loading }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines by name, generic name, company, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading medicines from database...</p>
        </div>
      ) : medicines.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No medicines found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or add a new medicine</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {medicines.map(medicine => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== MEDICINE CARD ====================

function MedicineCard({ medicine, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border-l-4 border-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {medicine.category}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{medicine.generic_name}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>🏢 {medicine.company}</span>
            <span>📦 {medicine.pack_size}</span>
            <span>🔢 {medicine.barcode}</span>
          </div>
          <div className="mt-3 flex gap-4">
            <span className="text-sm font-semibold text-green-600">MRP: ₹{medicine.mrp}</span>
            <span className="text-sm font-semibold text-blue-600">Purchase: ₹{medicine.purchase_price}</span>
            <span className="text-sm text-gray-500">
              Profit: ₹{(parseFloat(medicine.mrp) - parseFloat(medicine.purchase_price)).toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(medicine)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(medicine.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MEDICINE FORM ====================

function MedicineForm({ medicine, categories, onSave, onCancel, isEdit, loading }) {
  const [formData, setFormData] = useState(medicine || {
    name: '',
    generic_name: '',
    company: '',
    category: categories[0],
    pack_size: '',
    mrp: '',
    purchase_price: '',
    barcode: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isEdit ? '✏️ Edit Medicine' : '➕ Add New Medicine'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Paracetamol"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Generic Name *</label>
            <input
              type="text"
              required
              value={formData.generic_name}
              onChange={(e) => setFormData({...formData, generic_name: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Acetaminophen"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Cipla Ltd"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pack Size *</label>
            <input
              type="text"
              required
              value={formData.pack_size}
              onChange={(e) => setFormData({...formData, pack_size: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 10 tablets"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">MRP (₹) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.mrp}
              onChange={(e) => setFormData({...formData, mrp: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 12.50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.purchase_price}
              onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 8.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData({...formData, barcode: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., MED-000001"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              isEdit ? 'Update Medicine' : 'Add Medicine'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}