import React, { useState } from 'react';
import { Search, ExternalLink, Zap } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ onAnalyze }) => {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);

  const validateUrl = (input: string) => {
    try {
      const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    setIsValidUrl(value.length > 0 && validateUrl(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidUrl) {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      onAnalyze(normalizedUrl);
    }
  };

  const exampleUrls = [
    { name: 'Try a Privacy Policy URL', url: 'https://example.com/privacy' },
    { name: 'Try a Terms of Service URL', url: 'https://example.com/terms' },
    { name: 'Test with any policy URL', url: 'https://yoursite.com/policy' },
  ];

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setIsValidUrl(true);
    onAnalyze(exampleUrl);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={url}
            onChange={handleInputChange}
            placeholder="Enter privacy policy or terms of service URL..."
            className="w-full pl-12 pr-4 md:pr-32 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm md:text-base"
          />
          <button
            type="submit"
            disabled={!isValidUrl}
            className="absolute inset-y-0 right-0 mr-2 px-3 md:px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-600 hover:to-teal-700 transition-all flex items-center gap-2 text-sm md:text-base"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden md:inline">Analyze</span>
            <span className="md:hidden">Go</span>
          </button>
        </div>
      </form>

      {/* Example URLs */}
      <div className="text-center">
        <p className="text-slate-400 text-sm mb-4">Try these examples:</p>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {exampleUrls.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example.url)}
              className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/50 rounded-lg text-slate-300 hover:text-teal-400 transition-all text-xs md:text-sm"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="truncate max-w-[120px] md:max-w-none">{example.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UrlInput;