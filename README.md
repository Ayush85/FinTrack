# FinTrack

FinTrack is a React Native application designed to help users track their expenses and income by analyzing SMS messages. It automatically parses transaction alerts from banks and wallets, categorizes them, and provides real-time financial insights.

## Features

- **Automated SMS Tracking**: Reads and parses SMS messages to identify financial transactions.
- **Transaction Categorization**: Automatically detects Wallet Loads, Mobile Recharges, Deposits, and Withdrawals.
- **Real-time Analysis**: Provides daily, weekly, and monthly spending and earning summaries.
- **Advanced Filtering**: Filter transaction history by date ranges (Today, Week, Month) and transaction types (Debit, Credit).
- **Clean UI**: Modern dashboard with gradient backgrounds and clear statistical cards.

---

## Getting Started

### Prerequisites

- **Node.js** (>= 18)
- **Android Studio** & **SDK** (for Android)
- **Ruby** & **CocoaPods** (for iOS)

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd FinTrack
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. (iOS only) Install pods:
   ```sh
   cd ios && pod install && cd ..
   ```

---

## Running the Application

1. **Start Metro**:
   ```sh
   npm start
   ```

2. **Run on Android**:
   ```sh
   npm run android
   ```

3. **Run on iOS**:
   ```sh
   npm run ios
   ```

---

## Project Structure

The project follows a modular React Native structure:

- **`src/components/`**: UI components (Header, StatisticsCard, TransactionCard, etc.).
- **`src/hooks/`**: Custom React hooks (`useTransactions`, `useFilters`) for state management.
- **`src/services/`**: Core logic for native interactions (`transactionService.ts`).
- **`src/screens/`**: Main application screens (`FinTrack.tsx`).
- **`src/utils/`**: Helper functions for formatting and data analysis.
- **`src/types/`**: TypeScript interfaces and types.
- **`src/constants/`**: Application constants, themes, and filter options.
- **`android/app/src/main/java/com/fintrack/SMSModule.kt`**: Native Android module for reading SMS.

---

## Key Functionalities

### 1. SMS Data Extraction (Native)
The `SMSModule.kt` bridge allows the application to query the Android Telephony provider for SMS messages directly from JavaScript.

### 2. Transaction Parsing
Located in `src/services/transactionService.ts`, the app uses regex patterns to identify:
- **Currency**: Extracts amounts starting with `NPR` or `Rs.`.
- **Types**: Identifies 'Debit', 'Credit', and 'Recharge'.
- **Categories**: Detects specific keywords for Wallet Loads and Mobile Recharges.

### 3. Financial Analysis
The logic in `src/utils/index.ts` calculates totals for different timeframes:
```tsx
export const analyzeTransactions = (transactions: Transaction[]) => {
  // Returns spending/earning totals for Today, Week, and Month
};
```

---

## Permissions

### Android
The app requires `READ_SMS` permission. This is handled at runtime via `TransactionService.requestSMSPermission()`. Ensure the following is in your `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.READ_SMS" />
```

---

## Contributing

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## License

Distributed under the MIT License.
