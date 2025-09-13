import { CutTextParams, CopiedText } from '../types/index.js';
import { buildContextInfo, buildPositionInfo } from './utils.js';

export function handleCutText(params: CutTextParams, addToHistory: (item: CopiedText) => CopiedText, removeTextFromFile: (params: CutTextParams) => string) {
  try {
    // First copy to clipboard
    const cutItem: CopiedText = {
      content: params.text,
      sourceFile: params.sourceFile,
      startLine: params.startLine,
      endLine: params.endLine,
      copiedAt: new Date()
    };

    // Add to history and set as current clipboard
    addToHistory(cutItem);

    // Then remove from source file
    const diffInfo = removeTextFromFile(params);
    const contextInfo = buildContextInfo(cutItem);
    const positionInfo = buildPositionInfo(params.startLine, params.startPosition, params.endLine, params.endPosition);
    
    return {
      content: [
        {
          type: 'text',
          text: `✂️ Text cut from ${params.sourceFile} (${params.text.length} characters)${contextInfo}${positionInfo}\n\n${diffInfo}`
        }
      ]
    };

  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error cutting from file: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
}
