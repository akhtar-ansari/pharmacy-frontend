/**
 * ============================================================================
 * BARCODE PARSER UTILITY
 * ============================================================================
 * 
 * Purpose: Auto-detect and parse different barcode types for Pharmacy PMS
 * 
 * Supported Formats:
 * 1. GS1 Digital Link (URL) - https://go.gs1.org/01/GTIN/10/BATCH...
 * 2. GS1 Traditional - (01)GTIN(17)EXPIRY(10)BATCH(21)SERIAL
 * 3. EAN-13 / EAN-8 - Pure numeric 8 or 13 digits
 * 4. Internal QR - INT-xxx or MED-xxx format
 * 5. Text Search - Any other input treated as medicine name search
 * 
 * Usage:
 *   import { parseUniversalBarcode } from './utils/barcodeParser';
 *   const result = parseUniversalBarcode(scannedData);
 * 
 * Author: Arwa Enterprises
 * Last Updated: March 2026
 * ============================================================================
 */


// ============================================================================
// MAIN FUNCTION - Entry point for all barcode parsing
// ============================================================================

/**
 * parseUniversalBarcode - Detects barcode type and parses accordingly
 * 
 * @param {string} scannedData - Raw input from scanner or manual entry
 * @returns {object} - Parsed result with type and extracted fields
 * 
 * Return object structure:
 * {
 *   type: 'gs1' | 'ean' | 'internal' | 'text',
 *   gtin: string | null,        // 14-digit GTIN (padded if needed)
 *   barcode: string | null,     // Original barcode for EAN
 *   batch: string | null,       // Batch/Lot number
 *   expiry: string | null,      // Expiry date as YYYY-MM-DD
 *   manufacturing: string | null, // MFG date as YYYY-MM-DD
 *   serial: string | null,      // Serial number
 *   searchTerm: string | null,  // For text search
 *   raw: string,                // Original scanned input
 *   error: string | null        // Error message if parsing failed
 * }
 */
export function parseUniversalBarcode(scannedData) {
  // Step 1: Clean the input - remove extra spaces and trim
  const data = (scannedData || '').trim();
  
  // Step 2: Return error if empty input
  if (!data) {
    return createEmptyResult('Empty input', data);
  }
  
  // Step 3: Detect type and parse accordingly (order matters!)
  
  // CHECK 1: GS1 Digital Link (URL format)
  // Example: https://go.gs1.org/01/06291100080557/10/02222?17=250819
  if (isGS1DigitalLink(data)) {
    return parseGS1DigitalLink(data);
  }
  
  // CHECK 2: GS1 Traditional format with parentheses
  // Example: (01)06291100080557(17)250819(10)02222
  if (isGS1Traditional(data)) {
    return parseGS1Traditional(data);
  }
  
  // CHECK 3: GS1 without parentheses (pure numeric with AIs)
  // Example: 010629110008055717250819102222
  if (isGS1Numeric(data)) {
    return parseGS1Numeric(data);
  }
  
  // CHECK 4: EAN-13 or EAN-8 (pure numeric, 8 or 13 digits)
  // Example: 6291100080557
  if (isEAN(data)) {
    return parseEAN(data);
  }
  
  // CHECK 5: Internal QR code format
  // Example: INT-MED-001 or MED-123-BATCH-456
  if (isInternalQR(data)) {
    return parseInternalQR(data);
  }
  
  // DEFAULT: Treat as text search (medicine name)
  return {
    type: 'text',
    gtin: null,
    barcode: null,
    batch: null,
    expiry: null,
    manufacturing: null,
    serial: null,
    searchTerm: data,  // Use input as search term
    raw: data,
    error: null
  };
}


// ============================================================================
// DETECTION FUNCTIONS - Check what type of barcode it is
// ============================================================================

/**
 * isGS1DigitalLink - Check if input is a GS1 Digital Link URL
 * 
 * Patterns to detect:
 * - https://go.gs1.org/01/...
 * - https://id.gs1.org/01/...
 * - Any URL containing /01/ followed by digits (GTIN path)
 */
function isGS1DigitalLink(data) {
  // Check for common GS1 Digital Link domains
  if (data.includes('gs1.org') || data.includes('gs1.')) {
    return true;
  }
  
  // Check for URL with /01/ pattern (GTIN in path)
  if (data.startsWith('http') && data.includes('/01/')) {
    return true;
  }
  
  return false;
}

/**
 * isGS1Traditional - Check if input has GS1 Application Identifiers in parentheses
 * 
 * Pattern: (01)xxxxx or (17)xxxxx etc.
 */
function isGS1Traditional(data) {
  // Must contain at least one AI in parentheses format
  return /\(\d{2}\)/.test(data);
}

/**
 * isGS1Numeric - Check if input is GS1 without parentheses
 * 
 * Pattern: Starts with 01 followed by 14 digits (GTIN)
 * Example: 010629110008055717250819
 */
function isGS1Numeric(data) {
  // Must be all numeric and start with 01 + 14 digit GTIN
  if (!/^\d+$/.test(data)) return false;
  
  // Minimum length: 01 (2) + GTIN (14) = 16 digits
  if (data.length < 16) return false;
  
  // Must start with 01 (GTIN AI)
  if (!data.startsWith('01')) return false;
  
  return true;
}

/**
 * isEAN - Check if input is EAN-8 or EAN-13 barcode
 * 
 * EAN-8: Exactly 8 digits
 * EAN-13: Exactly 13 digits
 * Also accepts 12 digits (UPC-A) and 14 digits (GTIN-14)
 */
function isEAN(data) {
  // Must be pure numeric
  if (!/^\d+$/.test(data)) return false;
  
  // Valid lengths: 8 (EAN-8), 12 (UPC-A), 13 (EAN-13), 14 (GTIN-14)
  return [8, 12, 13, 14].includes(data.length);
}

/**
 * isInternalQR - Check if input is internal QR code format
 * 
 * Patterns:
 * - Starts with INT-
 * - Starts with MED-
 * - Contains pipe separator |
 */
function isInternalQR(data) {
  const upperData = data.toUpperCase();
  return upperData.startsWith('INT-') || 
         upperData.startsWith('MED-') || 
         data.includes('|');
}


// ============================================================================
// PARSING FUNCTIONS - Extract data from each barcode type
// ============================================================================

/**
 * parseGS1DigitalLink - Parse GS1 Digital Link URL format
 * 
 * Handles multiple URL formats:
 * 
 * Format 1 (Path-based):
 * https://go.gs1.org/01/06291100080557/10/02222/21/SERIAL?17=250819
 * 
 * Format 2 (Query-based):
 * https://go.gs1.org/01/06291100080557?10=02222&17=250819&21=SERIAL
 * 
 * Format 3 (Mixed path + query):
 * https://go.gs1.org/01/06291100080557/10/02222?17=250819
 */
function parseGS1DigitalLink(data) {
  const result = createEmptyResult(null, data);
  result.type = 'gs1';
  
  try {
    // Extract values from both path and query string
    const pathValues = extractFromPath(data);
    const queryValues = extractFromQuery(data);
    
    // Merge values (path takes priority, query fills gaps)
    const merged = { ...queryValues, ...pathValues };
    
    // GTIN - AI 01 (14 digits, pad with leading zero if 13)
    if (merged['01']) {
      result.gtin = padGTIN(merged['01']);
    }
    
    // Batch/Lot - AI 10
    if (merged['10']) {
      result.batch = merged['10'];
    }
    
    // Expiry Date - AI 17 (YYMMDD format)
    if (merged['17']) {
      result.expiry = parseGS1Date(merged['17']);
    }
    
    // Manufacturing Date - AI 11 (YYMMDD format)
    if (merged['11']) {
      result.manufacturing = parseGS1Date(merged['11']);
    }
    
    // Serial Number - AI 21
    if (merged['21']) {
      result.serial = merged['21'];
    }
    
  } catch (err) {
    result.error = `Failed to parse GS1 URL: ${err.message}`;
  }
  
  return result;
}

/**
 * extractFromPath - Extract AI values from URL path
 * 
 * Example path: /01/06291100080557/10/02222/21/SERIAL
 * Returns: { '01': '06291100080557', '10': '02222', '21': 'SERIAL' }
 */
function extractFromPath(url) {
  const values = {};
  
  // List of Application Identifiers to look for in path
  const aiCodes = ['01', '10', '11', '17', '21'];
  
  for (const ai of aiCodes) {
    // Pattern: /AI/VALUE or /AI/VALUE/
    const pattern = new RegExp(`/${ai}/([^/?]+)`);
    const match = url.match(pattern);
    
    if (match && match[1]) {
      values[ai] = decodeURIComponent(match[1]);
    }
  }
  
  return values;
}

/**
 * extractFromQuery - Extract AI values from URL query string
 * 
 * Example query: ?17=250819&11=230901
 * Returns: { '17': '250819', '11': '230901' }
 */
function extractFromQuery(url) {
  const values = {};
  
  // Get query string part (after ?)
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) return values;
  
  const queryString = url.substring(queryIndex + 1);
  
  // Parse each parameter
  const params = queryString.split('&');
  for (const param of params) {
    const [key, value] = param.split('=');
    if (key && value) {
      values[key] = decodeURIComponent(value);
    }
  }
  
  return values;
}

/**
 * parseGS1Traditional - Parse GS1 with parentheses format
 * 
 * Example: (01)06291100080557(17)250819(10)02222(21)SERIAL
 */
function parseGS1Traditional(data) {
  const result = createEmptyResult(null, data);
  result.type = 'gs1';
  
  try {
    // GTIN - AI (01) - Fixed 14 digits
    const gtinMatch = data.match(/\(01\)(\d{13,14})/);
    if (gtinMatch) {
      result.gtin = padGTIN(gtinMatch[1]);
    }
    
    // Batch/Lot - AI (10) - Variable length, ends at next ( or end
    const batchMatch = data.match(/\(10\)([^(]+)/);
    if (batchMatch) {
      result.batch = batchMatch[1].trim();
    }
    
    // Expiry Date - AI (17) - 6 digits YYMMDD
    const expiryMatch = data.match(/\(17\)(\d{4,8})/);
    if (expiryMatch) {
      result.expiry = parseGS1Date(expiryMatch[1]);
    }
    
    // Manufacturing Date - AI (11) - 6 digits YYMMDD
    const mfgMatch = data.match(/\(11\)(\d{4,8})/);
    if (mfgMatch) {
      result.manufacturing = parseGS1Date(mfgMatch[1]);
    }
    
    // Serial Number - AI (21) - Variable length
    const serialMatch = data.match(/\(21\)([^(]+)/);
    if (serialMatch) {
      result.serial = serialMatch[1].trim();
    }
    
  } catch (err) {
    result.error = `Failed to parse GS1 traditional: ${err.message}`;
  }
  
  return result;
}

/**
 * parseGS1Numeric - Parse GS1 without parentheses (pure numeric)
 * 
 * Example: 010629110008055717250819102222
 * 
 * Structure:
 * - 01 + 14 digits = GTIN
 * - 17 + 6 digits = Expiry
 * - 10 + variable = Batch (until next AI or end)
 * - 11 + 6 digits = MFG date
 * - 21 + variable = Serial
 */
function parseGS1Numeric(data) {
  const result = createEmptyResult(null, data);
  result.type = 'gs1';
  
  try {
    let remaining = data;
    
    // Extract GTIN (01 + 14 digits) - Always first
    if (remaining.startsWith('01')) {
      result.gtin = padGTIN(remaining.substring(2, 16));
      remaining = remaining.substring(16);
    }
    
    // Now parse remaining AIs
    // Note: This is simplified - real implementation may need GS (Group Separator)
    
    // Look for 17 (Expiry) - 17 + 6 digits
    const expiryIndex = remaining.indexOf('17');
    if (expiryIndex !== -1) {
      const expiryValue = remaining.substring(expiryIndex + 2, expiryIndex + 8);
      if (/^\d{6}$/.test(expiryValue)) {
        result.expiry = parseGS1Date(expiryValue);
      }
    }
    
    // Look for 11 (MFG) - 11 + 6 digits
    const mfgIndex = remaining.indexOf('11');
    if (mfgIndex !== -1 && mfgIndex !== expiryIndex) {
      const mfgValue = remaining.substring(mfgIndex + 2, mfgIndex + 8);
      if (/^\d{6}$/.test(mfgValue)) {
        result.manufacturing = parseGS1Date(mfgValue);
      }
    }
    
    // Look for 10 (Batch) - Variable length, harder to parse without separators
    const batchIndex = remaining.indexOf('10');
    if (batchIndex !== -1) {
      // Extract batch - assume it ends at next known AI or end
      let batchEnd = remaining.length;
      ['17', '11', '21'].forEach(ai => {
        const idx = remaining.indexOf(ai, batchIndex + 2);
        if (idx !== -1 && idx < batchEnd) batchEnd = idx;
      });
      result.batch = remaining.substring(batchIndex + 2, batchEnd);
    }
    
  } catch (err) {
    result.error = `Failed to parse GS1 numeric: ${err.message}`;
  }
  
  return result;
}

/**
 * parseEAN - Parse EAN-8, EAN-13, UPC-A, or GTIN-14
 * 
 * Simply captures the barcode and converts to 14-digit GTIN
 */
function parseEAN(data) {
  return {
    type: 'ean',
    gtin: padGTIN(data),       // Pad to 14 digits
    barcode: data,             // Keep original barcode
    batch: null,
    expiry: null,
    manufacturing: null,
    serial: null,
    searchTerm: null,
    raw: data,
    error: null
  };
}

/**
 * parseInternalQR - Parse internal QR code format
 * 
 * Formats supported:
 * - INT-{medicine_id}
 * - MED-{medicine_id}|BATCH-{batch}
 * - MED-{id}-{batch}-{expiry}
 */
function parseInternalQR(data) {
  const result = createEmptyResult(null, data);
  result.type = 'internal';
  
  try {
    // Format: MED-xxx|BATCH-yyy
    if (data.includes('|')) {
      const parts = data.split('|');
      
      // Extract medicine ID
      const medPart = parts.find(p => p.toUpperCase().startsWith('MED-') || p.toUpperCase().startsWith('INT-'));
      if (medPart) {
        result.searchTerm = medPart.replace(/^(MED-|INT-)/i, '');
      }
      
      // Extract batch
      const batchPart = parts.find(p => p.toUpperCase().startsWith('BATCH-'));
      if (batchPart) {
        result.batch = batchPart.replace(/^BATCH-/i, '');
      }
    } else {
      // Simple format: INT-xxx or MED-xxx
      result.searchTerm = data.replace(/^(MED-|INT-)/i, '');
    }
    
  } catch (err) {
    result.error = `Failed to parse internal QR: ${err.message}`;
  }
  
  return result;
}


// ============================================================================
// HELPER FUNCTIONS - Utility functions used by parsers
// ============================================================================

/**
 * createEmptyResult - Create a blank result object
 * 
 * @param {string|null} error - Error message if any
 * @param {string} raw - Original scanned data
 */
function createEmptyResult(error, raw) {
  return {
    type: 'unknown',
    gtin: null,
    barcode: null,
    batch: null,
    expiry: null,
    manufacturing: null,
    serial: null,
    searchTerm: null,
    raw: raw || '',
    error: error
  };
}

/**
 * padGTIN - Pad barcode to 14-digit GTIN format
 * 
 * EAN-8  (8 digits)  → pad 6 zeros at start
 * EAN-13 (13 digits) → pad 1 zero at start
 * GTIN-14 (14 digits) → no change
 * 
 * @param {string} barcode - Input barcode
 * @returns {string} - 14-digit GTIN
 */
function padGTIN(barcode) {
  if (!barcode) return null;
  
  // Remove any non-numeric characters
  const numeric = barcode.replace(/\D/g, '');
  
  // Pad to 14 digits with leading zeros
  return numeric.padStart(14, '0');
}

/**
 * parseGS1Date - Parse GS1 date formats to YYYY-MM-DD
 * 
 * Supported formats:
 * - YYMMDD (6 digits) → 250819 = 2025-08-19
 * - YYMM (4 digits)   → 2508 = 2025-08-31 (last day of month)
 * - YYYYMMDD (8 digits) → 20250819 = 2025-08-19
 * 
 * Year handling:
 * - YY >= 50 → 19XX (1950-1999)
 * - YY < 50  → 20XX (2000-2049)
 * 
 * @param {string} dateStr - Date string from GS1
 * @returns {string|null} - ISO date YYYY-MM-DD or null if invalid
 */
function parseGS1Date(dateStr) {
  if (!dateStr) return null;
  
  // Remove any non-numeric characters
  const digits = dateStr.replace(/\D/g, '');
  
  let year, month, day;
  
  if (digits.length === 8) {
    // Format: YYYYMMDD
    year = digits.substring(0, 4);
    month = digits.substring(4, 6);
    day = digits.substring(6, 8);
    
  } else if (digits.length === 6) {
    // Format: YYMMDD
    const yy = parseInt(digits.substring(0, 2), 10);
    year = (yy >= 50 ? '19' : '20') + digits.substring(0, 2);
    month = digits.substring(2, 4);
    day = digits.substring(4, 6);
    
  } else if (digits.length === 4) {
    // Format: YYMM (no day - use last day of month)
    const yy = parseInt(digits.substring(0, 2), 10);
    year = (yy >= 50 ? '19' : '20') + digits.substring(0, 2);
    month = digits.substring(2, 4);
    // Calculate last day of month
    day = getLastDayOfMonth(parseInt(year, 10), parseInt(month, 10));
    
  } else {
    // Unknown format
    return null;
  }
  
  // Validate month (01-12)
  const monthNum = parseInt(month, 10);
  if (monthNum < 1 || monthNum > 12) return null;
  
  // Handle day = 00 (means last day of month in GS1)
  if (day === '00') {
    day = getLastDayOfMonth(parseInt(year, 10), monthNum);
  }
  
  // Return formatted date
  return `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

/**
 * getLastDayOfMonth - Get the last day of a given month
 * 
 * @param {number} year - Full year (e.g., 2025)
 * @param {number} month - Month number (1-12)
 * @returns {string} - Day as 2-digit string (28, 29, 30, or 31)
 */
function getLastDayOfMonth(year, month) {
  // Day 0 of next month = last day of current month
  const lastDay = new Date(year, month, 0).getDate();
  return lastDay.toString().padStart(2, '0');
}


// ============================================================================
// EXPORT - Make functions available for import
// ============================================================================

// Main function (primary export)
export default parseUniversalBarcode;

// Named exports for individual use if needed
export {
  parseGS1DigitalLink,
  parseGS1Traditional,
  parseGS1Numeric,
  parseEAN,
  parseInternalQR,
  parseGS1Date,
  padGTIN,
  isGS1DigitalLink,
  isGS1Traditional,
  isEAN,
  isInternalQR
};


// ============================================================================
// TEST EXAMPLES (for development - can be removed in production)
// ============================================================================

/*
Test cases - run these in console to verify:

import { parseUniversalBarcode } from './utils/barcodeParser';

// Test GS1 Digital Link (URL)
console.log(parseUniversalBarcode('https://go.gs1.org/01/06291100080557/10/02222/21/ZWJZAJR8XXWN?17=250819'));
// Expected: { type: 'gs1', gtin: '06291100080557', batch: '02222', expiry: '2025-08-19', serial: 'ZWJZAJR8XXWN' }

// Test GS1 Traditional
console.log(parseUniversalBarcode('(01)06291100080557(17)250819(10)02222(21)SERIAL123'));
// Expected: { type: 'gs1', gtin: '06291100080557', batch: '02222', expiry: '2025-08-19', serial: 'SERIAL123' }

// Test EAN-13
console.log(parseUniversalBarcode('6291100080557'));
// Expected: { type: 'ean', barcode: '6291100080557', gtin: '06291100080557' }

// Test Medicine Name
console.log(parseUniversalBarcode('Panadol 500mg'));
// Expected: { type: 'text', searchTerm: 'Panadol 500mg' }

// Test Internal QR
console.log(parseUniversalBarcode('MED-123|BATCH-A001'));
// Expected: { type: 'internal', searchTerm: '123', batch: 'A001' }

*/