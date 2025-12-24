# FinTrack - Project Documentation

This document provides a comprehensive technical overview of the FinTrack mobile application, its architecture, and its core logic. This serves as a blueprint for extending the project or building a companion web/marketing site.

---

## 1. Project Overview
**FinTrack** is an automated personal finance management app built with React Native. It eliminates the need for manual expense entry by scanning and parsing transaction SMS alerts from banks and digital wallets (eSewa, Khalti, etc.) specifically tailored for the Nepali market.

### Core Value Proposition
- **Zero Effort**: Automatic tracking via SMS.
- **Privacy First**: All processing and storage happen locally on the device.
- **Insights**: Provides Daily, Weekly, and Monthly spending/earning summaries.

---

## 2. Technical Stack
- **Framework**: React Native (0.77.1)
- **Language**: TypeScript (Primary), Kotlin (Native Android Bridge)
- **Styling**: React Native StyleSheet with a central `COLORS` theme.
- **Libraries**: 
    - `react-native-linear-gradient`: For modern UI backgrounds.
    - `react-native-svg`: For crisp icons and logo rendering.
    - `react-native-vector-icons`: For UI iconography.

---

## 3. Architecture & Folder Structure

```
FinTrack/
├── android/               # Native Android project & SMS Bridge (SMSModule.kt)
├── src/
│   ├── assets/            # SVG Logo and static resources
│   ├── components/        # UI Components (Atomic Design)
│   │   ├── ui/            # Reusable primitive components (Logo, etc.)
│   │   └── ...            # Feature-specific components (TransactionCard, etc.)
│   ├── constants/         # Centralized Theme, Config, and Enums
│   ├── hooks/             # Custom React Hooks (Business Logic separation)
│   ├── services/          # API/Native Service wrappers (SMS Parser)
│   ├── styles/            # Global styles and layout helpers
│   ├── types/             # TypeScript Interfaces
│   └── utils/             # Helper functions (Date formatting, Analysis)
└── App.tsx                # Application Entry Point
```

---

## 4. Core Logic & Implementation

### A. SMS Data Extraction (The Bridge)
Located in `android/app/src/main/java/com/infoharness/fintrack/SMSModule.kt`.
It uses the Android `Telephony.Sms` content provider to query the device's inbox and return a list of messages to the JavaScript layer.

### B. Transaction Parsing Service
Located in `src/services/transactionService.ts`.
This is the "brain" of the app. It uses Regex to identify:
- **Amounts**: Detects `NPR`, `Rs.`, and `Rs` followed by numbers and commas.
- **Transaction Types**:
    - `Debit`: Patterns include "debited", "spent", "paid", "dr.", etc.
    - `Credit`: Patterns include "credited", "deposit", "received", "cr.", etc.
- **Categories**: Detects "wallet load", "recharge", "top-up" to categorize expenses automatically.

### C. Financial Analysis Utility
Located in `src/utils/index.ts`.
The `analyzeTransactions` function iterates through parsed data to calculate:
- **Today's Spend/Credit**
- **This Week's Spend/Credit**
- **This Month's Spend/Credit**

---

## 5. UI & Design System

### Theme (`src/constants/index.ts`)
- **Primary Gradient**: `#8C8CFF` to `#D89DFF` (Modern Purple/Lavender).
- **Transaction Colors**: Green for Credit (`#43a047`), Red for Debit (`#e53935`).
- **Cards**: White with 90% opacity for a glassmorphism feel over gradients.

### Key Components
1. **StatisticsSection**: Displays summary cards for different timeframes.
2. **FilterTabs**: Allows switching between 'All', 'Debit', and 'Credit' views.
3. **TransactionCard**: Detailed view of an individual SMS alert (Amount, Date, Message, Category).

---

## 6. Data Privacy & Permissions
- **READ_SMS**: Sensitive permission required.
- **Security Protocol**: No data is transmitted to an external server. The app functions entirely offline for data processing.
- **Transparency**: Clear disclosures provided in the `PRIVACY_POLICY.md` and through in-app permission requests.

---

## 7. Web/WebApp Extension Guide
If building a companion website or web app, consider the following:

### Marketing Website
- **Hero Section**: Feature the SVG logo and high-res screenshots of the dashboard.
- **Privacy Section**: Highlight the "Local Only" processing to build trust.
- **Download CTA**: Links to the Google Play Console listing (once published).

### Web App (Future Considerations)
- **Manual Data Import**: Since web browsers cannot read SMS, the web version would require users to upload CSV exports from their banking apps.
- **Cloud Sync**: To move data from Mobile to Web, a secure backend (Firebase/Node.js) would be needed, requiring an update to the Privacy Policy.

---

## 8. Deployment Checklist
- **Package Name**: `com.infoharness.fintrack`
- **Build Command**: `cd android && ./gradlew bundleRelease`
- **Signing**: Requires `fintrack.keystore` defined in `gradle.properties`.
