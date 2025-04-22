# FinTrack

FinTrack is a React Native application designed to help users track their expenses and income by analyzing SMS messages. It categorizes transactions, calculates available balance, and provides insights into spending habits.

## Features

- Fetch and parse SMS messages to extract financial transactions.
- Categorize transactions into predefined categories like Food, Shopping, Bills, etc.
- Analyze expenses and income to calculate available balance.
- Filter transactions by category.
- View detailed transaction history.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (>= 18)
- **npm** or **Yarn**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development)
- **Ruby** (>= 2.6.10) with Bundler for managing CocoaPods dependencies.

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

3. Install iOS dependencies (if building for iOS):

   ```sh
   bundle install
   bundle exec pod install --project-directory=ios
   ```

---

## Running the Application

### Start Metro

Metro is the JavaScript bundler for React Native. Start it by running:

```sh
npm start
```

### Run on Android

```sh
npm run android
```

### Run on iOS

```sh
npm run ios
```

---

## Application Structure

### Key Files and Directories

- **`App.tsx`**: The main application file containing the UI and logic for fetching and analyzing SMS transactions.
- **`android/`**: Contains Android-specific configuration and native modules.
  - **`SMSModule.kt`**: A native module to fetch SMS messages.
  - **`SMSPackage.kt`**: Registers the `SMSModule` with React Native.
- **`ios/`**: Contains iOS-specific configuration and native code.
- **`index.js`**: Entry point for the React Native application.
- **`__tests__/App.test.tsx`**: Unit tests for the application.

---

## Permissions

### Android

The app requires the following permissions in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS" />
```

### iOS

Ensure the following keys are added to `Info.plist` for iOS permissions:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>FinTrack needs access to your location for better insights.</string>
```

---

## Key Functionalities

### Fetching SMS Messages

The `SMSModule` native module fetches SMS messages from the device's inbox. It extracts the sender's address and message body.

```kt
// android/app/src/main/java/com/fintrack/SMSModule.kt
@ReactMethod
fun getMessages(promise: Promise) {
    // Fetch and parse SMS messages
}
```

### Parsing Transactions

The `parseTransactions` function in `App.tsx` analyzes SMS messages to identify financial transactions. It uses regex patterns to detect debits, credits, amounts, and categories.

```tsx
const parseTransactions = (
  messages: {body: string; address: string}[],
): Transaction[] => {
  // Parse SMS messages into transactions
};
```

### Expense Analysis

The app calculates total spent, total credited, available balance, and category-wise breakdown of expenses.

```tsx
const analyzeTransactions = (transactionsToAnalyze: Transaction[]) => {
  // Analyze transactions for insights
};
```

---

## Customization

### Adding New Categories

To add new categories, update the `determineCategory` function in `App.tsx`:

```tsx
const determineCategory = (message: string): string => {
  if (/your-new-category-keywords/i.test(message)) return 'Your New Category';
  return 'Other';
};
```

---

## Testing

Run unit tests using Jest:

```sh
npm test
```

The test file is located at `__tests__/App.test.tsx`.

---

## Troubleshooting

### Common Issues

1. **Metro bundler not starting**:

   - Ensure no other process is using port 8081.
   - Run `npm start --reset-cache`.

2. **Android build fails**:

   - Ensure you have the correct version of Android SDK installed.
   - Run `./gradlew clean` in the `android/` directory.

3. **iOS build fails**:
   - Ensure CocoaPods dependencies are installed (`bundle exec pod install`).
   - Open the `.xcworkspace` file in Xcode instead of `.xcodeproj`.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Acknowledgments

- [React Native](https://reactnative.dev)
- [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
