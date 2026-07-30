const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// ─── Data paths ───────────────────────────────────────────────────────────────
const DATA_DIR       = process.env.INVOICEWISE_DATA_DIR || path.join(__dirname, 'data');
const PRODUCTS_FILE  = path.join(DATA_DIR, 'products.json');
const SETTINGS_FILE  = path.join(DATA_DIR, 'settings.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const INVOICES_FILE  = path.join(DATA_DIR, 'invoices.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const initFile = (file, defaults) => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(defaults, null, 2));
};

initFile(PRODUCTS_FILE,  { products: [], lastUpdated: new Date().toISOString() });
initFile(CUSTOMERS_FILE, { customers: [], lastUpdated: new Date().toISOString() });
initFile(INVOICES_FILE,  { invoices: [], lastInvoiceSeq: 0, lastUpdated: new Date().toISOString() });
initFile(SETTINGS_FILE, {
  apiKey: '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',
  modelName: 'google/gemma-4-26b-a4b-it:free',
  businessName: '',
  businessGSTIN: '',
  businessAddress: '',
  businessStateCode: '',
  businessState: '',
  businessEmail: '',
  businessPhone: '',
  businessPAN: '',
  businessWebsite: '',
  businessBankName: '',
  businessBankAcc: '',
  businessBankIFSC: '',
  businessLogoBase64: '',
  invoicePrefix: 'INV',
  invoiceTerms: 'Payment due within 30 days of invoice date.',
  invoiceNotes: ''
});

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Helpers ─────────────────────────────────────────────────────────────────
const readJSON  = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf-8')); } catch { return null; } };
const writeJSON = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));
const uid       = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const d = readJSON(PRODUCTS_FILE);
  if (!d) return res.status(500).json({ error: 'Read failed' });
  res.json(d);
});

app.post('/api/products', (req, res) => {
  const d = readJSON(PRODUCTS_FILE);
  if (!d) return res.status(500).json({ error: 'Read failed' });
  const required = ['name','hsn_sac','unit','rate','gst_rate','supply_type'];
  const missing = required.filter(f => !req.body[f] && req.body[f] !== 0);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  const product = { id: uid('PRD'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...req.body };
  d.products.push(product);
  d.lastUpdated = new Date().toISOString();
  writeJSON(PRODUCTS_FILE, d);
  res.status(201).json({ success: true, product });
});

app.put('/api/products/:id', (req, res) => {
  const d = readJSON(PRODUCTS_FILE);
  if (!d) return res.status(500).json({ error: 'Read failed' });
  const i = d.products.findIndex(p => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  d.products[i] = { ...d.products[i], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
  d.lastUpdated = new Date().toISOString();
  writeJSON(PRODUCTS_FILE, d);
  res.json({ success: true, product: d.products[i] });
});

app.delete('/api/products/:id', (req, res) => {
  const d = readJSON(PRODUCTS_FILE);
  if (!d) return res.status(500).json({ error: 'Read failed' });
  const i = d.products.findIndex(p => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  d.products.splice(i, 1);
  d.lastUpdated = new Date().toISOString();
  writeJSON(PRODUCTS_FILE, d);
  res.json({ success: true });
});

app.get('/api/products/:id', (req, res) => {
  const d = readJSON(PRODUCTS_FILE);
  const p = d && d.products && d.products.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

app.get('/api/products/export/json', (req, res) => {
  const d = readJSON(PRODUCTS_FILE);
  res.setHeader('Content-Disposition', `attachment; filename="products-${Date.now()}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.json(d);
});

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────
app.get('/api/customers', (req, res) => {
  const d = readJSON(CUSTOMERS_FILE);
  if (!d) return res.status(500).json({ error: 'Read failed' });
  res.json(d);
});

app.post('/api/customers', (req, res) => {
  const d = readJSON(CUSTOMERS_FILE);
  if (!d) return res.status(500).json({ error: 'Read failed' });
  if (!req.body.name || !req.body.name.trim()) return res.status(400).json({ error: 'Customer name is required' });
  const customer = { id: uid('CUS'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...req.body };
  d.customers.push(customer);
  d.lastUpdated = new Date().toISOString();
  writeJSON(CUSTOMERS_FILE, d);
  res.status(201).json({ success: true, customer });
});

app.put('/api/customers/:id', (req, res) => {
  const d = readJSON(CUSTOMERS_FILE);
  if (!d) return res.status(500).json({ error: 'Read failed' });
  const i = d.customers.findIndex(c => c.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  d.customers[i] = { ...d.customers[i], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
  d.lastUpdated = new Date().toISOString();
  writeJSON(CUSTOMERS_FILE, d);
  res.json({ success: true, customer: d.customers[i] });
});

app.delete('/api/customers/:id', (req, res) => {
  const d = readJSON(CUSTOMERS_FILE);
  if (!d) return res.status(500).json({ error: 'Read failed' });
  const i = d.customers.findIndex(c => c.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  d.customers.splice(i, 1);
  d.lastUpdated = new Date().toISOString();
  writeJSON(CUSTOMERS_FILE, d);
  res.json({ success: true });
});

app.get('/api/customers/:id', (req, res) => {
  const d = readJSON(CUSTOMERS_FILE);
  const c = d && d.customers && d.customers.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(c);
});

// ─── INVOICES ────────────────────────────────────────────────────────────────
app.get('/api/invoices', (req, res) => {
  const d = readJSON(INVOICES_FILE);
  if (!d) return res.status(500).json({ error: 'Read failed' });
  res.json(d);
});

app.post('/api/invoices', (req, res) => {
  const d = readJSON(INVOICES_FILE);
  if (!d) return res.status(500).json({ error: 'Read failed' });
  const settings = readJSON(SETTINGS_FILE) || {};

  d.lastInvoiceSeq = (d.lastInvoiceSeq || 0) + 1;
  const now   = new Date();
  const year  = now.getFullYear();
  const fyEnd = now.getMonth() >= 3 ? year + 1 : year;
  const fyStr = `${fyEnd - 1}-${String(fyEnd).slice(-2)}`;
  const seq   = String(d.lastInvoiceSeq).padStart(4, '0');
  const prefix = settings.invoicePrefix || 'INV';
  const invoiceNumber = req.body.invoiceNumber || `${prefix}/${fyStr}/${seq}`;

  const invoice = {
    id: uid('INV'),
    invoiceNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body,
    invoiceNumber
  };

  d.invoices.push(invoice);
  d.lastUpdated = new Date().toISOString();
  writeJSON(INVOICES_FILE, d);
  res.status(201).json({ success: true, invoice });
});

app.put('/api/invoices/:id', (req, res) => {
  const d = readJSON(INVOICES_FILE);
  if (!d) return res.status(500).json({ error: 'Read failed' });
  const i = d.invoices.findIndex(inv => inv.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  d.invoices[i] = { ...d.invoices[i], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
  d.lastUpdated = new Date().toISOString();
  writeJSON(INVOICES_FILE, d);
  res.json({ success: true, invoice: d.invoices[i] });
});

app.delete('/api/invoices/:id', (req, res) => {
  const d = readJSON(INVOICES_FILE);
  if (!d) return res.status(500).json({ error: 'Read failed' });
  const i = d.invoices.findIndex(inv => inv.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  d.invoices.splice(i, 1);
  d.lastUpdated = new Date().toISOString();
  writeJSON(INVOICES_FILE, d);
  res.json({ success: true });
});

app.get('/api/invoices/:id', (req, res) => {
  const d = readJSON(INVOICES_FILE);
  const inv = d && d.invoices && d.invoices.find(i => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Not found' });
  res.json(inv);
});

// ─── SETTINGS ────────────────────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  const s = readJSON(SETTINGS_FILE);
  if (!s) return res.status(500).json({ error: 'Read failed' });
  res.json(s);
});

app.put('/api/settings', (req, res) => {
  const current = readJSON(SETTINGS_FILE) || {};
  const updated = { ...current, ...req.body };
  writeJSON(SETTINGS_FILE, updated);
  res.json({ success: true });
});

// ─── CONTEXT (for AI) ────────────────────────────────────────────────────────
app.get('/api/context', (req, res) => {
  const settings  = readJSON(SETTINGS_FILE) || {};
  const prodData  = readJSON(PRODUCTS_FILE) || { products: [] };
  const cusData   = readJSON(CUSTOMERS_FILE) || { customers: [] };
  const invData   = readJSON(INVOICES_FILE) || { invoices: [] };

  const products  = (prodData.products || []).map(p => ({
    id: p.id, name: p.name, hsn_sac: p.hsn_sac, rate: p.rate,
    gst_rate: p.gst_rate, unit: p.unit, supply_type: p.supply_type,
    category: p.category || '', status: p.status || 'active'
  }));

  const customers = (cusData.customers || []).map(c => ({
    id: c.id, name: c.name, gstin: c.gstin || '', state: c.state || '',
    type: c.type || 'B2B', email: c.email || ''
  }));

  const recentInvoices = (invData.invoices || [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map(inv => ({
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer ? inv.customer.name : 'Unknown',
      grandTotal: inv.grandTotal,
      status: inv.status,
      date: inv.date,
      dueDate: inv.dueDate
    }));

  res.json({
    company: {
      name: settings.businessName || '', gstin: settings.businessGSTIN || '',
      pan: settings.businessPAN || '', address: settings.businessAddress || '',
      state: settings.businessState || '', email: settings.businessEmail || '',
      phone: settings.businessPhone || ''
    },
    products, customers, recentInvoices
  });
});

// ─── STATS ───────────────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const prodData = readJSON(PRODUCTS_FILE) || { products: [] };
  const cusData  = readJSON(CUSTOMERS_FILE) || { customers: [] };
  const invData  = readJSON(INVOICES_FILE) || { invoices: [] };

  const products  = prodData.products || [];
  const customers = cusData.customers || [];
  const invoices  = invData.invoices || [];

  const totalRevenue   = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.grandTotal || 0), 0);
  const outstandingAmt = invoices.filter(i => ['sent','overdue'].includes(i.status)).reduce((s, i) => s + (i.grandTotal || 0), 0);
  const overdueCount   = invoices.filter(i => i.status === 'overdue').length;
  const draftCount     = invoices.filter(i => i.status === 'draft').length;

  const monthlyRevenue = {};
  const now = new Date();
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    monthlyRevenue[key] = 0;
  }
  invoices.filter(i => i.status === 'paid' && i.date).forEach(inv => {
    const key = inv.date.substring(0, 7);
    if (key in monthlyRevenue) monthlyRevenue[key] += (inv.grandTotal || 0);
  });

  const gstBreakdown = {};
  products.forEach(p => { const r = p.gst_rate || 0; gstBreakdown[r] = (gstBreakdown[r] || 0) + 1; });

  res.json({
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    categories: [...new Set(products.map(p => p.category).filter(Boolean))].length,
    totalCustomers: customers.length,
    totalInvoices: invoices.length,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    outstandingAmt: parseFloat(outstandingAmt.toFixed(2)),
    overdueCount, draftCount, monthlyRevenue, gstBreakdown,
    recentInvoices: invoices.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  });
});

// ─── AI (OpenRouter) ─────────────────────────────────────────────────────────
app.post('/api/ai/invoke', async (req, res) => {
  try {
    const fetch    = require('node-fetch');
    const settings = readJSON(SETTINGS_FILE);
    const { mode, payload } = req.body;

    if (!settings || !settings.apiKey) return res.status(400).json({ error: 'No API key configured. Go to Settings.' });

    const prodData = readJSON(PRODUCTS_FILE) || { products: [] };
    const cusData  = readJSON(CUSTOMERS_FILE) || { customers: [] };
    const invData  = readJSON(INVOICES_FILE) || { invoices: [] };

    const products  = prodData.products || [];
    const customers = cusData.customers || [];
    const invoices  = (invData.invoices || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,10);

    const contextBlock = [
      '=== YOUR BUSINESS DATA ===',
      `Company: ${settings.businessName || 'Not configured'} | GSTIN: ${settings.businessGSTIN || 'N/A'} | State: ${settings.businessState || 'N/A'}`,
      '',
      `Products (${products.length}):`,
      ...products.slice(0,20).map(p => `  • ${p.name} | HSN:${p.hsn_sac} | Rate:${p.rate}/${p.unit} | GST:${p.gst_rate}% | ${p.status||'active'}`),
      products.length > 20 ? `  ... and ${products.length-20} more products` : '',
      '',
      `Customers (${customers.length}):`,
      ...customers.slice(0,15).map(c => `  • ${c.name} | GSTIN:${c.gstin||'N/A'} | ${c.type||'B2B'} | ${c.state||''}`),
      customers.length > 15 ? `  ... and ${customers.length-15} more customers` : '',
      '',
      `Recent Invoices (${invoices.length}):`,
      ...invoices.map(i => `  • ${i.invoiceNumber} | ${i.customer ? i.customer.name : '?'} | Rs.${(i.grandTotal||0).toLocaleString('en-IN')} | ${i.status} | ${i.date}`),
      '=== END DATA ==='
    ].filter(l => l !== undefined).join('\n');

    const PROMPTS = require('./prompts');
    const modePrompt = PROMPTS.MODE_PROMPTS[mode] || PROMPTS.MODE_PROMPTS.general_chat;

    const systemPrompt = `${PROMPTS.BASE_PROMPT}\n\n${contextBlock}\n\n${modePrompt}\n\nCRITICAL FORMAT REQUIREMENT: Respond STRICTLY in natural language conversational English. NEVER output raw JSON, code blocks, or technical data schemas to the user. Present key figures, bullet points, and recommendations in clean human-readable prose with Indian currency formatted as ₹X,XX,XXX.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'InvoiceWise'
      },
      body: JSON.stringify({
        model: settings.modelName || 'google/gemma-4-26b-a4b-it:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: typeof payload === 'string' ? payload : JSON.stringify(payload) }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: (data.error && data.error.message) || 'OpenRouter error' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Fallback SPA ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 InvoiceWise running at http://localhost:${PORT}`);
  console.log(`📁 Data stored at: ${DATA_DIR}`);
  console.log(`   Press Ctrl+C to stop\n`);
});
