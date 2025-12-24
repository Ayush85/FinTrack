# SMS Permission Declaration (For Google Play Console)

This document provides the necessary justification for the use of high-risk/sensitive permissions in FinTrack.

## 1. Permission Requested
`android.permission.READ_SMS`

## 2. Core Functionality Category
**Personal Finance Management**

## 3. Justification
FinTrack is a dedicated personal finance manager whose **core purpose** is to automate the tracking of expenses and income. The app cannot function without access to SMS messages because:
- It automatically detects transaction alerts from banks and digital wallets (which are sent via SMS in our target market).
- Manual entry is not the primary feature; the app's value proposition is "zero-effort" tracking via automated parsing.
- The app uses this data to provide users with real-time financial health analysis (Today/Weekly/Monthly spend).

## 3.1 Data Minimization & On-device Processing
- Only transaction-related fields are extracted (amount, currency, date/time, issuer/merchant text).
- All parsing and extraction happen locally on the user's device. No SMS content or extracted transaction data is transmitted to our servers unless the user explicitly opts into an opt-in backup or sharing feature (not enabled by default).

<!-- Logging and diagnostics details removed per request -->

## 3.3 User Controls and Consent
1. The app displays a clear explanation before requesting `READ_SMS` permission.
2. The user must explicitly grant permission to enable automatic SMS parsing.
3. Users can revoke permission at any time via device settings; revoking prevents future SMS parsing.
4. If the user uninstalls the app or clears app data, locally stored parsed transactions are removed.

## 3.4 Play Store Compliance Notes
- `READ_SMS` is a sensitive permission. We assert this permission is necessary because automated SMS transaction alerts are the core feature of the app in our target market.
- If publishing to Google Play, include this declaration in the Play Console and provide clear in-app disclosure. Be prepared to submit a justification and a demo video if Play asks for review.

## 3.5 Contact
For questions about SMS usage or to request deletion of any server-side data (if applicable), contact: [Your Contact Email]

## 4. User Experience
1. Upon first launch, the user is presented with a clear explanation of why SMS access is needed.
2. The user must explicitly grant the permission.
3. Once granted, the app scans the inbox for financial keywords (e.g., "debited", "credited", "Rs.") and displays them in a structured dashboard.

## 5. Privacy Compliance
- **Local Processing**: All SMS reading and parsing happens strictly on the user's device. 
- **No Data Transmission**: No SMS content or extracted financial data is ever transmitted to a server or third party.
- **Privacy Policy**: A comprehensive privacy policy is linked within the app and on the Play Store listing.
