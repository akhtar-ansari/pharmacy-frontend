import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Package, AlertTriangle, ShoppingCart, ShoppingBag, Pill, Users, Clock, CheckCircle, XCircle, ArrowRight, Calendar, Activity, Award, TrendingDown, FileText, CreditCard, Bell, Zap } from 'lucide-react';

// ==================== MOCK DATA ====================

const SAMPLE_SALES = [
  { id: 1, date: '2024-10-04', time: '09:15 AM', items: 5, total: 156.50, profit: 45.20, paymentMethod: 'cash' },
  { id: 2, date: '2024-10-04', time: '09:45 AM', items: 3, total: 89.00, profit: 28.50, paymentMethod: 'gpay' },
  { id: 3, date: '2024-10-04', time: '10:20 AM', items: 8, total: 245.00, profit: 78.30, paymentMethod: 'cash' },
  { id: 4, date: '2024-10-03', time: '02:30 PM', items: 4, total: 178.50, profit: 52.10, paymentMethod: 'gpay' },
  { id: 5, date: '2024-10-03', time: '03:15 PM', items: 6, total: 298.00, profit: 95.40, paymentMethod: 'cash' },
  { id: 6, date: '2024-10-02', time: '11:00 AM', items: 7, total: 412.50, profit: 125.60, paymentMethod: 'cash' },
  { id: 7, date: '2024-10-01', time: '04:45 PM', items: 5, total: 189.00, profit: 58.70, paymentMethod: 'gpay' },
];

const SAMPLE_STOCK = [
  { id: 1, medicineName: 'Paracetamol', category: 'Analgesic', currentStock: 145, minStock: 50, expiryDate: '11/2024', daysToExpiry: 27 },
  { id: 2, medicineName: 'Crocin', category: 'Antipyretic', currentStock: 8, minStock: 40, expiryDate: '12/2024', daysToExpiry: 58 },
  { id: 3, medicineName: 'Amoxicillin', category: 'Antibiotic', currentStock: 0, minStock: 30, expiryDate: '03/2025', daysToExpiry: 150 },
  { id: 4, medicineName: 'Cetirizine', category: 'Antihistamine', currentStock: 125, minStock: 50, expiryDate: '09/2025', daysToExpiry: 340 },
  { id: 5, medicineName: 'Omeprazole', category: 'Antacid', currentStock: 15, minStock: 40, expiryDate: '10/2024', daysToExpiry: -4 },
];

const SAMPLE_PAYMENTS = [
  { id: 1, supplier: 'MediSupply Distributors', amount: 27560, dueDate: '2024-10-10', status: 'overdue' },
  { id: 2, supplier: 'PharmaCare Wholesalers', amount: 22340, dueDate: '2024-10-08', status: 'overdue' },
  { id: 3, supplier: 'HealthPlus Suppliers', amount: 31250, dueDate: '2024-10-12', status: 'due-soon' },
];

const TOP_SELLERS = [
  { name: 'Paracetamol', quantity: 125, revenue: 1562.50, category: 'Analgesic' },
  { name: 'Cetirizine', quantity: 98, revenue: 1764.00, category: 'Antihistamine' },
  { name: 'Omeprazole', quantity: 76, revenue: 4180.00, category: 'Antacid' },
  { name: 'Amoxicillin', quantity: 65, revenue: 2925.00, category: 'Antibiotic' },
  { name: 'Crocin', quantity: 54, revenue: 810.00, category: 'Antipyretic' },
];

const DAILY_SALES = [
  { date: 'Mon', sales: 1250, profit: 385 },
  { date: 'Tue', sales: 1480, profit: 445 },
  { date: 'Wed', sales: 1120, profit: 340 },
  { date: 'Thu', sales: 1680, profit: 510 },
  { date: 'Fri', sales: 1890, profit: 575 },
  { date: 'Sat', sales: 2150, profit: 655 },
  { date: 'Sun', sales: 490, profit: 152 },
];

// ==================== MAIN APP COMPONENT ====================

export default function DashboardApp({ appData, setAppData }) {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showAlerts, setShowAlerts] = useState(true);

  const today = new Date('2024-10-04');

  // Calculate statistics
  const stats = useMemo(() => {
    const todaySales = SAMPLE_SALES.filter(s => s.date === '2024-10-04');
    const thisWeekSales = SAMPLE_SALES;
    
    const expiredCount = SAMPLE_STOCK.filter(s => s.daysToExpiry < 0).length;
    const expiringSoonCount = SAMPLE_STOCK.filter(s => s.daysToExpiry >= 0 && s.daysToExpiry <= 30).length;
    const outOfStockCount = SAMPLE_STOCK.filter(s => s.currentStock === 0).length;
    const lowStockCount = SAMPLE_STOCK.filter(s => s.currentStock > 0 && s.currentStock <= s.minStock).length;
    
    const overduePayments = SAMPLE_PAYMENTS.filter(p => p.status === 'overdue').length;
    const dueThisWeek = SAMPLE_PAYMENTS.filter(p => p.status === 'due-soon').length;
    
    return {
      todaySales: todaySales.reduce((sum, s) => sum + s.total, 0),
      todayProfit: todaySales.reduce((sum, s) => sum + s.profit, 0),
      todayTransactions: todaySales.length,
      weekSales: thisWeekSales.reduce((sum, s) => sum + s.total, 0),
      weekProfit: thisWeekSales.reduce((sum, s) => sum + s.profit, 0),
      totalMedicines: SAMPLE_STOCK.length,
      totalStock: SAMPLE_STOCK.reduce((sum, s) => sum + s.currentStock, 0),
      expiredCount,
      expiringSoonCount,
      outOfStockCount,
      lowStockCount,
      totalAlerts: expiredCount + expiringSoonCount + outOfStockCount + lowStockCount + overduePayments + dueThisWeek,
      overduePayments,
      dueThisWeek,
      overdueAmount: SAMPLE_PAYMENTS.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white shadow-md border-b-2 border-indigo-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Al Naeima Pharmacy Dashboard
                </h1>
                <p className="text-sm text-gray-500">BUILD 12 - Your Command Center</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Today</p>
                <p className="font-bold text-gray-900">{today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button className="relative p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <Bell className="w-6 h-6 text-red-600" />
                {stats.totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.totalAlerts}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Critical Alerts Banner */}
        {showAlerts && stats.totalAlerts > 0 && (
          <CriticalAlertsBanner stats={stats} onClose={() => setShowAlerts(false)} />
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Today's Sales"
            value={`₹${stats.todaySales.toFixed(0)}`}
            subtitle={`${stats.todayTransactions} transactions`}
            icon={DollarSign}
            color="from-green-500 to-emerald-600"
            trend="+12%"
          />
          <StatCard
            title="Today's Profit"
            value={`₹${stats.todayProfit.toFixed(0)}`}
            subtitle={`${((stats.todayProfit / stats.todaySales) * 100).toFixed(1)}% margin`}
            icon={TrendingUp}
            color="from-blue-500 to-indigo-600"
            trend="+8%"
          />
          <StatCard
            title="Total Medicines"
            value={stats.totalMedicines}
            subtitle={`${stats.totalStock} units in stock`}
            icon={Pill}
            color="from-purple-500 to-pink-600"
          />
          <StatCard
            title="Active Alerts"
            value={stats.totalAlerts}
            subtitle="Need attention"
            icon={AlertTriangle}
            color="from-orange-500 to-red-600"
            alert={stats.totalAlerts > 0}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <QuickActionButton
              icon={ShoppingCart}
              label="New Sale"
              color="bg-green-600 hover:bg-green-700"
              onClick={() => alert('Navigate to POS')}
            />
            <QuickActionButton
              icon={ShoppingBag}
              label="Receive Stock"
              color="bg-blue-600 hover:bg-blue-700"
              onClick={() => alert('Navigate to Stock IN')}
            />
            <QuickActionButton
              icon={Pill}
              label="Add Medicine"
              color="bg-purple-600 hover:bg-purple-700"
              onClick={() => alert('Navigate to Medicine Database')}
            />
            <QuickActionButton
              icon={AlertTriangle}
              label="View Alerts"
              color="bg-orange-600 hover:bg-orange-700"
              onClick={() => alert('Navigate to Expiry Alerts')}
            />
            <QuickActionButton
              icon={CreditCard}
              label="Make Payment"
              color="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => alert('Navigate to Payment Tracking')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sales Trend (Last 7 Days)</h2>
              <select className="px-3 py-1 border rounded-lg text-sm">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Month</option>
              </select>
            </div>
            <SalesChart data={DAILY_SALES} />
          </div>

          {/* Top Sellers */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top 5 Best Sellers</h2>
              <Award className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="space-y-3">
              {TOP_SELLERS.map((item, index) => (
                <TopSellerItem key={index} item={item} rank={index + 1} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Alerts */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-red-50 border-b">
              <h2 className="text-xl font-bold text-gray-900">Stock Alerts</h2>
            </div>
            <div className="p-6 space-y-3">
              <AlertItem
                label="Expired Medicines"
                count={stats.expiredCount}
                color="bg-red-600"
                icon={XCircle}
              />
              <AlertItem
                label="Expiring Soon (≤30 days)"
                count={stats.expiringSoonCount}
                color="bg-orange-600"
                icon={Clock}
              />
              <AlertItem
                label="Out of Stock"
                count={stats.outOfStockCount}
                color="bg-red-600"
                icon={Package}
              />
              <AlertItem
                label="Low Stock"
                count={stats.lowStockCount}
                color="bg-yellow-600"
                icon={TrendingDown}
              />
            </div>
          </div>

          {/* Payment Alerts */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-orange-50 border-b">
              <h2 className="text-xl font-bold text-gray-900">Payment Alerts</h2>
            </div>
            <div className="p-6 space-y-3">
              <AlertItem
                label="Overdue Payments"
                count={stats.overduePayments}
                color="bg-red-600"
                icon={AlertTriangle}
                amount={stats.overdueAmount}
              />
              <AlertItem
                label="Due This Week"
                count={stats.dueThisWeek}
                color="bg-orange-600"
                icon={Clock}
              />
              
              {SAMPLE_PAYMENTS.filter(p => p.status === 'overdue').slice(0, 2).map(payment => (
                <div key={payment.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-red-900">{payment.supplier}</p>
                      <p className="text-sm text-red-700">Due: {payment.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">₹{payment.amount.toFixed(0)}</p>
                      <button className="text-xs text-red-700 hover:text-red-900">Pay Now →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y">
            {SAMPLE_SALES.slice(0, 5).map(sale => (
              <div key={sale.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Sale #{sale.id}</p>
                      <p className="text-sm text-gray-500">{sale.date} at {sale.time} • {sale.items} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{sale.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Profit: ₹{sale.profit.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Week Summary */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">This Week's Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-indigo-100 mb-2">Total Sales</p>
              <p className="text-4xl font-bold">₹{stats.weekSales.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-indigo-100 mb-2">Total Profit</p>
              <p className="text-4xl font-bold">₹{stats.weekProfit.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-indigo-100 mb-2">Profit Margin</p>
              <p className="text-4xl font-bold">{((stats.weekProfit / stats.weekSales) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== CRITICAL ALERTS BANNER ====================

function CriticalAlertsBanner({ stats, onClose }) {
  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">⚠️ Critical Alerts Require Immediate Attention!</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.expiredCount > 0 && (
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-sm text-white text-opacity-90">Expired Medicines</p>
                <p className="text-3xl font-bold">{stats.expiredCount}</p>
              </div>
            )}
            {stats.outOfStockCount > 0 && (
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-sm text-white text-opacity-90">Out of Stock</p>
                <p className="text-3xl font-bold">{stats.outOfStockCount}</p>
              </div>
            )}
            {stats.overduePayments > 0 && (
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-sm text-white text-opacity-90">Overdue Payments</p>
                <p className="text-3xl font-bold">{stats.overduePayments}</p>
              </div>
            )}
            {stats.expiringSoonCount > 0 && (
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-sm text-white text-opacity-90">Expiring Soon</p>
                <p className="text-3xl font-bold">{stats.expiringSoonCount}</p>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

// ==================== STAT CARD ====================

function StatCard({ title, value, subtitle, icon: Icon, color, trend, alert }) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border ${alert ? 'border-red-300' : 'border-gray-100'} hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-green-600 text-sm font-bold">{trend}</span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

// ==================== QUICK ACTION BUTTON ====================

function QuickActionButton({ icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all hover:shadow-lg`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

// ==================== SALES CHART ====================

function SalesChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.sales));
  
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 h-48">
        {data.map((day, index) => {
          const heightPercentage = (day.sales / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t-lg transition-all hover:from-indigo-700 hover:to-purple-700 cursor-pointer"
                  style={{ height: `${heightPercentage}%` }}
                  title={`Sales: ₹${day.sales} | Profit: ₹${day.profit}`}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">{day.date}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded" />
          <span className="text-gray-600">Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-600 rounded" />
          <span className="text-gray-600">Profit</span>
        </div>
      </div>
    </div>
  );
}

// ==================== TOP SELLER ITEM ====================

function TopSellerItem({ item, rank }) {
  const maxRevenue = 4180; // Omeprazole's revenue
  const widthPercentage = (item.revenue / maxRevenue) * 100;
  
  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-full ${getRankColor(rank)} flex items-center justify-center font-bold text-sm`}>
          {rank}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{item.name}</h4>
          <p className="text-xs text-gray-500">{item.category}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-green-600">₹{item.revenue.toFixed(0)}</p>
          <p className="text-xs text-gray-500">{item.quantity} units</p>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
          style={{ width: `${widthPercentage}%` }}
        />
      </div>
    </div>
  );
}

// ==================== ALERT ITEM ====================

function AlertItem({ label, count, color, icon: Icon, amount }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`${color} p-2 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{label}</p>
          {amount && <p className="text-sm text-gray-500">₹{amount.toFixed(0)}</p>}
        </div>
      </div>
      <span className={`${color} text-white px-3 py-1 rounded-full font-bold text-sm`}>
        {count}
      </span>
    </div>
  );
}