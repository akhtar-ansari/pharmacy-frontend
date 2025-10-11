import React, { useState, useEffect } from 'react';
import { ScanLine, Search, Hash, RefreshCw, CheckCircle, AlertCircle, X, Package } from 'lucide-react';
import { medicinesAPI } from '../services/api';

export default function BarcodeSystemApp({ appData, setAppData }) {
  const [medicines, setMedicines] = useState([]);
  const [scannedCode, setScannedCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicinesAPI.getAll();
      if (response.success) {
        setMedicines(response.data);
        showNotification('✅ Medicines loaded from database', 'success');
      }
    } catch (error) {
      showNotification('❌ Failed to load medicines: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSearch = (code) => {
    if (!code) return;

    const found = medicines.find(m => 
      m.barcode?.toLowerCase() === code.toLowerCase() ||
      m.name?.toLowerCase() === code.toLowerCase()
    );

    if (found) {
      setSearchResult(found);
      showNotification(`✅ Found: ${found.name}`, 'success');
    } else {
      setSearchResult(null);
      showNotification(`❌ No medicine found with code: ${code}`, 'error');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && scannedCode) {
      handleSearch(scannedCode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white shadow-md border-b-2 border-blue-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <ScanLine className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Barcode System
                </h1>
                <p className="text-sm text-gray-500">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>

            <button
              onClick={loadMedicines}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
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

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Scanner */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 animate-pulse">
              <ScanLine className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Scan or Enter Barcode</h2>
            <p className="text-gray-600 mt-2">Use a barcode scanner or manually enter the code</p>
          </div>

          <div className="relative">
            <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scan barcode or type medicine name..."
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
              autoFocus
            />
            <button
              onClick={() => handleSearch(scannedCode)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-8 border-2 border-green-200 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="bg-green-600 p-3 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">{searchResult.name}</h3>
                  <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                    Found
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Generic Name</p>
                    <p className="font-semibold text-gray-900">{searchResult.generic_name}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-semibold text-gray-900">{searchResult.company}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-semibold text-gray-900">{searchResult.category}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Pack Size</p>
                    <p className="font-semibold text-gray-900">{searchResult.pack_size}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-600">MRP</p>
                    <p className="font-bold text-green-600 text-xl">₹{searchResult.mrp}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Barcode</p>
                    <p className="font-mono font-semibold text-gray-900">{searchResult.barcode}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSearchResult(null);
                    setScannedCode('');
                  }}
                  className="mt-6 w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                >
                  Scan Next Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">📖 How to Use:</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Use a USB barcode scanner to scan medicine barcodes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Or manually type the barcode number or medicine name</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Press Enter or click Search to find the medicine</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Medicine details will appear instantly from the database</span>
            </li>
          </ul>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600 text-sm mb-1">Total Medicines</p>
            <p className="text-3xl font-bold text-blue-600">{medicines.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600 text-sm mb-1">With Barcodes</p>
            <p className="text-3xl font-bold text-green-600">
              {medicines.filter(m => m.barcode).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600 text-sm mb-1">Missing Barcodes</p>
            <p className="text-3xl font-bold text-orange-600">
              {medicines.filter(m => !m.barcode).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}