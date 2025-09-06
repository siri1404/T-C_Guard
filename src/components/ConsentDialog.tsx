import React, { useState } from 'react';
import { Shield, Check, X, Info } from 'lucide-react';

interface ConsentDialogProps {
  onAccept: (options: { analytics: boolean }) => void;
  onDecline: () => void;
}

const ConsentDialog: React.FC<ConsentDialogProps> = ({ onAccept, onDecline }) => {
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Privacy & Data Consent</h2>
            <p className="text-slate-400 text-sm">Required for T&C Guard to function</p>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-4 mb-6">
          <p className="text-slate-300 leading-relaxed">
            T&C Guard analyzes privacy policies to help protect your privacy. To provide this service, we need your consent for:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-white text-sm">Policy Analysis</div>
                <div className="text-slate-400 text-xs">Process policy content locally on your device</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-white text-sm">Secure Storage</div>
                <div className="text-slate-400 text-xs">Store encrypted analysis results on your device</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-white text-sm">Preferences</div>
                <div className="text-slate-400 text-xs">Remember your settings and preferences</div>
              </div>
            </div>
          </div>

          {/* Optional analytics */}
          <div className="border-t border-white/10 pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={analyticsConsent}
                onChange={(e) => setAnalyticsConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-teal-500 bg-white/10 border-white/20 rounded focus:ring-teal-500 focus:ring-2"
              />
              <div>
                <div className="font-medium text-white text-sm">Anonymous Analytics (Optional)</div>
                <div className="text-slate-400 text-xs">Help improve T&C Guard with anonymous usage data</div>
              </div>
            </label>
          </div>

          {/* Details toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm transition-colors"
          >
            <Info className="w-4 h-4" />
            {showDetails ? 'Hide' : 'Show'} Privacy Details
          </button>

          {showDetails && (
            <div className="bg-black/20 rounded-lg p-4 space-y-2 text-xs text-slate-400">
              <p><strong className="text-white">Data Processing:</strong> All analysis happens locally on your device. No policy content is sent to external servers.</p>
              <p><strong className="text-white">Storage:</strong> Results are encrypted using AES-256 and stored only in your browser's local storage.</p>
              <p><strong className="text-white">Retention:</strong> Data is automatically deleted after 30 days unless you change this setting.</p>
              <p><strong className="text-white">Analytics:</strong> If enabled, only anonymous usage statistics are collected (no personal data or policy content).</p>
              <p><strong className="text-white">Your Rights:</strong> You can export, delete, or modify your data anytime in extension settings.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={() => onAccept({ analytics: analyticsConsent })}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
        </div>

        <p className="text-slate-500 text-xs text-center mt-4">
          By accepting, you agree to our{' '}
          <a href="#" className="text-teal-400 hover:text-teal-300 underline">Privacy Policy</a>
          {' '}and{' '}
          <a href="#" className="text-teal-400 hover:text-teal-300 underline">Terms of Service</a>
        </p>
      </div>
    </div>
  );
};

export default ConsentDialog;