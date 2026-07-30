/**
 * InvoiceWise — A4 Invoice Print & PDF Generator
 * Renders a pixel-perfect, GST Rule 46 compliant tax invoice layout
 * Optimized for A4 printing and PDF export with zero external dependencies.
 */

(function () {
  function numberToWords(num) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n) {
      if ((n = n.toString()).length > 9) return 'overflow';
      let n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n_array) return '';
      let str = '';
      str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
      str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
      str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
      str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
      str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
      return str;
    }

    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    let result = 'Rupees ' + inWords(integerPart).trim();
    if (decimalPart > 0) {
      result += ' and ' + inWords(decimalPart).trim() + ' Paise';
    }
    result += ' Only';
    return result;
  }

  function formatMoney(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function generateInvoiceHTML(inv, company) {
    const lineItems = inv.lineItems || [];
    const isInterState = inv.supplyType === 'inter';

    // GST rate-wise breakdown
    const taxSummaryMap = {};
    lineItems.forEach(item => {
      const rate = item.gst_rate || 0;
      if (!taxSummaryMap[rate]) {
        taxSummaryMap[rate] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
      }
      taxSummaryMap[rate].taxable += item.taxableValue || 0;
      taxSummaryMap[rate].cgst += item.cgst || 0;
      taxSummaryMap[rate].sgst += item.sgst || 0;
      taxSummaryMap[rate].igst += item.igst || 0;
      taxSummaryMap[rate].totalTax += (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0);
    });

    const logoHtml = company.businessLogoBase64 || company.logoUrl ? 
      `<img src="${company.businessLogoBase64 || company.logoUrl}" alt="Company Logo" class="inv-logo" />` :
      `<div class="inv-logo-text">${company.businessName ? company.businessName.substring(0, 2).toUpperCase() : 'IW'}</div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice — ${inv.invoiceNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11px;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .invoice-wrapper {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      padding: 20px;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 15px;
    }
    .header-table td {
      vertical-align: top;
    }
    .inv-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .inv-subtitle {
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 2px;
    }
    .inv-logo {
      max-height: 55px;
      max-width: 180px;
      object-fit: contain;
    }
    .inv-logo-text {
      width: 48px;
      height: 48px;
      background: #0f172a;
      color: #ffffff;
      font-weight: 800;
      font-size: 18px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .meta-box {
      text-align: right;
    }
    .meta-table {
      margin-left: auto;
      border-collapse: collapse;
      font-size: 11px;
    }
    .meta-table td {
      padding: 2px 6px;
    }
    .meta-table td.label {
      color: #64748b;
      font-weight: 600;
      text-align: right;
    }
    .meta-table td.value {
      font-weight: 700;
      color: #0f172a;
      font-family: monospace;
    }

    .address-grid {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }
    .address-grid td {
      width: 50%;
      padding: 12px 15px;
      vertical-align: top;
      background: #f8fafc;
    }
    .address-grid td:first-child {
      border-right: 1px solid #e2e8f0;
    }
    .party-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 6px;
    }
    .party-name {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .party-details {
      font-size: 10.5px;
      color: #334155;
      line-height: 1.5;
    }
    .gstin-tag {
      display: inline-block;
      margin-top: 5px;
      padding: 2px 6px;
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 700;
      font-family: monospace;
      font-size: 10px;
      border-radius: 3px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .items-table th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 8px 8px;
      text-align: left;
      border: 1px solid #0f172a;
    }
    .items-table td {
      padding: 8px 8px;
      border: 1px solid #e2e8f0;
      font-size: 10.5px;
      vertical-align: top;
    }
    .items-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-mono { font-family: monospace; font-size: 10px; }

    .totals-area {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .totals-area td {
      vertical-align: top;
    }
    .words-box {
      width: 58%;
      padding-right: 20px;
    }
    .words-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 3px;
    }
    .words-value {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      background: #f1f5f9;
      padding: 8px 12px;
      border-radius: 4px;
      border-left: 3px solid #0f172a;
    }

    .calc-table {
      width: 42%;
      border-collapse: collapse;
      margin-left: auto;
    }
    .calc-table td {
      padding: 5px 8px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
    }
    .calc-table td.label {
      color: #475569;
      font-weight: 600;
    }
    .calc-table td.value {
      text-align: right;
      font-weight: 700;
      color: #0f172a;
      font-family: monospace;
    }
    .calc-table tr.grand-total td {
      background: #0f172a;
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
      padding: 8px 10px;
      border: none;
    }
    .calc-table tr.grand-total td.value {
      color: #38bdf8;
    }

    .tax-breakdown-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 6px;
      letter-spacing: 0.05em;
    }
    .tax-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 10px;
      page-break-inside: avoid;
    }
    .tax-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      text-transform: uppercase;
      font-size: 8.5px;
    }
    .tax-table td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      font-family: monospace;
    }

    .footer-section {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      border-top: 1px solid #cbd5e1;
      padding-top: 15px;
      page-break-inside: avoid;
    }
    .footer-section td {
      vertical-align: top;
      padding-top: 10px;
    }
    .terms-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
    }
    .terms-body {
      font-size: 9.5px;
      color: #475569;
      white-space: pre-line;
      line-height: 1.4;
    }
    .signatory-box {
      text-align: right;
    }
    .signatory-company {
      font-size: 10.5px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 45px;
    }
    .signatory-line {
      border-top: 1px dashed #94a3b8;
      display: inline-block;
      width: 180px;
      padding-top: 4px;
      font-size: 9.5px;
      color: #64748b;
      font-weight: 600;
      text-align: center;
    }

    @media print {
      body {
        padding: 0;
        background: #fff;
      }
      .invoice-wrapper {
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">

    <!-- Header Table -->
    <table class="header-table">
      <tr>
        <td style="width: 50%;">
          ${logoHtml}
          <div style="margin-top: 8px;">
            <div class="party-name" style="font-size: 15px;">${company.businessName || 'Your Business Name'}</div>
            <div class="party-details">
              ${company.businessAddress ? company.businessAddress.replace(/\n/g, '<br>') : ''}<br>
              ${company.businessPhone ? 'Phone: ' + company.businessPhone : ''} ${company.businessEmail ? ' | Email: ' + company.businessEmail : ''}
              ${company.businessGSTIN ? '<br><span class="gstin-tag">GSTIN: ' + company.businessGSTIN + '</span>' : ''}
              ${company.businessPAN ? ' <span style="font-size:10px;color:#64748b;">PAN: ' + company.businessPAN + '</span>' : ''}
            </div>
          </div>
        </td>
        <td class="meta-box" style="width: 50%;">
          <div class="inv-title">Tax Invoice</div>
          <div class="inv-subtitle">${inv.supplyType === 'inter' ? 'Inter-State Supply (IGST)' : 'Intra-State Supply (CGST/SGST)'}</div>
          <br>
          <table class="meta-table">
            <tr>
              <td class="label">Invoice No:</td>
              <td class="value">${inv.invoiceNumber || 'INV-0001'}</td>
            </tr>
            <tr>
              <td class="label">Invoice Date:</td>
              <td class="value">${inv.date || new Date().toISOString().split('T')[0]}</td>
            </tr>
            <tr>
              <td class="label">Due Date:</td>
              <td class="value">${inv.dueDate || '—'}</td>
            </tr>
            <tr>
              <td class="label">Status:</td>
              <td class="value" style="text-transform:uppercase; color:${inv.status === 'paid' ? '#16a34a' : (inv.status === 'overdue' ? '#dc2626' : '#2563eb')}">${inv.status || 'Draft'}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Address Grid -->
    <table class="address-grid">
      <tr>
        <td>
          <div class="party-title">Billed To (Customer)</div>
          <div class="party-name">${inv.customer ? inv.customer.name : 'Walk-in Customer'}</div>
          <div class="party-details">
            ${inv.customer && inv.customer.address ? inv.customer.address.replace(/\n/g, '<br>') : 'No address provided'}<br>
            ${inv.customer && inv.customer.phone ? 'Phone: ' + inv.customer.phone : ''} ${inv.customer && inv.customer.email ? ' | Email: ' + inv.customer.email : ''}
            <br>
            ${inv.customer && inv.customer.gstin ? '<span class="gstin-tag">GSTIN: ' + inv.customer.gstin + '</span>' : '<span style="font-size:10px;color:#64748b;">Unregistered / B2C</span>'}
            ${inv.customer && inv.customer.state ? ' | State: ' + inv.customer.state : ''}
          </div>
        </td>
        <td>
          <div class="party-title">Place of Supply & Transport</div>
          <div class="party-details">
            <strong>State of Supply:</strong> ${inv.placeOfSupply || (inv.customer ? inv.customer.state : company.businessState) || 'As per Customer State'}<br>
            <strong>Reverse Charge:</strong> ${inv.reverseCharge === 'yes' ? 'YES (Tax payable by Recipient)' : 'NO'}<br>
            ${inv.poNumber ? '<strong>P.O. Number:</strong> ' + inv.poNumber + '<br>' : ''}
            ${inv.vehicleNo ? '<strong>Vehicle No:</strong> ' + inv.vehicleNo + '<br>' : ''}
          </div>
        </td>
      </tr>
    </table>

    <!-- Line Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th class="text-center" style="width: 30px;">#</th>
          <th>Item / Service Description</th>
          <th class="text-center" style="width: 60px;">HSN/SAC</th>
          <th class="text-right" style="width: 45px;">Qty</th>
          <th class="text-right" style="width: 65px;">Rate (₹)</th>
          <th class="text-right" style="width: 45px;">Disc %</th>
          <th class="text-right" style="width: 70px;">Taxable (₹)</th>
          <th class="text-center" style="width: 45px;">GST</th>
          <th class="text-right" style="width: 80px;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems.map((item, idx) => `
          <tr>
            <td class="text-center font-mono">${idx + 1}</td>
            <td>
              <strong>${item.name || 'Item'}</strong>
              ${item.description ? `<br><span style="font-size:9.5px;color:#64748b;">${item.description}</span>` : ''}
            </td>
            <td class="text-center font-mono">${item.hsn_sac || '—'}</td>
            <td class="text-right font-mono">${item.qty || 1} ${item.unit || ''}</td>
            <td class="text-right font-mono">${Number(item.rate || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
            <td class="text-right font-mono">${item.discount_pct || 0}%</td>
            <td class="text-right font-mono">${Number(item.taxableValue || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
            <td class="text-center font-mono">${item.gst_rate || 0}%</td>
            <td class="text-right font-mono" style="font-weight:700;">${Number(item.total || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals Area -->
    <table class="totals-area">
      <tr>
        <td class="words-box">
          <div class="words-label">Amount in Words</div>
          <div class="words-value">${numberToWords(inv.grandTotal || 0)}</div>

          ${company.businessBankAcc ? `
            <div style="margin-top: 15px; font-size: 10px; color: #334155; background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0;">
              <strong style="color:#0f172a; text-transform:uppercase; font-size:9px;">Bank Details for Payment</strong><br>
              <strong>Bank:</strong> ${company.businessBankName || '—'} | <strong>A/C No:</strong> ${company.businessBankAcc}<br>
              <strong>IFSC Code:</strong> ${company.businessBankIFSC || '—'}
            </div>
          ` : ''}
        </td>
        <td>
          <table class="calc-table">
            <tr>
              <td class="label">Taxable Value:</td>
              <td class="value">${formatMoney(inv.subtotal)}</td>
            </tr>
            ${isInterState ? `
              <tr>
                <td class="label">IGST Total:</td>
                <td class="value">${formatMoney(inv.totalTax)}</td>
              </tr>
            ` : `
              <tr>
                <td class="label">CGST Total:</td>
                <td class="value">${formatMoney(inv.totalTax / 2)}</td>
              </tr>
              <tr>
                <td class="label">SGST/UTGST Total:</td>
                <td class="value">${formatMoney(inv.totalTax / 2)}</td>
              </tr>
            `}
            ${inv.shippingCharges ? `
              <tr>
                <td class="label">Shipping / Freight:</td>
                <td class="value">${formatMoney(inv.shippingCharges)}</td>
              </tr>
            ` : ''}
            <tr class="grand-total">
              <td class="label" style="color:#fff;">Grand Total:</td>
              <td class="value">${formatMoney(inv.grandTotal)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Tax Breakdown Summary Table -->
    <div class="tax-breakdown-title">GST Tax Rate Summary</div>
    <table class="tax-table">
      <thead>
        <tr>
          <th class="text-center">GST Rate</th>
          <th class="text-right">Taxable Amount (₹)</th>
          ${isInterState ? `
            <th class="text-right">IGST (₹)</th>
          ` : `
            <th class="text-right">CGST (₹)</th>
            <th class="text-right">SGST/UTGST (₹)</th>
          `}
          <th class="text-right">Total Tax (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${Object.keys(taxSummaryMap).map(rate => {
          const row = taxSummaryMap[rate];
          return `
            <tr>
              <td class="text-center font-mono">${rate}%</td>
              <td class="text-right font-mono">${Number(row.taxable).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
              ${isInterState ? `
                <td class="text-right font-mono">${Number(row.igst).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
              ` : `
                <td class="text-right font-mono">${Number(row.cgst).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                <td class="text-right font-mono">${Number(row.sgst).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
              `}
              <td class="text-right font-mono" style="font-weight:700;">${Number(row.totalTax).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <!-- Footer Terms & Signatory -->
    <table class="footer-section">
      <tr>
        <td style="width: 60%;">
          <div class="terms-title">Terms & Conditions</div>
          <div class="terms-body">${inv.terms || company.invoiceTerms || '1. Goods once sold will not be taken back.\n2. Interest @18% p.a. will be charged on overdue invoices.'}</div>
          ${inv.notes ? `<div class="terms-title" style="margin-top:8px;">Notes</div><div class="terms-body">${inv.notes}</div>` : ''}
        </td>
        <td class="signatory-box" style="width: 40%;">
          <div class="signatory-company">For ${company.businessName || 'Your Business Name'}</div>
          <div class="signatory-line">Authorised Signatory</div>
        </td>
      </tr>
    </table>

  </div>

  <script>
    window.onload = function() {
      // Auto trigger print dialog on popup open
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;
  }

  window.printInvoice = function (invoice, companySettings) {
    const html = generateInvoiceHTML(invoice, companySettings || {});
    const printWin = window.open('', '_blank', 'width=900,height=950,scrollbars=yes');
    if (!printWin) {
      alert('Pop-up blocked! Please allow pop-ups for this site to print invoices.');
      return;
    }
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };
})();
