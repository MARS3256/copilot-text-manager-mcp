import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { CopiedText, CopyTextParams, CutTextParams, PasteTextParams, IndentTextParams } from '../types/index.js';

// Common utility functions
export function buildContextInfo(item: CopiedText): string {
  let info = `\\n🕒 ${item.copiedAt.toISOString()}`;
  
  if (item.sourceFile) {
    info += `\\n📁 Source: ${item.sourceFile}`;
    
    if (item.startLine !== undefined) {
      if (item.endLine !== undefined && item.endLine !== item.startLine) {
        info += ` (lines ${item.startLine}-${item.endLine})`;
      } else {
        info += ` (line ${item.startLine})`;
      }
    }
  }
  
  return info;
}

export function buildPositionInfo(startLine: number, startPos: number | undefined, endLine: number, endPos: number | undefined): string {
  let info = '';
  if (startPos !== undefined || endPos !== undefined) {
    info += `\\n📍 Position: `;
    if (startLine === endLine) {
      info += `line ${startLine}, chars ${startPos || 0}-${endPos || 'end'}`;
    } else {
      info += `${startLine}:${startPos || 0} to ${endLine}:${endPos || 'end'}`;
    }
  }
  return info;
}

export function generateDiffInfo(filePath: string, lineNumber: number, linesAdded: number, linesRemoved: number): string {
  const fileName = filePath.split(/[\\\\/]/).pop() || filePath;
  let diffText = '';

  if (linesAdded > 0 && linesRemoved > 0) {
    diffText = `📊 \`${fileName}\` +${linesAdded} -${linesRemoved}`;
  } else if (linesAdded > 0) {
    diffText = `📊 \`${fileName}\` +${linesAdded}`;
  } else if (linesRemoved > 0) {
    diffText = `📊 \`${fileName}\` -${linesRemoved}`;
  }

  // Add clickable diff link (GitHub Copilot style)
  if (diffText) {
    diffText += `\\n\\n[📝 View changes in ${fileName}](vscode://file/${filePath}:${lineNumber})`;
  }

  return diffText;
}

export function ensureFileExists(filePath: string): void {
  if (!existsSync(filePath)) {
    // Create directory if it doesn't exist
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    // Create empty file with at least one line to allow pasting
    writeFileSync(filePath, '\\n', 'utf8');
  }
}
