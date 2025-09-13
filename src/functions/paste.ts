import { PasteTextParams, CopiedText } from '../types/index.js';
import { buildContextInfo, generateDiffInfo, ensureFileExists } from './utils.js';
import { readFileSync, writeFileSync } from 'fs';

export function handlePasteText(params: PasteTextParams, clipboard: CopiedText | null) {
  if (!clipboard) {
    return {
      content: [
        {
          type: 'text',
          text: '❌ No text in clipboard to paste'
        }
      ]
    };
  }

  try {
    // Ensure target file exists with at least one line
    ensureFileExists(params.targetFile);

    // Read the target file
    const fileContent = readFileSync(params.targetFile, 'utf8');
    const lines = fileContent.split(/\r?\n/);

    // Ensure we have enough lines - if file is empty, add empty lines
    while (lines.length < params.insertAtLine) {
      lines.push('');
    }

    // Get the target line (convert from 1-based to 0-based)
    const targetLineIndex = params.insertAtLine - 1;
    const targetLine = lines[targetLineIndex] || '';

    // Determine insertion position
    const insertPosition = params.insertAtPosition !== undefined 
      ? Math.min(params.insertAtPosition, targetLine.length)
      : targetLine.length;

    // Split the content to insert by lines
    const contentLines = clipboard.content.split(/\r?\n/);

    if (contentLines.length === 1) {
      // Single line insertion
      const newLine = targetLine.slice(0, insertPosition) + 
                     contentLines[0] + 
                     targetLine.slice(insertPosition);
      lines[targetLineIndex] = newLine;
    } else {
      // Multi-line insertion
      const firstPart = targetLine.slice(0, insertPosition);
      const lastPart = targetLine.slice(insertPosition);
      
      // Replace the target line with first part + first content line
      lines[targetLineIndex] = firstPart + contentLines[0];
      
      // Insert middle lines
      for (let i = 1; i < contentLines.length - 1; i++) {
        lines.splice(targetLineIndex + i, 0, contentLines[i]);
      }
      
      // Insert last content line + last part
      if (contentLines.length > 1) {
        lines.splice(targetLineIndex + contentLines.length - 1, 0, 
                    contentLines[contentLines.length - 1] + lastPart);
      }
    }

    // Write the modified content back to file
    const newContent = lines.join('\n');
    writeFileSync(params.targetFile, newContent, 'utf8');

    // Generate diff information
    const linesAdded = contentLines.length;
    const diffInfo = generateDiffInfo(params.targetFile, params.insertAtLine, linesAdded, 0);
    const sourceInfo = buildContextInfo(clipboard);
    const positionInfo = params.insertAtPosition !== undefined 
      ? ` at position ${params.insertAtPosition}` 
      : ' at end of line';
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully pasted content to ${params.targetFile} at line ${params.insertAtLine}${positionInfo}${sourceInfo}\n\n📝 Pasted ${clipboard.content.length} characters (${clipboard.content.split('\n').length} lines)\n\n${diffInfo}`
        }
      ]
    };

  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error pasting to file: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
}
