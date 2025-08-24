export interface SummaryItem {
  id: string;
  text: string;
  evidence?: number[][];
}

export interface RedFlag {
  id: string;
  title: string;
  severity: number;
  evidence: string;
  whatItMeans: string;
}

export interface Scores {
  collection: number;
  sharingSelling: number;
  rights: number;
  retention: number;
  dispute: number;
  license: number;
  tracking: number;
  children: number;
  security: number;
  aggregate: number;
  confidence: number;
}

export interface AnalysisResult {
  url: string;
  retrievedAt: string;
  contentHash: string;
  language: string;
  summary: SummaryItem[];
  redFlags?: RedFlag[];
  scores: Scores;
}

export interface PolicyContent {
  isPolicyPage: boolean;
  content?: string;
  title?: string;
  extractedAt: string;
}