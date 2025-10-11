import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  X, 
  CheckCircle, 
  Phone, 
  Building2, 
  DollarSign, 
  AlertCircle, 
  Edit2, 
  Trash2,
  TrendingUp,    // ADD THIS
  Clock,         // ADD THIS
  FileText,      // ADD THIS
  Download       // ADD THIS
} from 'lucide-react';

// ==================== MOCK DATA ====================
const INITIAL_SUPPLIERS = [
  { id: 1, name: 'MediSupply Distributors', contact: '9876543210', address: 'Market Road, Jeddah', email: 'medisupply@example.com', creditDays: 40 },
  { id: 2, name: 'PharmaCare Wholesalers', contact: '9876543211', address: 'Central Market, Jeddah', email: 'pharmacare@example.com', creditDays: 30 },
  { id: 3, name: 'HealthPlus Suppliers', contact: '9876543212', address: 'Medical Street, Jeddah', email: 'healthplus@example.com', creditDays: 45 }
];

const SAMPLE_SUPPLIERS = [
  { id: 1, name: 'MediSupply Distributors' },
  { id: 2, name: 'PharmaCare Wholesalers' },
  { id: 3, name: 'HealthPlus Suppliers' },
  { id: 4, name: 'Global Pharma Trading' }
];

const SAMPLE_INVOICES = [
  { 
    id: 1, 
    supplierId: 1, 
    supplierName: 'MediSupply Distributors', 
    invoiceNumber: 'INV-2024-001', 
    invoiceDate: '2024-09-15', 
    amount: 15680, 
    paid: 15680, 
    balance: 0, 
    dueDate: '2024-10-25', 
    status: 'paid',
    paymentHistory: [
      { date: '2024-09-20', amount: 15680, method: 'Bank Transfer', reference: 'TXN-001' }
    ]
  },
  { 
    id: 2, 
    supplierId: 2, 
    supplierName: 'PharmaCare Wholesalers', 
    invoiceNumber: 'INV-2024-002', 
    invoiceDate: '2024-09-20', 
    amount: 22340, 
    paid: 0, 
    balance: 22340, 
    dueDate: '2024-10-20', 
    status: 'overdue',
    paymentHistory: []
  },
  { 
    id: 3, 
    supplierId: 1, 
    supplierName: 'MediSupply Distributors', 
    invoiceNumber: 'INV-2024-003', 
    invoiceDate: '2024-09-25', 
    amount: 18920, 
    paid: 10000, 
    balance: 8920, 
    dueDate: '2024-11-04', 
    status: 'partial',
    paymentHistory: [
      { date: '2024-09-30', amount: 10000, method: 'Cash', reference: 'CASH-001' }
    ]
  },
  { 
    id: 4, 
    supplierId: 3, 
    supplierName: 'HealthPlus Suppliers', 
    invoiceNumber: 'INV-2024-004', 
    invoiceDate: '2024-09-28', 
    amount: 31250, 
    paid: 0, 
    balance: 31250, 
    dueDate: '2024-11-12', 
    status: 'pending',
    paymentHistory: []
  },
  { 
    id: 5, 
    supplierId: 2, 
    supplierName: 'PharmaCare Wholesalers', 
    invoiceNumber: 'INV-2024-005', 
    invoiceDate: '2024-10-01', 
    amount: 12890, 
    paid: 12890, 
    balance: 0, 
    dueDate: '2024-10-31', 
    status: 'paid',
    paymentHistory: [
      { date: '2024-10-15', amount: 12890, method: 'Bank Transfer', reference: 'TXN-002' }
    ]
  },
  { 
    id: 6, 
    supplierId: 1, 
    supplierName: 'MediSupply Distributors', 
    invoiceNumber: 'INV-2024-006', 
    invoiceDate: '2024-10-03', 
    amount: 27560, 
    paid: 0, 
    balance: 27560, 
    dueDate: '2024-11-12', 
    status: 'pending',
    paymentHistory: []
  },
  { 
    id: 7, 
    supplierId: 4, 
    supplierName: 'Global Pharma Trading', 
    invoiceNumber: 'INV-2024-007', 
    invoiceDate: '2024-10-04', 
    amount: 45600, 
    paid: 0, 
    balance: 45600, 
    dueDate: '2024-12-03', 
    status: 'pending',
    paymentHistory: []
  },
  { 
    id: 8, 
    supplierId: 2, 
    supplierName: 'PharmaCare Wholesalers', 
    invoiceNumber: 'INV-2024-008', 
    invoiceDate: '2024-10-05', 
    amount: 19340, 
    paid: 5000, 
    balance: 14340, 
    dueDate: '2024-11-04', 
    status: 'partial',
    paymentHistory: [
      { date: '2024-10-08', amount: 5000, method: 'Cash', reference: 'CASH-002' }
    ]
  },
];

// ==================== MAIN APP COMPONENT ====================

export default function PaymentTrackingApp({ appData, setAppData }) {
  const [invoices, setInvoices] = useState(SAMPLE_INVOICES);
  const [suppliers] = useState(INITIAL_SUPPLIERS);
  const [view, setView] = useState('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const makePayment = (invoiceId, paymentData) => {
    setInvoices(invoices.map(inv => {
      if (inv.id === invoiceId) {
        const newPaid = inv.paid + paymentData.amount;
        const newBalance = inv.amount - newPaid;
        return {
          ...inv,
          paid: newPaid,
          balance: newBalance,
          status: newBalance === 0 ? 'paid' : 'partial',
          paymentHistory: [...inv.paymentHistory, paymentData]
        };
      }
      return inv;
    }));
    setSelectedInvoice(null);
    showNotification('Payment recorded successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <header className="bg-white shadow-md border-b-2 border-green-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Payment Tracking System
                </h1>
                <p className="text-sm text-gray-500">BUILD 9 - Track All Supplier Payments</p>
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
        <div className="mb-6">
          <div className="flex gap-2">
            {[
              { id: 'dashboard', label: 'Payment Dashboard', icon: TrendingUp },
              { id: 'pending', label: 'Pending Payments', icon: Clock },
              { id: 'history', label: 'Payment History', icon: FileText },
              { id: 'supplier-summary', label: 'Supplier Summary', icon: DollarSign }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  view === tab.id
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {view === 'dashboard' && (
          <PaymentDashboard
            invoices={invoices}
            onMakePayment={(invoice) => setSelectedInvoice(invoice)}
          />
        )}

        {view === 'pending' && (
          <PendingPayments
            invoices={invoices.filter(inv => inv.status !== 'paid')}
            onMakePayment={(invoice) => setSelectedInvoice(invoice)}
          />
        )}

        {view === 'history' && (
          <PaymentHistory
            invoices={invoices.filter(inv => inv.paymentHistory.length > 0)}
          />
        )}

        {view === 'supplier-summary' && (
          <SupplierSummary
            invoices={invoices}
            suppliers={suppliers}
          />
        )}

        {selectedInvoice && (
          <PaymentModal
            invoice={selectedInvoice}
            onSubmit={(paymentData) => makePayment(selectedInvoice.id, paymentData)}
            onClose={() => setSelectedInvoice(null)}
          />
        )}
      </div>
    </div>
  );
}

// ==================== PAYMENT DASHBOARD ====================

function PaymentDashboard({ invoices, onMakePayment }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const today = new Date('2024-10-04');

  const stats = {
    totalOutstanding: invoices.reduce((sum, inv) => sum + inv.balance, 0),
    overdue: invoices.filter(inv => new Date(inv.dueDate) < today && inv.balance > 0).length,
    dueThisWeek: invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate >= today && dueDate <= weekFromNow && inv.balance > 0;
    }).length,
    totalPaid: invoices.reduce((sum, inv) => sum + inv.paid, 0)
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const exportToCSV = () => {
    const csvContent = [
      ['Invoice', 'Supplier', 'Date', 'Amount', 'Paid', 'Balance', 'Due Date', 'Status'].join(','),
      ...filteredInvoices.map(inv => [
        inv.invoiceNumber,
        inv.supplierName,
        inv.invoiceDate,
        inv.amount,
        inv.paid,
        inv.balance,
        inv.dueDate,
        inv.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment_tracking_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <h2 className="text-xl font-bold text-gray-900">Payment Overview</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold text-gray-900">Total Outstanding</td>
              <td className="px-6 py-4 text-right text-2xl font-bold text-orange-600">
                ₹{stats.totalOutstanding.toFixed(2)}
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                  Needs Payment
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold text-gray-900">Total Paid (All Time)</td>
              <td className="px-6 py-4 text-right text-2xl font-bold text-green-600">
                ₹{stats.totalPaid.toFixed(2)}
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  Completed
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 bg-red-50">
              <td className="px-6 py-4 font-semibold text-red-900">Overdue Invoices</td>
              <td className="px-6 py-4 text-right text-2xl font-bold text-red-600">
                {stats.overdue}
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-red-600 text-white text-xs rounded-full font-medium">
                  URGENT
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 bg-yellow-50">
              <td className="px-6 py-4 font-semibold text-yellow-900">Due This Week</td>
              <td className="px-6 py-4 text-right text-2xl font-bold text-yellow-600">
                {stats.dueThisWeek}
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-full font-medium">
                  Action Required
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
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

      {/* All Invoices Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-bold text-gray-900">All Invoices ({filteredInvoices.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInvoices.map(invoice => {
                const daysLeft = Math.ceil((new Date(invoice.dueDate) - today) / (1000 * 60 * 60 * 24));
                const isOverdue = daysLeft < 0 && invoice.balance > 0;
                
                return (
                  <tr key={invoice.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{invoice.supplierName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₹{invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ₹{invoice.paid.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-orange-600">
                      ₹{invoice.balance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-bold ${
                        isOverdue ? 'text-red-600' :
                        daysLeft <= 7 ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                        isOverdue ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {invoice.status === 'paid' ? 'Paid' :
                         invoice.status === 'partial' ? 'Partial' :
                         isOverdue ? 'Overdue' :
                         'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {invoice.balance > 0 && (
                        <button
                          onClick={() => onMakePayment(invoice)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Pay Now
                        </button>
                      )}
                      {invoice.balance === 0 && (
                        <span className="text-green-600 text-sm font-medium">✓ Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== PENDING PAYMENTS ====================

function PendingPayments({ invoices, onMakePayment }) {
  const today = new Date('2024-10-04');

  const categorized = {
    overdue: invoices.filter(inv => new Date(inv.dueDate) < today),
    dueThisWeek: invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate >= today && dueDate <= weekFromNow;
    }),
    upcoming: invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate > weekFromNow;
    })
  };

  const PendingTable = ({ title, data, color, bgColor }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className={`px-6 py-4 ${bgColor} border-b`}>
        <h2 className="text-lg font-bold text-gray-900">
          {title} ({data.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map(invoice => {
              const daysLeft = Math.ceil((new Date(invoice.dueDate) - today) / (1000 * 60 * 60 * 24));
              
              return (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{invoice.supplierName}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ₹{invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    ₹{invoice.paid.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-orange-600">
                    ₹{invoice.balance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-bold ${color}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} overdue` : `${daysLeft} days`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onMakePayment(invoice)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Pay Now
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2">
            <tr>
              <td colSpan="4" className="px-6 py-4 text-right font-bold text-gray-900">TOTAL:</td>
              <td className="px-6 py-4 text-lg font-bold text-orange-600">
                ₹{data.reduce((sum, inv) => sum + inv.balance, 0).toFixed(2)}
              </td>
              <td colSpan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PendingTable 
        title="🚨 OVERDUE - Pay Immediately"
        data={categorized.overdue}
        color="text-red-600"
        bgColor="bg-red-50"
      />
      
      <PendingTable 
        title="⚠️ Due This Week"
        data={categorized.dueThisWeek}
        color="text-orange-600"
        bgColor="bg-orange-50"
      />
      
      <PendingTable 
        title="📅 Upcoming Payments"
        data={categorized.upcoming}
        color="text-blue-600"
        bgColor="bg-blue-50"
      />
    </div>
  );
}

// ==================== PAYMENT HISTORY ====================

function PaymentHistory({ invoices }) {
  const allPayments = [];
  
  invoices.forEach(invoice => {
    invoice.paymentHistory.forEach(payment => {
      allPayments.push({
        ...payment,
        invoiceNumber: invoice.invoiceNumber,
        supplierName: invoice.supplierName
      });
    });
  });

  const sortedPayments = allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
        <p className="text-sm text-gray-600 mt-1">All payments made to suppliers</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedPayments.map((payment, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(payment.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">
                  {payment.invoiceNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{payment.supplierName}</td>
                <td className="px-6 py-4 text-lg font-bold text-green-600">
                  ₹{payment.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payment.method === 'Bank Transfer' ? 'bg-blue-100 text-blue-700' :
                    payment.method === 'Cash' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {payment.method}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-gray-600">{payment.reference}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2">
            <tr>
              <td colSpan="3" className="px-6 py-4 text-right font-bold text-gray-900">TOTAL PAID:</td>
              <td className="px-6 py-4 text-2xl font-bold text-green-600">
                ₹{sortedPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ==================== SUPPLIER SUMMARY ====================

function SupplierSummary({ invoices, suppliers }) {
  const summaryData = suppliers.map(supplier => {
    const supplierInvoices = invoices.filter(inv => inv.supplierId === supplier.id);
    
    return {
      ...supplier,
      totalInvoices: supplierInvoices.length,
      totalAmount: supplierInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      totalPaid: supplierInvoices.reduce((sum, inv) => sum + inv.paid, 0),
      totalBalance: supplierInvoices.reduce((sum, inv) => sum + inv.balance, 0),
      pendingCount: supplierInvoices.filter(inv => inv.status !== 'paid').length
    };
  }).sort((a, b) => b.totalBalance - a.totalBalance);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <h2 className="text-xl font-bold text-gray-900">Supplier Payment Summary</h2>
        <p className="text-sm text-gray-600 mt-1">Outstanding balances by supplier</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Invoices</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Invoices</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment %</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {summaryData.map((supplier, index) => {
              const paymentPercentage = supplier.totalAmount > 0 
                ? (supplier.totalPaid / supplier.totalAmount) * 100 
                : 0;
              
              return (
                <tr key={supplier.id} className={`hover:bg-gray-50 ${
                  supplier.totalBalance > 20000 ? 'bg-orange-50' : ''
                }`}>
                  <td className="px-6 py-4">
                    <span className="font-bold text-purple-600">#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{supplier.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{supplier.totalInvoices}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ₹{supplier.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    ₹{supplier.totalPaid.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-orange-600">
                    ₹{supplier.totalBalance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      supplier.pendingCount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {supplier.pendingCount} pending
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            paymentPercentage === 100 ? 'bg-green-600' :
                            paymentPercentage >= 50 ? 'bg-blue-600' :
                            'bg-orange-600'
                          }`}
                          style={{ width: `${paymentPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12">
                        {paymentPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2">
            <tr>
              <td colSpan="3" className="px-6 py-4 text-right font-bold text-gray-900">GRAND TOTAL:</td>
              <td className="px-6 py-4 text-lg font-bold text-gray-900">
                ₹{summaryData.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-lg font-bold text-green-600">
                ₹{summaryData.reduce((sum, s) => sum + s.totalPaid, 0).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-xl font-bold text-orange-600">
                ₹{summaryData.reduce((sum, s) => sum + s.totalBalance, 0).toFixed(2)}
              </td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ==================== PAYMENT MODAL ====================

function PaymentModal({ invoice, onSubmit, onClose }) {
  const [paymentData, setPaymentData] = useState({
    amount: invoice.balance,
    method: 'Bank Transfer',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (paymentData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (paymentData.amount > invoice.balance) {
      setError('Amount cannot exceed balance');
      return;
    }
    if (!paymentData.reference.trim()) {
      setError('Reference number is required');
      return;
    }

    onSubmit(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Make Payment</h2>
            <button onClick={onClose} className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Invoice Details Table */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Invoice Details</h3>
            <table className="w-full border">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 bg-gray-50 font-medium text-gray-700">Invoice Number</td>
                  <td className="px-4 py-2 font-mono font-semibold">{invoice.invoiceNumber}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 bg-gray-50 font-medium text-gray-700">Supplier</td>
                  <td className="px-4 py-2">{invoice.supplierName}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 bg-gray-50 font-medium text-gray-700">Total Amount</td>
                  <td className="px-4 py-2 font-semibold">₹{invoice.amount.toFixed(2)}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 bg-gray-50 font-medium text-gray-700">Already Paid</td>
                  <td className="px-4 py-2 font-semibold text-green-600">₹{invoice.paid.toFixed(2)}</td>
                </tr>
                <tr className="bg-orange-50">
                  <td className="px-4 py-2 bg-orange-100 font-bold text-orange-900">Outstanding Balance</td>
                  <td className="px-4 py-2 text-xl font-bold text-orange-600">₹{invoice.balance.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  max={invoice.balance}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Maximum: ₹{invoice.balance.toFixed(2)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-600">*</span>
              </label>
              <select
                value={paymentData.method}
                onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference/Transaction Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={paymentData.reference}
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., TXN-12345 or CASH-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={paymentData.date}
                onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Payment
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}