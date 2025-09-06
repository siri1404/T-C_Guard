// Production-ready content script with security hardening
class SecureContentAnalyzer {
    constructor() {
        this.isAnalyzing = false;
        this.consentChecked = false;
        this.init();
    }

    async init() {
        try {
            // Check consent before any operations
            await this.checkConsent();
            
            if (this.consentChecked) {
                this.detectPolicyPage();
                this.setupMessageListener();
            }
        } catch (error) {
            console.error('Content script initialization error:', error);
        }
    }

    async checkConsent() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getConsent' });
            this.consentChecked = response.success && response.data;
        } catch (error) {
            console.error('Consent check error:', error);
            this.consentChecked = false;
        }
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'extractContent') {
                this.extractContent().then(sendResponse);
                return true;
            }
        });
    }

    detectPolicyPage() {
        if (!this.consentChecked) return;

        try {
            const policyKeywords = [
                'privacy policy', 'terms of service', 'terms and conditions',
                'data policy', 'cookie policy', 'user agreement', 'eula',
                'terms of use', 'legal notice'
            ];

            const currentUrl = window.location.href.toLowerCase();
            const pageTitle = document.title.toLowerCase();
            const headings = this.extractHeadings();

            const isPolicyPage = policyKeywords.some(keyword => 
                currentUrl.includes(keyword.replace(/\s+/g, '')) ||
                pageTitle.includes(keyword) ||
                headings.some(heading => heading.includes(keyword))
            );

            if (isPolicyPage && !this.isAnalyzing) {
                this.showPolicyDetectedBadge();
            }
        } catch (error) {
            console.error('Policy detection error:', error);
        }
    }

    extractHeadings() {
        try {
            return Array.from(document.querySelectorAll('h1, h2, h3, h4'))
                .map(el => el.textContent.toLowerCase().trim())
                .filter(text => text.length > 0 && text.length < 200) // Reasonable limits
                .slice(0, 20); // Limit number of headings
        } catch (error) {
            console.error('Heading extraction error:', error);
            return [];
        }
    }

    showPolicyDetectedBadge() {
        try {
            // Remove existing badge
            const existingBadge = document.getElementById('tc-guard-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

            const badge = document.createElement('div');
            badge.id = 'tc-guard-badge';
            
            // Sanitize content
            badge.innerHTML = this.createBadgeHTML();

            // Add secure styles
            this.injectSecureStyles();

            // Add badge to page
            document.body.appendChild(badge);

            // Add secure click handler
            badge.addEventListener('click', this.handleBadgeClick.bind(this));

            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (badge.parentNode) {
                    badge.style.animation = 'tcBadgeSlide 0.3s ease reverse forwards';
                    setTimeout(() => {
                        if (badge.parentNode) {
                            badge.remove();
                        }
                    }, 300);
                }
            }, 5000);
        } catch (error) {
            console.error('Badge creation error:', error);
        }
    }

    createBadgeHTML() {
        // Use safe, static HTML - no user input
        return `
            <div class="tc-badge-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>T&C detected</span>
            </div>
        `;
    }

    injectSecureStyles() {
        const styleId = 'tc-guard-styles';
        
        // Remove existing styles
        const existingStyles = document.getElementById(styleId);
        if (existingStyles) {
            existingStyles.remove();
        }

        const styleSheet = document.createElement('style');
        styleSheet.id = styleId;
        styleSheet.textContent = `
            #tc-guard-badge {
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%) !important;
                color: white !important;
                padding: 8px 12px !important;
                border-radius: 20px !important;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                font-size: 12px !important;
                font-weight: 600 !important;
                z-index: 2147483647 !important;
                box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3) !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                opacity: 0 !important;
                transform: translateY(-10px) !important;
                animation: tcBadgeSlide 0.5s ease forwards !important;
                border: none !important;
                outline: none !important;
                text-decoration: none !important;
                user-select: none !important;
            }
            
            #tc-guard-badge:hover {
                transform: scale(1.05) !important;
                box-shadow: 0 6px 16px rgba(20, 184, 166, 0.4) !important;
            }
            
            .tc-badge-content {
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                pointer-events: none !important;
            }
            
            @keyframes tcBadgeSlide {
                to {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
            }
            
            @media (max-width: 768px) {
                #tc-guard-badge {
                    top: 10px !important;
                    right: 10px !important;
                    font-size: 11px !important;
                    padding: 6px 10px !important;
                }
            }
        `;

        document.head.appendChild(styleSheet);
    }

    handleBadgeClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        try {
            // Send secure message to background script
            chrome.runtime.sendMessage({
                action: 'analyzePage',
                url: window.location.href,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Badge click error:', error);
        }
    }

    async extractContent() {
        if (!this.consentChecked) {
            return {
                success: false,
                error: 'CONSENT_REQUIRED'
            };
        }

        try {
            const content = this.extractTextContent();
            const metadata = this.extractMetadata();
            const policyLinks = this.findPolicyLinks();

            return {
                success: true,
                data: {
                    content,
                    metadata,
                    policyLinks,
                    url: window.location.href,
                    extractedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Content extraction error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    extractTextContent() {
        try {
            // Create a safe copy of the document
            const clonedDoc = document.cloneNode(true);
            
            // Remove potentially dangerous elements
            const dangerousElements = clonedDoc.querySelectorAll(
                'script, style, nav, header, footer, iframe, object, embed, applet'
            );
            dangerousElements.forEach(el => el.remove());

            // Get main content areas with size limits
            const contentSelectors = [
                'main', '[role="main"]', '.content', '.main-content',
                '.policy-content', '.terms-content', '.privacy-content',
                'article', '.article'
            ];

            let mainContent = null;
            for (const selector of contentSelectors) {
                mainContent = clonedDoc.querySelector(selector);
                if (mainContent) break;
            }

            const source = mainContent || clonedDoc.body;
            if (!source) {
                throw new Error('CONTENT_NOT_FOUND');
            }
            
            let text = source.innerText || source.textContent || '';
            
            // Security: Limit text size
            if (text.length > 500000) { // 500KB limit
                text = text.slice(0, 500000);
            }
            
            // Clean up whitespace
            text = text
                .replace(/\s+/g, ' ')
                .replace(/\n\s*\n/g, '\n\n')
                .trim();

            if (text.length < 500) {
                throw new Error('CONTENT_TOO_SHORT');
            }

            return text;
        } catch (error) {
            console.error('Text extraction error:', error);
            throw error;
        }
    }

    extractMetadata() {
        try {
            return {
                title: document.title.slice(0, 500), // Limit title length
                description: this.getMetaContent('description').slice(0, 1000),
                keywords: this.getMetaContent('keywords').slice(0, 500),
                lastModified: document.lastModified,
                language: document.documentElement.lang || 'en',
                headings: this.extractHeadings().slice(0, 10)
            };
        } catch (error) {
            console.error('Metadata extraction error:', error);
            return {};
        }
    }

    getMetaContent(name) {
        try {
            const meta = document.querySelector(`meta[name="${name}"], meta[property="og:${name}"]`);
            return meta ? meta.content : '';
        } catch (error) {
            console.error('Meta content extraction error:', error);
            return '';
        }
    }

    findPolicyLinks() {
        try {
            const policyKeywords = [
                'privacy policy', 'terms of service', 'terms and conditions',
                'cookie policy', 'data policy', 'user agreement'
            ];

            const links = Array.from(document.querySelectorAll('a[href]'))
                .filter(link => {
                    try {
                        const text = link.textContent.toLowerCase().trim();
                        const href = link.href.toLowerCase();
                        
                        // Security: Validate href
                        if (!href.startsWith('http://') && !href.startsWith('https://')) {
                            return false;
                        }
                        
                        return policyKeywords.some(keyword => 
                            text.includes(keyword) || 
                            href.includes(keyword.replace(/\s+/g, ''))
                        );
                    } catch (error) {
                        return false;
                    }
                })
                .slice(0, 5) // Limit number of links
                .map(link => ({
                    text: link.textContent.trim().slice(0, 100), // Limit text length
                    href: link.href,
                    type: this.classifyPolicyLink(link)
                }));

            return links;
        } catch (error) {
            console.error('Policy links extraction error:', error);
            return [];
        }
    }

    classifyPolicyLink(link) {
        try {
            const text = link.textContent.toLowerCase();
            const href = link.href.toLowerCase();
            
            if (text.includes('privacy') || href.includes('privacy')) return 'privacy';
            if (text.includes('terms') || href.includes('terms')) return 'terms';
            if (text.includes('cookie') || href.includes('cookie')) return 'cookie';
            return 'other';
        } catch (error) {
            return 'other';
        }
    }
}

// Initialize content analyzer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            new SecureContentAnalyzer();
        } catch (error) {
            console.error('Content analyzer initialization error:', error);
        }
    });
} else {
    try {
        new SecureContentAnalyzer();
    } catch (error) {
        console.error('Content analyzer initialization error:', error);
    }
}