import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, Plus, Search, Calendar, AlertTriangle, CheckCircle, Clock, X, RefreshCw, Building2 } from 'lucide-react';
import { paymentsAPI, suppliersAPI } from '../services/api';

export default function PaymentTrackingApp({ appData, setAppData }) {
  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [view, setView] = useState('list');
  const [editingPayment, setEditingPayment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, suppliersRes] = await Promise.all([
        paymentsAPI.getAll(),
        suppliersAPI.getAll()
      ]);

      if (paymentsRes.success) setPayments(paymentsRes.data);
      if (suppliersRes.success) setSuppliers(suppliersRes.data);

      showNotification('✅ Data loaded from database', 'success');
    } catch (error) {
      showNotification('❌ Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addPayment = async (paymentData) => {
    try {
      setLoading(true);
      const response = await paymentsAPI.add(paymentData);
      
      if (response.success) {
        setPayments([...payments, response.data]);
        setView('list');
        showNotification('✅ Payment saved to database!', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to add payment: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePayment = async (paymentData) => {
    try {
      setLoading(true);
      const response = await paymentsAPI.update(paymentData.id, paymentData);
      
      if (response.success) {
        setPayments(payments.map(p => p.id === paymentData.id ? response.data : p));
        setEditingPayment(null);
        setView('list');
        showNotification('✅ Payment updated in database!', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to update payment: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deletePayment = async (id) => {
    if (window.confirm('⚠️ Delete this payment record from database?')) {
      try {
        setLoading(true);
        const response = await paymentsAPI.delete(id);
        
        if (response.success) {
          setPayments(payments.filter(p => p.id !== id));
          showNotification('✅ Payment deleted from database!', 'success');
        }
      } catch (error) {
        showNotification('❌ Failed to delete payment: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const markAsPaid = async (payment) => {
    const updatedPayment = {
      ...payment,
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0]
    };
    await updatePayment(updatedPayment);
  };

  const filteredPayments = useMemo(() => {
    let filtered = payments;

    if (filterStatus !== 'all') {
      if (filterStatus === 'overdue') {
        const today = new Date();
        filtered = filtered.filter(p => 
          p.status === 'pending' && new Date(p.due_date) < today
        );
      } else {
        filtered = filtered.filter(p => p.status === filterStatus);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(p => {
        const supplier = suppliers.find(s => s.id === p.supplier_id);
        return (
          p.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [payments, filterStatus, searchTerm, suppliers]);

  const stats = useMemo(() => {
    const pending = payments.filter(p => p.status === 'pending');
    const today = new Date();
    const overdue = pending.filter(p => new Date(p.due_date) < today);

    return {
      totalPending: pending.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      overdueAmount: overdue.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      overdueCount: overdue.length,
      pendingCount: pending.length
    };
  }, [payments]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-orange-600 to-red-600 shadow-lg border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Payment Tracking</h1>
                <p className="text-sm text-orange-100">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={() => setView('add')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Payment
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
                <AlertTriangle className="w-5 h-5 text-red-600" />
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingCount}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Pending</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">₹{stats.totalPending.toFixed(0)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Overdue Count</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdueCount}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Overdue Amount</p>
                <p className="text-2xl font-bold text-red-600 mt-1">₹{stats.overdueAmount.toFixed(0)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-red-600" />
            </div>
          </div>
        </div>

        {view === 'list' && (
          <PaymentList
            payments={filteredPayments}
            suppliers={suppliers}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onEdit={(payment) => {
              setEditingPayment(payment);
              setView('edit');
            }}
            onDelete={deletePayment}
            onMarkPaid={markAsPaid}
            loading={loading}
          />
        )}

        {(view === 'add' || view === 'edit') && (
          <PaymentForm
            payment={editingPayment}
            suppliers={suppliers}
            onSave={view === 'add' ? addPayment : updatePayment}
            onCancel={() => {
              setEditingPayment(null);
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

function PaymentList({ payments, suppliers, filterStatus, setFilterStatus, searchTerm, setSearchTerm, onEdit, onDelete, onMarkPaid, loading }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading payments from database...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No payments found</p>
          <p className="text-gray-400 text-sm">Add your first payment record</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {payments.map(payment => {
            const supplier = suppliers.find(s => s.id === payment.supplier_id);
            const isOverdue = payment.status === 'pending' && new Date(payment.due_date) < new Date();
            
            return (
              <div
                key={payment.id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border-l-4 ${
                  isOverdue ? 'border-red-500' : payment.status === 'paid' ? 'border-green-500' : 'border-orange-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{supplier?.name || 'Unknown Supplier'}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                        isOverdue ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {isOverdue ? 'OVERDUE' : payment.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-500">Invoice</p>
                        <p className="font-semibold text-gray-900">{payment.invoice_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-semibold text-gray-900">₹{parseFloat(payment.amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Due Date</p>
                        <p className="font-semibold text-gray-900">{new Date(payment.due_date).toLocaleDateString()}</p>
                      </div>
                      {payment.paid_date && (
                        <div>
                          <p className="text-sm text-gray-500">Paid Date</p>
                          <p className="font-semibold text-gray-900">{new Date(payment.paid_date).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => onMarkPaid(payment)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(payment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PaymentForm({ payment, suppliers, onSave, onCancel, isEdit, loading }) {
  const [formData, setFormData] = useState(payment || {
    supplier_id: suppliers[0]?.id || '',
    invoice_number: '',
    amount: '',
    due_date: '',
    paid_date: '',
    status: 'pending',
    payment_method: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isEdit ? '✏️ Edit Payment' : '➕ Add New Payment'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
            <select
              required
              value={formData.supplier_id}
              onChange={(e) => setFormData({...formData, supplier_id: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Supplier</option>
              {suppliers.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number *</label>
            <input
              type="text"
              required
              value={formData.invoice_number}
              onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="INV-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
            <input
              type="date"
              required
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {formData.status === 'paid' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Paid Date</label>
              <input
                type="date"
                value={formData.paid_date}
                onChange={(e) => setFormData({...formData, paid_date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              rows="3"
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Payment' : 'Add Payment')}
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