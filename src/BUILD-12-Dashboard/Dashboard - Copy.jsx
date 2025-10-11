import React, { useState, useEffect, useMemo } from 'react';
import { Home, TrendingUp, DollarSign, Package, AlertTriangle, ShoppingCart, Clock, XCircle, RefreshCw } from 'lucide-react';
import { salesAPI, stockAPI, medicinesAPI, paymentsAPI } from '../services/api';

export default function DashboardApp({ appData, setAppData, onNavigate }) {
  const [sales, setSales] = useState([]);
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesRes, stockRes, medicinesRes, paymentsRes] = await Promise.all([
        salesAPI.getAll(),
        stockAPI.getAll(),
        medicinesAPI.getAll(),
        paymentsAPI.getAll()
      ]);

      if (salesRes.success) setSales(salesRes.data);
      if (stockRes.success) setStock(stockRes.data);
      if (medicinesRes.success) setMedicines(medicinesRes.data);
      if (paymentsRes.success) setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's sales
    const todaySales = sales.filter(s => {
      const saleDate = new Date(s.sale_date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });

    const todayRevenue = todaySales.reduce((sum, s) => sum + parseFloat(s.final_amount || 0), 0);

    // Stock alerts
    const expiredStock = stock.filter(s => {
      const [month, year] = (s.expiry_date || '').split('/');
      const expiryDate = new Date(parseInt('20' + year), parseInt(month) - 1);
      return expiryDate < today && s.quantity > 0;
    });

    const expiringSoon = stock.filter(s => {
      const [month, year] = (s.expiry_date || '').split('/');
      const expiryDate = new Date(parseInt('20' + year), parseInt(month) - 1);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && s.quantity > 0;
    });

    // Group stock by medicine for low stock alerts
    const stockByMedicine = {};
    stock.forEach(s => {
      if (!stockByMedicine[s.medicine_id]) {
        stockByMedicine[s.medicine_id] = 0;
      }
      stockByMedicine[s.medicine_id] += s.quantity || 0;
    });

    const lowStock = Object.entries(stockByMedicine).filter(([id, qty]) => qty < 20 && qty > 0).length;
    const outOfStock = Object.entries(stockByMedicine).filter(([id, qty]) => qty === 0).length;

    // Payment alerts
    const overduePayments = payments.filter(p => 
      p.status === 'pending' && new Date(p.due_date) < today
    );

    const dueThisWeek = payments.filter(p => {
      if (p.status !== 'pending') return false;
      const dueDate = new Date(p.due_date);
      const weekLater = new Date(today);
      weekLater.setDate(weekLater.getDate() + 7);
      return dueDate >= today && dueDate <= weekLater;
    });

    return {
      totalMedicines: medicines.length,
      totalStock: Object.values(stockByMedicine).reduce((sum, qty) => sum + qty, 0),
      todaySales: todaySales.length,
      todayRevenue,
      expiredCount: expiredStock.length,
      expiringSoonCount: expiringSoon.length,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
      overduePayments: overduePayments.length,
      overdueAmount: overduePayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      dueThisWeek: dueThisWeek.length
    };
  }, [sales, stock, medicines, payments]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg">
                <Home className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Al Naeima Pharmacy</h1>
                <p className="text-blue-100">Dashboard Overview</p>
              </div>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Medicines"
            value={stats.totalMedicines}
            icon={Package}
            color="bg-blue-600"
            onClick={() => onNavigate && onNavigate('medicines')}
          />
          <MetricCard
            title="Total Stock Units"
            value={stats.totalStock}
            icon={Package}
            color="bg-green-600"
            onClick={() => onNavigate && onNavigate('stock-in')}
          />
          <MetricCard
            title="Today's Sales"
            value={stats.todaySales}
            icon={ShoppingCart}
            color="bg-purple-600"
            onClick={() => onNavigate && onNavigate('sales')}
          />
          <MetricCard
            title="Today's Revenue"
            value={`₹${stats.todayRevenue.toFixed(0)}`}
            icon={DollarSign}
            color="bg-orange-600"
            onClick={() => onNavigate && onNavigate('sales')}
          />
        </div>

        {/* Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Alerts */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Stock Alerts
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <AlertItem
                label="Expired Medicines"
                count={stats.expiredCount}
                color="bg-red-600"
                icon={XCircle}
                onClick={() => onNavigate && onNavigate('expiry')}
              />
              <AlertItem
                label="Expiring Soon (≤30 days)"
                count={stats.expiringSoonCount}
                color="bg-orange-600"
                icon={Clock}
                onClick={() => onNavigate && onNavigate('expiry')}
              />
              <AlertItem
                label="Out of Stock"
                count={stats.outOfStockCount}
                color="bg-red-600"
                icon={Package}
                onClick={() => onNavigate && onNavigate('reorder')}
              />
              <AlertItem
                label="Low Stock"
                count={stats.lowStockCount}
                color="bg-yellow-600"
                icon={TrendingUp}
                onClick={() => onNavigate && onNavigate('reorder')}
              />
            </div>
          </div>

          {/* Payment Alerts */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-orange-50 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-orange-600" />
                Payment Alerts
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <AlertItem
                label="Overdue Payments"
                count={stats.overduePayments}
                color="bg-red-600"
                icon={AlertTriangle}
                amount={stats.overdueAmount}
                onClick={() => onNavigate && onNavigate('payments')}
              />
              <AlertItem
                label="Due This Week"
                count={stats.dueThisWeek}
                color="bg-orange-600"
                icon={Clock}
                onClick={() => onNavigate && onNavigate('payments')}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              icon={ShoppingCart}
              label="New Sale"
              color="bg-green-600 hover:bg-green-700"
              onClick={() => onNavigate && onNavigate('pos')}
            />
            <QuickActionButton
              icon={Package}
              label="Add Stock"
              color="bg-blue-600 hover:bg-blue-700"
              onClick={() => onNavigate && onNavigate('stock-in')}
            />
            <QuickActionButton
              icon={AlertTriangle}
              label="Check Expiry"
              color="bg-red-600 hover:bg-red-700"
              onClick={() => onNavigate && onNavigate('expiry')}
            />
            <QuickActionButton
              icon={DollarSign}
              label="Make Payment"
              color="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => onNavigate && onNavigate('payments')}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Recent Activity</h2>
          {sales.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent sales</p>
          ) : (
            <div className="space-y-3">
              {sales.slice(0, 5).map(sale => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{sale.invoice_number}</p>
                      <p className="text-sm text-gray-600">{sale.customer_name || 'Walk-in Customer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{parseFloat(sale.final_amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(sale.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function AlertItem({ label, count, color, icon: Icon, amount, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className={`${color} p-2 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      <div className="text-right">
        <span className={`font-bold text-lg ${count > 0 ? 'text-red-600' : 'text-gray-400'}`}>
          {count}
        </span>
        {amount !== undefined && (
          <p className="text-sm text-gray-600">₹{amount.toFixed(0)}</p>
        )}
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center gap-3`}
    >
      <Icon className="w-8 h-8" />
      <span className="font-semibold">{label}</span>
    </button>
  );
}