# Ongeza - Micro-Lending & Savings Platform

Ongeza is a cutting-edge financial technology platform designed to provide affordable and accessible financial services to underserved individuals and micro-entrepreneurs in Tanzania. The application empowers users through micro-savings, community-based group investments (VICOBA), and transparent micro-lending opportunities.

## 🚀 Overview

The platform bridges the gap between traditional banking and the digital economy by providing a secure, mobile-responsive web experience. With a focus on UI/UX and financial security, Ongeza enables users to grow their wealth, manage loans, and support community growth.

## ✨ Key Features

### 1. Multi-Role Dashboards
Customized experiences for four distinct user roles:
*   **Saver:** Track personal goals, automated contributions, and interest earnings.
*   **Borrower:** Apply for various loan types (Home, SME, Corporate), track repayments, and monitor credit scores.
*   **Investor:** Browse funding opportunities, manage portfolios, and analyze risks.
*   **Platform Admin:** Full system oversight, KYC approval workflows, user management, and detailed financial reporting.

### 2. Micro-Savings & Goals
*   Create and track specific savings goals (e.g., Education, Business, Travel).
*   **Automated Contributions:** Schedule daily, weekly, or monthly deposits via mobile money.
*   **Interest Tiers:** Earn compound interest based on tiered balance configurations.

### 3. Group Savings (VICOBA)
*   Participate in community savings groups.
*   Track member contributions, pending payments, and shared group goals.
*   Generate group summary reports for transparency.

### 4. Micro-Lending
*   Categorized loan products: Apartment purchase, SME working capital, vehicle finance, etc.
*   Step-by-step application process with document upload for KYC.
*   Detailed repayment tracking and penalty management.

### 5. Advanced Security
*   **Security PIN:** 4-digit code required for sensitive transactions and session recovery.
*   **Two-Factor Authentication (2FA):** OTP-based verification for login and password changes.
*   **Role-Based Access Control (RBAC):** Strict permission-based access to system modules.

### 6. AI-Powered Analytics
*   Leverages **Google Gemini AI** to provide portfolio summaries and financial insights for administrators.

## 🛠 Tech Stack

*   **Core:** React 19, TypeScript
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Charts:** Recharts (Area, Line, Bar, and Radial charts)
*   **Reports:** jsPDF & jspdf-autotable for dynamic PDF generation
*   **AI:** @google/genai (Gemini 3 Flash Preview)
*   **Routing:** React Router DOM 6 (HashRouter)
*   **Authentication:** JWT with Intercepted Fetch and Automatic Token Refresh

## 📁 Project Structure

```text
src/
├── components/
│   ├── common/        # Reusable UI components (Modals, Badges)
│   ├── dashboards/    # Role-specific dashboard views
│   └── layout/        # Sidebar, Header, and Page wrappers
├── contexts/          # AuthContext for global state management
├── pages/             # Main application views and feature modules
├── services/          # API configurations, mock data, and AI services
└── types.ts           # Global TypeScript interfaces and enums
```

## ⚙️ Getting Started

### Prerequisites
*   Node.js (Latest LTS recommended)
*   A valid Gemini API Key (for AI features)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your API key:
   ```env
   API_KEY=your_gemini_api_key_here
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## 🔐 Security Standards
*   All API requests are handled via a custom `interceptedFetch` wrapper.
*   Supports automatic JWT refresh logic (Error Code 104).
*   Handles centralized session expiry via event-driven PIN verification (Error Code 101).

## 📄 License
Copyright © 2025 Ongeza. All rights reserved.
