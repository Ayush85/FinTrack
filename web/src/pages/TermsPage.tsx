import React from 'react'

export default function TermsPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="policy-page">
      <button onClick={onBack}>← Back</button>
      <h1>Terms of Service for FinTrack</h1>
      <p><strong>Effective Date: October 26, 2023</strong></p>

      <h2>1. Use of the App</h2>
      <p>FinTrack provides a tool for personal finance management by analyzing SMS messages. The app is for personal, non-commercial use only.</p>

      <h2>2. Accuracy of Data</h2>
      <p>
        FinTrack uses automated algorithms (regex patterns) to parse SMS messages. While we strive for accuracy, we cannot guarantee every transaction will be parsed correctly. Users should not rely solely on the app for critical financial decisions or tax reporting.
      </p>

      <p>By using the SMS parsing feature you acknowledge that:</p>
      <ul>
        <li>SMS parsing is automated and may misclassify or omit transactions.</li>
        <li>You consent to on-device analysis of SMS messages for extracting transaction information.</li>
        <li>You are responsible for reviewing parsed transactions for accuracy.</li>
      </ul>

      <h2>3. Privacy</h2>
      <p>Your use of the app is also governed by our Privacy Policy.</p>

      <h2>4. Prohibited Actions</h2>
      <p>You agree not to decompile or reverse engineer the app, use it for illegal purposes, or interfere with its security features.</p>

      <h2>5. Limitation of Liability</h2>
      <p>FinTrack and its developers shall not be liable for financial loss or damages resulting from app use or inability to use the app.</p>

      <h2>6. Modifications to Service</h2>
      <p>We reserve the right to modify or withdraw the service at any time without notice.</p>

      <h2>7. Termination</h2>
      <p>We may terminate your access if you violate these terms.</p>

      <h2>8. Governing Law</h2>
      <p>These terms are governed by the laws of Nepal.</p>

      <h2>9. Contact</h2>
      <p>Contact us at: [Your Contact Email]</p>
    </div>
  )
}
