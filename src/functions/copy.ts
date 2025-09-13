import { CopyTextParams, CopiedText } from '../types/index.js';
import { buildContextInfo, buildPositionInfo } from './utils.js';

export function handleCopyText(params: CopyTextParams, addToHistory: (item: CopiedText) => CopiedText) {
  const copiedItem: CopiedText = {
    content: params.text,
    sourceFile: params.sourceFile,
    startLine: params.startLine,
    endLine: params.endLine,
    copiedAt: new Date()
  };

  // Add to history and set as current clipboard
  const currentClipboard = addToHistory(copiedItem);

  const contextInfo = buildContextInfo(copiedItem);
  const positionInfo = buildPositionInfo(params.startLine, params.startPosition, params.endLine, params.endPosition);
  
  return {
    content: [
      {
        type: 'text',
        text: `✅ Text copied to clipboard (${params.text.length} characters)${contextInfo}${positionInfo}`
      }
    ]
  };
}
