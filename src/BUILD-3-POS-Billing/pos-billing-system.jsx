import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Smartphone, Printer, X, CheckCircle, AlertCircle, Package, RefreshCw, History } from 'lucide-react';
import { salesAPI, stockAPI, medicinesAPI } from '../services/api';

// ==================== MAIN APP COMPONENT ====================

export default function POSApp({ appData, setAppData }) {
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);
  const [view, setView] = useState('pos');
  const [currentSale, setCurrentSale] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stockRes, medicinesRes, salesRes] = await Promise.all([
        stockAPI.getAll(),
        medicinesAPI.getAll(),
        salesAPI.getAll()
      ]);

      if (stockRes.success) setStock(stockRes.data);
      if (medicinesRes.success) setMedicines(medicinesRes.data);
      if (salesRes.success) setSales(salesRes.data);

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

  const completeSale = async (saleData) => {
    try {
      setLoading(true);

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      const salePayload = {
        invoice_number: invoiceNumber,
        customer_name: saleData.customerName || 'Walk-in Customer',
        customer_phone: saleData.customerPhone || '',
        total_amount: saleData.subtotal,
        discount: saleData.discount || 0,
        final_amount: saleData.total,
        payment_method: saleData.paymentMethod,
        sale_date: new Date().toISOString().split('T')[0],
        items: cart.map(item => ({
          medicine_id: item.medicine_id,
          batch_number: item.batch_number,
          quantity: item.quantity,
          mrp: item.mrp,
          total: item.quantity * item.mrp
        }))
      };

      const response = await salesAPI.add(salePayload);
      
      if (response.success) {
        // Update local stock
        const updatedStock = [...stock];
        cart.forEach(cartItem => {
          const stockItem = updatedStock.find(s => 
            s.medicine_id === cartItem.medicine_id && 
            s.batch_number === cartItem.batch_number
          );
          if (stockItem) {
            stockItem.quantity -= cartItem.quantity;
          }
        });
        setStock(updatedStock);

        // Create sale object for receipt
        const newSale = {
          ...response.data,
          items: cart,
          timestamp: new Date().toISOString()
        };

        setSales([newSale, ...sales]);
        setCart([]);
        setCurrentSale(newSale);
        showNotification('✅ Sale completed and saved to database!', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to complete sale: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">POS / Billing System</h1>
                <p className="text-sm text-green-600 font-medium">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView(view === 'pos' ? 'history' : 'pos')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <History className="w-4 h-4" />
                {view === 'pos' ? 'View History' : 'Back to POS'}
              </button>

              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Today's Sales</div>
                <div className="text-2xl font-bold text-purple-600">{sales.length}</div>
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
        {view === 'pos' && !currentSale && (
          <POSScreen
            stock={stock}
            medicines={medicines}
            cart={cart}
            setCart={setCart}
            onComplete={completeSale}
            showNotification={showNotification}
            loading={loading}
          />
        )}

        {view === 'history' && (
          <SalesHistory
            sales={sales}
            onBack={() => setView('pos')}
          />
        )}

        {currentSale && (
          <Receipt
            sale={currentSale}
            onClose={() => {
              setCurrentSale(null);
              setView('pos');
            }}
          />
        )}
      </div>
    </div>
  );
}

// ==================== POS SCREEN ====================

function POSScreen({ stock, medicines, cart, setCart, onComplete, showNotification, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  // Group stock by medicine and get available items
  const availableStock = useMemo(() => {
    const grouped = {};
    
    stock.forEach(stockItem => {
      if (stockItem.quantity > 0) {
        const medicine = medicines.find(m => m.id === stockItem.medicine_id);
        if (medicine) {
          if (!grouped[stockItem.medicine_id]) {
            grouped[stockItem.medicine_id] = {
              medicine: medicine,
              batches: []
            };
          }
          grouped[stockItem.medicine_id].batches.push(stockItem);
        }
      }
    });

    return Object.values(grouped);
  }, [stock, medicines]);

  const filteredStock = useMemo(() => {
    return availableStock.filter(item => 
      item.medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medicine.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medicine.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableStock, searchTerm]);

  const addToCart = (stockGroup) => {
    // Get oldest batch (FIFO)
    const sortedBatches = [...stockGroup.batches].sort((a, b) => {
      const dateA = new Date(a.expiry_date);
      const dateB = new Date(b.expiry_date);
      return dateA - dateB;
    });

    const oldestBatch = sortedBatches[0];
    
    if (!oldestBatch || oldestBatch.quantity === 0) {
      showNotification('No stock available!', 'error');
      return;
    }

    const existingCartItem = cart.find(
      item => item.medicine_id === stockGroup.medicine.id && item.batch_number === oldestBatch.batch_number
    );

    if (existingCartItem) {
      if (existingCartItem.quantity >= oldestBatch.quantity) {
        showNotification('No more stock in this batch!', 'error');
        return;
      }
      setCart(cart.map(item =>
        item.medicine_id === stockGroup.medicine.id && item.batch_number === oldestBatch.batch_number
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        medicine_id: stockGroup.medicine.id,
        medicine_name: stockGroup.medicine.name,
        generic_name: stockGroup.medicine.generic_name,
        batch_number: oldestBatch.batch_number,
        expiry_date: oldestBatch.expiry_date,
        mrp: parseFloat(oldestBatch.mrp),
        purchase_price: parseFloat(oldestBatch.purchase_price),
        quantity: 1,
        max_quantity: oldestBatch.quantity
      }]);
    }

    setSearchTerm('');
  };

  const updateQuantity = (index, newQuantity) => {
    const item = cart[index];
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    if (newQuantity > item.max_quantity) {
      showNotification(`Only ${item.max_quantity} available!`, 'error');
      return;
    }
    setCart(cart.map((item, i) => i === index ? { ...item, quantity: newQuantity } : item));
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Product Search & List */}
      <div className="col-span-2 space-y-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicine by name, generic name, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              autoFocus
            />
          </div>
        </div>

        {searchTerm && (
          <div className="bg-white rounded-lg shadow max-h-96 overflow-y-auto">
            {filteredStock.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                No medicines found
              </div>
            ) : (
              <div className="divide-y">
                {filteredStock.map((item, index) => {
                  const totalQty = item.batches.reduce((sum, b) => sum + b.quantity, 0);
                  return (
                    <button
                      key={index}
                      onClick={() => addToCart(item)}
                      className="w-full p-4 text-left hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.medicine.name}</h3>
                          <p className="text-sm text-gray-600">{item.medicine.generic_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.medicine.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">₹{item.batches[0].mrp}</p>
                          <p className="text-sm text-gray-500">Stock: {totalQty}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {cart.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="font-bold text-gray-900">Cart Items ({cart.length})</h3>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.medicine_name}</h4>
                      <p className="text-sm text-gray-600">{item.generic_name}</p>
                      <p className="text-xs text-gray-500">Batch: {item.batch_number} | Exp: {item.expiry_date}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="p-1 border rounded hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="p-1 border rounded hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">₹{item.mrp} × {item.quantity}</p>
                      <p className="font-bold text-purple-600">₹{(item.mrp * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Cart Summary & Checkout */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-6 sticky top-24">
          <h3 className="font-bold text-gray-900 mb-4">Cart Summary</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Items:</span>
              <span>{cart.length}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Quantity:</span>
              <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-purple-600 pt-2 border-t">
              <span>Total:</span>
              <span>₹{calculateSubtotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0 || loading}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>

          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="w-full mt-2 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          subtotal={calculateSubtotal()}
          onComplete={(data) => {
            setShowCheckout(false);
            onComplete(data);
          }}
          onCancel={() => setShowCheckout(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

// ==================== SALES HISTORY WITH PAGINATION ====================

function SalesHistory({ sales, onBack }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;
    return sales.filter(sale =>
      sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_phone?.includes(searchTerm) ||
      sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]);

  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSales, currentPage, itemsPerPage]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sales History</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back to POS
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by customer, phone, or invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Items</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Discount</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">{sale.invoice_number}</td>
                <td className="px-4 py-3">{sale.sale_date}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{sale.customer_name}</p>
                  {sale.customer_phone && <p className="text-sm text-gray-600">{sale.customer_phone}</p>}
                </td>
                <td className="px-4 py-3 text-right">{sale.items?.length || 0}</td>
                <td className="px-4 py-3 text-right">₹{parseFloat(sale.total_amount || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-red-600">₹{parseFloat(sale.discount || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold text-purple-600">₹{parseFloat(sale.final_amount || 0).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {sale.payment_method}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">per page</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredSales.length)} to {Math.min(currentPage * itemsPerPage, filteredSales.length)} of {filteredSales.length}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm font-medium">
            {currentPage} / {Math.ceil(filteredSales.length / itemsPerPage) || 1}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredSales.length / itemsPerPage), prev + 1))}
            disabled={currentPage >= Math.ceil(filteredSales.length / itemsPerPage)}
            className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== CHECKOUT MODAL ====================

function CheckoutModal({ cart, subtotal, onComplete, onCancel, loading }) {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);

  const total = subtotal - discount;

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({
      paymentMethod,
      customerName,
      customerPhone,
      discount,
      subtotal,
      total
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Payment</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Walk-in Customer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={subtotal}
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`p-3 border rounded-lg flex items-center justify-center gap-2 ${
                  paymentMethod === 'Cash' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`p-3 border rounded-lg flex items-center justify-center gap-2 ${
                  paymentMethod === 'Card' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Card
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Discount:</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-purple-600">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Complete Sale'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== RECEIPT ====================

function Receipt({ sale, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-purple-600">Al Naeima Pharmacy</h1>
          <p className="text-gray-600">Sale Receipt</p>
          <p className="text-sm text-gray-500">Invoice: {sale.invoice_number}</p>
        </div>

        <div className="mb-6 pb-4 border-b">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Customer: {sale.customer_name || 'Walk-in'}</p>
              <p className="text-gray-600">Phone: {sale.customer_phone || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Date: {new Date(sale.timestamp).toLocaleDateString()}</p>
              <p className="text-gray-600">Time: {new Date(sale.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Item</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">
                  <p className="font-medium">{item.medicine_name}</p>
                  <p className="text-xs text-gray-500">{item.generic_name}</p>
                </td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">₹{item.mrp.toFixed(2)}</td>
                <td className="text-right">₹{(item.mrp * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>₹{sale.total_amount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Discount:</span>
            <span>-₹{sale.discount?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-purple-600 pt-2 border-t">
            <span>Total Paid:</span>
            <span>₹{sale.final_amount?.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-600 text-right">Payment: {sale.payment_method}</p>
        </div>

        <div className="text-center text-sm text-gray-500 mb-6">
          <p>Thank you for your purchase!</p>
          <p>Get well soon!</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            New Sale
          </button>
        </div>
      </div>
    </div>
  );
}