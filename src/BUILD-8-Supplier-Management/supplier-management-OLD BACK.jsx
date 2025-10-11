import React, { useState, useMemo } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, X, Save, Phone, Mail, MapPin, Calendar, Package, DollarSign, TrendingUp, Clock, Star, FileText, Download, Filter, ChevronDown, ChevronUp } from 'lucide-react';

// ==================== MOCK DATA ====================

const SAMPLE_SUPPLIERS = [
  {
    id: 1,
    name: 'MediSupply Distributors',
    contactPerson: 'Ahmed Al-Rashid',
    phone: '+966 555 123 4567',
    email: 'ahmed@medisupply.sa',
    address: 'King Fahd Road, Riyadh',
    city: 'Riyadh',
    paymentTerms: 40,
    creditLimit: 50000,
    gstNumber: 'GST-MS-001',
    rating: 4.5,
    status: 'active',
    addedDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'PharmaCare Wholesalers',
    contactPerson: 'Fatima Hassan',
    phone: '+966 555 234 5678',
    email: 'fatima@pharmacare.sa',
    address: 'Olaya Street, Riyadh',
    city: 'Riyadh',
    paymentTerms: 30,
    creditLimit: 75000,
    gstNumber: 'GST-PC-002',
    rating: 4.8,
    status: 'active',
    addedDate: '2024-02-01'
  },
  {
    id: 3,
    name: 'HealthPlus Suppliers',
    contactPerson: 'Mohammed Abdullah',
    phone: '+966 555 345 6789',
    email: 'mohammed@healthplus.sa',
    address: 'Makkah Road, Jeddah',
    city: 'Jeddah',
    paymentTerms: 45,
    creditLimit: 100000,
    gstNumber: 'GST-HP-003',
    rating: 4.2,
    status: 'active',
    addedDate: '2024-03-10'
  },
  {
    id: 4,
    name: 'Global Pharma Trading',
    contactPerson: 'Sara Al-Mansoori',
    phone: '+966 555 456 7890',
    email: 'sara@globalpharma.sa',
    address: 'Industrial Area, Dammam',
    city: 'Dammam',
    paymentTerms: 60,
    creditLimit: 150000,
    gstNumber: 'GST-GP-004',
    rating: 3.9,
    status: 'active',
    addedDate: '2024-04-05'
  }
];

const SAMPLE_PURCHASES = [
  { id: 1, supplierId: 1, supplierName: 'MediSupply Distributors', invoiceNumber: 'INV-2024-001', date: '2024-09-15', amount: 15680, paid: 15680, balance: 0, dueDate: '2024-10-25', status: 'paid' },
  { id: 2, supplierId: 2, supplierName: 'PharmaCare Wholesalers', invoiceNumber: 'INV-2024-002', date: '2024-09-20', amount: 22340, paid: 0, balance: 22340, dueDate: '2024-10-20', status: 'pending' },
  { id: 3, supplierId: 1, supplierName: 'MediSupply Distributors', invoiceNumber: 'INV-2024-003', date: '2024-09-25', amount: 18920, paid: 10000, balance: 8920, dueDate: '2024-11-04', status: 'partial' },
  { id: 4, supplierId: 3, supplierName: 'HealthPlus Suppliers', invoiceNumber: 'INV-2024-004', date: '2024-09-28', amount: 31250, paid: 0, balance: 31250, dueDate: '2024-11-12', status: 'pending' },
  { id: 5, supplierId: 2, supplierName: 'PharmaCare Wholesalers', invoiceNumber: 'INV-2024-005', date: '2024-10-01', amount: 12890, paid: 12890, balance: 0, dueDate: '2024-10-31', status: 'paid' },
  { id: 6, supplierId: 1, supplierName: 'MediSupply Distributors', invoiceNumber: 'INV-2024-006', date: '2024-10-03', amount: 27560, paid: 0, balance: 27560, dueDate: '2024-11-12', status: 'pending' },
  { id: 7, supplierId: 4, supplierName: 'Global Pharma Trading', invoiceNumber: 'INV-2024-007', date: '2024-10-04', amount: 45600, paid: 0, balance: 45600, dueDate: '2024-12-03', status: 'pending' },
];

// ==================== MAIN APP COMPONENT ====================

export default function SupplierManagementApp({ appData, setAppData }) {
  const [suppliers, setSuppliers] = useState(SAMPLE_SUPPLIERS);
  const [purchases, setPurchases] = useState(SAMPLE_PURCHASES);
  const [view, setView] = useState('list');
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addSupplier = (supplierData) => {
    const newSupplier = {
      ...supplierData,
      id: suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
      addedDate: new Date().toISOString().split('T')[0]
    };
    setSuppliers([...suppliers, newSupplier]);
    setView('list');
    showNotification('Supplier added successfully!', 'success');
  };

  const updateSupplier = (supplierData) => {
    setSuppliers(suppliers.map(s => s.id === supplierData.id ? supplierData : s));
    setEditingSupplier(null);
    setView('list');
    showNotification('Supplier updated successfully!', 'success');
  };

  const deleteSupplier = (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
      showNotification('Supplier deleted successfully!', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white shadow-md border-b-2 border-indigo-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Supplier Management
                </h1>
                <p className="text-sm text-gray-500">BUILD 8 - Manage Your Supplier Network</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <div className="text-sm text-gray-500">Active Suppliers</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {suppliers.filter(s => s.status === 'active').length}
                </div>
              </div>
              
              <button
                onClick={() => setView('add')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Supplier
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
        {view === 'list' && !selectedSupplier && (
          <SupplierList
            suppliers={suppliers}
            purchases={purchases}
            onEdit={(supplier) => {
              setEditingSupplier(supplier);
              setView('edit');
            }}
            onDelete={deleteSupplier}
            onViewDetails={(supplier) => setSelectedSupplier(supplier)}
          />
        )}

        {view === 'add' && (
          <SupplierForm
            onSubmit={addSupplier}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'edit' && editingSupplier && (
          <SupplierForm
            supplier={editingSupplier}
            onSubmit={updateSupplier}
            onCancel={() => {
              setEditingSupplier(null);
              setView('list');
            }}
            isEdit
          />
        )}

        {selectedSupplier && (
          <SupplierDetails
            supplier={selectedSupplier}
            purchases={purchases.filter(p => p.supplierId === selectedSupplier.id)}
            onClose={() => setSelectedSupplier(null)}
            onEdit={(supplier) => {
              setEditingSupplier(supplier);
              setSelectedSupplier(null);
              setView('edit');
            }}
          />
        )}
      </div>
    </div>
  );
}

// ==================== SUPPLIER LIST ====================

function SupplierList({ suppliers, purchases, onEdit, onDelete, onViewDetails }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const getSupplierStats = (supplierId) => {
    const supplierPurchases = purchases.filter(p => p.supplierId === supplierId);
    const totalPurchases = supplierPurchases.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = supplierPurchases.reduce((sum, p) => sum + p.paid, 0);
    const totalBalance = supplierPurchases.reduce((sum, p) => sum + p.balance, 0);
    const pendingInvoices = supplierPurchases.filter(p => p.status !== 'paid').length;

    return {
      totalPurchases,
      totalPaid,
      totalBalance,
      pendingInvoices,
      transactionCount: supplierPurchases.length
    };
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, filterStatus]);

  const sortedSuppliers = useMemo(() => {
    return [...filteredSuppliers].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'purchases':
          return getSupplierStats(b.id).totalPurchases - getSupplierStats(a.id).totalPurchases;
        default:
          return 0;
      }
    });
  }, [filteredSuppliers, sortBy]);

  const overallStats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter(s => s.status === 'active').length,
    totalOutstanding: suppliers.reduce((sum, s) => sum + getSupplierStats(s.id).totalBalance, 0),
    avgRating: suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Contact Person', 'Phone', 'Email', 'City', 'Payment Terms', 'Rating', 'Status'].join(','),
      ...suppliers.map(s => [
        s.name,
        s.contactPerson,
        s.phone,
        s.email,
        s.city,
        s.paymentTerms,
        s.rating,
        s.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suppliers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Suppliers"
          value={overallStats.totalSuppliers}
          icon={Building2}
          color="from-blue-500 to-indigo-600"
          subtitle={`${overallStats.activeSuppliers} active`}
        />
        <StatCard
          title="Outstanding Amount"
          value={`₹${overallStats.totalOutstanding.toFixed(0)}`}
          icon={DollarSign}
          color="from-orange-500 to-red-600"
          subtitle="To be paid"
        />
        <StatCard
          title="Average Rating"
          value={overallStats.avgRating.toFixed(1)}
          icon={Star}
          color="from-yellow-500 to-orange-600"
          subtitle="Out of 5.0"
        />
        <StatCard
          title="Total Purchases"
          value={`₹${purchases.reduce((sum, p) => sum + p.amount, 0).toFixed(0)}`}
          icon={Package}
          color="from-green-500 to-emerald-600"
          subtitle={`${purchases.length} invoices`}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, contact person, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
            <option value="purchases">Sort by Purchases</option>
          </select>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Supplier Cards */}
      {sortedSuppliers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No suppliers found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedSuppliers.map(supplier => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              stats={getSupplierStats(supplier.id)}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== SUPPLIER CARD ====================

function SupplierCard({ supplier, stats, onEdit, onDelete, onViewDetails }) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{supplier.name}</h3>
            <p className="text-indigo-100 text-sm">{supplier.contactPerson}</p>
          </div>
          <div className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-white font-bold">{supplier.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-indigo-600" />
            <span>{supplier.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>{supplier.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>{supplier.address}, {supplier.city}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{supplier.paymentTerms} days credit</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg">
          <div>
            <div className="text-xs text-gray-500 mb-1">Total Purchases</div>
            <div className="text-lg font-bold text-indigo-600">₹{stats.totalPurchases.toFixed(0)}</div>
            <div className="text-xs text-gray-500">{stats.transactionCount} invoices</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Outstanding</div>
            <div className={`text-lg font-bold ${stats.totalBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              ₹{stats.totalBalance.toFixed(0)}
            </div>
            <div className="text-xs text-gray-500">{stats.pendingInvoices} pending</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(supplier)}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            View Details
          </button>
          <button
            onClick={() => onEdit(supplier)}
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(supplier.id)}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== SUPPLIER FORM ====================

function SupplierForm({ supplier, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState(supplier || {
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    paymentTerms: 30,
    creditLimit: 0,
    gstNumber: '',
    rating: 5,
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Supplier name is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Supplier' : 'Add New Supplier'}
        </h2>
        <button onClick={onCancel} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="e.g., MediSupply Distributors"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.contactPerson ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="e.g., Ahmed Al-Rashid"
              />
              {errors.contactPerson && <p className="text-red-600 text-sm mt-1">{errors.contactPerson}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="+966 555 123 4567"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="email@supplier.com"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.address ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Street address"
              />
              {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="e.g., Riyadh"
              />
              {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
            </div>
          </div>
        </div>

        {/* Business Terms */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms (Days)
              </label>
              <input
                type="number"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Limit (₹)
              </label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="GST-XXXXX"
              />
            </div>
          </div>
        </div>

        {/* Rating & Status */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating & Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Rating (1-5)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-900">{formData.rating}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            <Save className="w-5 h-5" />
            {isEdit ? 'Update Supplier' : 'Add Supplier'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== SUPPLIER DETAILS ====================

function SupplierDetails({ supplier, purchases, onClose, onEdit }) {
  const [showAllPurchases, setShowAllPurchases] = useState(false);

  const stats = {
    totalPurchases: purchases.reduce((sum, p) => sum + p.amount, 0),
    totalPaid: purchases.reduce((sum, p) => sum + p.paid, 0),
    totalBalance: purchases.reduce((sum, p) => sum + p.balance, 0),
    pendingInvoices: purchases.filter(p => p.status !== 'paid').length,
    overdueInvoices: purchases.filter(p => {
      return p.status !== 'paid' && new Date(p.dueDate) < new Date();
    }).length
  };

  const displayedPurchases = showAllPurchases ? purchases : purchases.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{supplier.name}</h2>
              <p className="text-indigo-100">{supplier.contactPerson}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5 text-indigo-600" />
                <span>{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5 text-indigo-600" />
                <span>{supplier.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <span>{supplier.address}, {supplier.city}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Business Terms</h3>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>{supplier.paymentTerms} days credit period</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <span>Credit Limit: ₹{supplier.creditLimit.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>GST: {supplier.gstNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span>Rating: {supplier.rating} / 5.0</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onEdit(supplier)}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Edit Supplier Details
          </button>
        </div>
      </div>

      {/* Purchase Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ₹{stats.totalPurchases.toFixed(0)}
          </div>
          <div className="text-sm text-gray-500">Total Purchases</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ₹{stats.totalPaid.toFixed(0)}
          </div>
          <div className="text-sm text-gray-500">Amount Paid</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600 mb-1">
            ₹{stats.totalBalance.toFixed(0)}
          </div>
          <div className="text-sm text-gray-500">Outstanding</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.pendingInvoices}
          </div>
          <div className="text-sm text-gray-500">
            Pending ({stats.overdueInvoices} overdue)
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-bold text-gray-900">Purchase History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayedPurchases.map(purchase => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{purchase.invoiceNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(purchase.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ₹{purchase.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600">
                    ₹{purchase.paid.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-orange-600">
                    ₹{purchase.balance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(purchase.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      purchase.status === 'paid' ? 'bg-green-100 text-green-700' :
                      purchase.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      new Date(purchase.dueDate) < new Date() ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {purchase.status === 'paid' ? 'Paid' :
                       purchase.status === 'partial' ? 'Partial' :
                       new Date(purchase.dueDate) < new Date() ? 'Overdue' :
                       'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {purchases.length > 5 && (
          <div className="p-4 border-t text-center">
            <button
              onClick={() => setShowAllPurchases(!showAllPurchases)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {showAllPurchases ? 'Show Less' : `Show All ${purchases.length} Purchases`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== STAT CARD ====================

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </div>
  );
}