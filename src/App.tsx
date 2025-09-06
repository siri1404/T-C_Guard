import React, { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import ConsentDialog from './components/ConsentDialog';
import { ConsentManager } from './services/ConsentManager';
import { EncryptionService } from './services/EncryptionService';
import { ErrorReporting } from './services/ErrorReporting';
import { Shield, Search, ExternalLink, AlertTriangle, CheckCircle, XCircle, Download, Copy, BarChart3 } from 'lucide-react';
import UrlInput from './components/UrlInput';
import AnalysisResults from './components/AnalysisResults';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { PolicyAnalyzer } from './services/PolicyAnalyzer';
import { UrlExtractor } from './services/UrlExtractor';
import type { AnalysisResult } from './types/analysis';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [consentManager] = useState(() => ConsentManager.getInstance());
  const [encryptionService] = useState(() => EncryptionService.getInstance());
  const [errorReporting] = useState(() => ErrorReporting.getInstance());

  React.useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize encryption
      await encryptionService.initializeKey();
      
      // Check consent
      const hasConsent = await consentManager.hasValidConsent();
      if (!hasConsent) {
        setShowConsentDialog(true);
      } else {
        // Initialize error reporting if analytics enabled
        const consent = await consentManager.getConsent();
        if (consent?.analytics) {
          await errorReporting.initialize(true);
        }
      }
    } catch (error) {
      console.error('Service initialization error:', error);
    }
  };

  const handleConsentAccept = async (options: { analytics: boolean }) => {
    try {
      const consent = {
        dataCollection: true,
        analytics: options.analytics,
        storage: true,
        consentDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      await consentManager.saveConsent(consent);
      
      if (options.analytics) {
        await errorReporting.initialize(true);
      }
      
      setShowConsentDialog(false);
    } catch (error) {
      console.error('Consent save error:', error);
      errorReporting.reportError(error as Error, { action: 'consent_save' });
    }
  };

  const handleConsentDecline = () => {
    setShowConsentDialog(false);
    // Show limited functionality message
    setError('T&C Guard requires consent to analyze policies. Please refresh and accept to use the extension.');
  };

  const handleAnalyze = async (url: string) => {
    try {
      // Check consent first
      const hasConsent = await consentManager.hasValidConsent();
      if (!hasConsent) {
        setShowConsentDialog(true);
        return;
      }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setCurrentUrl(url);

    try {
      // Extract content from URL
      const extractor = new UrlExtractor();
      const content = await extractor.extractFromUrl(url);
      
      if (!content) {
        throw new Error('NO_POLICY');
      }

      // Analyze the content
      const analyzer = new PolicyAnalyzer();
      const result = await analyzer.analyze(content, url);
      
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      errorReporting.reportError(err, {
        action: 'analyze_policy',
        url: url,
        timestamp: new Date().toISOString()
      });
      
      if (err.message === 'NO_POLICY') {
        setError('No policy content found at this URL. Please check the link or try a direct link to the privacy policy or terms of service.');
      } else if (err.message === 'FETCH_ERROR') {
        setError('Unable to fetch content from this URL. The site may block automated requests or require authentication.');
      } else {
        setError('Analysis failed. Please try again or check if the URL is accessible.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setCurrentUrl('');
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.1)_0%,transparent_50%)] pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg shadow-teal-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">T&C Guard</h1>
                <p className="text-slate-400 text-sm">Analyze Terms & Privacy Policies</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {!analysisResult && !isAnalyzing && !error && (
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-2xl mb-6 border border-teal-500/30">
                <Search className="w-10 h-10 text-teal-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Policy Analysis Demo
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
                Enter any policy URL to see how our analysis works. This demo generates realistic analysis results to showcase the full functionality.
              </p>
              
              
              
              {/* Feature highlights */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <BarChart3 className="w-6 h-6 text-teal-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Trust Score</h3>
                  <p className="text-slate-400 text-sm">Get a comprehensive 0-100 score across 9 key privacy dimensions</p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Red Flags</h3>
                  <p className="text-slate-400 text-sm">Automatically detect concerning clauses like data selling and arbitration</p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Plain Language</h3>
                  <p className="text-slate-400 text-sm">Complex legal text translated into clear, actionable insights</p>
                </div>
              </div>
            </div>
          )}

          {/* URL Input */}
          {!analysisResult && !isAnalyzing && !error && (
            <UrlInput onAnalyze={handleAnalyze} />
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <LoadingState url={currentUrl} />
          )}

          {/* Error State */}
          {error && (
            <ErrorState 
              error={error} 
              onRetry={() => handleAnalyze(currentUrl)}
              onReset={handleReset}
            />
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <AnalysisResults 
              result={analysisResult} 
              onAnalyzeNew={handleReset}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Privacy-first analysis • No data stored</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <a href="#" className="hover:text-teal-400 transition-colors">About</a>
                <a href="#" className="hover:text-teal-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-teal-400 transition-colors">GitHub</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      {showConsentDialog && (
        <ConsentDialog
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
      )}
    </div>
    </ErrorBoundary>
  );
}

export default App;