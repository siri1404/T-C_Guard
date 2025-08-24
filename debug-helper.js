// Debug Helper Script
// Paste this in browser console to test extension functionality

class TCGuardDebugger {
    constructor() {
        this.extensionId = null;
        this.findExtension();
    }

    async findExtension() {
        // Try to find the extension ID
        try {
            const extensions = await chrome.management.getAll();
            const tcGuard = extensions.find(ext => 
                ext.name.includes('T&C Guard') || 
                ext.name.includes('Terms') ||
                ext.id.includes('tc-guard')
            );
            
            if (tcGuard) {
                this.extensionId = tcGuard.id;
                console.log('✅ Found T&C Guard extension:', tcGuard.name, tcGuard.id);
                console.log('Extension enabled:', tcGuard.enabled);
            } else {
                console.log('❌ T&C Guard extension not found');
            }
        } catch (error) {
            console.log('⚠️ Cannot access extension management API');
        }
    }

    // Test if content script is loaded
    testContentScript() {
        console.log('🔍 Testing content script...');
        
        // Check if content script globals exist
        if (window.ContentAnalyzer) {
            console.log('✅ Content script loaded');
        } else {
            console.log('❌ Content script not found');
        }

        // Test policy detection
        const policyKeywords = [
            'privacy policy', 'terms of service', 'terms and conditions',
            'data policy', 'cookie policy', 'user agreement'
        ];

        const url = window.location.href.toLowerCase();
        const title = document.title.toLowerCase();
        
        const isPolicyPage = policyKeywords.some(keyword => 
            url.includes(keyword.replace(/\s+/g, '')) || 
            title.includes(keyword)
        );

        console.log('Current page is policy page:', isPolicyPage);
        console.log('Page URL:', url);
        console.log('Page title:', title);

        // Check for policy links
        const policyLinks = Array.from(document.querySelectorAll('a'))
            .filter(link => {
                const text = link.textContent.toLowerCase();
                const href = link.href.toLowerCase();
                return policyKeywords.some(keyword => 
                    text.includes(keyword) || href.includes(keyword.replace(/\s+/g, ''))
                );
            })
            .slice(0, 5);

        console.log('Found policy links:', policyLinks.length);
        policyLinks.forEach(link => {
            console.log('  -', link.textContent.trim(), '→', link.href);
        });
    }

    // Test text extraction
    testTextExtraction() {
        console.log('📝 Testing text extraction...');
        
        const content = document.body.innerText || document.body.textContent || '';
        const cleanContent = content.replace(/\s+/g, ' ').trim();
        
        console.log('Extracted text length:', cleanContent.length);
        console.log('First 200 chars:', cleanContent.substring(0, 200));
        
        if (cleanContent.length < 500) {
            console.log('⚠️ Content too short for policy analysis');
        } else {
            console.log('✅ Content length sufficient for analysis');
        }

        return cleanContent;
    }

    // Test pattern matching
    testPatternMatching(content) {
        console.log('🔍 Testing pattern matching...');
        
        const patterns = {
            dataSelling: [
                /sell (your|personal) data/i,
                /monetize.*data/i,
                /valuable consideration/i
            ],
            arbitration: [
                /binding arbitration/i,
                /waive.*right.*jury/i,
                /class action waiver/i
            ],
            license: [
                /perpetual.*license/i,
                /irrevocable.*rights/i,
                /royalty-free.*sublicense/i
            ],
            tracking: [
                /device fingerprint/i,
                /canvas fingerprint/i,
                /cross.*site tracking/i
            ]
        };

        const results = {};
        Object.entries(patterns).forEach(([category, patternList]) => {
            const matches = patternList.filter(pattern => pattern.test(content));
            results[category] = matches.length > 0;
            
            if (matches.length > 0) {
                console.log(`🚩 Found ${category} patterns:`, matches.length);
            }
        });

        return results;
    }

    // Test extension popup
    async testPopup() {
        console.log('🔧 Testing popup functionality...');
        
        try {
            // Try to send message to background script
            const response = await chrome.runtime.sendMessage({
                action: 'analyzePage',
                url: window.location.href
            });
            
            console.log('Background script response:', response);
        } catch (error) {
            console.log('❌ Error communicating with background script:', error);
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Running T&C Guard Debug Tests...\n');
        
        this.testContentScript();
        console.log('\n');
        
        const content = this.testTextExtraction();
        console.log('\n');
        
        if (content.length > 500) {
            this.testPatternMatching(content);
            console.log('\n');
        }
        
        await this.testPopup();
        console.log('\n✅ Debug tests completed');
    }

    // Helper to check extension storage
    async checkStorage() {
        try {
            const data = await chrome.storage.local.get();
            console.log('Extension storage:', data);
        } catch (error) {
            console.log('Cannot access extension storage:', error);
        }
    }
}

// Auto-run debugger
const debugger = new TCGuardDebugger();
setTimeout(() => debugger.runAllTests(), 1000);

// Make available globally
window.tcGuardDebugger = debugger;

console.log('T&C Guard Debugger loaded. Run tcGuardDebugger.runAllTests() to test.');