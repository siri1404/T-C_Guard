import type { AnalysisResult, SummaryItem, RedFlag, Scores, PolicyContent } from '../types/analysis';

export class PolicyAnalyzer {
  private patterns: Record<string, RegExp[]>;
  private scoringWeights: Record<string, number>;

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

  private initializePatterns(): Record<string, RegExp[]> {
    return {
      dataSelling: [
        /\b(we|may|will|can)\s+sell\s+(your|personal)\s+data/i,
        /monetize\s+(your\s+)?data/i,
        /sell\s+.*information.*valuable\s+consideration/i,
        /share.*third\s+parties.*advertising.*revenue/i,
        /data\s+broker/i,
        /sell.*information.*marketing.*purposes(?!\s+without)/i
      ],
      arbitration: [
        /binding arbitration/i,
        /waive.*right.*jury/i,
        /class action waiver/i,
        /dispute resolution.*binding/i,
        /arbitration agreement/i,
        /waive.*class.*action/i
      ],
      license: [
        /perpetual.*license/i,
        /irrevocable.*rights/i,
        /royalty-free.*sublicense/i,
        /worldwide.*license.*content/i,
        /perpetual.*irrevocable/i,
        /sublicensable.*transferable/i
      ],
      retention: [
        /retain indefinitely/i,
        /keep.*data.*forever/i,
        /no retention period/i,
        /retain.*as long as/i,
        /indefinite.*retention/i
      ],
      fingerprinting: [
        /device fingerprint/i,
        /canvas fingerprint/i,
        /unique identifier/i,
        /cross.*site tracking/i,
        /browser fingerprint/i,
        /tracking.*pixels/i
      ],
      children: [
        /under (13|16)/i,
        /child.*consent/i,
        /COPPA/i,
        /parental consent/i,
        /children.*privacy/i,
        /minors.*data/i
      ],
      rights: [
        /right to delete/i,
        /data portability/i,
        /access.*data/i,
        /opt.*out/i,
        /delete.*account/i,
        /data subject rights/i,
        /GDPR/i,
        /CCPA/i
      ],
      security: [
        /encrypt/i,
        /secure/i,
        /protection/i,
        /SSL|TLS/i,
        /security measures/i,
        /data protection/i
      ],
      sharing: [
        /share.*third parties/i,
        /disclose.*partners/i,
        /third.*party.*services/i,
        /business partners/i,
        /service providers/i
      ],
      collection: [
        /collect.*information/i,
        /gather.*data/i,
        /obtain.*personal/i,
        /we collect/i,
        /information.*collect/i
      ]
    };
  }

  async analyze(content: PolicyContent, url: string): Promise<AnalysisResult> {
    const text = content.content || '';
    
    const summary = this.generateSummary(text);
    const redFlags = this.detectRedFlags(text);
    const scores = this.calculateScores(text);

    return {
      url,
      retrievedAt: new Date().toISOString(),
      contentHash: this.simpleHash(text),
      language: 'en',
      summary,
      redFlags,
      scores
    };
  }

  private generateSummary(content: string): SummaryItem[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keywordSentences: SummaryItem[] = [];

    const importantKeywords = [
      { terms: ['collect', 'gather', 'obtain'], id: 'collection', priority: 1 },
      { terms: ['share', 'disclose', 'third party', 'partners'], id: 'sharing', priority: 2 },
      { terms: ['cookie', 'tracking', 'analytics'], id: 'tracking', priority: 3 },
      { terms: ['delete', 'remove', 'right', 'access'], id: 'rights', priority: 4 },
      { terms: ['secure', 'protect', 'encryption'], id: 'security', priority: 5 },
      { terms: ['retain', 'keep', 'store'], id: 'retention', priority: 6 },
      { terms: ['arbitration', 'dispute', 'legal'], id: 'dispute', priority: 7 },
      { terms: ['license', 'content', 'intellectual'], id: 'license', priority: 8 }
    ];

    importantKeywords.forEach(keyword => {
      const relevantSentences = sentences.filter(sentence => 
        keyword.terms.some(term => 
          sentence.toLowerCase().includes(term)
        )
      ).slice(0, 2);

      relevantSentences.forEach(sentence => {
        keywordSentences.push({
          id: keyword.id + '_' + Date.now() + Math.random(),
          text: this.simplifyLanguage(sentence.trim()),
          priority: keyword.priority,
          evidence: []
        });
      });
    });

    return keywordSentences
      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
      .slice(0, 8);
  }

  private simplifyLanguage(text: string): string {
    return text
      .replace(/\b(shall|hereby|wherein|whereas)\b/gi, '')
      .replace(/\b(such|aforementioned)\b/gi, 'this')
      .replace(/\bpursuant to\b/gi, 'according to')
      .replace(/\bin accordance with\b/gi, 'following')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200) + (text.length > 200 ? '...' : '');
  }

  private detectRedFlags(content: string): RedFlag[] {
    const flags: RedFlag[] = [];

    // Check for data selling - but exclude explicit denials
    const hasDataSelling = this.patterns.dataSelling.some(pattern => pattern.test(content));
    const explicitlyDenies = /do not sell|will not sell|never sell|don't sell/i.test(content);
    
    if (hasDataSelling && !explicitlyDenies) {
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

    // Check for fingerprinting
    if (this.patterns.fingerprinting.some(pattern => pattern.test(content))) {
      flags.push({
        id: 'fingerprinting',
        title: 'Device fingerprinting',
        severity: 3,
        evidence: this.findEvidence(content, this.patterns.fingerprinting),
        whatItMeans: 'Uses advanced tracking techniques that are hard to block.'
      });
    }

    return flags.slice(0, 5);
  }

  private findEvidence(content: string, patterns: RegExp[]): string {
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const start = Math.max(0, match.index! - 50);
        const end = Math.min(content.length, match.index! + match[0].length + 50);
        return content.substring(start, end).trim();
      }
    }
    return 'Evidence found in policy text';
  }

  private calculateScores(content: string): Scores {
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
      security: baseScore,
      aggregate: baseScore,
      confidence: 0.5
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

    if (this.patterns.license.some(p => p.test(content))) {
      scores.license -= 20;
    }

    if (this.patterns.retention.some(p => p.test(content))) {
      scores.retention -= 25;
    }

    // Positive indicators
    if (/GDPR|CCPA|data protection/i.test(content)) {
      scores.rights += 15;
      scores.collection += 10;
    }

    if (/opt.*out|unsubscribe|delete.*account/i.test(content)) {
      scores.rights += 10;
    }

    // Ensure scores stay within bounds
    Object.keys(scores).forEach(key => {
      if (key !== 'aggregate' && key !== 'confidence') {
        scores[key as keyof Scores] = Math.max(0, Math.min(100, scores[key as keyof Scores] as number));
      }
    });

    // Calculate aggregate score
    const aggregate = Math.round(
      Object.entries(scores)
        .filter(([key]) => key !== 'aggregate' && key !== 'confidence')
        .reduce((sum, [key, value]) => sum + (value as number) * this.scoringWeights[key], 0)
    );

    scores.aggregate = aggregate;
    scores.confidence = this.calculateConfidence(content);

    return scores;
  }

  private calculateConfidence(content: string): number {
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

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'simple-' + Math.abs(hash).toString(16);
  }
}