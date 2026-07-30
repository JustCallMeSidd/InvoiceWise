/**
 * InvoiceWise — Single Page Application Frontend
 * Complete GST Billing, Product & Customer Management, AI Assistant
 */

// ─── Global State ─────────────────────────────────────────────────────────────
const state = {
  products: [],
  customers: [],
  invoices: [],
  settings: {},
  stats: {},
  currentPage: 'dashboard',
  aiMode: 'anomaly_explanation',
  editProductId: null,
  editCustomerId: null,
  deleteTarget: null, // { type: 'product'|'customer'|'invoice', id: string, name: string }
  chatHistories: {}
};

// ─── Constants & Master Data ──────────────────────────────────────────────────
const GST_SLAB_INFO = [
  { rate: 0,  name: 'Exempt / Zero Rated', examples: 'Fresh milk, foodgrains, salt, printed books', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
  { rate: 5,  name: 'Essential Goods', examples: 'Tea, coffee, sugar, edible oil, domestic LPG', color: '#22d3ee', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
  { rate: 12, name: 'Standard Rate 1', examples: 'Processed food, computers, mobile phones, apparels > ₹1k', color: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
  { rate: 18, name: 'Standard Rate 2 (Most Common)', examples: 'IT services, telecom, software, capital goods, hair oil', color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  { rate: 28, name: 'DeMerit / Luxury Goods', examples: 'Automobiles, ACs, refrigerators, aerated drinks, tobacco', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' }
];

const GST_RATES = [0, 5, 12, 18, 28];

const INDIAN_STATES = [
  { code: '01', name: 'Jammu & Kashmir' }, { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' }, { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' }, { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' }, { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' }, { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' }, { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' }, { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' }, { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' }, { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' }, { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' }, { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' }, { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: '27', name: 'Maharashtra' }, { code: '28', name: 'Andhra Pradesh (Old)' },
  { code: '29', name: 'Karnataka' }, { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' }, { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' }, { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' }, { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh (New)' }, { code: '38', name: 'Ladakh' }
];

const UQC_CODES = [
  { code: 'BAG', desc: 'Bags' }, { code: 'BAL', desc: 'Bale' },
  { code: 'BDL', desc: 'Bundles' }, { code: 'BKL', desc: 'Buckles' },
  { code: 'BOX', desc: 'Boxes' }, { code: 'BTL', desc: 'Bottles' },
  { code: 'CAN', desc: 'Cans' }, { code: 'CTN', desc: 'Cartons' },
  { code: 'DOZ', desc: 'Dozen' }, { code: 'DRM', desc: 'Drums' },
  { code: 'GGR', desc: 'Great Gross' }, { code: 'GMS', desc: 'Grams' },
  { code: 'KGS', desc: 'Kilograms' }, { code: 'KLR', desc: 'Kilolitre' },
  { code: 'MTR', desc: 'Metres' }, { code: 'NOS', desc: 'Numbers / Units' },
  { code: 'PAC', desc: 'Packs' }, { code: 'PCS', desc: 'Pieces' },
  { code: 'SET', desc: 'Sets' }, { code: 'SQM', desc: 'Square Metres' },
  { code: 'TUB', desc: 'Tubes' }
];

const PRODUCT_CATEGORIES = [
  'Electronics & IT', 'Software & SaaS', 'Office Supplies', 'Raw Materials',
  'Professional Services', 'Consulting & Advisory', 'Maintenance & Repair',
  'Logistics & Transport', 'Hardware & Tools', 'Apparel & Textiles', 'FMCG & Groceries'
];

const AI_MODES = [
  { id: 'anomaly_explanation', name: 'Anomaly Explanation', color: '#f59e0b', desc: 'Examines suspicious charges, sudden spikes, or unusual line items.' },
  { id: 'forecast_narrative', name: 'Forecast Narrative', color: '#06b6d4', desc: 'Translates cashflow trends & revenue predictions into clear business insights.' },
  { id: 'pricing_suggestion', name: 'Pricing Intelligence', color: '#10b981', desc: 'Evaluates discounts, retention pricing, and GST margin impacts.' },
  { id: 'dispute_draft', name: 'Dispute Resolution', color: '#a855f7', desc: 'Drafts professional responses for customer invoice inquiries & overages.' },
  { id: 'executive_narrative', name: 'Executive Summary', color: '#6366f1', desc: 'Generates high-level billing summaries for leadership & board review.' },
  { id: 'general_chat', name: 'General GST & Q&A', color: '#ec4899', desc: 'Answers tax compliance, HSN/SAC, CGST/SGST rules, and billing questions.' }
];

// ─── DOM Helpers ─────────────────────────────────────────────────────────────
const $  = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

function escHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatCurrency(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showToast(msg, type = 'info') {
  const container = $('#toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${escHtml(msg)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

async function api(method, url, body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Server request failed');
  return data;
}

// ─── Data Loading ────────────────────────────────────────────────────────────
async function loadData() {
  try {
    const [pData, cData, iData, sData, statsData] = await Promise.all([
      api('GET', '/api/products'),
      api('GET', '/api/customers'),
      api('GET', '/api/invoices'),
      api('GET', '/api/settings'),
      api('GET', '/api/stats')
    ]);

    state.products  = pData.products || [];
    state.customers = cData.customers || [];
    state.invoices  = iData.invoices || [];
    state.settings  = sData || {};
    state.stats     = statsData || {};

    // Update Sidebar Badges
    const pBadge = $('#product-count-badge');
    if (pBadge) pBadge.textContent = state.products.length;

    const cBadge = $('#customer-count-badge');
    if (cBadge) cBadge.textContent = state.customers.length;

    const iBadge = $('#invoice-count-badge');
    if (iBadge) iBadge.textContent = state.invoices.length;

    // Load Sidebar Logo
    const sidebarLogo = $('#sidebar-logo-img');
    if (sidebarLogo && state.settings.businessLogoBase64) {
      sidebarLogo.src = state.settings.businessLogoBase64;
    }
  } catch (err) {
    showToast('Failed to load application data: ' + err.message, 'error');
  }
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function navigateTo(pageId) {
  state.currentPage = pageId;

  // Active page DOM toggle
  $$('.page').forEach(p => p.classList.remove('active'));
  const targetPage = $(`#page-${pageId}`);
  if (targetPage) targetPage.classList.add('active');

  // Active nav item toggle
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  const activeNav = $(`[data-page="${pageId}"]`);
  if (activeNav) activeNav.classList.add('active');

  // Update Breadcrumb
  const breadcrumbMap = {
    'dashboard': 'Dashboard',
    'invoices': 'Invoices List',
    'create-invoice': 'Create Invoice',
    'customers': 'Customer Directory',
    'add-customer': 'Add Customer',
    'products': 'Product Catalog',
    'add-product': 'Add Product',
    'ai-assistant': 'AI Assistant',
    'gst-info': 'GST Reference'
  };
  const breadcrumb = $('#breadcrumb');
  if (breadcrumb) breadcrumb.textContent = breadcrumbMap[pageId] || 'InvoiceWise';

  // Render Page Content
  switch (pageId) {
    case 'dashboard': renderDashboard(); break;
    case 'invoices': renderInvoicesList(); break;
    case 'create-invoice': renderCreateInvoice(); break;
    case 'customers': renderCustomersList(); break;
    case 'add-customer': renderCustomerForm(); break;
    case 'products': renderProductsList(); break;
    case 'add-product': renderProductForm(); break;
    case 'ai-assistant': renderAIAssistant(); break;
    case 'gst-info': renderGSTReference(); break;
  }

  // Close mobile sidebar
  $('#sidebar')?.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── PAGE 1: Dashboard ───────────────────────────────────────────────────────
function renderDashboard() {
  const el = $('#page-dashboard');
  const s = state.stats;
  const userName = state.settings.userName;
  const greeting = userName ? `Welcome back, ${escHtml(userName)}! 👋` : 'Billing Overview';
  const subtitle = userName ? 'Here is your real-time revenue, invoice, customer, and product summary.' : 'Real-time revenue, invoices, customers, and product metrics';

  el.innerHTML = `
    <h1 class="page-title">${greeting}</h1>
    <p class="page-subtitle">${subtitle}</p>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card" style="--card-color:#10b981">
        <div class="stat-header">
          <span class="stat-title">Total Revenue Paid</span>
          <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        </div>
        <div class="stat-value">${formatCurrency(s.totalRevenue)}</div>
        <div class="stat-desc">Collected from paid invoices</div>
      </div>

      <div class="stat-card" style="--card-color:#f59e0b">
        <div class="stat-header">
          <span class="stat-title">Outstanding Due</span>
          <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        </div>
        <div class="stat-value">${formatCurrency(s.outstandingAmt)}</div>
        <div class="stat-desc">${s.overdueCount || 0} overdue invoices</div>
      </div>

      <div class="stat-card" style="--card-color:#6366f1">
        <div class="stat-header">
          <span class="stat-title">Total Invoices</span>
          <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div>
        </div>
        <div class="stat-value">${s.totalInvoices || 0}</div>
        <div class="stat-desc">${s.draftCount || 0} drafts waiting</div>
      </div>

      <div class="stat-card" style="--card-color:#06b6d4">
        <div class="stat-header">
          <span class="stat-title">Active Customers</span>
          <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
        </div>
        <div class="stat-value">${s.totalCustomers || 0}</div>
        <div class="stat-desc">${s.activeProducts || 0} catalog products</div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="dashboard-sections-grid">
      <!-- Left: Recent Invoices Feed -->
      <div class="dashboard-card">
        <div class="dashboard-card-title">
          <span>Recent Invoices</span>
          <button class="btn btn-ghost btn-sm" onclick="navigateTo('invoices')">View All →</button>
        </div>

        ${(!s.recentInvoices || s.recentInvoices.length === 0) ? `
          <div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
            <p>No invoices created yet.</p>
            <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="navigateTo('create-invoice')">+ Create First Invoice</button>
          </div>
        ` : `
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${s.recentInvoices.map(inv => `
                <tr>
                  <td class="font-mono" style="font-weight:600;color:#fff">${inv.invoiceNumber}</td>
                  <td>${escHtml(inv.customer ? inv.customer.name : 'Walk-in')}</td>
                  <td>${inv.date}</td>
                  <td class="font-mono" style="font-weight:700;color:#fff">${formatCurrency(inv.grandTotal)}</td>
                  <td><span class="status-badge status-${inv.status}">${inv.status}</span></td>
                  <td>
                    <button class="btn btn-ghost btn-sm" onclick="triggerPrintInvoice('${inv.id}')">Print / PDF</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>

      <!-- Right: Quick Actions & GST Summary -->
      <div>
        <div class="dashboard-card">
          <div class="dashboard-card-title">Quick Actions</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <button class="btn btn-primary" style="justify-content:flex-start" onclick="navigateTo('create-invoice')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create New Tax Invoice
            </button>
            <button class="btn btn-secondary" style="justify-content:flex-start" onclick="navigateTo('add-customer')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
              Add New Customer
            </button>
            <button class="btn btn-secondary" style="justify-content:flex-start" onclick="navigateTo('add-product')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              Add Product to Catalog
            </button>
            <button class="btn btn-ghost" style="justify-content:flex-start" onclick="navigateTo('ai-assistant')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Ask AI Assistant
            </button>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-title">Company Profile</div>
          <div style="font-size:0.85rem;line-height:1.6;color:var(--text-secondary)">
            <strong style="color:#fff">${escHtml(state.settings.businessName || 'Business Name Not Set')}</strong><br>
            ${state.settings.businessGSTIN ? `<span class="font-mono" style="color:var(--accent-secondary)">GSTIN: ${state.settings.businessGSTIN}</span><br>` : ''}
            ${state.settings.businessState ? `State: ${state.settings.businessState}<br>` : ''}
            <button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="openSettingsModal()">Edit Company Profile →</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── PAGE 2: Invoices List ────────────────────────────────────────────────────
function renderInvoicesList() {
  const el = $('#page-invoices');

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div>
        <h1 class="page-title">Invoices</h1>
        <p class="page-subtitle">Manage, track, and print GST tax invoices</p>
      </div>
      <button class="btn btn-primary" onclick="navigateTo('create-invoice')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create Invoice
      </button>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="invoice-search" placeholder="Search by invoice #, customer name, GSTIN…" oninput="filterInvoicesTable()" />
        </div>
        <select id="invoice-status-filter" style="width:auto" onchange="filterInvoicesTable()">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div id="invoices-table-wrap">
        ${renderInvoicesTableRows(state.invoices)}
      </div>
    </div>
  `;
}

function renderInvoicesTableRows(invoices) {
  if (!invoices || invoices.length === 0) {
    return `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p style="font-size:1rem;margin-top:12px;font-weight:600;color:var(--text-secondary)">No invoices found</p>
        <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="navigateTo('create-invoice')">+ Create New Invoice</button>
      </div>
    `;
  }

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Invoice #</th>
          <th>Customer</th>
          <th>Date</th>
          <th>Due Date</th>
          <th>Total (incl. GST)</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${invoices.map(inv => `
          <tr>
            <td class="font-mono" style="font-weight:700;color:#fff">${inv.invoiceNumber}</td>
            <td>
              <strong style="color:#fff">${escHtml(inv.customer ? inv.customer.name : 'Walk-in Customer')}</strong>
              ${inv.customer && inv.customer.gstin ? `<br><span class="font-mono" style="font-size:0.7rem;color:var(--text-muted)">${inv.customer.gstin}</span>` : ''}
            </td>
            <td>${inv.date}</td>
            <td>${inv.dueDate || '—'}</td>
            <td class="font-mono" style="font-weight:800;color:#fff">${formatCurrency(inv.grandTotal)}</td>
            <td>
              <select onchange="updateInvoiceStatus('${inv.id}', this.value)" style="padding:2px 6px;font-size:0.75rem;border-radius:12px;background:var(--bg-elevated);color:#fff">
                <option value="draft" ${inv.status === 'draft' ? 'selected' : ''}>Draft</option>
                <option value="sent" ${inv.status === 'sent' ? 'selected' : ''}>Sent</option>
                <option value="paid" ${inv.status === 'paid' ? 'selected' : ''}>Paid</option>
                <option value="overdue" ${inv.status === 'overdue' ? 'selected' : ''}>Overdue</option>
                <option value="cancelled" ${inv.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-primary btn-sm" title="Print or Save PDF" onclick="triggerPrintInvoice('${inv.id}')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print / PDF
                </button>
                <button class="btn btn-danger btn-sm" title="Delete Invoice" onclick="confirmDeleteInvoice('${inv.id}', '${inv.invoiceNumber}')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function filterInvoicesTable() {
  const query = $('#invoice-search')?.value.toLowerCase().trim() || '';
  const status = $('#invoice-status-filter')?.value || '';

  const filtered = state.invoices.filter(inv => {
    const matchesQuery = !query ||
      inv.invoiceNumber.toLowerCase().includes(query) ||
      (inv.customer && inv.customer.name.toLowerCase().includes(query)) ||
      (inv.customer && inv.customer.gstin && inv.customer.gstin.toLowerCase().includes(query));
    const matchesStatus = !status || inv.status === status;
    return matchesQuery && matchesStatus;
  });

  const wrap = $('#invoices-table-wrap');
  if (wrap) wrap.innerHTML = renderInvoicesTableRows(filtered);
}

async function updateInvoiceStatus(id, newStatus) {
  try {
    await api('PUT', `/api/invoices/${id}`, { status: newStatus });
    const inv = state.invoices.find(i => i.id === id);
    if (inv) inv.status = newStatus;
    showToast(`Invoice status updated to ${newStatus}`, 'success');
  } catch (err) {
    showToast('Failed to update status: ' + err.message, 'error');
  }
}

function triggerPrintInvoice(id) {
  const inv = state.invoices.find(i => i.id === id);
  if (!inv) return showToast('Invoice not found', 'error');
  if (typeof window.printInvoice === 'function') {
    window.printInvoice(inv, state.settings);
  } else {
    showToast('Print engine not loaded', 'error');
  }
}

// ─── PAGE 3: Create Invoice Builder ──────────────────────────────────────────
let builderLineItems = [];

function renderCreateInvoice() {
  const el = $('#page-create-invoice');
  builderLineItems = [createEmptyLineItem()];

  const todayStr = new Date().toISOString().split('T')[0];
  const dueDateStr = new Date(Date.now() + 30*24*3600*1000).toISOString().split('T')[0];

  el.innerHTML = `
    <h1 class="page-title">New Tax Invoice</h1>
    <p class="page-subtitle">GST Rule 46 Compliant Invoice Builder</p>

    <div class="invoice-builder-layout">
      <!-- Main Invoice Details -->
      <div class="builder-main">
        <!-- Party Details Card -->
        <div class="builder-card">
          <div class="builder-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Customer &amp; Tax Options
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label for="inv-customer-select">Customer *</label>
              <select id="inv-customer-select" onchange="onInvoiceCustomerSelect(this.value)">
                <option value="">-- Select Saved Customer --</option>
                ${state.customers.map(c => `<option value="${c.id}">${escHtml(c.name)} ${c.gstin ? ' (' + c.gstin + ')' : ''}</option>`).join('')}
              </select>
              <span class="field-hint"><a href="#" onclick="navigateTo('add-customer'); return false;">+ Create New Customer</a></span>
            </div>

            <div class="form-group">
              <label for="inv-supply-type">Supply Type *</label>
              <select id="inv-supply-type" onchange="recalculateBuilder()">
                <option value="intra">Intra-State (CGST + SGST)</option>
                <option value="inter">Inter-State (IGST)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="inv-date">Invoice Date *</label>
              <input type="date" id="inv-date" value="${todayStr}" />
            </div>

            <div class="form-group">
              <label for="inv-due-date">Due Date</label>
              <input type="date" id="inv-due-date" value="${dueDateStr}" />
            </div>

            <div class="form-group">
              <label for="inv-po-no">P.O. Number (Optional)</label>
              <input type="text" id="inv-po-no" placeholder="e.g. PO-98765" />
            </div>

            <div class="form-group">
              <label for="inv-rcm">Reverse Charge Applicable?</label>
              <select id="inv-rcm">
                <option value="no">No</option>
                <option value="yes">Yes (RCM)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Line Items Card -->
        <div class="builder-card">
          <div class="builder-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            Line Items
          </div>

          <table class="line-items-table">
            <thead>
              <tr>
                <th style="width:35%">Item / Service</th>
                <th style="width:12%">HSN/SAC</th>
                <th style="width:10%">Qty</th>
                <th style="width:15%">Rate (₹)</th>
                <th style="width:10%">GST %</th>
                <th style="width:15%;text-align:right">Total (₹)</th>
                <th style="width:3%"></th>
              </tr>
            </thead>
            <tbody id="line-items-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>

          <button class="btn btn-secondary btn-sm" onclick="addBuilderRow()">+ Add Item Row</button>
        </div>

        <!-- Notes & Terms -->
        <div class="builder-card">
          <div class="form-grid-2">
            <div class="form-group">
              <label for="inv-notes">Invoice Notes</label>
              <textarea id="inv-notes" rows="3" placeholder="Notes for customer...">${state.settings.invoiceNotes || ''}</textarea>
            </div>
            <div class="form-group">
              <label for="inv-terms">Terms &amp; Conditions</label>
              <textarea id="inv-terms" rows="3" placeholder="Terms...">${state.settings.invoiceTerms || 'Payment due within 30 days.'}</textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Summary Panel -->
      <div class="builder-summary-card">
        <h3 style="font-size:1rem;font-weight:700;color:#fff;margin-bottom:16px">Summary</h3>

        <div class="summary-row">
          <span>Taxable Subtotal:</span>
          <span id="summary-subtotal" class="font-mono">₹0.00</span>
        </div>
        <div class="summary-row" id="summary-cgst-row">
          <span>CGST:</span>
          <span id="summary-cgst" class="font-mono">₹0.00</span>
        </div>
        <div class="summary-row" id="summary-sgst-row">
          <span>SGST/UTGST:</span>
          <span id="summary-sgst" class="font-mono">₹0.00</span>
        </div>
        <div class="summary-row" id="summary-igst-row" style="display:none">
          <span>IGST:</span>
          <span id="summary-igst" class="font-mono">₹0.00</span>
        </div>
        <div class="summary-row">
          <span>Freight / Shipping:</span>
          <input type="number" id="inv-shipping" value="0" min="0" style="width:90px;text-align:right;padding:4px" oninput="recalculateBuilder()" />
        </div>
        <div class="summary-row grand-total">
          <span>Grand Total:</span>
          <span id="summary-grand-total" class="font-mono" style="color:var(--accent-secondary)">₹0.00</span>
        </div>

        <div style="margin-top:24px;display:flex;flex-direction:column;gap:10px">
          <button class="btn btn-primary btn-lg" onclick="saveInvoice('paid')">
            Save &amp; Print Invoice
          </button>
          <button class="btn btn-secondary" onclick="saveInvoice('draft')">
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  `;

  renderLineItemsTable();
}

function createEmptyLineItem() {
  return { productId: '', name: '', hsn_sac: '', qty: 1, rate: 0, discount_pct: 0, gst_rate: 18, unit: 'NOS', taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
}

function renderLineItemsTable() {
  const tbody = $('#line-items-tbody');
  if (!tbody) return;

  tbody.innerHTML = builderLineItems.map((item, idx) => `
    <tr>
      <td>
        <select class="item-select" onchange="onItemCatalogSelect(${idx}, this.value)">
          <option value="">-- Pick Product or Custom --</option>
          ${state.products.map(p => `<option value="${p.id}" ${item.productId === p.id ? 'selected' : ''}>${escHtml(p.name)} (₹${p.rate})</option>`).join('')}
        </select>
        <input type="text" placeholder="Description" value="${escHtml(item.name)}" oninput="builderLineItems[${idx}].name=this.value" style="margin-top:4px;font-size:0.78rem" />
      </td>
      <td>
        <input type="text" class="font-mono" value="${item.hsn_sac}" oninput="builderLineItems[${idx}].hsn_sac=this.value" placeholder="8471" style="font-size:0.8rem" />
      </td>
      <td>
        <input type="number" class="item-qty-input" value="${item.qty}" min="1" oninput="builderLineItems[${idx}].qty=parseFloat(this.value)||0; recalculateBuilder()" />
      </td>
      <td>
        <input type="number" class="item-rate-input" value="${item.rate}" min="0" step="0.01" oninput="builderLineItems[${idx}].rate=parseFloat(this.value)||0; recalculateBuilder()" />
      </td>
      <td>
        <select style="padding:6px;font-size:0.8rem" onchange="builderLineItems[${idx}].gst_rate=parseFloat(this.value)||0; recalculateBuilder()">
          ${GST_RATES.map(r => `<option value="${r}" ${item.gst_rate === r ? 'selected' : ''}>${r}%</option>`).join('')}
        </select>
      </td>
      <td style="text-align:right" class="font-mono font-bold">
        <span id="line-total-${idx}">${formatCurrency(item.total)}</span>
      </td>
      <td>
        ${builderLineItems.length > 1 ? `<button class="btn btn-ghost btn-sm" onclick="removeBuilderRow(${idx})" style="color:var(--accent-danger);padding:4px">✕</button>` : ''}
      </td>
    </tr>
  `).join('');

  recalculateBuilder();
}

function onItemCatalogSelect(idx, productId) {
  const product = state.products.find(p => p.id === productId);
  if (product) {
    builderLineItems[idx].productId = product.id;
    builderLineItems[idx].name = product.name;
    builderLineItems[idx].hsn_sac = product.hsn_sac || '';
    builderLineItems[idx].rate = parseFloat(product.rate) || 0;
    builderLineItems[idx].gst_rate = parseFloat(product.gst_rate) || 18;
    builderLineItems[idx].unit = product.unit || 'NOS';
  }
  renderLineItemsTable();
}

function addBuilderRow() {
  builderLineItems.push(createEmptyLineItem());
  renderLineItemsTable();
}

function removeBuilderRow(idx) {
  if (builderLineItems.length > 1) {
    builderLineItems.splice(idx, 1);
    renderLineItemsTable();
  }
}

function onInvoiceCustomerSelect(customerId) {
  const customer = state.customers.find(c => c.id === customerId);
  if (customer && customer.state && state.settings.businessState) {
    const isInter = customer.state.toLowerCase() !== state.settings.businessState.toLowerCase();
    const select = $('#inv-supply-type');
    if (select) select.value = isInter ? 'inter' : 'intra';
    recalculateBuilder();
  }
}

function recalculateBuilder() {
  const supplyType = $('#inv-supply-type')?.value || 'intra';
  const isInter = supplyType === 'inter';

  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  builderLineItems.forEach((item, idx) => {
    const qty = item.qty || 0;
    const rate = item.rate || 0;
    const gstRate = item.gst_rate || 0;

    const taxable = qty * rate;
    let cgst = 0, sgst = 0, igst = 0;

    if (isInter) {
      igst = taxable * (gstRate / 100);
    } else {
      cgst = taxable * ((gstRate / 2) / 100);
      sgst = taxable * ((gstRate / 2) / 100);
    }

    const rowTotal = taxable + cgst + sgst + igst;

    item.taxableValue = taxable;
    item.cgst = cgst;
    item.sgst = sgst;
    item.igst = igst;
    item.total = rowTotal;

    subtotal += taxable;
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;

    const rowEl = $(`#line-total-${idx}`);
    if (rowEl) rowEl.textContent = formatCurrency(rowTotal);
  });

  const shipping = parseFloat($('#inv-shipping')?.value) || 0;
  const totalTax = totalCgst + totalSgst + totalIgst;
  const grandTotal = subtotal + totalTax + shipping;

  const subEl = $('#summary-subtotal'); if (subEl) subEl.textContent = formatCurrency(subtotal);
  const cgstEl = $('#summary-cgst'); if (cgstEl) cgstEl.textContent = formatCurrency(totalCgst);
  const sgstEl = $('#summary-sgst'); if (sgstEl) sgstEl.textContent = formatCurrency(totalSgst);
  const igstEl = $('#summary-igst'); if (igstEl) igstEl.textContent = formatCurrency(totalIgst);
  const grandEl = $('#summary-grand-total'); if (grandEl) grandEl.textContent = formatCurrency(grandTotal);

  const cgstRow = $('#summary-cgst-row'); if (cgstRow) cgstRow.style.display = isInter ? 'none' : 'flex';
  const sgstRow = $('#summary-sgst-row'); if (sgstRow) sgstRow.style.display = isInter ? 'none' : 'flex';
  const igstRow = $('#summary-igst-row'); if (igstRow) igstRow.style.display = isInter ? 'flex' : 'none';
}

async function saveInvoice(targetStatus = 'paid') {
  const customerId = $('#inv-customer-select')?.value;
  const customer = state.customers.find(c => c.id === customerId);

  const validItems = builderLineItems.filter(i => i.name && i.name.trim() !== '');
  if (validItems.length === 0) {
    return showToast('Add at least one line item with a name', 'error');
  }

  const supplyType = $('#inv-supply-type')?.value || 'intra';
  const isInter = supplyType === 'inter';

  const subtotal = validItems.reduce((s, i) => s + i.taxableValue, 0);
  const totalTax = validItems.reduce((s, i) => s + i.cgst + i.sgst + i.igst, 0);
  const shippingCharges = parseFloat($('#inv-shipping')?.value) || 0;
  const grandTotal = subtotal + totalTax + shippingCharges;

  const payload = {
    customer: customer || { name: 'Walk-in Customer' },
    supplyType,
    date: $('#inv-date')?.value || new Date().toISOString().split('T')[0],
    dueDate: $('#inv-due-date')?.value || '',
    poNumber: $('#inv-po-no')?.value || '',
    reverseCharge: $('#inv-rcm')?.value || 'no',
    lineItems: validItems,
    subtotal,
    totalTax,
    shippingCharges,
    grandTotal,
    notes: $('#inv-notes')?.value || '',
    terms: $('#inv-terms')?.value || '',
    status: targetStatus
  };

  try {
    const res = await api('POST', '/api/invoices', payload);
    showToast('Invoice created successfully!', 'success');
    await loadData();

    if (res.invoice && targetStatus !== 'draft') {
      window.printInvoice(res.invoice, state.settings);
    }
    navigateTo('invoices');
  } catch (err) {
    showToast('Failed to save invoice: ' + err.message, 'error');
  }
}

// ─── PAGE 4: Customers Directory ─────────────────────────────────────────────
function renderCustomersList() {
  const el = $('#page-customers');

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div>
        <h1 class="page-title">Customers</h1>
        <p class="page-subtitle">Manage customer profiles and GSTIN details</p>
      </div>
      <button class="btn btn-primary" onclick="navigateTo('add-customer')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
        Add Customer
      </button>
    </div>

    ${state.customers.length === 0 ? `
      <div style="text-align:center;padding:60px 20px;background:var(--bg-card);border-radius:var(--radius-lg);border:1px solid var(--border-subtle)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="color:var(--text-muted)"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        <p style="font-size:1rem;margin-top:12px;font-weight:600;color:var(--text-secondary)">No customers added yet</p>
        <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="navigateTo('add-customer')">+ Add First Customer</button>
      </div>
    ` : `
      <div class="customers-grid">
        ${state.customers.map(c => `
          <div class="customer-card">
            <div class="customer-card-header">
              <div>
                <div class="customer-name">${escHtml(c.name)}</div>
                <span class="customer-type-badge">${c.type || 'B2B'}</span>
              </div>
              <button class="btn btn-ghost btn-sm" onclick="editCustomer('${c.id}')">Edit</button>
            </div>
            <div style="font-size:0.8rem;line-height:1.6;color:var(--text-secondary)">
              ${c.gstin ? `<strong>GSTIN:</strong> <span class="font-mono" style="color:var(--accent-secondary)">${c.gstin}</span><br>` : '<span style="color:var(--text-muted)">Unregistered (B2C)</span><br>'}
              ${c.state ? `State: ${c.state}<br>` : ''}
              ${c.phone ? `Phone: ${c.phone}<br>` : ''}
              ${c.email ? `Email: ${c.email}` : ''}
            </div>
            <div style="display:flex;justify-content:flex-end;margin-top:10px">
              <button class="btn btn-danger btn-sm" onclick="confirmDeleteCustomer('${c.id}', '${escHtml(c.name)}')">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

function renderCustomerForm(customerData = null) {
  const el = $('#page-add-customer');
  const isEdit = !!customerData;
  state.editCustomerId = isEdit ? customerData.id : null;
  const c = customerData || {};

  el.innerHTML = `
    <h1 class="page-title">${isEdit ? 'Edit Customer' : 'Add New Customer'}</h1>
    <p class="page-subtitle">${isEdit ? `Editing ${escHtml(c.name)}` : 'Enter customer details for GST billing'}</p>

    <div class="builder-card" style="max-width:700px">
      <form onsubmit="handleCustomerSubmit(event)">
        <div class="form-grid-2">
          <div class="form-group full-width">
            <label for="c-name">Customer / Company Name *</label>
            <input type="text" id="c-name" value="${escHtml(c.name || '')}" required placeholder="Acme Technologies Pvt Ltd" />
          </div>

          <div class="form-group">
            <label for="c-type">Customer Type</label>
            <select id="c-type">
              <option value="B2B" ${c.type === 'B2B' ? 'selected' : ''}>B2B (Registered Business)</option>
              <option value="B2C" ${c.type === 'B2C' ? 'selected' : ''}>B2C (Consumer / Unregistered)</option>
              <option value="SEZ" ${c.type === 'SEZ' ? 'selected' : ''}>SEZ Developer / Unit</option>
            </select>
          </div>

          <div class="form-group">
            <label for="c-gstin">GSTIN (15-digit)</label>
            <input type="text" id="c-gstin" class="font-mono" maxlength="15" value="${c.gstin || ''}" placeholder="27AABCU9603R1ZX" />
          </div>

          <div class="form-group">
            <label for="c-state">State / UT *</label>
            <select id="c-state" required>
              <option value="">-- Select State --</option>
              ${INDIAN_STATES.map(s => `<option value="${s.name}" ${c.state === s.name ? 'selected' : ''}>${s.code} - ${s.name}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="c-pan">PAN Number</label>
            <input type="text" id="c-pan" class="font-mono" maxlength="10" value="${c.pan || ''}" placeholder="AABCU9603R" />
          </div>

          <div class="form-group">
            <label for="c-email">Email Address</label>
            <input type="email" id="c-email" value="${c.email || ''}" placeholder="billing@acme.com" />
          </div>

          <div class="form-group">
            <label for="c-phone">Phone Number</label>
            <input type="tel" id="c-phone" value="${c.phone || ''}" placeholder="+91 98765 43210" />
          </div>

          <div class="form-group full-width">
            <label for="c-address">Billing Address</label>
            <textarea id="c-address" rows="3" placeholder="Full address details...">${escHtml(c.address || '')}</textarea>
          </div>
        </div>

        <div style="margin-top:20px;display:flex;gap:12px;justify-content:flex-end">
          <button type="button" class="btn btn-ghost" onclick="navigateTo('customers')">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Customer'}</button>
        </div>
      </form>
    </div>
  `;
}

async function handleCustomerSubmit(e) {
  e.preventDefault();
  const payload = {
    name: $('#c-name')?.value.trim(),
    type: $('#c-type')?.value,
    gstin: $('#c-gstin')?.value.trim().toUpperCase(),
    state: $('#c-state')?.value,
    pan: $('#c-pan')?.value.trim().toUpperCase(),
    email: $('#c-email')?.value.trim(),
    phone: $('#c-phone')?.value.trim(),
    address: $('#c-address')?.value.trim()
  };

  try {
    if (state.editCustomerId) {
      await api('PUT', `/api/customers/${state.editCustomerId}`, payload);
      showToast('Customer updated', 'success');
    } else {
      await api('POST', '/api/customers', payload);
      showToast('Customer created', 'success');
    }
    state.editCustomerId = null;
    await loadData();
    navigateTo('customers');
  } catch (err) {
    showToast('Failed: ' + err.message, 'error');
  }
}

function editCustomer(id) {
  const c = state.customers.find(item => item.id === id);
  if (!c) return;
  state.editCustomerId = id;
  renderCustomerForm(c);
  navigateTo('add-customer');
}

// ─── PAGE 5: Products Catalog ────────────────────────────────────────────────
function renderProductsList() {
  const el = $('#page-products');

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div>
        <h1 class="page-title">Products Catalog</h1>
        <p class="page-subtitle">Manage products, HSN/SAC codes, pricing, and GST tax slabs</p>
      </div>
      <button class="btn btn-primary" onclick="navigateTo('add-product')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Product
      </button>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="product-search" placeholder="Search by product name, SKU, HSN/SAC code…" oninput="filterProductsTable()" />
        </div>
      </div>

      <div id="products-table-wrap">
        ${renderProductsTableRows(state.products)}
      </div>
    </div>
  `;
}

function renderProductsTableRows(products) {
  if (!products || products.length === 0) {
    return `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <p style="font-size:1rem;font-weight:600;color:var(--text-secondary)">No products found</p>
        <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="navigateTo('add-product')">+ Add Product</button>
      </div>
    `;
  }

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Product / Service</th>
          <th>HSN/SAC</th>
          <th>Price (₹)</th>
          <th>GST Rate</th>
          <th>UQC Unit</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td>
              <strong style="color:#fff">${escHtml(p.name)}</strong>
              ${p.sku ? `<br><span class="font-mono" style="font-size:0.7rem;color:var(--text-muted)">SKU: ${p.sku}</span>` : ''}
            </td>
            <td class="font-mono">${p.hsn_sac}</td>
            <td class="font-mono" style="font-weight:700;color:#fff">${formatCurrency(p.rate)}</td>
            <td><span class="status-badge" style="background:rgba(99,102,241,0.15);color:var(--accent-primary-light)">${p.gst_rate}%</span></td>
            <td>${p.unit}</td>
            <td><span class="status-badge status-${p.status || 'active'}">${p.status || 'active'}</span></td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm" onclick="editProduct('${p.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="confirmDeleteProduct('${p.id}', '${escHtml(p.name)}')">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function filterProductsTable() {
  const query = $('#product-search')?.value.toLowerCase().trim() || '';
  const filtered = state.products.filter(p => !query || p.name.toLowerCase().includes(query) || (p.hsn_sac && p.hsn_sac.includes(query)));
  const wrap = $('#products-table-wrap');
  if (wrap) wrap.innerHTML = renderProductsTableRows(filtered);
}

function renderProductForm(productData = null) {
  const el = $('#page-add-product');
  const isEdit = !!productData;
  state.editProductId = isEdit ? productData.id : null;
  const p = productData || {};

  el.innerHTML = `
    <h1 class="page-title">${isEdit ? 'Edit Product' : 'Add New Product'}</h1>
    <p class="page-subtitle">${isEdit ? `Editing ${escHtml(p.name)}` : 'Enter product pricing and tax details'}</p>

    <div class="builder-card" style="max-width:700px">
      <form onsubmit="handleProductSubmit(event)">
        <div class="form-grid-2">
          <div class="form-group full-width">
            <label for="p-name">Product Name *</label>
            <input type="text" id="p-name" value="${escHtml(p.name || '')}" required placeholder="Wireless Keyboard" />
          </div>

          <div class="form-group">
            <label for="p-sku">SKU Code</label>
            <input type="text" id="p-sku" class="font-mono" value="${p.sku || ''}" placeholder="WKB-001" />
          </div>

          <div class="form-group">
            <label for="p-hsn">HSN / SAC Code *</label>
            <input type="text" id="p-hsn" class="font-mono" value="${p.hsn_sac || ''}" required placeholder="8471" />
          </div>

          <div class="form-group">
            <label for="p-rate">Unit Price (₹) *</label>
            <input type="number" id="p-rate" step="0.01" value="${p.rate || ''}" required placeholder="2500.00" />
          </div>

          <div class="form-group">
            <label for="p-gst">GST Rate *</label>
            <select id="p-gst" required>
              ${GST_RATES.map(r => `<option value="${r}" ${p.gst_rate === r ? 'selected' : ''}>${r}%</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="p-unit">Unit of Measurement (UQC) *</label>
            <select id="p-unit" required>
              ${UQC_CODES.map(u => `<option value="${u.code}" ${p.unit === u.code ? 'selected' : ''}>${u.code} - ${u.desc}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="p-supply">Default Supply Type</label>
            <select id="p-supply">
              <option value="intra" ${p.supply_type === 'intra' ? 'selected' : ''}>Intra-State</option>
              <option value="inter" ${p.supply_type === 'inter' ? 'selected' : ''}>Inter-State</option>
            </select>
          </div>
        </div>

        <div style="margin-top:20px;display:flex;gap:12px;justify-content:flex-end">
          <button type="button" class="btn btn-ghost" onclick="navigateTo('products')">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Product'}</button>
        </div>
      </form>
    </div>
  `;
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const payload = {
    name: $('#p-name')?.value.trim(),
    sku: $('#p-sku')?.value.trim(),
    hsn_sac: $('#p-hsn')?.value.trim(),
    rate: parseFloat($('#p-rate')?.value) || 0,
    gst_rate: parseFloat($('#p-gst')?.value) || 0,
    unit: $('#p-unit')?.value,
    supply_type: $('#p-supply')?.value
  };

  try {
    if (state.editProductId) {
      await api('PUT', `/api/products/${state.editProductId}`, payload);
      showToast('Product updated', 'success');
    } else {
      await api('POST', '/api/products', payload);
      showToast('Product created', 'success');
    }
    state.editProductId = null;
    await loadData();
    navigateTo('products');
  } catch (err) {
    showToast('Failed: ' + err.message, 'error');
  }
}

function editProduct(id) {
  const p = state.products.find(item => item.id === id);
  if (!p) return;
  state.editProductId = id;
  renderProductForm(p);
  navigateTo('add-product');
}

// ─── PAGE 6: AI Assistant ────────────────────────────────────────────────────
function getChatHistory(mode = state.aiMode) {
  if (!state.chatHistories[mode]) {
    state.chatHistories[mode] = [];
  }
  return state.chatHistories[mode];
}

function clearCurrentModeChat() {
  state.chatHistories[state.aiMode] = [];
  renderAIAssistant();
}

function formatNaturalLanguageText(str) {
  if (!str) return '';

  let htmlOutput = '';

  try {
    const trimmed = str.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('```json') && trimmed.endsWith('```'))) {
      const cleanJsonStr = trimmed.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJsonStr);

      if (parsed.summary) htmlOutput += `<strong>${escHtml(parsed.summary)}</strong><br><br>`;
      if (parsed.headline) htmlOutput += `<strong>${escHtml(parsed.headline)}</strong><br><br>`;
      if (parsed.direct_answer) htmlOutput += `<strong>${escHtml(parsed.direct_answer)}</strong><br><br>`;
      if (parsed.recommendation) htmlOutput += `<strong>Recommendation:</strong> ${escHtml(parsed.recommendation)}<br><br>`;
      if (parsed.narrative) htmlOutput += `${escHtml(parsed.narrative)}<br><br>`;
      if (parsed.draft_response) htmlOutput += `<strong>Draft Response:</strong><br>${escHtml(parsed.draft_response)}<br><br>`;

      if (Array.isArray(parsed.evidence) && parsed.evidence.length) {
        htmlOutput += `<strong>Key Evidence:</strong><ul>` + parsed.evidence.map(e => `<li>${escHtml(e)}</li>`).join('') + `</ul>`;
      }
      if (Array.isArray(parsed.likely_explanations) && parsed.likely_explanations.length) {
        htmlOutput += `<strong>Likely Causes:</strong><ul>` + parsed.likely_explanations.map(e => `<li>${escHtml(e)}</li>`).join('') + `</ul>`;
      }
      if (Array.isArray(parsed.key_numbers) && parsed.key_numbers.length) {
        htmlOutput += `<strong>Key Figures:</strong><ul>` + parsed.key_numbers.map(e => `<li>${escHtml(e)}</li>`).join('') + `</ul>`;
      }
      if (Array.isArray(parsed.suggested_actions) && parsed.suggested_actions.length) {
        htmlOutput += `<strong>Suggested Actions:</strong><ul>` + parsed.suggested_actions.map(e => `<li>${escHtml(e)}</li>`).join('') + `</ul>`;
      }
      if (parsed.recommended_action) {
        htmlOutput += `<br><strong>Next Action:</strong> ${escHtml(parsed.recommended_action)}<br>`;
      }
    }
  } catch (e) {
    // Ignore JSON parse error and fallback
  }

  if (!htmlOutput) {
    htmlOutput = escHtml(str)
      .replace(/###\s*(.*?)(?:\n|<br>|$)/g, '<h4 style="color:#fff;margin:10px 0 4px;font-size:0.95rem;font-weight:700">$1</h4>')
      .replace(/\n\s*•\s*/g, '<br>• ')
      .replace(/\n\s*-\s*/g, '<br>• ')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  // Parse any **asterisks** in the text (multiline supported)
  htmlOutput = htmlOutput.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return htmlOutput;
}

function renderAIAssistant() {
  const el = $('#page-ai-assistant');
  const currentMode = AI_MODES.find(m => m.id === state.aiMode) || AI_MODES[0];
  const modeHistory = getChatHistory(state.aiMode);

  el.innerHTML = `
    <h1 class="page-title">AI Assistant</h1>
    <p class="page-subtitle">Text-to-text intelligence layer connected to your live business database</p>

    <div class="ai-chat-layout">
      <!-- Left Mode Panel -->
      <div class="ai-modes-panel">
        <div class="ai-modes-panel-label">Analysis Modes</div>
        ${AI_MODES.map(m => `
          <div class="ai-mode-card ${state.aiMode === m.id ? 'active' : ''}" style="--mode-color:${m.color}" onclick="setAIMode('${m.id}')">
            <div class="ai-mode-name">
              <div class="ai-mode-dot"></div>
              ${m.name}
            </div>
            <div class="ai-mode-desc">${m.desc}</div>
          </div>
        `).join('')}
      </div>

      <!-- Right Chat Window -->
      <div class="ai-chat-window">
        <div class="ai-chat-header">
          <div style="display:flex;align-items:center;gap:8px">
            <div class="ai-mode-dot" style="background:${currentMode.color}"></div>
            <strong style="color:#fff">${currentMode.name}</strong>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="clearCurrentModeChat()">Clear ${currentMode.name} Chat</button>
        </div>

        <div class="ai-messages" id="ai-messages">
          ${modeHistory.length === 0 ? `
            <div style="text-align:center;margin:auto;color:var(--text-muted);max-width:420px">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="color:${currentMode.color};margin-bottom:12px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <h3 style="color:#fff;font-size:1.05rem;margin-bottom:6px">${currentMode.name}</h3>
              <p style="font-size:0.82rem;line-height:1.5">${currentMode.desc}</p>
              <p style="font-size:0.78rem;color:var(--accent-secondary);margin-top:10px">Type a question in plain English to get started.</p>
            </div>
          ` : modeHistory.map(msg => `
            <div class="chat-message ${msg.role}">
              <div class="chat-bubble">${msg.role === 'user' ? escHtml(msg.text) : formatNaturalLanguageText(msg.text)}</div>
            </div>
          `).join('')}
        </div>

        <div class="ai-input-bar">
          <div class="ai-input-wrap">
            <textarea id="ai-user-input" class="ai-textarea" rows="1" placeholder="Ask ${currentMode.name} in plain English..." onkeydown="onAIChatKeydown(event)"></textarea>
          </div>
          <button class="ai-send-btn" onclick="sendAIChatMessage()" style="background:${currentMode.color}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const msgs = $('#ai-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
    $('#ai-user-input')?.focus();
  }, 50);
}

function setAIMode(modeId) {
  state.aiMode = modeId;
  renderAIAssistant();
}

function onAIChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAIChatMessage();
  }
}

async function sendAIChatMessage() {
  const textarea = $('#ai-user-input');
  if (!textarea) return;
  const text = textarea.value.trim();
  if (!text) return;

  const currentHistory = getChatHistory(state.aiMode);
  currentHistory.push({ role: 'user', text });
  textarea.value = '';
  renderAIAssistant();

  try {
    const data = await api('POST', '/api/ai/invoke', {
      mode: state.aiMode,
      payload: text
    });

    const reply = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : 'No response generated.';
    currentHistory.push({ role: 'assistant', text: reply });
  } catch (err) {
    currentHistory.push({ role: 'assistant', text: 'Error: ' + err.message });
  }

  renderAIAssistant();
}

// ─── PAGE 7: GST Reference ───────────────────────────────────────────────────
function renderGSTReference() {
  const el = $('#page-gst-info');

  el.innerHTML = `
    <h1 class="page-title">GST Tax Reference</h1>
    <p class="page-subtitle">Official rate slabs, HSN/SAC guidelines, state codes, and UQC codes</p>

    <div style="display:flex;flex-direction:column;gap:20px">
      <!-- Slabs Grid -->
      <div class="builder-card">
        <h3 style="font-size:1rem;font-weight:700;color:#fff;margin-bottom:14px">GST Tax Rate Slabs</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px">
          ${GST_SLAB_INFO.map(s => `
            <div style="background:${s.bg};border:1px solid ${s.border};padding:14px;border-radius:var(--radius-md)">
              <div style="font-size:1.4rem;font-weight:800;color:${s.color}">${s.rate}%</div>
              <div style="font-size:0.85rem;font-weight:700;color:#fff;margin-top:2px">${s.name}</div>
              <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:6px">${s.examples}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ─── Settings Modal & Tab Controls ───────────────────────────────────────────
function openSettingsModal() {
  const modal = $('#settings-modal');
  if (!modal) return;

  // Populate form fields
  $('#s-business-name').value = state.settings.businessName || '';
  $('#s-business-pan').value = state.settings.businessPAN || '';
  $('#s-business-gstin').value = state.settings.businessGSTIN || '';
  $('#s-business-address').value = state.settings.businessAddress || '';
  $('#s-business-email').value = state.settings.businessEmail || '';
  $('#s-business-phone').value = state.settings.businessPhone || '';
  $('#s-business-website').value = state.settings.businessWebsite || '';
  $('#s-bank-name').value = state.settings.businessBankName || '';
  $('#s-bank-acc').value = state.settings.businessBankAcc || '';
  $('#s-bank-ifsc').value = state.settings.businessBankIFSC || '';
  $('#s-invoice-prefix').value = state.settings.invoicePrefix || 'INV';
  $('#s-invoice-terms').value = state.settings.invoiceTerms || '';
  $('#s-invoice-notes').value = state.settings.invoiceNotes || '';
  $('#s-api-key').value = state.settings.apiKey || '';
  $('#s-model-name').value = state.settings.modelName || '';

  // State dropdown
  const stateSel = $('#s-business-state');
  if (stateSel) {
    stateSel.innerHTML = '<option value="">-- Select State --</option>' +
      INDIAN_STATES.map(s => `<option value="${s.name}" ${state.settings.businessState === s.name ? 'selected' : ''}>${s.code} - ${s.name}</option>`).join('');
  }

  modal.classList.add('open');
}

async function saveSettings() {
  const payload = {
    businessName: $('#s-business-name')?.value.trim(),
    businessPAN: $('#s-business-pan')?.value.trim().toUpperCase(),
    businessGSTIN: $('#s-business-gstin')?.value.trim().toUpperCase(),
    businessState: $('#s-business-state')?.value,
    businessAddress: $('#s-business-address')?.value.trim(),
    businessEmail: $('#s-business-email')?.value.trim(),
    businessPhone: $('#s-business-phone')?.value.trim(),
    businessWebsite: $('#s-business-website')?.value.trim(),
    businessBankName: $('#s-bank-name')?.value.trim(),
    businessBankAcc: $('#s-bank-acc')?.value.trim(),
    businessBankIFSC: $('#s-bank-ifsc')?.value.trim().toUpperCase(),
    invoicePrefix: $('#s-invoice-prefix')?.value.trim() || 'INV',
    invoiceTerms: $('#s-invoice-terms')?.value.trim(),
    invoiceNotes: $('#s-invoice-notes')?.value.trim(),
    apiKey: $('#s-api-key')?.value.trim(),
    modelName: $('#s-model-name')?.value.trim() || 'google/gemma-4-26b-a4b-it:free'
  };

  try {
    await api('PUT', '/api/settings', payload);
    showToast('Settings saved successfully', 'success');
    $('#settings-modal')?.classList.remove('open');
    await loadData();
  } catch (err) {
    showToast('Failed to save settings: ' + err.message, 'error');
  }
}

// ─── Delete Dialog Handlers ──────────────────────────────────────────────────
function confirmDeleteCustomer(id, name) {
  state.deleteTarget = { type: 'customer', id, name };
  $('#delete-item-name').textContent = name;
  $('#delete-modal-title').textContent = 'Delete Customer';
  $('#delete-modal')?.classList.add('open');
}

function confirmDeleteProduct(id, name) {
  state.deleteTarget = { type: 'product', id, name };
  $('#delete-item-name').textContent = name;
  $('#delete-modal-title').textContent = 'Delete Product';
  $('#delete-modal')?.classList.add('open');
}

function confirmDeleteInvoice(id, number) {
  state.deleteTarget = { type: 'invoice', id, name: number };
  $('#delete-item-name').textContent = number;
  $('#delete-modal-title').textContent = 'Delete Invoice';
  $('#delete-modal')?.classList.add('open');
}

async function executeDelete() {
  if (!state.deleteTarget) return;
  const { type, id } = state.deleteTarget;
  try {
    if (type === 'customer') await api('DELETE', `/api/customers/${id}`);
    else if (type === 'product') await api('DELETE', `/api/products/${id}`);
    else if (type === 'invoice') await api('DELETE', `/api/invoices/${id}`);

    showToast(`Item deleted`, 'success');
    $('#delete-modal')?.classList.remove('open');
    state.deleteTarget = null;
    await loadData();
    navigateTo(state.currentPage);
  } catch (err) {
    showToast('Delete failed: ' + err.message, 'error');
  }
}

// ─── Event Listeners ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Navigation binding
  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page) navigateTo(page);
    });
  });

  // Hamburger toggle
  $('#hamburger')?.addEventListener('click', () => {
    $('#sidebar')?.classList.toggle('open');
  });

  // Settings Modal bindings
  $('#open-settings')?.addEventListener('click', openSettingsModal);
  $('#close-settings')?.addEventListener('click', () => $('#settings-modal')?.classList.remove('open'));
  $('#cancel-settings')?.addEventListener('click', () => $('#settings-modal')?.classList.remove('open'));
  $('#save-settings')?.addEventListener('click', saveSettings);

  // Settings Modal Tabs
  $$('.settings-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.settings-tab').forEach(t => t.classList.remove('active'));
      $$('.settings-tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      $(`#tab-${tab.dataset.tab}`)?.classList.add('active');
    });
  });

  // Delete modal bindings
  $('#close-delete-modal')?.addEventListener('click', () => $('#delete-modal')?.classList.remove('open'));
  $('#cancel-delete')?.addEventListener('click', () => $('#delete-modal')?.classList.remove('open'));
  $('#confirm-delete')?.addEventListener('click', executeDelete);

  // Logo file upload handler
  const logoArea = $('#logo-upload-area');
  const logoInput = $('#logo-file-input');
  if (logoArea && logoInput) {
    logoArea.addEventListener('click', () => logoInput.click());
    logoInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) return showToast('Logo image must be smaller than 5MB', 'error');
      const reader = new FileReader();
      reader.onload = async evt => {
        const base64 = evt.target.result;
        await api('PUT', '/api/settings', { businessLogoBase64: base64 });
        state.settings.businessLogoBase64 = base64;
        showToast('Logo updated successfully!', 'success');
        loadData();
      };
      reader.readAsDataURL(file);
    });
  }

  $('#remove-logo-btn')?.addEventListener('click', async () => {
    await api('PUT', '/api/settings', { businessLogoBase64: '' });
    state.settings.businessLogoBase64 = '';
    showToast('Logo removed', 'success');
    loadData();
  });

  // Toggle API key visibility
  $('#toggle-api-key')?.addEventListener('click', () => {
    const input = $('#s-api-key');
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
      showToast(`API Key ${input.type === 'text' ? 'visible' : 'hidden'}`, 'info');
    }
  });

  // Replay tour button
  $('#replay-tour-btn')?.addEventListener('click', () => {
    $('#settings-modal')?.classList.remove('open');
    replayWelcomeTour();
  });

  // Initial Data Load
  await loadData();
  navigateTo('dashboard');
  checkFirstLaunch();
});

// ─── Animated Welcome Tour Logic ─────────────────────────────────────────────
let currentTourSlide = 1;

function checkFirstLaunch() {
  if (!state.settings.firstLaunchCompleted) {
    showWelcomeTour();
  }
}

function showWelcomeTour() {
  currentTourSlide = 1;
  updateTourSlideView();
  $('#welcome-modal')?.classList.add('open');
}

function nextTourSlide() {
  if (currentTourSlide === 1) {
    currentTourSlide = 2;
    updateTourSlideView();
  } else {
    finishTour(false);
  }
}

function updateTourSlideView() {
  const s1 = $('#tour-slide-1');
  const s2 = $('#tour-slide-2');
  const dot1 = $('#dot-1');
  const dot2 = $('#dot-2');
  const nextBtn = $('#next-tour-btn');

  if (currentTourSlide === 1) {
    if (s1) s1.style.display = 'block';
    if (s2) s2.style.display = 'none';
    if (dot1) dot1.classList.add('active');
    if (dot2) dot2.classList.remove('active');
    if (nextBtn) nextBtn.textContent = 'Next →';
  } else {
    if (s1) s1.style.display = 'none';
    if (s2) s2.style.display = 'block';
    if (dot1) dot1.classList.remove('active');
    if (dot2) dot2.classList.add('active');
    if (nextBtn) nextBtn.textContent = 'Get Started 🚀';
    setTimeout(() => $('#w-user-name')?.focus(), 100);
  }
}

async function finishTour(skipped = false) {
  $('#welcome-modal')?.classList.remove('open');
  const userName = $('#w-user-name')?.value.trim();
  const companyName = $('#w-company-name')?.value.trim();

  const updates = { firstLaunchCompleted: true };
  if (!skipped && userName) updates.userName = userName;
  if (!skipped && companyName && !state.settings.businessName) updates.businessName = companyName;

  try {
    await api('PUT', '/api/settings', updates);
    await loadData();
    if (!skipped && userName) {
      showToast(`Welcome aboard, ${userName}! 🎉`, 'success');
    }
    renderDashboard();
  } catch (err) {
    console.error('Failed to save tour preferences:', err);
  }
}

function replayWelcomeTour() {
  showWelcomeTour();
}

// Window Globals
window.navigateTo = navigateTo;
window.editCustomer = editCustomer;
window.editProduct = editProduct;
window.confirmDeleteCustomer = confirmDeleteCustomer;
window.confirmDeleteProduct = confirmDeleteProduct;
window.confirmDeleteInvoice = confirmDeleteInvoice;
window.triggerPrintInvoice = triggerPrintInvoice;
window.onInvoiceCustomerSelect = onInvoiceCustomerSelect;
window.nextTourSlide = nextTourSlide;
window.finishTour = finishTour;
window.replayWelcomeTour = replayWelcomeTour;
window.onItemCatalogSelect = onItemCatalogSelect;
window.addBuilderRow = addBuilderRow;
window.removeBuilderRow = removeBuilderRow;
window.recalculateBuilder = recalculateBuilder;
window.saveInvoice = saveInvoice;
window.filterInvoicesTable = filterInvoicesTable;
window.updateInvoiceStatus = updateInvoiceStatus;
window.filterProductsTable = filterProductsTable;
window.setAIMode = setAIMode;
window.clearCurrentModeChat = clearCurrentModeChat;
window.onAIChatKeydown = onAIChatKeydown;
window.sendAIChatMessage = sendAIChatMessage;
window.openSettingsModal = openSettingsModal;
