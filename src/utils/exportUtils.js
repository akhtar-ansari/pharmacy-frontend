/**
 * Export Utilities
 * Arwa Enterprises - Pharmacy Management System
 * 
 * Handles Excel and PDF exports for reports
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {string} sheetName - Name of the Excel sheet
 * @param {Array} columns - Column definitions [{header: 'Name', key: 'name', width: 20}]
 */
export function exportToExcel(data, filename, sheetName = 'Sheet1', columns = null) {
  try {
    // If columns provided, map data to match column order
    let exportData = data;
    let headers = null;

    if (columns && columns.length > 0) {
      headers = columns.map(col => col.header);
      exportData = data.map(row => {
        const newRow = {};
        columns.forEach(col => {
          newRow[col.header] = row[col.key] ?? '';
        });
        return newRow;
      });
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths if provided
    if (columns && columns.length > 0) {
      worksheet['!cols'] = columns.map(col => ({ wch: col.width || 15 }));
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${date}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fullFilename);

    return { success: true, filename: fullFilename };
  } catch (error) {
    console.error('Excel export error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Export data to PDF file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {string} title - Title of the report
 * @param {Array} columns - Column definitions [{header: 'Name', key: 'name', width: 50}]
 * @param {Object} options - Additional options {orientation, companyName, companyLogo}
 */
export function exportToPDF(data, filename, title, columns, options = {}) {
  try {
    const {
      orientation = 'portrait',
      companyName = '',
      companyLogo = null,
      showDate = true,
      showPageNumbers = true
    } = options;

    // Create PDF document
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;

    // Add company logo if provided
    if (companyLogo) {
      try {
        doc.addImage(companyLogo, 'PNG', 10, 10, 25, 25);
        yPosition = 40;
      } catch (e) {
        console.warn('Could not add logo:', e);
      }
    }

    // Add company name
    if (companyName) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(companyName, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
    }

    // Add title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;

    // Add date
    if (showDate) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated: ${date}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }

    // Prepare table data
    const tableHeaders = columns.map(col => col.header);
    const tableData = data.map(row => 
      columns.map(col => {
        const value = row[col.key];
        // Format numbers and dates
        if (typeof value === 'number') {
          return col.format === 'currency' ? `₹${value.toFixed(2)}` : value.toString();
        }
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        return value ?? '';
      })
    );

    // Add table
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246], // Blue
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: columns.reduce((acc, col, index) => {
        acc[index] = {
          cellWidth: col.width || 'auto',
          halign: col.align || 'left'
        };
        return acc;
      }, {}),
      didDrawPage: function(data) {
        // Add page numbers
        if (showPageNumbers) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          const pageCount = doc.internal.getNumberOfPages();
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        }
      }
    });

    // Add footer
    const finalY = doc.lastAutoTable.finalY || yPosition + 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Powered by Arwa Enterprises', pageWidth / 2, finalY + 10, { align: 'center' });

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${date}.pdf`;

    // Download file
    doc.save(fullFilename);

    return { success: true, filename: fullFilename };
  } catch (error) {
    console.error('PDF export error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Export stock report
 */
export function exportStockReport(stockData, format = 'excel', companyInfo = {}) {
  const columns = [
    { header: 'Medicine Name', key: 'medicine_name', width: 30 },
    { header: 'Batch No', key: 'batch_number', width: 15 },
    { header: 'Expiry Date', key: 'expiry_date', width: 15 },
    { header: 'Quantity', key: 'quantity', width: 12, align: 'right' },
    { header: 'MRP', key: 'mrp', width: 12, format: 'currency', align: 'right' },
    { header: 'Purchase Price', key: 'purchase_price', width: 15, format: 'currency', align: 'right' },
    { header: 'Stock Value', key: 'stock_value', width: 15, format: 'currency', align: 'right' }
  ];

  // Calculate stock value
  const dataWithValue = stockData.map(item => ({
    ...item,
    stock_value: (item.quantity || 0) * (item.purchase_price || 0)
  }));

  if (format === 'pdf') {
    return exportToPDF(dataWithValue, 'Stock_Report', 'Stock on Hand Report', columns, {
      orientation: 'landscape',
      companyName: companyInfo.name,
      companyLogo: companyInfo.logo
    });
  } else {
    return exportToExcel(dataWithValue, 'Stock_Report', 'Stock', columns);
  }
}

/**
 * Export sales report
 */
export function exportSalesReport(salesData, format = 'excel', companyInfo = {}, dateRange = null) {
  const columns = [
    { header: 'Invoice No', key: 'invoice_number', width: 15 },
    { header: 'Date', key: 'sale_date', width: 12 },
    { header: 'Customer', key: 'customer_name', width: 25 },
    { header: 'Items', key: 'item_count', width: 10, align: 'right' },
    { header: 'Total', key: 'total_amount', width: 12, format: 'currency', align: 'right' },
    { header: 'Discount', key: 'discount', width: 12, format: 'currency', align: 'right' },
    { header: 'Final Amount', key: 'final_amount', width: 15, format: 'currency', align: 'right' },
    { header: 'Payment', key: 'payment_method', width: 12 }
  ];

  let title = 'Sales Report';
  if (dateRange) {
    title += ` (${dateRange.from} to ${dateRange.to})`;
  }

  if (format === 'pdf') {
    return exportToPDF(salesData, 'Sales_Report', title, columns, {
      orientation: 'landscape',
      companyName: companyInfo.name,
      companyLogo: companyInfo.logo
    });
  } else {
    return exportToExcel(salesData, 'Sales_Report', 'Sales', columns);
  }
}

/**
 * Export expiry alert report
 */
export function exportExpiryReport(expiryData, format = 'excel', companyInfo = {}) {
  const columns = [
    { header: 'Medicine Name', key: 'medicine_name', width: 30 },
    { header: 'Batch No', key: 'batch_number', width: 15 },
    { header: 'Expiry Date', key: 'expiry_date', width: 12 },
    { header: 'Days Left', key: 'days_left', width: 12, align: 'right' },
    { header: 'Quantity', key: 'quantity', width: 12, align: 'right' },
    { header: 'MRP', key: 'mrp', width: 12, format: 'currency', align: 'right' },
    { header: 'Status', key: 'status', width: 15 }
  ];

  if (format === 'pdf') {
    return exportToPDF(expiryData, 'Expiry_Alert_Report', 'Expiry Alert Report', columns, {
      companyName: companyInfo.name,
      companyLogo: companyInfo.logo
    });
  } else {
    return exportToExcel(expiryData, 'Expiry_Alert_Report', 'Expiry Alerts', columns);
  }
}

/**
 * Export supplier payment report
 */
export function exportPaymentReport(paymentData, format = 'excel', companyInfo = {}) {
  const columns = [
    { header: 'Supplier', key: 'supplier_name', width: 25 },
    { header: 'Invoice No', key: 'invoice_number', width: 15 },
    { header: 'Invoice Amount', key: 'invoice_amount', width: 15, format: 'currency', align: 'right' },
    { header: 'Paid Amount', key: 'paid_amount', width: 15, format: 'currency', align: 'right' },
    { header: 'Balance', key: 'balance', width: 15, format: 'currency', align: 'right' },
    { header: 'Due Date', key: 'due_date', width: 12 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  if (format === 'pdf') {
    return exportToPDF(paymentData, 'Payment_Report', 'Supplier Payment Report', columns, {
      orientation: 'landscape',
      companyName: companyInfo.name,
      companyLogo: companyInfo.logo
    });
  } else {
    return exportToExcel(paymentData, 'Payment_Report', 'Payments', columns);
  }
}

/**
 * Export medicines list
 */
export function exportMedicinesList(medicinesData, format = 'excel', companyInfo = {}) {
  const columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Generic Name', key: 'generic_name', width: 25 },
    { header: 'Company', key: 'company', width: 20 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Pack Size', key: 'pack_size', width: 12 },
    { header: 'MRP', key: 'mrp', width: 10, format: 'currency', align: 'right' },
    { header: 'Purchase Price', key: 'purchase_price', width: 15, format: 'currency', align: 'right' },
    { header: 'Barcode', key: 'barcode', width: 15 }
  ];

  if (format === 'pdf') {
    return exportToPDF(medicinesData, 'Medicine_List', 'Medicine Database', columns, {
      orientation: 'landscape',
      companyName: companyInfo.name,
      companyLogo: companyInfo.logo
    });
  } else {
    return exportToExcel(medicinesData, 'Medicine_List', 'Medicines', columns);
  }
}

const exportAPI = {
  exportToExcel,
  exportToPDF,
  exportStockReport,
  exportSalesReport,
  exportExpiryReport,
  exportPaymentReport,
  exportMedicinesList
};

export default exportAPI;
