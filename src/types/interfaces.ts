// Interface definitions for MCP text manager

export interface CopiedText {
  content: string;
  sourceFile?: string;
  startLine?: number;
  endLine?: number;
  copiedAt: Date;
}

export interface CopyTextParams {
  text: string;
  sourceFile: string;
  startLine: number;
  startPosition?: number;
  endLine: number;
  endPosition?: number;
}

export interface CutTextParams {
  text: string;
  sourceFile: string;
  startLine: number;
  startPosition?: number;
  endLine: number;
  endPosition?: number;
}

export interface PasteTextParams {
  targetFile: string;
  insertAtLine: number;
  insertAtPosition?: number;
}

export interface IndentTextParams {
  indents: number;
  startLine: number;
  endLine: number;
  file: string;
}