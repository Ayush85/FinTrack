import React from 'react'

export default function PrivacyPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="policy-page">
      <button onClick={onBack}>← Back</button>
      <h1>Privacy Policy for FinTrack</h1>
      <p><strong>Last Updated: October 26, 2023</strong></p>

      <p>
        FinTrack ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
        explains how we collect, use, and safeguard your information when you use our mobile application.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>SMS Data (Sensitive Permission)</h3>
      <p>
        FinTrack requires access to your SMS messages to provide its core functionality. We read incoming and existing SMS
        messages from banks, financial institutions, and service providers. We only extract transaction-related data such as
        amount, date, currency, and merchant/bank name. All SMS processing is done locally on your device. Your raw SMS messages
        and extracted transaction data are never uploaded to our servers, sold to third parties, or shared with anyone else.
      </p>

      <h3>Device Information</h3>
      <p>
        We may collect basic device information (model, OS version) for the purpose of debugging and improving app performance.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>
        We use the data extracted from your SMS to generate spending and earning reports, categorize transactions, and provide
        financial summaries.
      </p>

      <h2>3. Data Storage and Security</h2>
      <p>
        All your financial data is stored locally on your device. We do not provide cloud synchronization by default. Since data
        remains on-device, its security is tied to your device's security settings.
      </p>

      <h2>4. Third-Party Services</h2>
      <p>FinTrack does not share personal or financial data with third-party services. The app does not contain ads or tracking SDKs that transmit your financial behavior.</p>

      <h2>5. Permissions</h2>
      <p>
        <strong>READ_SMS</strong>: Required to analyze transaction alerts. <strong>INTERNET</strong>: Used only for fetching static UI assets and app updates. No financial data is transmitted over the internet.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        You can revoke SMS permissions at any time through your device settings. Doing so prevents the app from tracking new transactions. If you uninstall the app, extracted transaction data stored in the app will be removed.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>We may update our Privacy Policy from time to time. We will notify you by posting the new policy in the app or on this page.</p>

      <h2>8. Contact Us</h2>
      <p>For questions, contact: [Your Contact Email]</p>
    </div>
  )
}
