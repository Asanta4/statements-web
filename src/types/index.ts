export interface CheckData {
  checkNumber: string;
  checkName: string;
  reason?: string;
}

export interface BankStatementRow {
  date: string;
  description: string;
  debit: string;
  checkNumber: string;
  checkName?: string;
  reason?: string;
}

export interface ReasonMapping {
  searchTerm: string;
  reason: string;
}

export interface ProcessedCSV {
  headers: string[];
  rows: BankStatementRow[];
}

export interface ImageAnalysisResult {
  checkNumber: string;
  checkName: string;
  imageUrl: string;
  error?: string;
} 