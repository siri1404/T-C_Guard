class PopupController {
    constructor() {
        this.currentTab = null;
        this.analysisData = null;
        this.init();
    }

    async init() {
        await this.getCurrentTab();
        this.setupEventListeners();
        this.showLoadingState();
        await this.analyzeCurrentPage();
    }

    async getCurrentTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        this.currentTab = tab;
        this.updateSiteInfo(tab);
    }

    updateSiteInfo(tab) {
        const domain = new URL(tab.url).hostname;
        document.getElementById('site-domain').textContent = domain;
        
        // Hide favicon since chrome://favicon/ is not allowed in extensions
        const favicon = document.getElementById('site-favicon');
        favicon.style.display = 'none';
    }

    setupEventListeners() {
        document.getElementById('theme-toggle').addEventListener('click', this.toggleTheme.bind(this));
        document.getElementById('accept-btn').addEventListener('click', this.handleAccept.bind(this));
        document.getElementById('reject-btn').addEventListener('click', this.handleReject.bind(this));
        document.getElementById('alternatives-btn').addEventListener('click', this.showAlternatives.bind(this));
        document.getElementById('export-btn').addEventListener('click', this.exportReport.bind(this));
        document.getElementById('full-report-btn').addEventListener('click', this.openFullReport.bind(this));
        document.getElementById('retry-btn')?.addEventListener('click', this.retryAnalysis.bind(this));
    }

    showLoadingState() {
        this.hideAllStates();
        document.getElementById('loading-state').style.display = 'block';
    }

    showContentState() {
        this.hideAllStates();
        document.getElementById('content-state').style.display = 'block';
    }

    showNoPolicyState() {
        this.hideAllStates();
        document.getElementById('no-policy-state').style.display = 'block';
    }

    showErrorState() {
        this.hideAllStates();
        document.getElementById('error-state').style.display = 'block';
    }

    hideAllStates() {
        const states = ['loading-state', 'content-state', 'no-policy-state', 'error-state'];
        states.forEach(state => {
            document.getElementById(state).style.display = 'none';
        });
    }

    async analyzeCurrentPage() {
        try {
            // Request analysis from background script
            const response = await chrome.runtime.sendMessage({
                action: 'analyzePage',
                url: this.currentTab.url
            });

            if (response.success) {
                this.analysisData = response.data;
                this.renderAnalysis();
                this.updateLastChecked();
            } else if (response.error === 'NO_POLICY') {
                this.showNoPolicyState();
            } else {
                this.showErrorState();
            }
        } catch (error) {
            console.error('Analysis error:', error);
            this.showErrorState();
        }
    }

    renderAnalysis() {
        if (!this.analysisData) return;

        this.showContentState();
        this.renderTrustScore();
        this.renderSummary();
        this.renderRedFlags();
    }

    renderTrustScore() {
        const { scores } = this.analysisData;
        const trustScore = scores.aggregate;
        const confidence = Math.round(scores.confidence * 100);

        // Update score display
        document.getElementById('trust-score').textContent = trustScore;
        document.getElementById('confidence-value').textContent = `${confidence}%`;

        // Animate dial
        const dialProgress = document.getElementById('dial-progress');
        const circumference = 126; // Approximate arc length for semicircle
        const progress = (trustScore / 100) * circumference;
        
        setTimeout(() => {
            dialProgress.style.strokeDasharray = `${progress} ${circumference}`;
        }, 500);

        // Update dial color based on score
        const scoreGradient = document.getElementById('scoreGradient');
        if (trustScore >= 75) {
            dialProgress.style.stroke = '#22C55E';
        } else if (trustScore >= 50) {
            dialProgress.style.stroke = '#F59E0B';
        } else {
            dialProgress.style.stroke = '#EF4444';
        }
    }

    renderSummary() {
        const { summary } = this.analysisData;
        const container = document.getElementById('summary-bullets');
        
        container.innerHTML = summary.map(item => `
            <div class="summary-bullet" data-evidence='${JSON.stringify(item.evidence || [])}'>
                <div class="summary-bullet-content">
                    <span class="bullet-icon">${this.getSummaryIcon(item.id)}</span>
                    <span class="bullet-text">${item.text}</span>
                </div>
            </div>
        `).join('');

        // Add click handlers for evidence
        container.querySelectorAll('.summary-bullet').forEach(bullet => {
            bullet.addEventListener('click', (e) => {
                const evidence = JSON.parse(e.currentTarget.dataset.evidence);
                this.showEvidence(evidence);
            });
        });
    }

    renderRedFlags() {
        const { redFlags } = this.analysisData;
        
        if (!redFlags || redFlags.length === 0) {
            return;
        }

        const section = document.getElementById('red-flags-section');
        const container = document.getElementById('red-flags-container');
        
        section.style.display = 'block';
        
        container.innerHTML = redFlags.map(flag => `
            <div class="red-flag-card" data-flag-id="${flag.id}">
                <div class="red-flag-header">
                    <span class="red-flag-title">${flag.title}</span>
                    <span class="severity-chip">${this.getSeverityEmoji(flag.severity)} ${flag.severity}</span>
                </div>
                <div class="red-flag-description">${flag.whatItMeans}</div>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.red-flag-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const flagId = e.currentTarget.dataset.flagId;
                const flag = redFlags.find(f => f.id === flagId);
                this.showFlagDetails(flag);
            });
        });
    }

    getSummaryIcon(id) {
        const icons = {
            collection: '📊',
            sharing: '🔗',
            rights: '⚖️',
            retention: '🗄️',
            security: '🔒',
            tracking: '👁️',
            children: '👶',
            license: '📜',
            default: '📋'
        };
        
        const key = Object.keys(icons).find(k => id.includes(k));
        return icons[key] || icons.default;
    }

    getSeverityEmoji(severity) {
        if (severity >= 4) return '🔥';
        if (severity >= 3) return '⚠️';
        return 'ℹ️';
    }

    updateLastChecked() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        document.getElementById('last-checked').textContent = `Last checked: ${timeStr}`;
    }

    showEvidence(evidence) {
        if (!evidence || evidence.length === 0) return;
        
        // For now, just show an alert with evidence info
        // In a full implementation, this would open a detailed evidence viewer
        alert(`Evidence found in ${evidence.length} location(s) in the policy document.`);
    }

    showFlagDetails(flag) {
        if (!flag) return;
        
        // Create a modal-like overlay for flag details
        const overlay = document.createElement('div');
        overlay.className = 'flag-detail-overlay';
        overlay.innerHTML = `
            <div class="flag-detail-modal">
                <div class="flag-detail-header">
                    <h3>${flag.title}</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="flag-detail-content">
                    <div class="severity-indicator">
                        Severity: ${this.getSeverityEmoji(flag.severity)} ${flag.severity}/5
                    </div>
                    <div class="flag-evidence">
                        <h4>Evidence:</h4>
                        <blockquote>"${flag.evidence}"</blockquote>
                    </div>
                    <div class="flag-explanation">
                        <h4>What this means:</h4>
                        <p>${flag.whatItMeans}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .flag-detail-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .flag-detail-modal {
                background: var(--bg-secondary);
                border-radius: var(--border-radius);
                border: 1px solid var(--border-color);
                max-width: 320px;
                max-height: 400px;
                overflow-y: auto;
            }
            .flag-detail-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid var(--border-color);
            }
            .close-modal {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 20px;
                cursor: pointer;
            }
            .flag-detail-content {
                padding: 16px;
            }
            .flag-evidence blockquote {
                background: var(--bg-glass);
                padding: 12px;
                border-radius: 6px;
                font-style: italic;
                margin: 8px 0;
                font-family: monospace;
                font-size: 12px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        
        // Close modal handlers
        const closeModal = () => {
            document.body.removeChild(overlay);
            document.head.removeChild(style);
        };
        
        overlay.querySelector('.close-modal').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    toggleTheme() {
        // Theme toggle placeholder - would implement full theme switching
        console.log('Theme toggle clicked');
    }

    handleAccept() {
        // Close popup and optionally show accept options
        window.close();
    }

    handleReject() {
        // Close current tab or navigate away
        chrome.tabs.remove(this.currentTab.id);
    }

    showAlternatives() {
        const domain = new URL(this.currentTab.url).hostname;
        const searchUrl = `https://www.google.com/search?q=alternatives+to+${encodeURIComponent(domain)}`;
        chrome.tabs.create({ url: searchUrl });
    }

    async exportReport() {
        if (!this.analysisData) return;
        
        const report = this.generateReportText();
        
        try {
            await navigator.clipboard.writeText(report);
            
            // Show success feedback
            const btn = document.getElementById('export-btn');
            const originalText = btn.textContent;
            btn.textContent = '✅ Copied!';
            btn.style.color = 'var(--accent-success)';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.color = '';
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            // Fallback: create downloadable file
            this.downloadReport(report);
        }
    }

    generateReportText() {
        const { summary, redFlags, scores } = this.analysisData;
        const domain = new URL(this.currentTab.url).hostname;
        
        return `
T&C GUARD ANALYSIS REPORT
Domain: ${domain}
Analyzed: ${new Date().toLocaleString()}
Trust Score: ${scores.aggregate}/100 (${Math.round(scores.confidence * 100)}% confidence)

KEY POINTS:
${summary.map(item => `• ${item.text}`).join('\n')}

${redFlags?.length ? `RED FLAGS:
${redFlags.map(flag => `⚠️ ${flag.title} (Severity: ${flag.severity}/5)
   Evidence: "${flag.evidence}"
   Impact: ${flag.whatItMeans}`).join('\n\n')}` : 'No significant red flags detected.'}

SCORE BREAKDOWN:
• Data Collection: ${scores.collection}/100
• Data Sharing/Selling: ${scores.sharingSelling}/100  
• User Rights: ${scores.rights}/100
• Data Retention: ${scores.retention}/100
• Dispute Resolution: ${scores.dispute}/100
• License to Content: ${scores.license}/100
• Tracking: ${scores.tracking}/100
• Children's Data: ${scores.children}/100
• Security: ${scores.security}/100

Generated by T&C Guard Browser Extension
        `.trim();
    }

    downloadReport(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tc-guard-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    openFullReport() {
        // Placeholder for opening detailed side panel
        console.log('Opening full report');
    }

    retryAnalysis() {
        this.analyzeCurrentPage();
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});