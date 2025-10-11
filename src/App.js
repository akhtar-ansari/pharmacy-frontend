import React, { useState } from 'react';
import { 
  Pill, ShoppingBag, ShoppingCart, AlertTriangle, Package, 
  TrendingUp, BarChart3, Building2, DollarSign, Menu, X, Home, 
  ScanLine, Users
} from 'lucide-react';

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
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appData, setAppData] = useState(INITIAL_STATE);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'medicines', label: 'Medicine Database', icon: Pill },
    { id: 'stock-in', label: 'Stock IN', icon: ShoppingBag },
    { id: 'pos', label: 'POS / Billing', icon: ShoppingCart },
    { id: 'expiry', label: 'Expiry Alerts', icon: AlertTriangle },
    { id: 'reorder', label: 'Reorder Alerts', icon: Package },
    { id: 'sales', label: 'Sales Reports', icon: TrendingUp },
    { id: 'insights', label: 'Business Insights', icon: BarChart3 },
    { id: 'suppliers', label: 'Suppliers', icon: Building2 },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'barcode', label: 'Barcode System', icon: ScanLine },
    { id: 'users', label: 'User Management', icon: Users },
  ];

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
                <h1 className="text-lg font-bold">Al Naeima Pharmacy</h1>
                <p className="text-xs text-gray-400">Complete PMS</p>
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
          <div className={`flex items-center gap-3 ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">A</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-400">Owner</p>
              </div>
            )}
          </div>
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