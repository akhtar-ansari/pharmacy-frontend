import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Printer, Search, Settings, Zap, Package, ScanLine, Edit2, Save, X, CheckCircle, AlertCircle, Grid, List, RefreshCw } from 'lucide-react';
import { medicinesAPI, stockAPI } from '../services/api';

// ==================== MAIN APP COMPONENT ====================

export default function BarcodeSystemApp({ appData, setAppData }) {
  const [medicines, setMedicines] = useState([]);
  const [stock, setStock] = useState([]);
  const [view, setView] = useState('scanner');
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [notification, setNotification] = useState(null);
  const [barcodeFormat, setBarcodeFormat] = useState('code128');
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const scanInputRef = useRef(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medicinesRes, stockRes] = await Promise.all([
        medicinesAPI.getAll(),
        stockAPI.getAll()
      ]);

      if (medicinesRes.success) setMedicines(medicinesRes.data);
      if (stockRes.success) setStock(stockRes.data);

      showNotification('✅ Data loaded from database', 'success');
    } catch (error) {
      showNotification('❌ Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const generateBarcode = async (medicineId) => {
    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine.barcode || medicine.barcode === '') {
      const newBarcode = `MED${String(medicineId).padStart(6, '0')}`;
      
      try {
        const result = await medicinesAPI.update(medicineId, { ...medicine, barcode: newBarcode });
        if (result.success) {
          setMedicines(medicines.map(m => 
            m.id === medicineId ? { ...m, barcode: newBarcode } : m
          ));
          showNotification(`Barcode generated for ${medicine.name}`, 'success');
          return newBarcode;
        }
      } catch (error) {
        showNotification('Failed to generate barcode: ' + error.message, 'error');
      }
    }
    return medicine.barcode;
  };

  const generateAllBarcodes = async () => {
    let count = 0;
    const updates = [];
    
    for (const m of medicines) {
      if (!m.barcode || m.barcode === '') {
        count++;
        const newBarcode = `MED${String(m.id).padStart(6, '0')}`;
        updates.push(medicinesAPI.update(m.id, { ...m, barcode: newBarcode }));
      }
    }

    try {
      await Promise.all(updates);
      await loadData();
      showNotification(`Generated ${count} barcodes successfully!`, 'success');
    } catch (error) {
      showNotification('Failed to generate barcodes: ' + error.message, 'error');
    }
  };

  const handleScan = (code) => {
    const found = medicines.find(m => m.barcode === code || m.barcode === code.toUpperCase());
    
    if (found) {
      // Get stock info
      const stockInfo = stock.filter(s => s.medicine_id === found.id);
      const totalStock = stockInfo.reduce((sum, s) => sum + s.quantity, 0);
      
      setScanResult({ ...found, stockInfo, totalStock });
      showNotification(`Found: ${found.name}`, 'success');
    } else {
      setScanResult(null);
      showNotification(`No medicine found with barcode: ${code}`, 'error');
    }
  };

  useEffect(() => {
    if (scannerActive && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [scannerActive]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && scannedCode) {
      handleScan(scannedCode);
      setScannedCode('');
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
                  Barcode Management System
                </h1>
                <p className="text-sm text-gray-500">
                  {loading ? '⏳ Loading...' : '✅ Connected to Database'}
                </p>
              </div>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
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
              <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
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
        <div className="mb-6">
          <div className="flex gap-2">
            {[
              { id: 'scanner', label: 'Barcode Scanner', icon: ScanLine },
              { id: 'generator', label: 'Generate Barcodes', icon: Zap },
              { id: 'printer', label: 'Print Labels', icon: Printer },
              { id: 'manager', label: 'Manage Barcodes', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  view === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {view === 'scanner' && (
          <BarcodeScanner
            scannerActive={scannerActive}
            setScannerActive={setScannerActive}
            scannedCode={scannedCode}
            setScannedCode={setScannedCode}
            scanResult={scanResult}
            handleScan={handleScan}
            handleKeyPress={handleKeyPress}
            scanInputRef={scanInputRef}
            medicines={medicines}
          />
        )}

        {view === 'generator' && (
          <BarcodeGenerator
            medicines={medicines}
            generateBarcode={generateBarcode}
            generateAllBarcodes={generateAllBarcodes}
            barcodeFormat={barcodeFormat}
            setBarcodeFormat={setBarcodeFormat}
          />
        )}

        {view === 'printer' && (
          <BarcodePrinter
            medicines={medicines}
            selectedMedicines={selectedMedicines}
            setSelectedMedicines={setSelectedMedicines}
            showNotification={showNotification}
          />
        )}

        {view === 'manager' && (
          <BarcodeManager
            medicines={medicines}
            setMedicines={setMedicines}
            showNotification={showNotification}
            loadData={loadData}
          />
        )}
      </div>
    </div>
  );
}

// ==================== BARCODE SCANNER ====================

function BarcodeScanner({ 
  scannerActive, 
  setScannerActive, 
  scannedCode, 
  setScannedCode, 
  scanResult, 
  handleScan,
  handleKeyPress,
  scanInputRef,
  medicines
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMedicines = medicines.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Barcode Scanner</h2>
            <p className="text-gray-600 mt-1">Scan items using hardware scanner or manual entry</p>
          </div>
          <button
            onClick={() => setScannerActive(!scannerActive)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              scannerActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
            }`}
          >
            <ScanLine className="w-5 h-5" />
            {scannerActive ? 'Stop Scanner' : 'Start Scanner'}
          </button>
        </div>

        {scannerActive && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-pulse">
                  <ScanLine className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900">Scanner Active</h3>
                  <p className="text-sm text-blue-700">Ready to scan barcodes...</p>
                </div>
              </div>

              <div className="relative">
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Point scanner here and scan barcode..."
                  className="w-full px-4 py-4 text-2xl font-mono border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (scannedCode) {
                      handleScan(scannedCode);
                      setScannedCode('');
                    }
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Search
                </button>
              </div>

              <p className="text-sm text-blue-600 mt-2">
                💡 Tip: Click in the box above and scan with your USB barcode scanner
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-gray-400" />
                <h4 className="font-semibold text-gray-900">Manual Search</h4>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by medicine name or barcode..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <div className="mt-3 max-h-60 overflow-y-auto border rounded-lg">
                  {filteredMedicines.map(med => (
                    <button
                      key={med.id}
                      onClick={() => {
                        handleScan(med.barcode);
                        setSearchTerm('');
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-semibold text-gray-900">{med.name}</div>
                      <div className="text-sm text-gray-500">Barcode: {med.barcode || 'Not Generated'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {scanResult && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">Medicine Found!</h3>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-2xl text-gray-900 mb-2">{scanResult.name}</h4>
                <p className="text-gray-600 mb-4">{scanResult.generic_name}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Manufacturer:</span>
                    <span className="font-semibold">{scanResult.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-semibold">{scanResult.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold">{scanResult.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Stock:</span>
                    <span className="font-bold text-blue-600 text-xl">{scanResult.totalStock || 0} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">MRP:</span>
                    <span className="font-bold text-green-600 text-xl">₹{parseFloat(scanResult.mrp || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchase Price:</span>
                    <span className="font-semibold">₹{parseFloat(scanResult.purchase_price || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
                <BarcodeDisplay code={scanResult.barcode} />
                <p className="font-mono text-lg font-bold text-gray-900 mt-4">{scanResult.barcode}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h3 className="font-bold text-purple-900 mb-3">📱 Scanner Setup Instructions</h3>
        <div className="space-y-2 text-purple-800">
          <p><strong>For USB Barcode Scanner:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Plug in your USB barcode scanner</li>
            <li>Click "Start Scanner" button</li>
            <li>Click in the blue input box</li>
            <li>Scan any barcode - it will automatically search!</li>
          </ol>
          <p className="mt-3"><strong>For Manual Entry:</strong></p>
          <p className="ml-4">Type the barcode or medicine name in the search box below</p>
        </div>
      </div>
    </div>
  );
}

// ==================== BARCODE GENERATOR ====================

function BarcodeGenerator({ medicines, generateBarcode, generateAllBarcodes, barcodeFormat, setBarcodeFormat }) {
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = {
    total: medicines.length,
    withBarcode: medicines.filter(m => m.barcode && m.barcode !== '').length,
    withoutBarcode: medicines.filter(m => !m.barcode || m.barcode === '').length
  };

  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return medicines;
    return medicines.filter(m =>
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [medicines, searchTerm]);

  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedicines, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Medicines</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">With Barcode</p>
              <p className="text-3xl font-bold text-green-600">{stats.withBarcode}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Without Barcode</p>
              <p className="text-3xl font-bold text-orange-600">{stats.withoutBarcode}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Barcode Format</label>
              <select
                value={barcodeFormat}
                onChange={(e) => setBarcodeFormat(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="code128">Code 128 (Standard)</option>
                <option value="ean13">EAN-13</option>
                <option value="qr">QR Code</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={generateAllBarcodes}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            <Zap className="w-5 h-5" />
            Generate All Missing Barcodes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Medicine Barcodes</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedMedicines.map(medicine => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                format={barcodeFormat}
                onGenerate={() => generateBarcode(medicine.id)}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedMedicines.map(medicine => (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{medicine.name}</div>
                      <div className="text-sm text-gray-500">{medicine.generic_name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{medicine.manufacturer}</td>
                    <td className="px-6 py-4 font-mono text-sm font-bold">
                      {medicine.barcode || <span className="text-orange-600">Not Generated</span>}
                    </td>
                    <td className="px-6 py-4">
                      {medicine.barcode && <BarcodeDisplay code={medicine.barcode} height={40} />}
                    </td>
                    <td className="px-6 py-4">
                      {!medicine.barcode && (
                        <button
                          onClick={() => generateBarcode(medicine.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                        >
                          Generate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t flex items-center justify-between">
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
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredMedicines.length)} to {Math.min(currentPage * itemsPerPage, filteredMedicines.length)} of {filteredMedicines.length}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm font-medium">
              {currentPage} / {Math.ceil(filteredMedicines.length / itemsPerPage) || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredMedicines.length / itemsPerPage), prev + 1))}
              disabled={currentPage >= Math.ceil(filteredMedicines.length / itemsPerPage)}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MEDICINE CARD ====================

function MedicineCard({ medicine, format, onGenerate }) {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all">
      <h4 className="font-bold text-gray-900 mb-1">{medicine.name}</h4>
      <p className="text-sm text-gray-600 mb-3">{medicine.manufacturer}</p>

      {medicine.barcode ? (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <BarcodeDisplay code={medicine.barcode} height={60} />
          <p className="font-mono text-sm font-bold text-center mt-2">{medicine.barcode}</p>
        </div>
      ) : (
        <div className="bg-orange-50 rounded-lg p-4 mb-3 border border-orange-200">
          <p className="text-orange-800 text-sm text-center">No barcode generated</p>
        </div>
      )}

      {!medicine.barcode && (
        <button
          onClick={onGenerate}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Generate Barcode
        </button>
      )}
    </div>
  );
}

// ==================== BARCODE DISPLAY ====================

function BarcodeDisplay({ code, height = 80 }) {
  if (!code) return null;
  
  return (
    <div className="flex justify-center bg-white p-2 rounded">
      <svg width={code.length * 8} height={height}>
        <rect x="0" y="0" width={code.length * 8} height={height} fill="white" />
        {code.split('').map((char, idx) => {
          const isBar = parseInt(char, 36) % 2 === 0;
          return isBar ? (
            <rect
              key={idx}
              x={idx * 8}
              y="0"
              width="6"
              height={height}
              fill="black"
            />
          ) : null;
        })}
      </svg>
    </div>
  );
}

// ==================== BARCODE PRINTER ====================

function BarcodePrinter({ medicines, selectedMedicines, setSelectedMedicines, showNotification }) {
  const [labelSize, setLabelSize] = useState('40x25');
  const [includePrice, setIncludePrice] = useState(true);
  const [includeName, setIncludeName] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return medicines;
    return medicines.filter(m =>
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [medicines, searchTerm]);

  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedicines, currentPage, itemsPerPage]);

  const toggleSelection = (id) => {
    setSelectedMedicines(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedMedicines(medicines.map(m => m.id));
  };

  const clearAll = () => {
    setSelectedMedicines([]);
  };

  const handlePrint = () => {
    if (selectedMedicines.length === 0) {
      showNotification('Please select at least one medicine to print', 'error');
      return;
    }
    window.print();
    showNotification(`Printing ${selectedMedicines.length} labels...`, 'success');
  };

  const selectedMeds = medicines.filter(m => selectedMedicines.includes(m.id));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Print Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label Size</label>
            <select
              value={labelSize}
              onChange={(e) => setLabelSize(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="40x25">40mm x 25mm (Standard)</option>
              <option value="50x25">50mm x 25mm (Large)</option>
              <option value="30x20">30mm x 20mm (Small)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeName}
                onChange={(e) => setIncludeName(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Include Medicine Name</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePrice}
                onChange={(e) => setIncludePrice(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Include Price (MRP)</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={selectAll}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Select All ({medicines.length})
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Clear Selection
          </button>
          <button
            onClick={handlePrint}
            disabled={selectedMedicines.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
            Print {selectedMedicines.length} Labels
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              Select Medicines ({selectedMedicines.length} selected)
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedMedicines.map(medicine => (
            <label
              key={medicine.id}
              className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                selectedMedicines.includes(medicine.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedMedicines.includes(medicine.id)}
                  onChange={() => toggleSelection(medicine.id)}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{medicine.name}</h4>
                  <p className="text-sm text-gray-600">{medicine.manufacturer}</p>
                  <p className="text-sm font-mono text-gray-500 mt-1">{medicine.barcode || 'No barcode'}</p>
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between">
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
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredMedicines.length)} to {Math.min(currentPage * itemsPerPage, filteredMedicines.length)} of {filteredMedicines.length}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm font-medium">
              {currentPage} / {Math.ceil(filteredMedicines.length / itemsPerPage) || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredMedicines.length / itemsPerPage), prev + 1))}
              disabled={currentPage >= Math.ceil(filteredMedicines.length / itemsPerPage)}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedMeds.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 bg-gray-50 border-b print:hidden">
            <h3 className="text-lg font-bold text-gray-900">Print Preview</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {selectedMeds.map(medicine => (
                <div key={medicine.id} className="border-2 border-dashed border-gray-300 p-3 rounded bg-white">
                  {includeName && (
                    <div className="font-bold text-xs mb-1 truncate">{medicine.name}</div>
                  )}
                  <div className="bg-white p-1">
                    <BarcodeDisplay code={medicine.barcode} height={40} />
                  </div>
                  <div className="font-mono text-xs text-center mt-1">{medicine.barcode}</div>
                  {includePrice && (
                    <div className="font-bold text-sm text-center mt-1">MRP: ₹{parseFloat(medicine.mrp || 0).toFixed(2)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== BARCODE MANAGER ====================

function BarcodeManager({ medicines, setMedicines, showNotification, loadData }) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return medicines;
    return medicines.filter(m =>
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [medicines, searchTerm]);

  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedicines, currentPage, itemsPerPage]);

  const startEdit = (medicine) => {
    setEditingId(medicine.id);
    setEditValue(medicine.barcode);
  };

  const saveEdit = async () => {
    if (!editValue.trim()) {
      showNotification('Barcode cannot be empty', 'error');
      return;
    }

    const medicine = medicines.find(m => m.id === editingId);
    
    try {
      const result = await medicinesAPI.update(editingId, { ...medicine, barcode: editValue });
      if (result.success) {
        setMedicines(medicines.map(m =>
          m.id === editingId ? { ...m, barcode: editValue } : m
        ));
        setEditingId(null);
        setEditValue('');
        showNotification('Barcode updated successfully!', 'success');
      }
    } catch (error) {
      showNotification('Failed to update barcode: ' + error.message, 'error');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Manage Barcodes</h3>
            <p className="text-sm text-gray-600">Edit or update medicine barcodes</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Barcode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedMedicines.map(medicine => (
              <tr key={medicine.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{medicine.name}</div>
                  <div className="text-sm text-gray-500">{medicine.generic_name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{medicine.manufacturer}</td>
                <td className="px-6 py-4">
                  {editingId === medicine.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="px-3 py-2 border-2 border-blue-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span className="font-mono font-bold">{medicine.barcode || 'Not generated'}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {medicine.barcode && editingId !== medicine.id && (
                    <BarcodeDisplay code={medicine.barcode} height={40} />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {editingId === medicine.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(medicine)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t flex items-center justify-between">
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
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredMedicines.length)} to {Math.min(currentPage * itemsPerPage, filteredMedicines.length)} of {filteredMedicines.length}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm font-medium">
            {currentPage} / {Math.ceil(filteredMedicines.length / itemsPerPage) || 1}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredMedicines.length / itemsPerPage), prev + 1))}
            disabled={currentPage >= Math.ceil(filteredMedicines.length / itemsPerPage)}
            className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
