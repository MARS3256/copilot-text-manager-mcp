import { CutTextParams } from '../types/index.js';
import { generateDiffInfo } from './utils.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';

export function removeTextFromFile(params: CutTextParams): string {
  if (!existsSync(params.sourceFile)) {
    throw new Error(`Source file does not exist: ${params.sourceFile}`);
  }

  const fileContent = readFileSync(params.sourceFile, 'utf8');
  // Handle both Windows (\r\n) and Unix (\n) line endings
  const lines = fileContent.split(/\r?\n/);

  const startIdx = params.startLine - 1;
  const endIdx = params.endLine - 1;
  const startPos = params.startPosition || 0;
  const endPos = params.endPosition;

  if (startIdx < 0 || startIdx >= lines.length || endIdx < 0 || endIdx >= lines.length) {
    throw new Error(`Invalid line range: ${params.startLine}-${params.endLine}. File has ${lines.length} lines.`);
  }

  if (startIdx > endIdx) {
    throw new Error(`Start line ${params.startLine} cannot be greater than end line ${params.endLine}`);
  }

  let linesRemoved = 0;

  if (startIdx === endIdx) {
    // Single line removal
    const line = lines[startIdx];
    const actualEndPos = endPos !== undefined ? endPos : line.length;
    
    if (startPos >= line.length) {
      throw new Error(`Start position ${startPos} is beyond line length ${line.length}`);
    }
    
    const removedText = line.slice(startPos, actualEndPos);
    const newLine = line.slice(0, startPos) + line.slice(actualEndPos);
    lines[startIdx] = newLine;
    
    // For single line cuts, report characters removed
    linesRemoved = removedText.includes('\n') ? removedText.split('\n').length - 1 : 0;
  } else {
    // Multi-line removal
    const firstLine = lines[startIdx];
    const lastLine = lines[endIdx];
    const actualEndPos = endPos !== undefined ? endPos : lastLine.length;
    
    const newLine = firstLine.slice(0, startPos) + lastLine.slice(actualEndPos);
    lines[startIdx] = newLine;
    
    // Remove lines in between and the last line
    linesRemoved = endIdx - startIdx;
    lines.splice(startIdx + 1, linesRemoved);
  }

  // Write back to file using proper newlines
  const newContent = lines.join('\n');
  writeFileSync(params.sourceFile, newContent, 'utf8');

  return generateDiffInfo(params.sourceFile, params.startLine, 0, linesRemoved);
}
