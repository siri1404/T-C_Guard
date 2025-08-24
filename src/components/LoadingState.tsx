import React from 'react';
import { Globe, FileText, Search, Brain } from 'lucide-react';

interface LoadingStateProps {
  url: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ url }) => {
  const domain = React.useMemo(() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }, [url]);

  const steps = [
    { icon: Globe, text: 'Fetching policy content...', delay: 0 },
    { icon: FileText, text: 'Extracting legal text...', delay: 1000 },
    { icon: Search, text: 'Scanning for red flags...', delay: 2000 },
    { icon: Brain, text: 'Calculating trust score...', delay: 3000 },
  ];

  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    const timers = steps.map((_, index) => 
      setTimeout(() => setCurrentStep(index), steps[index].delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        {/* Site Info */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-500/30">
            <Globe className="w-8 h-8 text-teal-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Analyzing Policy</h3>
          <p className="text-slate-400">{domain}</p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                  isActive 
                    ? 'bg-teal-500/10 border border-teal-500/30' 
                    : isCompleted 
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-teal-500/20 animate-pulse' 
                    : isCompleted 
                    ? 'bg-emerald-500/20'
                    : 'bg-white/10'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive 
                      ? 'text-teal-400' 
                      : isCompleted 
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`} />
                </div>
                <span className={`font-medium ${
                  isActive 
                    ? 'text-teal-400' 
                    : isCompleted 
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }`}>
                  {step.text}
                </span>
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {isCompleted && (
                  <div className="ml-auto">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Loading Animation */}
        <div className="mt-8">
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;