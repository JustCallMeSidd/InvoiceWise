<div align="center">

  <img src="public/logo.png" alt="InvoiceWise Logo" width="100" />

  # InvoiceWise — Professional Standalone GST Billing & AI Intelligence

  **A modern, GST-compliant billing, product management, and invoice intelligence desktop application built for Windows.**

  [![Version](https://img.shields.io/badge/version-1.0.0-indigo.svg)](https://github.com)
  [![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-blue.svg)](https://microsoft.com/windows)
  [![GST Compliance](https://img.shields.io/badge/GST-Rule%2046%20Compliant-emerald.svg)](https://cbic.gov.in)
  [![License](https://img.shields.io/badge/license-MIT-slate.svg)](LICENSE)

</div>

---

## ⚡ Overview

**InvoiceWise** is a standalone Windows desktop application designed for small businesses, freelancers, and finance teams to create, manage, and print **GST Rule 46 compliant tax invoices**. It includes a **natural language AI intelligence layer** connected directly to your local database to help analyze revenue, forecast cashflows, and draft dispute responses.

* **Zero Cloud Lock-in**: All your products, customers, and invoice records remain 100% stored on your local computer.
* **No Pre-installed Dependencies**: End users do not need Node.js, Python, or npm installed. Download the installer `.exe` and run.

---

## ✨ Key Features

### 📄 GST Rule 46 Compliant Tax Invoices & Instant A4 PDF
- **Auto GST Tax Logic**: Auto-calculates CGST + SGST for intra-state supplies and IGST for inter-state supplies.
- **Pixel-Perfect A4 Printing**: Opens a native print window optimized for A4 paper and PDF saving.
- **Rate-wise Tax Summary Table**: Displays tax breakdowns by slab rate (0%, 5%, 12%, 18%, 28%).
- **Amount in Words Generator**: Converts grand totals into formal English words (*"Rupees Twenty-Three Thousand Six Hundred Only"*).
- **Company Logo & Bank Details**: Displays custom logos and bank account details for wire transfers.

### 👥 Customer Directory & Product Catalog
- **Customer Management**: Save B2B and B2C clients, validate 15-digit GSTINs, and auto-detect place of supply.
- **Product Catalog**: Store products with HSN/SAC codes, UQC measurement units (NOS, KGS, MTR, etc.), rates, and default tax slabs.

### 🤖 Natural Language AI Assistant
- **100% Conversational Input**: No JSON forms exposed to users. Ask queries in plain English (*"How much revenue did we generate this month?"* or *"Draft a reply to this invoice overage dispute"*).
- **Live Database Context Injection**: Automatically feeds your local product catalog, customer records, and recent invoices into every prompt.
- **6 Specialized Modes**: Anomaly Explanation, Cashflow Forecast, Pricing Intelligence, Dispute Resolution, Executive Summary, and General GST Q&A.

### 🎨 Animated Welcome Experience & Personalization
- **First-Launch Tour**: Interactive onboarding modal introducing key features with micro-animations.
- **Workspace Personalization**: Remembers your name and greets you on the dashboard (*"Welcome back, Siddharth! 👋"*).
- **Replay Tour**: Re-watch the tour anytime from Settings.

---

## 📥 Download & Installation Guide

### Option 1: Standalone Windows Installer (Recommended for End Users)

1. **Download the Setup Package**:
   Run or double-click `InvoiceWise Setup 1.0.0.exe` located right inside the `invoicewise/` folder.

2. **Run the Setup**:
   Double-click `InvoiceWise Setup 1.0.0.exe` to launch the Windows Setup Wizard.

3. **Choose Install Location**:
   Select your preferred installation directory (default: `C:\Program Files\InvoiceWise`).

4. **Desktop & Start Menu Shortcuts**:
   The installer automatically creates a **Desktop Shortcut** and **Start Menu Shortcut** (`InvoiceWise GST Billing`).

5. **Launch Application**:
   Launch InvoiceWise directly from your Desktop or Start Menu.

---

### Option 2: Portable Executable (No Installation Required)

1. Double-click **`InvoiceWise 1.0.0.exe`** directly inside the `invoicewise/` folder.
2. Runs immediately without installation from any folder or USB drive.

---

### Option 3: Developer / Local Node.js Setup

If you want to run or modify the source code locally:

#### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [npm](https://www.npmjs.com/)

#### Installation & Startup

```powershell
# 1. Clone the repository
git clone https://github.com/your-username/invoicewise.git
cd invoicewise

# 2. Install dependencies
npm install

# 3. Start the Express local server (http://localhost:3000)
npm start

# 4. Launch Electron Desktop Window (Development Mode)
npm run electron:start
```

#### Packaging Windows Executable (.exe)

To compile the standalone installer and portable `.exe` from source:

```powershell
npm run dist:win
```
The compiled executables will be generated in `dist/`:
* `dist/InvoiceWise Setup 1.0.0.exe` (NSIS Installer)
* `dist/InvoiceWise 1.0.0.exe` (Portable App)

---

## 📁 Data Storage & Persistence

All application data is saved locally on disk as human-readable JSON files:

### Standalone Desktop Mode:
```
%APPDATA%\InvoiceWise\InvoiceWiseData\
  ├── products.json      # Product catalog with HSN/SAC codes & tax rates
  ├── customers.json     # Client directory & GSTINs
  ├── invoices.json      # Saved tax invoices & draft records
  └── settings.json      # Company profile, bank details & AI settings
```

### Local Web Server Mode:
```
invoicewise/data/
  ├── products.json
  ├── customers.json
  ├── invoices.json
  └── settings.json
```

---

## ⚙️ AI Configuration (OpenRouter API)

1. Open **Settings** (gear icon in sidebar).
2. Go to the **AI Configuration** tab.
3. Enter your **OpenRouter API Key** (`sk-or-v1-...`). *(Get a free key at [openrouter.ai](https://openrouter.ai))*
4. (Optional) Choose your preferred LLM model (default: `google/gemma-4-26b-a4b-it:free` or `mistralai/mistral-7b-instruct:free`).
5. Click **Save Settings**.

---

## 🏗️ Project Architecture

```
invoicewise/
├── main.js                  # Electron Main Process (desktop window & native print handler)
├── server.js                # Embedded Express Backend API & local JSON database engine
├── prompts.js               # AI Assistant base system prompts & mode definitions
├── package.json             # App dependencies & electron-builder packaging rules
├── public/
│   ├── index.html           # Single Page Application UI shell & modals
│   ├── style.css            # Dark mode design system, layout grid & animations
│   ├── app.js               # Frontend application logic, state & API handlers
│   ├── invoice-print.js     # Native A4 invoice renderer & print generator
│   └── logo.png             # Application logo asset
└── dist/                    # Output directory for compiled .exe installers
```

---

## 🛡️ License & Support

Distributed under the **MIT License**. See `LICENSE` for more information.

For feedback, support, or custom deployment requests, please open an issue in the project repository.
