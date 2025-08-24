class BackgroundService {
    constructor() {
        this.analysisCache = new Map();
        this.setupMessageListener();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'analyzePage') {
                this.handleAnalyzeRequest(request, sendResponse);
                return true; // Will respond asynchronously
            }
        });
    }

    async handleAnalyzeRequest(request, sendResponse) {
        try {
            const analysis = await this.analyzePage(request.url);
            sendResponse({ success: true, data: analysis });
        } catch (error) {
            console.error('Background analysis error:', error);
            sendResponse({ 
                success: false, 
                error: error.message || 'ANALYSIS_ERROR' 
            });
        }
    }

    async analyzePage(url) {
        const urlHash = await this.hashString(url);
        
        // Check cache first
        if (this.analysisCache.has(urlHash)) {
            const cached = this.analysisCache.get(urlHash);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutes
                return cached.data;
            }
        }

        // Extract page content
        const content = await this.extractPageContent(url);
        if (!content) {
            throw new Error('NO_POLICY');
        }

        // Analyze content
        const analysis = await this.performAnalysis(content, url);
        
        // Cache results
        this.analysisCache.set(urlHash, {
            data: analysis,
            timestamp: Date.now()
        });

        return analysis;
    }

    async extractPageContent(url) {
        try {
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Inject content script to extract text
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: this.extractPolicyContent
            });

            return results[0]?.result || null;
        } catch (error) {
            console.error('Content extraction error:', error);
            return null;
        }
    }

    // This function runs in the page context
    extractPolicyContent() {
        const policyIndicators = [
            'privacy policy', 'terms of service', 'terms and conditions',
            'data policy', 'cookie policy', 'user agreement', 'eula'
        ];

        const url = window.location.href.toLowerCase();
        const title = document.title.toLowerCase();
        const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
            .map(h => h.textContent.toLowerCase());

        // Check if current page is likely a policy page
        const isPolicyPage = policyIndicators.some(indicator => 
            url.includes(indicator.replace(/\s/g, '')) || 
            title.includes(indicator) ||
            headings.some(h => h.includes(indicator))
        );

        if (!isPolicyPage) {
            // Look for policy links in footer or navigation
            const policyLinks = Array.from(document.querySelectorAll('a'))
                .filter(link => {
                    const text = link.textContent.toLowerCase();
                    const href = link.href.toLowerCase();
                    return policyIndicators.some(indicator => 
                        text.includes(indicator) || href.includes(indicator.replace(/\s/g, ''))
                    );
                });

            if (policyLinks.length === 0) {
                return null; // No policy found
            }

            // Return info about found policy links instead of extracting
            return {
                isPolicyPage: false,
                policyLinks: policyLinks.slice(0, 3).map(link => ({
                    text: link.textContent.trim(),
                    href: link.href
                }))
            };
        }

        // Extract text from policy page
        const content = document.body.innerText || document.body.textContent || '';
        
        // Clean up the content
        const cleanContent = content
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim();

        if (cleanContent.length < 500) {
            return null; // Too short to be a real policy
        }

        return {
            isPolicyPage: true,
            content: cleanContent,
            url: window.location.href,
            title: document.title,
            extractedAt: new Date().toISOString()
        };
    }

    async performAnalysis(extracted, url) {
        if (!extracted.isPolicyPage) {
            throw new Error('NO_POLICY');
        }

        const content = extracted.content;
        const analyzer = new PolicyAnalyzer();
        
        return analyzer.analyze(content, url);
    }

    async hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

class PolicyAnalyzer {
    constructor() {
        this.patterns = this.initializePatterns();
        this.scoringWeights = {
            collection: 0.15,
            sharingSelling: 0.20,
            rights: 0.15,
            retention: 0.10,
            dispute: 0.15,
            license: 0.10,
            tracking: 0.10,
            children: 0.025,
            security: 0.075
        };
    }

    initializePatterns() {
        return {
            dataSelling: [
                /sell (your|personal) data/i,
                /monetize.*data/i,
                /valuable consideration/i,
                /share.*third parties.*advertising/i
            ],
            arbitration: [
                /binding arbitration/i,
                /waive.*right.*jury/i,
                /class action waiver/i,
                /dispute resolution.*binding/i
            ],
            license: [
                /perpetual.*license/i,
                /irrevocable.*rights/i,
                /royalty-free.*sublicense/i,
                /worldwide.*license.*content/i
            ],
            retention: [
                /retain indefinitely/i,
                /keep.*data.*forever/i,
                /no retention period/i
            ],
            fingerprinting: [
                /device fingerprint/i,
                /canvas fingerprint/i,
                /unique identifier/i,
                /cross.*site tracking/i
            ],
            children: [
                /under (13|16)/i,
                /child.*consent/i,
                /COPPA/i,
                /parental consent/i
            ],
            rights: [
                /right to delete/i,
                /data portability/i,
                /access.*data/i,
                /opt.*out/i
            ],
            security: [
                /encrypt/i,
                /secure/i,
                /protection/i,
                /SSL|TLS/i
            ]
        };
    }

    analyze(content, url) {
        const summary = this.generateSummary(content);
        const redFlags = this.detectRedFlags(content);
        const scores = this.calculateScores(content);

        return {
            url,
            retrievedAt: new Date().toISOString(),
            contentHash: this.simpleHash(content),
            language: 'en', // Simple detection
            summary,
            redFlags,
            scores
        };
    }

    generateSummary(content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const keywordSentences = [];

        // Find sentences containing important keywords
        const importantKeywords = [
            { terms: ['collect', 'gather'], icon: 'collection', priority: 1 },
            { terms: ['share', 'disclose', 'third party'], icon: 'sharing', priority: 2 },
            { terms: ['cookie', 'tracking'], icon: 'tracking', priority: 3 },
            { terms: ['delete', 'remove', 'right'], icon: 'rights', priority: 4 },
            { terms: ['secure', 'protect'], icon: 'security', priority: 5 },
            { terms: ['retain', 'keep'], icon: 'retention', priority: 6 }
        ];

        importantKeywords.forEach(keyword => {
            const relevantSentences = sentences.filter(sentence => 
                keyword.terms.some(term => 
                    sentence.toLowerCase().includes(term)
                )
            ).slice(0, 2);

            relevantSentences.forEach(sentence => {
                keywordSentences.push({
                    id: keyword.icon + Date.now(),
                    text: this.simplifyLanguage(sentence.trim()),
                    priority: keyword.priority,
                    evidence: []
                });
            });
        });

        // Sort by priority and take top items
        return keywordSentences
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 8);
    }

    simplifyLanguage(text) {
        // Simple language simplification
        return text
            .replace(/\b(shall|hereby|wherein|whereas)\b/gi, '')
            .replace(/\b(such|aforementioned)\b/gi, 'this')
            .replace(/\bpursuant to\b/gi, 'according to')
            .replace(/\bin accordance with\b/gi, 'following')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 200) + (text.length > 200 ? '...' : '');
    }

    detectRedFlags(content) {
        const flags = [];

        // Check for data selling
        if (this.patterns.dataSelling.some(pattern => pattern.test(content))) {
            flags.push({
                id: 'data-selling',
                title: 'May sell your data',
                severity: 5,
                evidence: this.findEvidence(content, this.patterns.dataSelling),
                whatItMeans: 'This company may sell or share your personal information with third parties for profit.'
            });
        }

        // Check for arbitration clauses
        if (this.patterns.arbitration.some(pattern => pattern.test(content))) {
            flags.push({
                id: 'arbitration',
                title: 'Mandatory arbitration',
                severity: 4,
                evidence: this.findEvidence(content, this.patterns.arbitration),
                whatItMeans: 'You give up your right to sue or join class action lawsuits.'
            });
        }

        // Check for broad content licenses
        if (this.patterns.license.some(pattern => pattern.test(content))) {
            flags.push({
                id: 'broad-license',
                title: 'Broad license to your content',
                severity: 3,
                evidence: this.findEvidence(content, this.patterns.license),
                whatItMeans: 'The company gets extensive rights to use, modify, and share your content.'
            });
        }

        // Check for indefinite retention
        if (this.patterns.retention.some(pattern => pattern.test(content))) {
            flags.push({
                id: 'indefinite-retention',
                title: 'Keeps data indefinitely',
                severity: 4,
                evidence: this.findEvidence(content, this.patterns.retention),
                whatItMeans: 'Your data may be stored forever without clear deletion policies.'
            });
        }

        return flags.slice(0, 5); // Limit to top 5 flags
    }

    findEvidence(content, patterns) {
        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
                const start = Math.max(0, match.index - 50);
                const end = Math.min(content.length, match.index + match[0].length + 50);
                return content.substring(start, end).trim();
            }
        }
        return 'Evidence found in policy text';
    }

    calculateScores(content) {
        const baseScore = 50;
        let scores = {
            collection: baseScore,
            sharingSelling: baseScore,
            rights: baseScore,
            retention: baseScore,
            dispute: baseScore,
            license: baseScore,
            tracking: baseScore,
            children: baseScore,
            security: baseScore
        };

        // Adjust scores based on detected patterns
        if (this.patterns.dataSelling.some(p => p.test(content))) {
            scores.sharingSelling -= 30;
        }

        if (this.patterns.arbitration.some(p => p.test(content))) {
            scores.dispute -= 25;
        }

        if (this.patterns.rights.some(p => p.test(content))) {
            scores.rights += 20;
        }

        if (this.patterns.security.some(p => p.test(content))) {
            scores.security += 15;
        }

        if (this.patterns.fingerprinting.some(p => p.test(content))) {
            scores.tracking -= 20;
        }

        // Ensure scores stay within bounds
        Object.keys(scores).forEach(key => {
            scores[key] = Math.max(0, Math.min(100, scores[key]));
        });

        // Calculate aggregate score
        const aggregate = Math.round(
            Object.entries(scores)
                .filter(([key]) => key !== 'aggregate')
                .reduce((sum, [key, value]) => sum + value * this.scoringWeights[key], 0)
        );

        scores.aggregate = aggregate;
        scores.confidence = this.calculateConfidence(content);

        return scores;
    }

    calculateConfidence(content) {
        let confidence = 0.5;

        // Higher confidence for longer documents
        if (content.length > 5000) confidence += 0.2;
        if (content.length > 10000) confidence += 0.1;

        // Higher confidence if we find clear policy language
        const policyTerms = ['privacy', 'data', 'information', 'collect', 'use', 'share'];
        const foundTerms = policyTerms.filter(term => 
            content.toLowerCase().includes(term)
        ).length;
        confidence += (foundTerms / policyTerms.length) * 0.3;

        return Math.min(1.0, confidence);
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return 'simple-' + Math.abs(hash).toString(16);
    }
}

// Initialize background service
const backgroundService = new BackgroundService();