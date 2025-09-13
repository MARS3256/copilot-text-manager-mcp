import { IndentTextParams } from '../types/index.js';
import { generateDiffInfo } from './utils.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';

export function handleIndentText(params: IndentTextParams) {
  try {
    // Validate parameters - allow negative values for unindenting
    if (params.startLine < 1 || params.endLine < 1) {
      throw new Error('Line numbers must be 1-based (greater than 0)');
    }
    
    if (params.startLine > params.endLine) {
      throw new Error('Start line must be less than or equal to end line');
    }

    // Check if file exists
    if (!existsSync(params.file)) {
      throw new Error(`File does not exist: ${params.file}`);
    }

    // Read the file
    const fileContent = readFileSync(params.file, 'utf8');
    const lines = fileContent.split(/\r?\n/);

    // Validate line numbers
    if (params.startLine > lines.length || params.endLine > lines.length) {
      throw new Error(`Line numbers exceed file length (${lines.length} lines)`);
    }

    // Handle both indentation (positive) and unindentation (negative)
    if (params.indents >= 0) {
      // Indenting: add spaces
      const indentString = '    '.repeat(params.indents);
      for (let i = params.startLine - 1; i <= params.endLine - 1; i++) {
        lines[i] = indentString + lines[i];
      }
    } else {
      // Unindenting: remove spaces
      const spacesToRemove = Math.abs(params.indents) * 4;
      for (let i = params.startLine - 1; i <= params.endLine - 1; i++) {
        let line = lines[i];
        let removedSpaces = 0;
        
        // Remove leading spaces up to the specified amount
        while (removedSpaces < spacesToRemove && line.startsWith(' ')) {
          line = line.substring(1);
          removedSpaces++;
        }
        
        lines[i] = line;
      }
    }

    // Write the modified content back to file
    const newContent = lines.join('\n');
    writeFileSync(params.file, newContent, 'utf8');

    // Calculate affected lines
    const linesAffected = params.endLine - params.startLine + 1;
    const rangeText = params.startLine === params.endLine 
      ? `line ${params.startLine}` 
      : `lines ${params.startLine}-${params.endLine}`;

    // Generate diff information
    const diffInfo = generateDiffInfo(params.file, params.startLine, 0, linesAffected);

    // Generate success message based on operation type
    const operation = params.indents >= 0 ? 'indented' : 'unindented';
    const levelText = Math.abs(params.indents) === 1 ? 'level' : 'levels';
    const spaceText = params.indents >= 0 
      ? `(${params.indents * 4} spaces)` 
      : `(up to ${Math.abs(params.indents) * 4} spaces)`;

    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully ${operation} ${rangeText} by ${Math.abs(params.indents)} ${levelText} ${spaceText} in ${params.file}\n\n📝 Modified ${linesAffected} line${linesAffected !== 1 ? 's' : ''}\n\n${diffInfo}`
        }
      ]
    };

  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error indenting lines: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
}