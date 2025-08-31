import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Enhanced PDF generation with Arabic support
export const generateInvoicePDF = async (invoiceElement, invoice, options = {}) => {
  try {
    const {
      filename = `invoice-${invoice.invoiceNumber}.pdf`,
      format = 'a4',
      orientation = 'portrait',
      margin = 10
    } = options;

    // Configure jsPDF for RTL
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    // Capture the element as canvas
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: invoiceElement.scrollWidth,
      height: invoiceElement.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = format === 'a4' ? 210 - (margin * 2) : 297 - (margin * 2);
    const pageHeight = format === 'a4' ? 297 - (margin * 2) : 210 - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = margin;

    // Add first page
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Download invoice PDF
export const downloadInvoicePDF = async (invoiceElement, filename, invoice) => {
  try {
    const pdf = await generateInvoicePDF(invoiceElement, invoice, { filename });
    pdf.save(filename);
  } catch (error) {
    throw new Error('Failed to download PDF');
  }
};

// Print invoice with optimized styling
export const printInvoice = (invoiceElement, options = {}) => {
  const {
    title = 'Invoice',
    styles = '',
    includeDate = true
  } = options;

  const printWindow = window.open('', '_blank');
  
  const printStyles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: 'Noto Sans Arabic', sans-serif;
        direction: rtl;
        margin: 0;
        padding: 20px;
        color: #333;
        line-height: 1.6;
        background: white;
      }
      
      .invoice-print {
        max-width: 210mm;
        margin: 0 auto;
        background: white;
        padding: 20px;
      }
      
      .invoice-header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #C8102E;
        padding-bottom: 20px;
      }
      
      .invoice-header h1 {
        color: #C8102E;
        font-size: 28px;
        margin-bottom: 10px;
      }
      
      .invoice-details {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }
      
      .company-info, .customer-info {
        width: 45%;
      }
      
      .invoice-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      
      .invoice-table th,
      .invoice-table td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: right;
      }
      
      .invoice-table th {
        background-color: #f8f9fa;
        font-weight: 600;
      }
      
      .invoice-totals {
        margin-top: 20px;
        border-top: 2px solid #C8102E;
        padding-top: 15px;
      }
      
      .total-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      
      .final-total {
        font-size: 18px;
        font-weight: bold;
        color: #C8102E;
        border-top: 1px solid #ddd;
        padding-top: 10px;
      }
      
      .invoice-footer {
        margin-top: 40px;
        text-align: center;
        font-size: 12px;
        color: #666;
        border-top: 1px solid #eee;
        padding-top: 20px;
      }
      
      .qr-code {
        text-align: center;
        margin: 20px 0;
      }
      
      .no-print {
        display: none !important;
      }
      
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        
        .invoice-print {
          box-shadow: none;
          margin: 0;
          padding: 0;
        }
        
        @page {
          margin: 1cm;
          size: A4;
        }
      }
      
      /* Arabic number formatting */
      .currency, .number {
        direction: ltr;
        text-align: right;
        unicode-bidi: bidi-override;
      }
      
      ${styles}
    </style>
  `;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        ${printStyles}
    </head>
    <body>
        <div class="invoice-print">
            ${invoiceElement.innerHTML}
        </div>
        <script>
            window.onload = function() {
                setTimeout(() => {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                }, 500);
            };
        </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
};

// Print report
export const printReport = (reportElement, reportTitle, options = {}) => {
  const printOptions = {
    title: reportTitle,
    styles: `
      .report-header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #C8102E;
        padding-bottom: 20px;
      }
      
      .report-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .summary-card {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #C8102E;
      }
      
      .report-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        font-size: 12px;
      }
      
      .report-table th,
      .report-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: right;
      }
      
      .report-table th {
        background-color: #C8102E;
        color: white;
      }
      
      .report-table tbody tr:nth-child(even) {
        background-color: #f9f9f9;
      }
    `,
    ...options
  };
  
  printInvoice(reportElement, printOptions);
};

// Generate and download Excel report
export const downloadExcelReport = (data, filename, sheetName = 'Report') => {
  try {
    // This would require a library like xlsx
    // For now, we'll convert to CSV as a fallback
    downloadCSVReport(data, filename.replace('.xlsx', '.csv'));
  } catch (error) {
    console.error('Excel download error:', error);
    throw new Error('Failed to download Excel file');
  }
};

// Generate and download CSV report
export const downloadCSVReport = (data, filename) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Convert data to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob(['\uFEFF' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('CSV download error:', error);
    throw new Error('Failed to download CSV file');
  }
};

// Batch print invoices
export const batchPrintInvoices = async (invoices, options = {}) => {
  const { 
    pageBreak = true,
    includeIndex = true 
  } = options;

  let combinedHTML = '';
  
  for (let i = 0; i < invoices.length; i++) {
    const invoice = invoices[i];
    const invoiceElement = document.getElementById(`invoice-${invoice.id}`);
    
    if (invoiceElement) {
      if (includeIndex && i > 0) {
        combinedHTML += pageBreak ? '<div style="page-break-before: always;"></div>' : '<hr style="margin: 40px 0;">';
      }
      
      combinedHTML += invoiceElement.innerHTML;
    }
  }
  
  if (combinedHTML) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = combinedHTML;
    
    printInvoice(tempElement, {
      title: `Batch Print - ${invoices.length} Invoices`,
      styles: `
        .page-break {
          page-break-before: always;
        }
        
        @media print {
          .page-break {
            page-break-before: always;
          }
        }
      `
    });
  }
};

// Print preview
export const showPrintPreview = (element, title = 'Print Preview') => {
  const previewWindow = window.open('', '_blank', 'width=800,height=600');
  
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <style>
            body { 
                font-family: 'Noto Sans Arabic', sans-serif; 
                direction: rtl;
                margin: 20px;
                background: #f5f5f5;
            }
            .preview-container {
                background: white;
                padding: 40px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                max-width: 210mm;
                margin: 0 auto;
            }
            .preview-actions {
                text-align: center;
                margin-bottom: 20px;
            }
            .btn {
                padding: 10px 20px;
                margin: 0 5px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            .btn-primary {
                background: #C8102E;
                color: white;
            }
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
        </style>
    </head>
    <body>
        <div class="preview-actions">
            <button class="btn btn-primary" onclick="window.print()">طباعة</button>
            <button class="btn btn-secondary" onclick="window.close()">إغلاق</button>
        </div>
        <div class="preview-container">
            ${element.innerHTML}
        </div>
    </body>
    </html>
  `);
  
  previewWindow.document.close();
};