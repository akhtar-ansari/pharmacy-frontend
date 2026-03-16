/**
 * ============================================================================
 * STOCK IN SYSTEM - GS1/EAN/BARCODE ENABLED
 * ============================================================================
 * 
 * Purpose: Stock invoice management with universal barcode scanning
 * 
 * Features:
 * - GS1 Digital Link parsing (URL format)
 * - GS1 Traditional parsing ((01)xxxx format)
 * - EAN-13/EAN-8 barcode support
 * - Manual medicine search with debounce
 * - Draft/Approve workflow
 * - Virtualized item list for performance
 * 
 * Author: Arwa Enterprises
 * Last Updated: March 2026
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';

// Icon imports from lucide-react
import { 
  Package,          // Used for empty state icon
  Plus,             // Add item button
  Upload,           // Excel upload button
  Eye,              // View invoice button
  Trash2,           // Delete button
  RefreshCw,        // Refresh/loading spinner
  DollarSign,       // Amount icon in stats
  FileText,         // Invoice/document icon
  X,                // Close/remove button
  Save,             // Save button
  ArrowLeft,        // Back navigation
  Search,           // Search icon for scanner field
  CheckCircle,      // Approve icon
  AlertCircle,      // Warning/draft icon
  ScanLine          // Barcode scan icon
} from 'lucide-react';

// API imports for data operations
import { stockInvoicesAPI, suppliersAPI, medicinesAPI } from '../services/api';

// Excel file handling library
import * as XLSX from 'xlsx';

// Import the universal barcode parser utility
import { parseUniversalBarcode } from '../utils/barcodeParser';

// Invoice status options
const INVOICE_STATUS = {
  DRAFT: 'draft',       // Can be edited
  APPROVED: 'approved'  // Locked, stock updated
};


// ============================================================================
// MEDIFLOW LOGO COMPONENT - Brand logo SVG
// ============================================================================

const MediFlowLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0EA5E9" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    {/* Capsule/Pill Shape */}
    <ellipse cx="35" cy="50" rx="25" ry="15" fill="url(#pillGradient)" opacity="0.9"/>
    {/* Medical Cross */}
    <rect x="30" y="45" width="10" height="3" fill="white"/>
    <rect x="33" y="42" width="4" height="9" fill="white"/>
    {/* Flow Lines representing data/medicine flow */}
    <path d="M 60 45 Q 70 40 80 45" stroke="#0EA5E9" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8"/>
    <path d="M 60 50 Q 70 50 80 50" stroke="#06B6D4" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M 60 55 Q 70 60 80 55" stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6"/>
  </svg>
);


// ============================================================================
// MAIN COMPONENT - StockINApp
// ============================================================================
// This is the main exported component that handles:
// - View routing (list, form, detail)
// - Data loading (invoices, suppliers, medicines)
// - CRUD operations for invoices
// ============================================================================

export default function StockINApp({ appData, setAppData }) {
  // ----------------------------------------
  // STATE VARIABLES
  // ----------------------------------------
  
  // Current view: 'list' (invoice list), 'form' (new/edit invoice), 'detail' (view invoice)
  const [view, setView] = useState('list');
  
  // Array of all invoices loaded from database
  const [invoices, setInvoices] = useState([]);
  
  // Array of all suppliers for dropdown selection
  const [suppliers, setSuppliers] = useState([]);
  
  // Array of all medicines (used for barcode lookup and search)
  const [medicines, setMedicines] = useState([]);
  
  // Loading state for showing spinners during data fetch
  const [loading, setLoading] = useState(false);
  
  // Notification message and type for user feedback
  const [notification, setNotification] = useState(null);
  
  // Currently selected invoice for detail view or editing
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Filter for invoice list: 'all', 'draft', 'approved'
  const [statusFilter, setStatusFilter] = useState('all');

  // ----------------------------------------
  // LIFECYCLE - Load data on component mount
  // ----------------------------------------
  
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------
  // DATA LOADING FUNCTION
  // ----------------------------------------
  
  /**
   * loadData - Fetches all required data from API
   * Loads: invoices, suppliers, medicines in parallel
   */
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel for better performance
      const [invoicesRes, suppliersRes, medicinesRes] = await Promise.all([
        stockInvoicesAPI.getAll(),
        suppliersAPI.getAll(),
        medicinesAPI.getAll()
      ]);

      // Update state with fetched data
      if (invoicesRes.success) setInvoices(invoicesRes.data || []);
      if (suppliersRes.success) setSuppliers(suppliersRes.data || []);
      if (medicinesRes.success) setMedicines(medicinesRes.data || []);

      showNotification('✅ Data loaded successfully', 'success');
    } catch (error) {
      showNotification('❌ Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // NOTIFICATION HELPER
  // ----------------------------------------
  
  /**
   * showNotification - Displays a temporary notification message
   * @param {string} message - Text to display
   * @param {string} type - 'success' or 'error' for styling
   */
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    // Auto-hide notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };

  // ----------------------------------------
  // NAVIGATION HANDLERS
  // ----------------------------------------
  
  /**
   * handleNewInvoice - Opens the form for creating a new invoice
   */
  const handleNewInvoice = () => {
    setSelectedInvoice(null);  // Clear any previously selected invoice
    setView('form');
  };

  /**
   * handleViewInvoice - Opens the detail view for an invoice
   * @param {string} id - Invoice UUID to view
   */
  const handleViewInvoice = async (id) => {
    try {
      const result = await stockInvoicesAPI.getById(id);
      if (result.success) {
        setSelectedInvoice(result.data);
        setView('detail');
      }
    } catch (error) {
      showNotification('❌ Failed to load invoice', 'error');
    }
  };

  /**
   * handleEditInvoice - Opens the form to edit an existing draft invoice
   * @param {object} invoice - Invoice object to edit
   */
  /**
 * handleEditInvoice - Opens the form to edit an existing draft invoice
 * Fetches full invoice data including items before opening form
 * @param {object} invoice - Invoice object to edit
 */
const handleEditInvoice = async (invoice) => {
  // Only allow editing draft invoices
  if (invoice.status === INVOICE_STATUS.APPROVED) {
    showNotification('⚠️ Cannot edit approved invoice', 'error');
    return;
  }
  
  try {
    // Fetch full invoice with items
    const result = await stockInvoicesAPI.getById(invoice.id);
    if (result.success && result.data) {
      setSelectedInvoice(result.data);
      setView('form');
    } else {
      showNotification('❌ Failed to load invoice details', 'error');
    }
  } catch (error) {
    showNotification('❌ Error loading invoice: ' + error.message, 'error');
  }
};;

  // ----------------------------------------
  // CRUD OPERATIONS
  // ----------------------------------------
  
  /**
   * handleDeleteInvoice - Deletes an invoice after confirmation
   * @param {string} id - Invoice UUID to delete
   */
  const handleDeleteInvoice = async (id) => {
    // Find the invoice to check its status
    const invoice = invoices.find(inv => inv.id === id);
    
    // Prevent deletion of approved invoices
    if (invoice?.status === INVOICE_STATUS.APPROVED) {
      showNotification('⚠️ Cannot delete approved invoice', 'error');
      return;
    }
    
    // Confirm deletion with user
    if (!window.confirm('Delete this invoice? This will remove all related stock entries.')) return;

    try {
      const result = await stockInvoicesAPI.delete(id);
      if (result.success) {
        // Remove from local state
        setInvoices(invoices.filter(inv => inv.id !== id));
        showNotification('✅ Invoice deleted successfully', 'success');
        // Return to list if currently viewing the deleted invoice
        if (view === 'detail') setView('list');
      }
    } catch (error) {
      showNotification('❌ Failed to delete invoice: ' + error.message, 'error');
    }
  };

  /**
   * handleSaveInvoice - Saves a new or updated invoice
   * @param {object} invoiceData - Invoice data including items
   * @param {boolean} isApprove - Whether to save as approved (true) or draft (false)
   */
  const handleSaveInvoice = async (invoiceData, isApprove = false) => {
    try {
      // Set status based on approve flag
      const dataToSave = {
        ...invoiceData,
        status: isApprove ? INVOICE_STATUS.APPROVED : INVOICE_STATUS.DRAFT
      };
      
      let result;
      
      // Check if this is an update (has id) or new invoice
      if (invoiceData.id) {
        // Update existing invoice
        result = await stockInvoicesAPI.update(invoiceData.id, dataToSave);
      } else {
        // Create new invoice
        result = await stockInvoicesAPI.create(dataToSave);
      }
      
      if (result.success) {
        await loadData();  // Refresh all data
        setView('list');
        
        const actionText = isApprove ? 'approved' : 'saved as draft';
        showNotification(`✅ Invoice ${actionText} with ${invoiceData.items.length} items`, 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to save invoice: ' + error.message, 'error');
    }
  };

  // ----------------------------------------
  // COMPUTED VALUES
  // ----------------------------------------
  
  /**
   * filteredInvoices - Returns invoices filtered by status
   */
  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter === 'all') return true;
    return inv.status === statusFilter;
  });

  /**
   * Calculate statistics for display
   */
  const stats = {
    total: invoices.length,
    draft: invoices.filter(inv => inv.status === INVOICE_STATUS.DRAFT).length,
    approved: invoices.filter(inv => inv.status === INVOICE_STATUS.APPROVED).length,
    totalAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0),
    totalItems: invoices.reduce((sum, inv) => sum + (inv.total_items || 0), 0)
  };

  // ----------------------------------------
  // VIEW ROUTING
  // ----------------------------------------
  
  // Route to Invoice Form view
  if (view === 'form') {
    return (
      <InvoiceForm
        suppliers={suppliers}
        medicines={medicines}
        existingInvoice={selectedInvoice}  // Pass existing invoice for editing
        onSave={handleSaveInvoice}
        onCancel={() => setView('list')}
        showNotification={showNotification}
      />
    );
  }

  // Route to Invoice Detail view
  if (view === 'detail' && selectedInvoice) {
    return (
      <InvoiceDetail
        invoice={selectedInvoice}
        onBack={() => setView('list')}
        onEdit={() => handleEditInvoice(selectedInvoice)}
        onDelete={handleDeleteInvoice}
      />
    );
  }

  // ----------------------------------------
  // DEFAULT VIEW: Invoice List
  // ----------------------------------------
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================== HEADER ==================== */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and title */}
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <MediFlowLogo size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-white">MediFlow</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">PMS</span>
                </div>
                <h1 className="text-lg font-semibold text-white">Stock IN - GRN</h1>
                <p className="text-xs text-green-100">
                  {loading ? '⏳ Loading...' : `${invoices.length} invoices`}
                </p>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-3">
              {/* Refresh button */}
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {/* New Invoice button */}
              <button
                onClick={handleNewInvoice}
                className="flex items-center gap-2 px-6 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                New Invoice
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== NOTIFICATION ==================== */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className={`p-4 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* ==================== STATISTICS CARDS ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {/* Total Invoices */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-green-600">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>

          {/* Draft Invoices */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600 opacity-20" />
            </div>
          </div>

          {/* Approved Invoices */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{stats.totalAmount.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </div>

          {/* Total Items */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-indigo-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* ==================== FILTER TABS ==================== */}
        <div className="flex gap-2 mb-4">
          {/* All invoices filter */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({stats.total})
          </button>
          
          {/* Draft filter */}
          <button
            onClick={() => setStatusFilter(INVOICE_STATUS.DRAFT)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === INVOICE_STATUS.DRAFT
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🟡 Draft ({stats.draft})
          </button>
          
          {/* Approved filter */}
          <button
            onClick={() => setStatusFilter(INVOICE_STATUS.APPROVED)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === INVOICE_STATUS.APPROVED
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✅ Approved ({stats.approved})
          </button>
        </div>

        {/* ==================== INVOICE TABLE ==================== */}
        <div className="bg-white rounded-lg shadow">
          {filteredInvoices.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                {statusFilter === 'all' ? 'No invoices yet' : `No ${statusFilter} invoices`}
              </p>
              <button
                onClick={handleNewInvoice}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Your First Invoice
              </button>
            </div>
          ) : (
            // Invoice table
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Items</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      {/* Invoice Number */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-900">{invoice.invoice_number}</span>
                        </div>
                      </td>
                      
                      {/* Supplier Name */}
                      <td className="px-4 py-3 text-gray-700">
                        {invoice.suppliers?.name || '-'}
                        {invoice.suppliers?.company && (
                          <div className="text-xs text-gray-500">{invoice.suppliers.company}</div>
                        )}
                      </td>
                      
                      {/* Invoice Date */}
                      <td className="px-4 py-3 text-gray-700">
                        {invoice.invoice_date 
                          ? new Date(invoice.invoice_date).toLocaleDateString('en-GB')
                          : '-'
                        }
                      </td>
                      
                      {/* Item Count */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {invoice.total_items || 0} items
                        </span>
                      </td>
                      
                      {/* Total Amount */}
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        ₹{parseFloat(invoice.total_amount || 0).toFixed(2)}
                      </td>
                      
                      {/* Status Badge */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          invoice.status === INVOICE_STATUS.APPROVED 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status === INVOICE_STATUS.APPROVED ? '✅ Approved' : '🟡 Draft'}
                        </span>
                      </td>
                      
                      {/* Action Buttons */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* View button */}
                          <button
                            onClick={() => handleViewInvoice(invoice.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* Edit button - only for drafts */}
                          {invoice.status === INVOICE_STATUS.DRAFT && (
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Delete button - only for drafts */}
                          {invoice.status === INVOICE_STATUS.DRAFT && (
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INVOICE FORM COMPONENT
// ============================================================================
// This component handles:
// - Creating new invoices
// - Editing existing draft invoices
// - Universal barcode scanning (GS1/EAN/Manual search)
// - Excel upload for bulk items
// - Save as Draft or Approve workflow
// ============================================================================

function InvoiceForm({ suppliers, medicines, existingInvoice, onSave, onCancel, showNotification }) {
  
  // ----------------------------------------
  // STATE VARIABLES
  // ----------------------------------------
  
  // Form header data (invoice number, supplier, date, etc.)
  const [formData, setFormData] = useState({
    id: existingInvoice?.id || null,
    invoice_number: existingInvoice?.invoice_number || `GRN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    supplier_id: existingInvoice?.supplier_id || '',
    invoice_date: existingInvoice?.invoice_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    notes: existingInvoice?.notes || '',
    status: existingInvoice?.status || 'draft'
  });

  // Array of invoice line items
  // Each item: { medicine_id, medicine_name, quantity, batch_number, expiry_date, manufacturing_date, serial_number, purchase_price, gtin, barcode_type }
  const [items, setItems] = useState(existingInvoice?.items || []);

  // Scanner/search input field value
  const [scanInput, setScanInput] = useState('');
  
  // Search results for medicine name search
  const [searchResults, setSearchResults] = useState([]);
  
  // Show/hide search results dropdown
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  // Currently highlighted search result index (for keyboard navigation)
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  // Loading state for search
  const [searching, setSearching] = useState(false);
  
  // Saving state to prevent double submission
  const [saving, setSaving] = useState(false);
  
  // Reference to scan input field for auto-focus
  const scanInputRef = useRef(null);
  
  // Reference to search timeout for debounce
  const searchTimeoutRef = useRef(null);

  // ----------------------------------------
  // FOCUS SCAN INPUT ON MOUNT
  // ----------------------------------------
  
  useEffect(() => {
    // Auto-focus the scan input when form loads
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, []);

  // ----------------------------------------
  // BARCODE/SEARCH PROCESSING
  // ----------------------------------------
  
  /**
   * handleScanInputChange - Processes scan input as user types
   * Detects barcode type and either:
   * - Immediately processes GS1/EAN barcodes
   * - Debounces text search for medicine names
   */
  const handleScanInputChange = (e) => {
    const value = e.target.value;
    setScanInput(value);
    
    // Clear any existing search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If empty, clear search results
    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    
    // Check if this looks like a barcode (starts with http, has digits, etc.)
    const trimmedValue = value.trim();
    
    // GS1 Digital Link URL - process immediately on paste/scan
    if (trimmedValue.startsWith('http') || trimmedValue.includes('go.gs1.org')) {
      processBarcode(trimmedValue);
      return;
    }
    
    // Pure numeric - could be EAN or GS1 numeric
    if (/^\d+$/.test(trimmedValue) && trimmedValue.length >= 8) {
      // Wait a moment for complete barcode (scanner might be slow)
      searchTimeoutRef.current = setTimeout(() => {
        processBarcode(trimmedValue);
      }, 100);
      return;
    }
    
    // GS1 with parentheses format
    if (trimmedValue.startsWith('(01)') || trimmedValue.includes('(01)')) {
      processBarcode(trimmedValue);
      return;
    }
    
    // Otherwise, treat as medicine name search with debounce
    searchTimeoutRef.current = setTimeout(() => {
      searchMedicines(trimmedValue);
    }, 300); // 300ms debounce
  };

  /**
   * processBarcode - Parses barcode and adds item to invoice
   * @param {string} barcodeData - Raw barcode string (GS1 URL, EAN, etc.)
   */
  const processBarcode = (barcodeData) => {
    // Parse the barcode using our universal parser
    const parsed = parseUniversalBarcode(barcodeData);
    
    if (!parsed) {
      showNotification('⚠️ Could not parse barcode', 'error');
      setScanInput('');
      return;
    }
    
    // Find medicine by GTIN or barcode
    let medicine = null;
    
    if (parsed.gtin) {
      // Search by GTIN (check both gtin and barcode fields)
      medicine = medicines.find(m => 
        m.gtin === parsed.gtin || 
        m.barcode === parsed.gtin ||
        m.barcode === parsed.gtin.replace(/^0+/, '') // Try without leading zeros
      );
    }
    
    if (!medicine && parsed.type === 'ean') {
      // For EAN, also check the raw barcode value
      medicine = medicines.find(m => 
        m.barcode === barcodeData.trim() ||
        m.gtin === barcodeData.trim()
      );
    }
    
    if (!medicine) {
      showNotification(`⚠️ Medicine not found for barcode: ${parsed.gtin || barcodeData}`, 'error');
      setScanInput('');
      scanInputRef.current?.focus();
      return;
    }
    
    // For GS1 barcodes with serial - always add new row (each serial is unique)
    // For EAN barcodes - check if same medicine+batch exists, increment qty
    if (parsed.type === 'gs1' && parsed.serial) {
      // GS1 with serial - always add new row
      addItemFromBarcode(medicine, parsed);
    } else if (parsed.type === 'ean' || (parsed.type === 'gs1' && !parsed.serial)) {
      // EAN or GS1 without serial - check for duplicate batch
      const existingIndex = items.findIndex(item => 
        item.medicine_id === medicine.id && 
        item.batch_number === (parsed.batch || '')
      );
      
      if (existingIndex >= 0) {
        // Increment quantity of existing item
        const newItems = [...items];
        newItems[existingIndex].quantity = (parseInt(newItems[existingIndex].quantity) || 0) + 1;
        setItems(newItems);
        showNotification(`✅ ${medicine.name} qty +1 (now ${newItems[existingIndex].quantity})`, 'success');
      } else {
        // Add new row
        addItemFromBarcode(medicine, parsed);
      }
    } else {
      // Fallback - add new row
      addItemFromBarcode(medicine, parsed);
    }
    
    // Clear input and refocus
    setScanInput('');
    scanInputRef.current?.focus();
  };

  /**
   * addItemFromBarcode - Adds a new item row from parsed barcode data
   * @param {object} medicine - Medicine object from database
   * @param {object} parsed - Parsed barcode data
   */
  const addItemFromBarcode = (medicine, parsed) => {
    const newItem = {
      medicine_id: medicine.id,
      medicine_name: medicine.name,
      quantity: 1,
      batch_number: parsed.batch || '',
      expiry_date: parsed.expiry || '',
      manufacturing_date: parsed.manufacturing || '',
      serial_number: parsed.serial || '',
      purchase_price: medicine.purchase_price || '',
      gtin: parsed.gtin || '',
      barcode_type: parsed.type || 'manual'
    };
    
    // Add to beginning of array (newest first)
    setItems([newItem, ...items]);
    showNotification(`✅ Added: ${medicine.name}`, 'success');
  };

  /**
   * searchMedicines - Searches medicines by name
   * @param {string} searchTerm - Search query
   */
  const searchMedicines = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    
    setSearching(true);
    
    try {
      // First search in local medicines array (faster)
      const localResults = medicines.filter(m => 
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 20);
      
      setSearchResults(localResults);
      setShowSearchDropdown(localResults.length > 0);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  /**
   * selectMedicine - Handles medicine selection from search dropdown
   * @param {object} medicine - Selected medicine object
   */
  const selectMedicine = (medicine) => {
    // Check if medicine already exists in items (without batch - manual entry)
    const existingIndex = items.findIndex(item => 
      item.medicine_id === medicine.id && 
      !item.batch_number
    );
    
    if (existingIndex >= 0) {
      // Increment quantity
      const newItems = [...items];
      newItems[existingIndex].quantity = (parseInt(newItems[existingIndex].quantity) || 0) + 1;
      setItems(newItems);
      showNotification(`✅ ${medicine.name} qty +1`, 'success');
    } else {
      // Add new item
      const newItem = {
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        quantity: 1,
        batch_number: '',
        expiry_date: '',
        manufacturing_date: '',
        serial_number: '',
        purchase_price: medicine.purchase_price || '',
        gtin: medicine.gtin || '',
        barcode_type: 'manual'
      };
      
      // Add to beginning (newest first)
      setItems([newItem, ...items]);
      showNotification(`✅ Added: ${medicine.name}`, 'success');
    }
    
    // Clear search and refocus
    setScanInput('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    scanInputRef.current?.focus();
  };

  /**
   * handleScanKeyDown - Handles keyboard navigation in search dropdown
   */
  const handleScanKeyDown = (e) => {
    if (!showSearchDropdown || searchResults.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
          selectMedicine(searchResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSearchDropdown(false);
        setSearchResults([]);
        break;
      default:
        break;
    }
  };

  // ----------------------------------------
  // ITEM MANAGEMENT
  // ----------------------------------------
  
  /**
   * updateItem - Updates a specific field in an item
   * @param {number} index - Item index in array
   * @param {string} field - Field name to update
   * @param {any} value - New value
   */
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  /**
   * removeItem - Removes an item from the list
   * @param {number} index - Item index to remove
   */
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    showNotification('🗑️ Item removed', 'success');
  };

  /**
   * addManualItem - Adds an empty item row for manual entry
   */
  const addManualItem = () => {
    const newItem = {
      medicine_id: '',
      medicine_name: '',
      quantity: 1,
      batch_number: '',
      expiry_date: '',
      manufacturing_date: '',
      serial_number: '',
      purchase_price: '',
      gtin: '',
      barcode_type: 'manual'
    };
    setItems([newItem, ...items]);
  };

  // ----------------------------------------
  // CALCULATIONS
  // ----------------------------------------
  
  /**
   * calculateTotal - Calculates total invoice amount
   */
  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.purchase_price || 0));
    }, 0);
  };

  /**
   * calculateTotalQty - Calculates total quantity across all items
   */
  const calculateTotalQty = () => {
    return items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
  };

  // ----------------------------------------
  // FORM SUBMISSION
  // ----------------------------------------
  
  /**
   * handleSubmit - Handles form submission (Save Draft or Approve)
   * @param {boolean} isApprove - Whether to approve the invoice
   */
  const handleSubmit = async (isApprove = false) => {
    // Prevent double submission
    if (saving) return;

    // Validate supplier
    if (!formData.supplier_id) {
      showNotification('⚠️ Please select a supplier', 'error');
      return;
    }

    // Validate items
    const validItems = items.filter(item => item.medicine_id && item.quantity);
    
    if (validItems.length === 0) {
      showNotification('⚠️ Please add at least one item', 'error');
      return;
    }

    // Prepare invoice data
    const invoiceData = {
      ...formData,
      items: validItems,
      total_items: validItems.length,
      total_amount: calculateTotal()
    };

    setSaving(true);
    showNotification('⏳ Saving invoice...', 'success');

    try {
      await onSave(invoiceData, isApprove);
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------
  // EXCEL UPLOAD
  // ----------------------------------------
  
  /**
   * parseExcelDate - Converts Excel date formats to YYYY-MM-DD
   */
  const parseExcelDate = (excelDate) => {
    if (!excelDate) return '';
    
    // Already in YYYY-MM-DD format
    if (typeof excelDate === 'string' && excelDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return excelDate;
    }
    
    // Excel serial number
    if (typeof excelDate === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const excelEpochAsUnixTimestamp = excelEpoch.getTime();
      const missingLeapYearDay = 24 * 60 * 60 * 1000;
      const delta = excelEpochAsUnixTimestamp - missingLeapYearDay;
      const excelTimestampAsUnixTimestamp = delta + excelDate * 24 * 60 * 60 * 1000;
      const date = new Date(excelTimestampAsUnixTimestamp);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse as date string
    try {
      const date = new Date(excelDate);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      return '';
    }
    
    return '';
  };

  /**
   * downloadTemplate - Downloads Excel template for bulk upload
   */
  const downloadTemplate = () => {
    const template = [
      {
        'Medicine Name': 'Paracetamol 500mg',
        'Quantity': '100',
        'Batch Number': 'A123',
        'Expiry Date': '2026-12-31',
        'Manufacturing Date': '2024-01-15',
        'Purchase Price': '8.50',
        'GTIN': ''
      },
      {
        'Medicine Name': 'Amoxicillin 250mg',
        'Quantity': '50',
        'Batch Number': 'B456',
        'Expiry Date': '2026-06-30',
        'Manufacturing Date': '2024-03-20',
        'Purchase Price': '25.00',
        'GTIN': ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Invoice Template');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 }, // Medicine Name
      { wch: 10 }, // Quantity
      { wch: 15 }, // Batch Number
      { wch: 15 }, // Expiry Date
      { wch: 18 }, // Manufacturing Date
      { wch: 15 }, // Purchase Price
      { wch: 18 }  // GTIN
    ];

    XLSX.writeFile(workbook, 'Stock_Invoice_Template.xlsx');
    showNotification('✅ Template downloaded', 'success');
  };

  /**
   * handleExcelUpload - Processes uploaded Excel file
   */
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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

        showNotification(`⏳ Processing ${jsonData.length} items...`, 'success');

        const uploadedItems = [];
        let notFoundCount = 0;

        for (const row of jsonData) {
          const medicineName = (row['Medicine Name'] || '').trim();
          
          if (!medicineName) continue;

          // Find medicine by name
          const medicine = medicines.find(m => 
            m.name?.toLowerCase() === medicineName.toLowerCase()
          );

          if (!medicine) {
            notFoundCount++;
            continue;
          }

          // Add item
          uploadedItems.push({
            medicine_id: medicine.id,
            medicine_name: medicine.name,
            quantity: row['Quantity'] || 1,
            batch_number: row['Batch Number'] || '',
            expiry_date: parseExcelDate(row['Expiry Date']),
            manufacturing_date: parseExcelDate(row['Manufacturing Date']),
            serial_number: '',
            purchase_price: row['Purchase Price'] || medicine.purchase_price || '',
            gtin: row['GTIN'] || medicine.gtin || '',
            barcode_type: 'excel'
          });
        }

        if (uploadedItems.length > 0) {
          // Add to beginning of existing items
          setItems([...uploadedItems, ...items]);
          
          let message = `✅ Added ${uploadedItems.length} items from Excel`;
          if (notFoundCount > 0) {
            message += ` (${notFoundCount} medicines not found)`;
          }
          showNotification(message, 'success');
        } else {
          showNotification('⚠️ No valid items found in Excel', 'error');
        }

      } catch (error) {
        showNotification('❌ Failed to parse Excel: ' + error.message, 'error');
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = ''; // Reset input
  };

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================== HEADER ==================== */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="p-2 bg-white text-green-600 rounded-lg hover:bg-green-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-white">MediFlow</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">PMS</span>
                </div>
                <h1 className="text-lg font-semibold text-white">
                  {existingInvoice ? 'Edit Invoice' : 'New Stock Invoice'}
                </h1>
                <p className="text-xs text-green-100">
                  Status: {formData.status === 'approved' ? '✅ Approved' : '🟡 Draft'}
                </p>
              </div>
            </div>

            {/* Right: Excel buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400"
              >
                <FileText className="w-4 h-4" />
                Template
              </button>
              
              <label className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 cursor-pointer">
                <Upload className="w-4 h-4" />
                Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== MAIN FORM ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          
          {/* ========== INVOICE HEADER FIELDS ========== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 pb-6 border-b">
            {/* Invoice Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.invoice_number}
                onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Supplier Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.company && `- ${s.company}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Status Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className={`w-full px-3 py-2 rounded-lg font-medium text-center ${
                formData.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {formData.status === 'approved' ? '✅ Approved' : '🟡 Draft'}
              </div>
            </div>
          </div>

          {/* ========== SCANNER/SEARCH FIELD ========== */}
          <div className="mb-6 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ScanLine className="w-4 h-4 inline mr-1" />
              Scan Barcode or Search Medicine
            </label>
            <div className="relative">
              <input
                ref={scanInputRef}
                type="text"
                value={scanInput}
                onChange={handleScanInputChange}
                onKeyDown={handleScanKeyDown}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                placeholder="Scan GS1/EAN barcode or type medicine name..."
                className="w-full px-4 py-3 pl-12 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                autoComplete="off"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              {searching && (
                <RefreshCw className="w-5 h-5 text-green-500 animate-spin absolute right-4 top-1/2 transform -translate-y-1/2" />
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute z-30 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((medicine, index) => (
                  <div
                    key={medicine.id}
                    onClick={() => selectMedicine(medicine)}
                    className={`px-4 py-3 cursor-pointer border-b last:border-b-0 ${
                      index === highlightedIndex ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{medicine.name}</div>
                    <div className="text-sm text-gray-500">
                      {medicine.generic_name && `${medicine.generic_name} • `}
                      {medicine.company && `${medicine.company} • `}
                      ₹{medicine.purchase_price || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Helper text */}
            <p className="text-xs text-gray-500 mt-1">
              Auto-detects: GS1 Digital Link URL | GS1 (01)xxxx | EAN-13/8 | Medicine Name
            </p>
          </div>

          {/* ========== ITEMS SUMMARY ========== */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-gray-500">Total Items:</span>
                <span className="ml-2 font-bold text-lg text-blue-600">{items.length}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Total Qty:</span>
                <span className="ml-2 font-bold text-lg text-purple-600">{calculateTotalQty()}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Total Amount:</span>
                <span className="ml-2 font-bold text-lg text-green-600">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={addManualItem}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
            >
              <Plus className="w-4 h-4" />
              Add Manual
            </button>
          </div>

          {/* ========== ITEMS TABLE ========== */}
          <div className="border rounded-lg overflow-hidden mb-6">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Medicine</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 w-20">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Batch</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Expiry</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">MFG</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Serial</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 w-24">Price</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 w-24">Total</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                        <ScanLine className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Scan a barcode or search for medicine to add items</p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {/* Row Number */}
                        <td className="px-3 py-2 text-gray-500 text-sm">{index + 1}</td>
                        
                        {/* Medicine Name (or dropdown if manual) */}
                        <td className="px-3 py-2">
                          {item.medicine_id ? (
                            <div>
                              <div className="font-medium text-sm">{item.medicine_name}</div>
                              <div className="text-xs text-gray-400">
                                {item.barcode_type === 'gs1' && '🔗 GS1'}
                                {item.barcode_type === 'ean' && '📊 EAN'}
                                {item.barcode_type === 'manual' && '✍️ Manual'}
                                {item.barcode_type === 'excel' && '📑 Excel'}
                              </div>
                            </div>
                          ) : (
                            <select
                              value={item.medicine_id}
                              onChange={(e) => {
                                const med = medicines.find(m => m.id === e.target.value);
                                if (med) {
                                  updateItem(index, 'medicine_id', med.id);
                                  updateItem(index, 'medicine_name', med.name);
                                  updateItem(index, 'purchase_price', med.purchase_price || '');
                                }
                              }}
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              <option value="">Select Medicine</option>
                              {medicines.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        
                        {/* Quantity */}
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="w-16 px-2 py-1 border rounded text-sm text-center"
                            min="1"
                          />
                        </td>
                        
                        {/* Batch Number */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.batch_number}
                            onChange={(e) => updateItem(index, 'batch_number', e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            placeholder="Batch"
                          />
                        </td>
                        
                        {/* Expiry Date */}
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={item.expiry_date}
                            onChange={(e) => updateItem(index, 'expiry_date', e.target.value)}
                            className="w-32 px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        
                        {/* Manufacturing Date */}
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={item.manufacturing_date}
                            onChange={(e) => updateItem(index, 'manufacturing_date', e.target.value)}
                            className="w-32 px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        
                        {/* Serial Number */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.serial_number}
                            onChange={(e) => updateItem(index, 'serial_number', e.target.value)}
                            className="w-24 px-2 py-1 border rounded text-sm"
                            placeholder="Serial"
                          />
                        </td>
                        
                        {/* Purchase Price */}
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.purchase_price}
                            onChange={(e) => updateItem(index, 'purchase_price', e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-sm text-right"
                            placeholder="0.00"
                          />
                        </td>
                        
                        {/* Line Total */}
                        <td className="px-3 py-2 text-right font-semibold text-sm">
                          ₹{(parseFloat(item.quantity || 0) * parseFloat(item.purchase_price || 0)).toFixed(2)}
                        </td>
                        
                        {/* Remove Button */}
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========== NOTES ========== */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="Any additional notes..."
            />
          </div>

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex gap-4">
            {/* Save Draft Button */}
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={saving || formData.status === 'approved'}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
                saving || formData.status === 'approved'
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Draft
                </>
              )}
            </button>
            
            {/* Approve Button */}
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={saving || formData.status === 'approved'}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
                saving || formData.status === 'approved'
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Approve GRN
                </>
              )}
            </button>
            
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INVOICE DETAIL COMPONENT
// ============================================================================
// This component handles:
// - View-only display of invoice details
// - Shows all item information
// - Edit button (for drafts only)
// - Delete button (for drafts only)
// ============================================================================

function InvoiceDetail({ invoice, onBack, onEdit, onDelete }) {
  
  // ----------------------------------------
  // CALCULATIONS
  // ----------------------------------------
  
  /**
   * calculateTotal - Calculates total invoice amount from items
   */
  const calculateTotal = () => {
    if (!invoice.items) return parseFloat(invoice.total_amount || 0);
    return invoice.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.purchase_price || 0));
    }, 0);
  };

  /**
   * calculateTotalQty - Calculates total quantity
   */
  const calculateTotalQty = () => {
    if (!invoice.items) return invoice.total_items || 0;
    return invoice.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
  };

  // Check if invoice is approved (locked)
  const isApproved = invoice.status === 'approved';

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================== HEADER ==================== */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 bg-white text-green-600 rounded-lg hover:bg-green-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-white">MediFlow</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">PMS</span>
                </div>
                <h1 className="text-lg font-semibold text-white">Invoice Details</h1>
                <p className="text-xs text-green-100">{invoice.invoice_number}</p>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex gap-3">
              {/* Edit button - only for drafts */}
              {!isApproved && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <FileText className="w-4 h-4" />
                  Edit
                </button>
              )}
              
              {/* Delete button - only for drafts */}
              {!isApproved && (
                <button
                  onClick={() => onDelete(invoice.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* ========== INVOICE INFO SECTION ========== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b">
            
            {/* Left Column: Invoice Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Invoice Information
              </h3>
              <div className="space-y-4">
                {/* Invoice Number */}
                <div>
                  <p className="text-xs text-gray-500">Invoice Number</p>
                  <p className="text-lg font-bold text-gray-900">{invoice.invoice_number}</p>
                </div>
                
                {/* Invoice Date */}
                <div>
                  <p className="text-xs text-gray-500">Invoice Date</p>
                  <p className="font-semibold text-gray-700">
                    {invoice.invoice_date 
                      ? new Date(invoice.invoice_date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : '-'
                    }
                  </p>
                </div>
                
                {/* Status */}
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    isApproved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isApproved ? '✅ Approved' : '🟡 Draft'}
                  </span>
                </div>
                
                {/* Approved Info (if approved) */}
                {isApproved && invoice.approved_at && (
                  <div>
                    <p className="text-xs text-gray-500">Approved On</p>
                    <p className="font-semibold text-gray-700">
                      {new Date(invoice.approved_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Supplier Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Supplier Information
              </h3>
              <div className="space-y-4">
                {/* Supplier Name */}
                <div>
                  <p className="text-xs text-gray-500">Supplier Name</p>
                  <p className="font-semibold text-gray-700">
                    {invoice.suppliers?.name || '-'}
                  </p>
                </div>
                
                {/* Company */}
                {invoice.suppliers?.company && (
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="font-semibold text-gray-700">{invoice.suppliers.company}</p>
                  </div>
                )}
                
                {/* Phone */}
                {invoice.suppliers?.phone && (
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-700">{invoice.suppliers.phone}</p>
                  </div>
                )}
                
                {/* GST Number */}
                {invoice.suppliers?.gst_number && (
                  <div>
                    <p className="text-xs text-gray-500">GST Number</p>
                    <p className="font-semibold text-gray-700">{invoice.suppliers.gst_number}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========== SUMMARY STATS ========== */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-600">Total Items</p>
              <p className="text-2xl font-bold text-blue-800">{invoice.items?.length || invoice.total_items || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-purple-600">Total Quantity</p>
              <p className="text-2xl font-bold text-purple-800">{calculateTotalQty()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-800">₹{calculateTotal().toFixed(2)}</p>
            </div>
          </div>

          {/* ========== ITEMS TABLE ========== */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Medicine</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Batch</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Expiry</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">MFG Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Serial</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">GTIN</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.items?.length > 0 ? (
                      invoice.items.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-gray-50">
                          {/* Row Number */}
                          <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                          
                          {/* Medicine Name */}
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">
                              {item.medicines?.name || item.medicine_name || '-'}
                            </div>
                            {item.medicines?.generic_name && (
                              <div className="text-xs text-gray-500">{item.medicines.generic_name}</div>
                            )}
                          </td>
                          
                          {/* Quantity */}
                          <td className="px-4 py-3 text-center font-semibold">{item.quantity}</td>
                          
                          {/* Batch Number */}
                          <td className="px-4 py-3 text-sm">{item.batch_number || '-'}</td>
                          
                          {/* Expiry Date */}
                          <td className="px-4 py-3 text-sm">
                            {item.expiry_date 
                              ? new Date(item.expiry_date).toLocaleDateString('en-GB')
                              : '-'
                            }
                          </td>
                          
                          {/* Manufacturing Date */}
                          <td className="px-4 py-3 text-sm">
                            {item.manufacturing_date 
                              ? new Date(item.manufacturing_date).toLocaleDateString('en-GB')
                              : '-'
                            }
                          </td>
                          
                          {/* Serial Number */}
                          <td className="px-4 py-3 text-sm font-mono">
                            {item.serial_number || '-'}
                          </td>
                          
                          {/* GTIN */}
                          <td className="px-4 py-3 text-sm font-mono">
                            {item.gtin || '-'}
                          </td>
                          
                          {/* Purchase Price */}
                          <td className="px-4 py-3 text-right">
                            ₹{parseFloat(item.purchase_price || 0).toFixed(2)}
                          </td>
                          
                          {/* Line Total */}
                          <td className="px-4 py-3 text-right font-semibold">
                            ₹{(parseFloat(item.quantity || 0) * parseFloat(item.purchase_price || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                  
                  {/* Footer with Total */}
                  <tfoot className="bg-gray-50 border-t-2">
                    <tr>
                      <td colSpan="9" className="px-4 py-4 text-right font-semibold text-lg">
                        Total Invoice Amount:
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-xl text-green-600">
                        ₹{calculateTotal().toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* ========== NOTES SECTION ========== */}
          {invoice.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
