// Production-ready background service worker
import { validateUrl, validatePolicyContent, sanitizeText } from './src/types/security.js';

class SecureBackgroundService {
    constructor() {
        this.analysisCache = new Map();
        this.encryptionService = null;
        this.consentManager = null;
        this.errorReporting = null;
        this.setupMessageListener();
        this.initializeServices();
    }

    async initializeServices() {
        try {
            // Initialize encryption service
            const { EncryptionService } = await import('./src/services/EncryptionService.js');
            this.encryptionService = EncryptionService.getInstance();
            await this.encryptionService.initializeKey();

            // Initialize consent manager
            const { ConsentManager } = await import('./src/services/ConsentManager.js');
            this.consentManager = ConsentManager.getInstance();

            // Initialize error reporting
            const { ErrorReporting } = await import('./src/services/ErrorReporting.js');
            this.errorReporting = ErrorReporting.getInstance();
            
            // Check if user has consented to analytics
            const consent = await this.consentManager.getConsent();
            if (consent?.analytics) {
                await this.errorReporting.initialize(true);
            }

            // Schedule periodic cleanup
            this.scheduleDataCleanup();
            
            console.log('T&C Guard background services initialized');
        } catch (error) {
            console.error('Failed to initialize background services:', error);
        }
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Will respond asynchronously
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            // Validate sender
            if (!sender.tab || !sender.tab.url) {
                throw new Error('Invalid message sender');
            }

            // Check consent before processing
            if (!await this.hasValidConsent()) {
                sendResponse({ 
                    success: false, 
                    error: 'CONSENT_REQUIRED',
                    message: 'User consent required before analysis'
                });
                return;
            }

            switch (request.action) {
                case 'analyzePage':
                    await this.handleAnalyzeRequest(request, sender, sendResponse);
                    break;
                case 'getConsent':
                    await this.handleConsentRequest(sendResponse);
                    break;
                case 'revokeConsent':
                    await this.handleRevokeConsent(sendResponse);
                    break;
                case 'exportData':
                    await this.handleExportData(sendResponse);
                    break;
                default:
                    throw new Error(`Unknown action: ${request.action}`);
            }
        } catch (error) {
            console.error('Background message handling error:', error);
            
            if (this.errorReporting) {
                this.errorReporting.reportError(error, {
                    action: request.action,
                    url: sender.tab?.url,
                    timestamp: new Date().toISOString()
                });
            }

            sendResponse({ 
                success: false, 
                error: error.message || 'BACKGROUND_ERROR' 
            });
        }
    }

    async hasValidConsent() {
        if (!this.consentManager) return false;
        return await this.consentManager.hasValidConsent();
    }

    async handleAnalyzeRequest(request, sender, sendResponse) {
        try {
            // Validate input
            const validatedUrl = validateUrl(request.url);
            
            // Check cache first
            const cacheKey = await this.generateCacheKey(validatedUrl);
            const cached = await this.getCachedAnalysis(cacheKey);
            
            if (cached && this.isCacheValid(cached)) {
                sendResponse({ success: true, data: cached.data });
                return;
            }

            // Extract content securely
            const content = await this.extractPageContentSecurely(sender.tab.id);
            if (!content) {
                throw new Error('NO_POLICY');
            }

            // Validate extracted content
            const validatedContent = validatePolicyContent(content);

            // Analyze content
            const analysis = await this.performSecureAnalysis(validatedContent, validatedUrl);
            
            // Cache results securely
            await this.cacheAnalysisSecurely(cacheKey, analysis);

            sendResponse({ success: true, data: analysis });
        } catch (error) {
            console.error('Analysis request error:', error);
            throw error;
        }
    }

    async extractPageContentSecurely(tabId) {
        try {
            // Only execute predefined, safe extraction function
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                function: this.safeContentExtractor
            });

            const extracted = results[0]?.result;
            if (!extracted) return null;

            // Sanitize extracted content
            if (extracted.content) {
                extracted.content = sanitizeText(extracted.content);
            }
            if (extracted.title) {
                extracted.title = sanitizeText(extracted.title);
            }

            return extracted;
        } catch (error) {
            console.error('Content extraction error:', error);
            return null;
        }
    }

    // Safe content extraction function (no external input)
    safeContentExtractor() {
        try {
            const policyKeywords = [
                'privacy policy', 'terms of service', 'terms and conditions',
                'data policy', 'cookie policy', 'user agreement', 'eula'
            ];

            const url = window.location.href.toLowerCase();
            const title = document.title.toLowerCase();
            const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
                .map(h => h.textContent.toLowerCase())
                .slice(0, 10); // Limit headings

            // Check if current page is likely a policy page
            const isPolicyPage = policyKeywords.some(keyword => 
                url.includes(keyword.replace(/\s/g, '')) || 
                title.includes(keyword) ||
                headings.some(h => h.includes(keyword))
            );

            if (!isPolicyPage) {
                return null;
            }

            // Extract text content safely
            const content = document.body.innerText || document.body.textContent || '';
            
            // Limit content size for security
            const limitedContent = content.slice(0, 500000); // 500KB limit
            
            if (limitedContent.length < 500) {
                return null;
            }

            return {
                isPolicyPage: true,
                content: limitedContent,
                url: window.location.href,
                title: document.title,
                extractedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Safe extraction error:', error);
            return null;
        }
    }

    async performSecureAnalysis(content, url) {
        try {
            // Import analyzer dynamically
            const { PolicyAnalyzer } = await import('./src/services/PolicyAnalyzer.js');
            const analyzer = new PolicyAnalyzer();
            
            return await analyzer.analyze(content, url);
        } catch (error) {
            console.error('Analysis error:', error);
            throw new Error('ANALYSIS_FAILED');
        }
    }

    async generateCacheKey(url) {
        const encoder = new TextEncoder();
        const data = encoder.encode(url);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async getCachedAnalysis(cacheKey) {
        if (!this.encryptionService) return null;
        
        try {
            return await this.encryptionService.secureRetrieve(`analysis_${cacheKey}`);
        } catch (error) {
            console.error('Cache retrieval error:', error);
            return null;
        }
    }

    async cacheAnalysisSecurely(cacheKey, analysis) {
        if (!this.encryptionService) return;
        
        try {
            const cacheData = {
                data: analysis,
                timestamp: Date.now(),
                version: '1.0.0'
            };
            
            await this.encryptionService.secureStore(`analysis_${cacheKey}`, cacheData);
        } catch (error) {
            console.error('Cache storage error:', error);
        }
    }

    isCacheValid(cached) {
        const maxAge = 5 * 60 * 1000; // 5 minutes
        return cached && (Date.now() - cached.timestamp) < maxAge;
    }

    async handleConsentRequest(sendResponse) {
        try {
            const consent = await this.consentManager.getConsent();
            sendResponse({ success: true, data: consent });
        } catch (error) {
            console.error('Consent request error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async handleRevokeConsent(sendResponse) {
        try {
            await this.consentManager.revokeConsent();
            sendResponse({ success: true });
        } catch (error) {
            console.error('Consent revocation error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async handleExportData(sendResponse) {
        try {
            const exportData = await this.consentManager.exportUserData();
            sendResponse({ success: true, data: exportData });
        } catch (error) {
            console.error('Data export error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    scheduleDataCleanup() {
        // Run cleanup every 24 hours
        setInterval(async () => {
            try {
                if (this.consentManager) {
                    await this.consentManager.cleanupExpiredData();
                }
            } catch (error) {
                console.error('Scheduled cleanup error:', error);
            }
        }, 24 * 60 * 60 * 1000);

        // Run initial cleanup after 1 minute
        setTimeout(async () => {
            try {
                if (this.consentManager) {
                    await this.consentManager.cleanupExpiredData();
                }
            } catch (error) {
                console.error('Initial cleanup error:', error);
            }
        }, 60 * 1000);
    }
}

// Initialize background service
const backgroundService = new SecureBackgroundService();