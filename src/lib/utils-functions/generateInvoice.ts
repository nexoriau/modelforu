import { dateFormatter } from './dateFormatter';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './formatCurrency';

export const generateInvoice = async (
  transaction: any,
  setGeneratingInvoice: (val: string | null) => void
) => {
  setGeneratingInvoice(transaction.id);

  try {
    const doc = new jsPDF();

    const blackText = [0, 0, 0];
    const grayText = [102, 102, 102];
    const lightGray = [238, 238, 238];

    // Page setup
    doc.setFillColor(255, 255, 255);
    doc.rect(
      0,
      0,
      doc.internal.pageSize.width,
      doc.internal.pageSize.height,
      'F'
    );

    let yPos = 10;

    // Header with "Page 1 of 1" (top right)
    doc.setFontSize(9);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('Page 1 of 1', 190, yPos, { align: 'right' });

    yPos = 30;

    // Center the "Invoice" heading with padding below
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blackText[0], blackText[1], blackText[2]);
    const pageWidth = doc.internal.pageSize.width;
    doc.text('Invoice', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Check if user information exists
    const hasUserInfo =
      transaction?.companyName ||
      transaction?.companyAddress ||
      transaction?.userEmail ||
      transaction?.vatNumber;

    // Company information (left side if exists)
    let companyY = yPos;
    let maxCompanyY = yPos;

    if (hasUserInfo) {
      if (transaction?.companyName) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(blackText[0], blackText[1], blackText[2]);
        doc.text(transaction.companyName, 20, companyY);
        companyY += 6;
        maxCompanyY = companyY;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      if (transaction?.companyAddress) {
        const addressLines = transaction.companyAddress.split('\n');
        addressLines.forEach((line: any) => {
          if (line.trim()) {
            doc.text(line.trim(), 20, companyY);
            companyY += 5;
            maxCompanyY = companyY;
          }
        });
      }

      if (transaction?.userEmail) {
        doc.text(transaction.userEmail, 20, companyY);
        companyY += 5;
        maxCompanyY = companyY;
      }

      if (transaction?.vatNumber) {
        doc.text(`VAT: ${transaction.vatNumber}`, 20, companyY);
        companyY += 5;
        maxCompanyY = companyY;
      }
    }

    // Invoice details (right side)
    let detailsY = yPos;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (transaction.invoiceId) {
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('Invoice number', 120, detailsY);
      doc.setTextColor(blackText[0], blackText[1], blackText[2]);
      const invoiceNumber =
        transaction.invoiceId.length > 20
          ? `${transaction.invoiceId.substring(0, 17)}...`
          : transaction.invoiceId;
      doc.text(invoiceNumber, 190, detailsY, { align: 'right' });
      detailsY += 6;
    } else if (transaction.id) {
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('Invoice number', 120, detailsY);
      doc.setTextColor(blackText[0], blackText[1], blackText[2]);
      const invoiceNumber =
        transaction.id.length > 20
          ? `${transaction.id.substring(0, 17)}...`
          : transaction.id;
      doc.text(invoiceNumber, 190, detailsY, { align: 'right' });
      detailsY += 6;
    }

    if (transaction.createdDate) {
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('Date of issue', 120, detailsY);
      doc.setTextColor(blackText[0], blackText[1], blackText[2]);
      doc.text(
        dateFormatter(transaction.createdDate, 'MMMM DD, YYYY'),
        190,
        detailsY,
        { align: 'right' }
      );
      detailsY += 6;

      // Due date in bold
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('Tokens expire at', 120, detailsY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(blackText[0], blackText[1], blackText[2]);
      doc.text(
        dateFormatter(transaction.tokensExpireAt, 'MMMM DD, YYYY'),
        190,
        detailsY,
        { align: 'right' }
      );
      detailsY += 6;
    }

    // Set yPos to the bottom of whichever section is taller
    yPos = Math.max(maxCompanyY, detailsY) + 20;

    // Bill to section
    if (
      transaction.customerDetails &&
      (transaction.customerDetails.name || transaction.customerDetails.email)
    ) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Bill to', 20, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      if (transaction.customerDetails.name) {
        doc.text(transaction.customerDetails.name.toUpperCase(), 20, yPos);
        yPos += 5;
      }

      if (transaction.customerDetails.email) {
        doc.text(transaction.customerDetails.email, 20, yPos);
        yPos += 5;
      }

      yPos += 15;
    }

    // Add due date line above the table
    if (transaction.createdDate && transaction.price !== undefined) {
      const dueDate = dateFormatter(
        transaction.tokensExpireAt,
        'MMMM DD, YYYY'
      );
      const amount = formatCurrency(+transaction.price);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(blackText[0], blackText[1], blackText[2]);
      doc.text(`Tokens expire at ${dueDate}`, 20, yPos);
      yPos += 10;
    }

    // Table using autoTable for professional look
    if (transaction.price !== undefined && transaction.price !== null) {
      // Main description
      let description = transaction.description || 'Service';
      if (transaction.source === 'subscription') {
        description = 'Subscriptions';
      }

      // Period for subscriptions
      let period = '';
      if (
        transaction.source === 'subscription' &&
        transaction.createdDate &&
        transaction.currentPeriodEnd
      ) {
        const periodStart = dateFormatter(
          transaction.createdDate,
          'MMM DD, YYYY'
        );
        const periodEnd = dateFormatter(
          transaction.currentPeriodEnd,
          'MMM DD, YYYY'
        );
        period = `\n${periodStart} – ${periodEnd}`;
      }

      // Quantity
      const quantity = transaction.tokenQuantity
        ? transaction.tokenQuantity.toString()
        : '1';

      // Unit price and amount
      const unitPrice = formatCurrency(+transaction.price);
      const amount = formatCurrency(+transaction.price);

      autoTable(doc, {
        startY: yPos,
        head: [['Description', 'Qty', 'Price', 'Amount']],
        body: [[`${description}${period}`, quantity, unitPrice, amount]],
        margin: { left: 20 }, // Add 30px left margin
        columnStyles: {
          0: { cellWidth: 70, minCellHeight: period ? 20 : 10 },
          1: { cellWidth: 35, halign: 'left' },
          2: { cellWidth: 35, halign: 'left' },
          3: { cellWidth: 30, halign: 'left' },
        },
        styles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineColor: [255, 255, 255], // Remove all borders
          lineWidth: 0,
          fontSize: 10,
        },
        headStyles: {
          // fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          lineWidth: 0.5,
          // lineColor: [0, 0, 0],
          // Add border only to the bottom of header cells
          cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
        },
        bodyStyles: {
          fontSize: 10,
          lineColor: [255, 255, 255], // Remove all borders
          lineWidth: 0,
          cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
        },
        // Add border only below the header row
        didDrawCell: (data) => {
          if (data.section === 'head' && data.row.index === 0) {
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.line(
              data.cell.x,
              data.cell.y + data.cell.height,
              data.cell.x + data.cell.width,
              data.cell.y + data.cell.height
            );
          }
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Totals section with partial lines above
      const lineStartX = 120;
      const lineEndX = 190;

      // Subtotal line
      // doc.setDrawColor(0, 0, 0);
      // doc.setLineWidth(0.5);
      // doc.line(lineStartX, yPos - 3, lineEndX, yPos - 3);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal', 120, yPos);
      doc.text(formatCurrency(+transaction.price), 190, yPos, {
        align: 'right',
      });
      yPos += 10;

      // Total line
      doc.line(lineStartX, yPos - 6, lineEndX, yPos - 6);

      doc.setFont('helvetica', 'bold');
      doc.text('Total', 120, yPos);
      doc.text(formatCurrency(+transaction.price), 190, yPos, {
        align: 'right',
      });
      yPos += 10;
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('Thank you for your business.', 105, 280, { align: 'center' });

    // Generate PDF and open in new tab
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Open in new tab
    window.open(pdfUrl, '_blank');

    // Trigger download
    const fileName = transaction.id
      ? `Invoice-${transaction.id}-${dateFormatter(
          { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
          'YYYY-MM-DD'
        )}.pdf`
      : `Invoice-${dateFormatter(
          { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
          'YYYY-MM-DD'
        )}.pdf`;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate invoice. Please try again.');
  } finally {
    setGeneratingInvoice(null);
  }
};
