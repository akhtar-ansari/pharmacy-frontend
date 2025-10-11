import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Smartphone, Printer, X, CheckCircle, Barcode, Calendar, Package, AlertTriangle } from 'lucide-react';

// ==================== MOCK DATA ====================

const SAMPLE_STOCK = [
  {
    id: 1,
    medicineId: 1,
    medicineName: 'Paracetamol',
    genericName: 'Acetaminophen',
    company: 'Cipla Ltd',
    packSize: '10 tablets',
    barcode: 'MED-000001',
    batches: [
      { batchNumber: 'PCM-2024-A1', expiryDate: '11/2024', quantity: 20, mrp: 12.50, purchasePrice: 8.00 },
      { batchNumber: 'PCM-2024-B1', expiryDate: '06/2025', quantity: 80, mrp: 12.50, purchasePrice: 8.00 },
      { batchNumber: 'PCM-2025-A1', expiryDate: '03/2026', quantity: 100, mrp: 13.00, purchasePrice: 8.50 }
    ]
  },
  {
    id: 2,
    medicineId: 2,
    medicineName: 'Crocin',
    genericName: 'Paracetamol',
    company: 'GSK',
    packSize: '15 tablets',
    barcode: 'MED-000002',
    batches: [
      { batchNumber: 'CRO-2024-X1', expiryDate: '08/2025', quantity: 50, mrp: 15.00, purchasePrice: 10.50 }
    ]
  },
  {
    id: 3,
    medicineId: 3,
    medicineName: 'Amoxicillin',
    genericName: 'Amoxicillin Trihydrate',
    company: 'Sun Pharma',
    packSize: '10 capsules',
    barcode: 'MED-000003',
    batches: [
      { batchNumber: 'AMX-2024-P1', expiryDate: '12/2025', quantity: 30, mrp: 45.00, purchasePrice: 32.00 }
    ]
  },
  {
    id: 4,
    medicineId: 4,
    medicineName: 'Cetirizine',
    genericName: 'Cetirizine Hydrochloride',
    company: 'Dr. Reddy\'s',
    packSize: '10 tablets',
    barcode: 'MED-000004',
    batches: [
      { batchNumber: 'CET-2025-A1', expiryDate: '09/2025', quantity: 60, mrp: 18.00, purchasePrice: 12.00 }
    ]
  },
  {
    id: 5,
    medicineId: 5,
    medicineName: 'Omeprazole',
    genericName: 'Omeprazole',
    company: 'Lupin',
    packSize: '14 capsules',
    barcode: 'MED-000005',
    batches: [
      { batchNumber: 'OME-2024-Z1', expiryDate: '10/2024', quantity: 5, mrp: 55.00, purchasePrice: 38.00 },
      { batchNumber: 'OME-2025-A1', expiryDate: '07/2025', quantity: 45, mrp: 55.00, purchasePrice: 38.00 }
    ]
  }
];

const SAMPLE_SALES = [];

// ==================== MAIN APP COMPONENT ====================

export default function POSApp({ appData, setAppData }) {
  const [stock, setStock] = useState(SAMPLE_STOCK);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState(SAMPLE_SALES);
  const [view, setView] = useState('pos');
  const [currentSale, setCurrentSale] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const completeSale = (saleData) => {
    const newSale = {
      ...saleData,
      id: sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1,
      timestamp: new Date().toISOString()
    };
    
    setSales([...sales, newSale]);
    
    const updatedStock = [...stock];
    saleData.items.forEach(cartItem => {
      const stockItem = updatedStock.find(s => s.id === cartItem.stockId);
      if (stockItem) {
        const batch = stockItem.batches.find(b => b.batchNumber === cartItem.batchNumber);
        if (batch) {
          batch.quantity -= cartItem.quantity;
        }
      }
    });
    setStock(updatedStock);
    
    setCart([]);
    setCurrentSale(newSale);
    showNotification('Sale completed successfully!', 'success');
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
                <p className="text-sm text-gray-500">BUILD 3 - Fast Customer Checkout</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
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
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800">{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {view === 'pos' && !currentSale && (
          <POSScreen
            stock={stock}
            cart={cart}
            setCart={setCart}
            onComplete={completeSale}
            showNotification={showNotification}
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

function POSScreen({ stock, cart, setCart, onComplete, showNotification }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredStock = useMemo(() => {
    return stock.filter(item => {
      const totalQty = item.batches.reduce((sum, b) => sum + b.quantity, 0);
      if (totalQty === 0) return false;
      
      return item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [stock, searchTerm]);

  const parseExpiryDate = (expiryStr) => {
    const [month, year] = expiryStr.split('/');
    return new Date(parseInt('20' + year), parseInt(month) - 1);
  };

  const addToCart = (stockItem) => {
    const sortedBatches = [...stockItem.batches]
      .filter(b => b.quantity > 0)
      .sort((a, b) => parseExpiryDate(a.expiryDate) - parseExpiryDate(b.expiryDate));

    if (sortedBatches.length === 0) {
      showNotification('No stock available!', 'error');
      return;
    }

    const oldestBatch = sortedBatches[0];
    
    const expiryDate = parseExpiryDate(oldestBatch.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      showNotification('Cannot sell expired medicine!', 'error');
      return;
    }

    const existingCartItem = cart.find(
      item => item.stockId === stockItem.id && item.batchNumber === oldestBatch.batchNumber
    );

    if (existingCartItem) {
      if (existingCartItem.quantity >= oldestBatch.quantity) {
        showNotification('No more stock in this batch!', 'error');
        return;
      }
      setCart(cart.map(item =>
        item.stockId === stockItem.id && item.batchNumber === oldestBatch.batchNumber
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        stockId: stockItem.id,
        medicineId: stockItem.medicineId,
        medicineName: stockItem.medicineName,
        genericName: stockItem.genericName,
        company: stockItem.company,
        packSize: stockItem.packSize,
        batchNumber: oldestBatch.batchNumber,
        expiryDate: oldestBatch.expiryDate,
        mrp: oldestBatch.mrp,
        purchasePrice: oldestBatch.purchasePrice,
        quantity: 1,
        maxQuantity: oldestBatch.quantity,
        daysUntilExpiry: daysUntilExpiry
      }]);
    }

    setSearchTerm('');
    setShowSearch(false);
  };

  const updateQuantity = (index, newQuantity) => {
    const item = cart[index];
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    if (newQuantity > item.maxQuantity) {
      showNotification(`Only ${item.maxQuantity} available in stock!`, 'error');
      return;
    }
    setCart(cart.map((item, i) => i === index ? { ...item, quantity: newQuantity } : item));
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
  };

  const handleCheckout = (paymentMethod) => {
    if (cart.length === 0) {
      showNotification('Cart is empty!', 'error');
      return;
    }

    onComplete({
      items: cart,
      subtotal: calculateTotal(),
      total: calculateTotal(),
      paymentMethod: paymentMethod,
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Medicine</h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
              className="w-full pl-10 pr-4 py-3 text-lg border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Search by name, generic name, or scan barcode..."
            />
          </div>

          {showSearch && searchTerm && (
            <div className="mt-2 max-h-96 overflow-y-auto border rounded-lg">
              {filteredStock.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No medicines found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredStock.map(item => {
                    const totalQty = item.batches.reduce((sum, b) => sum + b.quantity, 0);
                    const oldestBatch = [...item.batches]
                      .filter(b => b.quantity > 0)
                      .sort((a, b) => parseExpiryDate(a.expiryDate) - parseExpiryDate(b.expiryDate))[0];
                    
                    const expiryDate = parseExpiryDate(oldestBatch.expiryDate);
                    const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                    const isExpiringSoon = daysUntilExpiry < 90;
                    const isExpired = daysUntilExpiry < 0;

                    return (
                      <button
                        key={item.id}
                        onClick={() => !isExpired && addToCart(item)}
                        disabled={isExpired}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          isExpired ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{item.medicineName}</h3>
                              {isExpiringSoon && !isExpired && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                                  Expiring Soon
                                </span>
                              )}
                              {isExpired && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                  EXPIRED
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.genericName} - {item.company}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">Stock: {totalQty}</span>
                              <span className="text-gray-600">Batch: {oldestBatch.batchNumber}</span>
                              <span className={`${isExpiringSoon ? 'text-orange-600' : 'text-gray-600'}`}>
                                Exp: {oldestBatch.expiryDate}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">₹{oldestBatch.mrp.toFixed(2)}</div>
                            <div className="text-sm text-gray-500">{item.packSize}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Shopping Cart ({cart.length})</h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p>Cart is empty</p>
              <p className="text-sm">Search and add medicines to cart</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <CartItem
                  key={index}
                  item={item}
                  index={index}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6 sticky top-24">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment</h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Items</span>
              <span className="font-semibold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">₹{calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between py-4 bg-purple-50 rounded-lg px-4">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-3xl font-bold text-purple-600">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleCheckout('cash')}
              disabled={cart.length === 0}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-5 h-5" />
              <span className="font-semibold">Pay Cash</span>
            </button>

            <button
              onClick={() => handleCheckout('gpay')}
              disabled={cart.length === 0}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Smartphone className="w-5 h-5" />
              <span className="font-semibold">Pay GPay/UPI</span>
            </button>
          </div>

          {cart.some(item => item.daysUntilExpiry < 90) && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 mb-1">Expiry Warning</h4>
                  <p className="text-sm text-orange-800">
                    Some items in cart are expiring within 90 days
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== CART ITEM ====================

function CartItem({ item, index, onUpdateQuantity, onRemove }) {
  const isExpiringSoon = item.daysUntilExpiry < 90;

  return (
    <div className={`border rounded-lg p-4 ${isExpiringSoon ? 'border-orange-300 bg-orange-50' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{item.medicineName}</h4>
          <p className="text-sm text-gray-600 mb-2">{item.company} - {item.packSize}</p>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Barcode className="w-3 h-3" />
              <span>Batch: {item.batchNumber}</span>
            </div>
            <div className={`flex items-center gap-1 ${isExpiringSoon ? 'text-orange-600 font-medium' : ''}`}>
              <Calendar className="w-3 h-3" />
              <span>Exp: {item.expiryDate}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-lg font-semibold w-12 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500">of {item.maxQuantity}</span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">₹{item.mrp.toFixed(2)} each</div>
          <div className="text-xl font-bold text-purple-600">₹{(item.mrp * item.quantity).toFixed(2)}</div>
        </div>
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
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6" id="receipt">
        <div className="text-center mb-6 border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Village Pharmacy</h1>
          <p className="text-gray-600">Market Road, Jeddah</p>
          <p className="text-gray-600">Phone: +966 XXX XXX XXX</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Receipt #:</p>
            <p className="font-semibold">{sale.id.toString().padStart(6, '0')}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Date:</p>
            <p className="font-semibold">{new Date(sale.timestamp).toLocaleString()}</p>
          </div>
        </div>

        <table className="w-full mb-6">
          <thead className="border-b-2 border-gray-300">
            <tr>
              <th className="text-left py-2">Item</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sale.items.map((item, index) => (
              <tr key={index}>
                <td className="py-3">
                  <div className="font-medium">{item.medicineName}</div>
                  <div className="text-xs text-gray-500">Batch: {item.batchNumber} | Exp: {item.expiryDate}</div>
                </td>
                <td className="text-center py-3">{item.quantity}</td>
                <td className="text-right py-3">₹{item.mrp.toFixed(2)}</td>
                <td className="text-right py-3 font-semibold">₹{(item.mrp * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t-2 border-gray-300 pt-4 mb-6">
          <div className="flex justify-between text-lg mb-2">
            <span>Subtotal:</span>
            <span>₹{sale.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold">
            <span>Total:</span>
            <span>₹{sale.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Payment Method:</span>
            <span className="uppercase">{sale.paymentMethod}</span>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 border-t pt-4">
          <p className="mb-2">Thank you for your purchase!</p>
          <p>Please check expiry dates before use</p>
        </div>
      </div>

      <div className="flex gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Printer className="w-5 h-5" />
          Print Receipt
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          New Sale
        </button>
      </div>
    </div>
  );
}