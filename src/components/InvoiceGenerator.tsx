import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface InvoiceData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderDate: string;
  paymentMethod: string;
}

interface InvoiceGeneratorProps {
  invoiceData: InvoiceData;
  onDownload?: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ invoiceData, onDownload }) => {
  const generateInvoiceHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${invoiceData.orderNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-info h1 {
            color: #10b981;
            margin: 0;
            font-size: 28px;
        }
        .company-info p {
            margin: 5px 0;
            color: #666;
        }
        .invoice-info {
            text-align: right;
        }
        .invoice-info h2 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
        .customer-section {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .customer-section h3 {
            margin: 0 0 15px 0;
            color: #10b981;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .items-table th {
            background-color: #10b981;
            color: white;
            font-weight: bold;
        }
        .items-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .total-section {
            float: right;
            width: 300px;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .total-row.final {
            border-top: 2px solid #10b981;
            padding-top: 10px;
            font-weight: bold;
            font-size: 18px;
            color: #10b981;
        }
        .footer {
            clear: both;
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .payment-info {
            margin-top: 30px;
            padding: 15px;
            background: #e8f5e8;
            border-radius: 8px;
        }
        @media print {
            body {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1>EsyGrab</h1>
            <p>New Baneshwor, Kathmandu, Nepal</p>
            <p>Phone: +9779865053325 / +9779868293232</p>
            <p>Email: support@esygrab.com</p>
        </div>
        <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${invoiceData.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(invoiceData.orderDate).toLocaleDateString()}</p>
        </div>
    </div>

    <div class="customer-section">
        <h3>Bill To:</h3>
        <p><strong>${invoiceData.customerName}</strong></p>
        <p>Email: ${invoiceData.customerEmail}</p>
        <p>Phone: ${invoiceData.customerPhone}</p>
        <p>Delivery Address: ${invoiceData.deliveryAddress}</p>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoiceData.items.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>Rs ${item.price.toFixed(2)}</td>
                    <td>Rs ${item.total.toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="total-section">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>Rs ${invoiceData.subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
            <span>Delivery Fee:</span>
            <span>Rs ${invoiceData.deliveryFee.toFixed(2)}</span>
        </div>
        <div class="total-row final">
            <span>Total:</span>
            <span>Rs ${invoiceData.total.toFixed(2)}</span>
        </div>
    </div>

    <div class="payment-info">
        <p><strong>Payment Method:</strong> ${invoiceData.paymentMethod}</p>
        <p><strong>Order Status:</strong> Confirmed</p>
    </div>

    <div class="footer">
        <p>Thank you for choosing EsyGrab!</p>
        <p>For any queries, contact us at support@esygrab.com or +9779865053325</p>
        <p>&copy; 2025 EsyGrab by Virkuti Online Shopping Pvt.Ltd</p>
    </div>
</body>
</html>
    `;
  };

  const downloadInvoice = () => {
    const invoiceHTML = generateInvoiceHTML();
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceData.orderNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (onDownload) {
      onDownload();
    }
  };

  const printInvoice = () => {
    const invoiceHTML = generateInvoiceHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={downloadInvoice} variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Download Invoice
      </Button>
      <Button onClick={printInvoice} variant="outline" size="sm">
        <FileText className="h-4 w-4 mr-2" />
        Print Invoice
      </Button>
    </div>
  );
};

export default InvoiceGenerator;