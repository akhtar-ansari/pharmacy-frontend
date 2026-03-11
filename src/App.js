import React, { useState, useEffect } from 'react';
import { 
  Pill, ShoppingBag, ShoppingCart, AlertTriangle, Package, 
  TrendingUp, BarChart3, Building2, DollarSign, Menu, X, Home, 
  ScanLine, Users, LogOut
} from 'lucide-react';
// Import Login component
import Login from './components/Login';
// Import all 12 BUILD modules
import MedicineDatabaseApp from './BUILD-1-Medicine-Database/medicine-database';
import StockInApp from './BUILD-2-Stock-IN/stock-in-system';
import POSApp from './BUILD-3-POS-Billing/pos-billing-system';
import ExpiryAlertsApp from './BUILD-4-Expiry-Alerts/pharmacy-expiry-alerts-system';
import ReorderAlertsApp from './BUILD-5-Reorder-Alerts/reorder-alerts-system';
import SalesReportsApp from './BUILD-6-Sales-Reports/sales-reports-system';
import BusinessInsightsApp from './BUILD-7-Business-Insights/business-insights';
import SupplierManagementApp from './BUILD-8-Supplier-Management/supplier-management';
import PaymentTrackingApp from './BUILD-9-Payment-Tracking/payment-tracking';
import BarcodeSystemApp from './BUILD-10-Barcode-System/Barcode-System';
import DashboardApp from './BUILD-12-Dashboard/Dashboard';
import UserManagementApp from './BUILD-11-User-Login/User-Login';

// Import utilities
import { initKeyboardShortcuts, registerHandlers } from './utils/keyboardShortcuts';

// Initial shared data state
const INITIAL_STATE = {
  medicines: [
    { id: 1, name: 'Paracetamol', genericName: 'Acetaminophen', company: 'Cipla Ltd', category: 'Analgesic', packSize: '10 tablets', mrp: 12.50, purchasePrice: 8.00, barcode: 'MED-000001', addedDate: '2024-10-01' },
    { id: 2, name: 'Crocin', genericName: 'Paracetamol', company: 'GSK', category: 'Antipyretic', packSize: '15 tablets', mrp: 15.00, purchasePrice: 10.50, barcode: 'MED-000002', addedDate: '2024-10-01' },
  ],
  stock: [],
  sales: [],
  suppliers: [
    { id: 1, name: 'MediSupply Distributors', contactPerson: 'Ahmed Al-Rashid', phone: '+966 555 123 4567', email: 'ahmed@medisupply.sa', address: 'King Fahd Road, Riyadh', city: 'Riyadh', paymentTerms: 40, creditLimit: 50000, gstNumber: 'GST-MS-001', rating: 4.5, status: 'active', addedDate: '2024-01-15' },
  ],
  invoices: []
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appData, setAppData] = useState(INITIAL_STATE);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
  try {
    const userData = JSON.parse(savedUser);
    setUser(userData);
    setIsAuthenticated(true);
    
    // Set default pharmacy name (will be replaced after Arwa integration)
    if (!localStorage.getItem('pms_client_name')) {
      localStorage.setItem('pms_client_name', 'Al Naeima Pharmacy');
    }
  } catch (error) {
        // Invalid data, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  // Initialize keyboard shortcuts
  useEffect(() => {
    initKeyboardShortcuts();
    
    // Register custom handlers for navigation
    registerHandlers({
      'dashboard': () => setActiveModule('dashboard'),
      'medicines': () => setActiveModule('medicines'),
      'pos': () => setActiveModule('pos'),
      'new-sale': () => setActiveModule('pos'),
      'stock-in': () => setActiveModule('stock-in'),
      'reports': () => setActiveModule('sales'),
      'add-medicine': () => setActiveModule('medicines'),
      'search': () => document.querySelector('input[type="search"], input[type="text"]')?.focus(),
      'logout': () => handleLogout(),
    });

    console.log('⌨️ Keyboard shortcuts ready! Press F1 for help.');
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setActiveModule('dashboard');
    }
  };

  // Role-based module access
  const getAccessibleModules = (userRole) => {
    const allModules = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'pharmacist', 'cashier'] },
      { id: 'medicines', label: 'Medicine Database', icon: Pill, roles: ['admin', 'pharmacist'] },
      { id: 'stock-in', label: 'Stock IN', icon: ShoppingBag, roles: ['admin', 'pharmacist'] },
      { id: 'pos', label: 'POS / Billing', icon: ShoppingCart, roles: ['admin', 'pharmacist', 'cashier'] },
      { id: 'expiry', label: 'Expiry Alerts', icon: AlertTriangle, roles: ['admin', 'pharmacist'] },
      { id: 'reorder', label: 'Reorder Alerts', icon: Package, roles: ['admin', 'pharmacist'] },
      { id: 'sales', label: 'Sales Reports', icon: TrendingUp, roles: ['admin'] },
      { id: 'insights', label: 'Business Insights', icon: BarChart3, roles: ['admin'] },
      { id: 'suppliers', label: 'Suppliers', icon: Building2, roles: ['admin', 'pharmacist'] },
      { id: 'payments', label: 'Payments', icon: DollarSign, roles: ['admin'] },
      { id: 'barcode', label: 'Barcode System', icon: ScanLine, roles: ['admin', 'pharmacist', 'cashier'] },
      { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
    ];

    return allModules.filter(module => module.roles.includes(userRole));
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading MediFlow...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Get accessible modules based on user role
  const menuItems = getAccessibleModules(user?.role || 'cashier');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {sidebarOpen && (
              <div className="ml-2">
                <div className="flex items-center gap-2 mb-1">
                  <img 
                    id="company-logo" 
                    src={localStorage.getItem('pms_client_logo') || ''} 
                    alt="" 
                    style={{ 
                      height: '28px', 
                      display: localStorage.getItem('pms_client_logo') ? 'block' : 'none',
                      borderRadius: '4px'
                    }}
                  />
                  <span id="company-name" className="text-base font-bold text-white">
                    {localStorage.getItem('pms_client_name') || 'Pharmacy'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">Pharmacy Management</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 ${
                activeModule === item.id 
                  ? 'bg-blue-600 border-l-4 border-blue-400 shadow-lg' 
                  : 'hover:bg-gray-700 hover:border-l-4 hover:border-gray-600'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold">{user?.full_name?.[0] || 'U'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.full_name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeModule === 'dashboard' && <DashboardApp appData={appData} onNavigate={setActiveModule} />}
        {activeModule === 'medicines' && <MedicineDatabaseApp appData={appData} setAppData={setAppData} />}
        {activeModule === 'stock-in' && <StockInApp appData={appData} setAppData={setAppData} />}
        {activeModule === 'pos' && <POSApp appData={appData} setAppData={setAppData} />}
        {activeModule === 'expiry' && <ExpiryAlertsApp appData={appData} setAppData={setAppData} />}
        {activeModule === 'reorder' && <ReorderAlertsApp appData={appData} setAppData={setAppData} />}
        {activeModule === 'sales' && <SalesReportsApp appData={appData} setAppData={setAppData} />}
        {activeModule === 'insights' && <BusinessInsightsApp appData={appData} setAppData={setAppData} />}
        {activeModule === 'suppliers' && <SupplierManagementApp appData={appData} setAppData={setAppData} />}
        {activeModule === 'payments' && <PaymentTrackingApp appData={appData} setAppData={setAppData} />}
        {activeModule === 'barcode' && <BarcodeSystemApp appData={appData} setAppData={setAppData} />}
        {activeModule === 'users' && <UserManagementApp appData={appData} setAppData={setAppData} />}
      </div>
    </div>
  );
}
