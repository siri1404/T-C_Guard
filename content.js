class ContentAnalyzer {
    constructor() {
        this.isAnalyzing = false;
        this.init();
    }

    init() {
        // Auto-detect if current page is a policy page
        this.detectPolicyPage();
        
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'extractContent') {
                this.extractContent().then(sendResponse);
                return true;
            }
        });
    }

    detectPolicyPage() {
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
    }

    extractHeadings() {
        return Array.from(document.querySelectorAll('h1, h2, h3, h4'))
            .map(el => el.textContent.toLowerCase().trim())
            .filter(text => text.length > 0);
    }

    showPolicyDetectedBadge() {
        // Create a small badge indicating policy detected
        const badge = document.createElement('div');
        badge.id = 'tc-guard-badge';
        badge.innerHTML = `
            <div class="tc-badge-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>T&C detected</span>
            </div>
        `;

        // Add styles
        const styles = `
            #tc-guard-badge {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-family: 'Inter', sans-serif;
                font-size: 12px;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
                cursor: pointer;
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateY(-10px);
                animation: tcBadgeSlide 0.5s ease forwards;
            }
            
            #tc-guard-badge:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 16px rgba(20, 184, 166, 0.4);
            }
            
            .tc-badge-content {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            @keyframes tcBadgeSlide {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @media (max-width: 768px) {
                #tc-guard-badge {
                    top: 10px;
                    right: 10px;
                    font-size: 11px;
                    padding: 6px 10px;
                }
            }
        `;

        // Inject styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        // Add badge to page
        document.body.appendChild(badge);

        // Add click handler to open extension popup
        badge.addEventListener('click', () => {
            // Send message to background script to trigger analysis
            chrome.runtime.sendMessage({
                action: 'triggerAnalysis',
                url: window.location.href
            });
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (badge.parentNode) {
                badge.style.animation = 'tcBadgeSlide 0.3s ease reverse forwards';
                setTimeout(() => badge.remove(), 300);
            }
        }, 5000);
    }

    async extractContent() {
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
            return {
                success: false,
                error: error.message
            };
        }
    }

    extractTextContent() {
        // Remove script and style elements
        const clonedDoc = document.cloneNode(true);
        const scripts = clonedDoc.querySelectorAll('script, style, nav, header, footer');
        scripts.forEach(el => el.remove());

        // Get main content areas
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

        // Fall back to body if no main content found
        const source = mainContent || clonedDoc.body;
        
        // Extract and clean text
        let text = source.innerText || source.textContent || '';
        
        // Clean up whitespace and formatting
        text = text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();

        // Ensure minimum length for valid policy
        if (text.length < 500) {
            throw new Error('CONTENT_TOO_SHORT');
        }

        return text;
    }

    extractMetadata() {
        return {
            title: document.title,
            description: this.getMetaContent('description'),
            keywords: this.getMetaContent('keywords'),
            lastModified: document.lastModified,
            language: document.documentElement.lang || 'en',
            headings: this.extractHeadings().slice(0, 10) // Top 10 headings
        };
    }

    getMetaContent(name) {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="og:${name}"]`);
        return meta ? meta.content : '';
    }

    findPolicyLinks() {
        const policyKeywords = [
            'privacy policy', 'terms of service', 'terms and conditions',
            'cookie policy', 'data policy', 'user agreement'
        ];

        const links = Array.from(document.querySelectorAll('a[href]'))
            .filter(link => {
                const text = link.textContent.toLowerCase().trim();
                const href = link.href.toLowerCase();
                
                return policyKeywords.some(keyword => 
                    text.includes(keyword) || 
                    href.includes(keyword.replace(/\s+/g, ''))
                );
            })
            .slice(0, 5) // Limit to 5 links
            .map(link => ({
                text: link.textContent.trim(),
                href: link.href,
                type: this.classifyPolicyLink(link)
            }));

        return links;
    }

    classifyPolicyLink(link) {
        const text = link.textContent.toLowerCase();
        const href = link.href.toLowerCase();
        
        if (text.includes('privacy') || href.includes('privacy')) return 'privacy';
        if (text.includes('terms') || href.includes('terms')) return 'terms';
        if (text.includes('cookie') || href.includes('cookie')) return 'cookie';
        return 'other';
    }
}

// Initialize content analyzer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ContentAnalyzer());
} else {
    new ContentAnalyzer();
}