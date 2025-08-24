import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, ExternalLink } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onReset: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onReset }) => {
  const getErrorDetails = (error: string) => {
    if (error.includes('No policy content found')) {
      return {
        title: 'No Policy Found',
        description: 'We couldn\'t find policy content at this URL. The page might not contain terms of service or privacy policy text.',
        suggestions: [
          'Check if the URL is correct',
          'Look for "Privacy Policy" or "Terms of Service" links on the website',
          'Try the direct link to the policy document',
          'Some sites require you to scroll down or click "Read More" to load content'
        ],
        icon: '🔍'
      };
    } else if (error.includes('Unable to fetch content')) {
      return {
        title: 'Access Blocked',
        description: 'The website is blocking automated requests or requires authentication to access the content.',
        suggestions: [
          'The site may have anti-bot protection',
          'Try copying and pasting the policy text directly',
          'Check if the page requires login to view',
          'Some sites block cross-origin requests for security'
        ],
        icon: '🚫'
      };
    } else {
      return {
        title: 'Analysis Failed',
        description: 'Something went wrong while analyzing the policy. This could be a temporary issue.',
        suggestions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Verify the URL is accessible in your browser',
          'Contact support if the issue persists'
        ],
        icon: '⚠️'
      };
    }
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 text-center">
        {/* Error Icon */}
        <div className="text-6xl mb-6">{errorDetails.icon}</div>
        
        {/* Error Title */}
        <h3 className="text-2xl font-bold text-white mb-4">{errorDetails.title}</h3>
        
        {/* Error Description */}
        <p className="text-slate-400 mb-6 leading-relaxed">
          {errorDetails.description}
        </p>

        {/* Suggestions */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8 text-left">
          <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Suggestions:
          </h4>
          <ul className="space-y-2 text-slate-300 text-sm">
            {errorDetails.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Try Different URL
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-slate-500 text-sm">
            Need help? Try our{' '}
            <button className="text-teal-400 hover:text-teal-300 underline">
              example URLs
            </button>{' '}
            or check if the policy page loads correctly in your browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;