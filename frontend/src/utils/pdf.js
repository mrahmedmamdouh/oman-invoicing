import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateInvoicePDF = async (invoiceElement, invoice) => {
  try {
    // Configure jsPDF for RTL
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add Arabic font support (you'd need to add the font file)
    // pdf.addFont('path/to/NotoSansArabic.ttf', 'NotoSansArabic', 'normal');
    // pdf.setFont('NotoSansArabic');

    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const downloadInvoicePDF = async (invoiceElement, filename) => {
  const pdf = await generateInvoicePDF(invoiceElement);
  pdf.save(filename);
};

export const printInvoice = (invoiceElement) => {
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>طباعة الفاتورة</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');
            
            body {
                font-family: 'Noto Sans Arabic', sans-serif;
                direction: rtl;
                margin: 0;
                padding: 20px;
                color: #333;
                line-height: 1.6;
            }
            
            @media print {
                body { margin: 0; padding: 10px; }
                .no-print { display: none !important; }
            }
        </style>
    </head>
    <body>
        ${invoiceElement.innerHTML}
        <script>
            window.onload = function() {
                window.print();
                window.onafterprint = function() {
                    window.close();
                };
            };
        </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};