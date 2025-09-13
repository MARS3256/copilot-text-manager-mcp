import { CopiedText } from '../types/index.js';
import { buildContextInfo } from './utils.js';

export function handleGetClipboardInfo(clipboard: CopiedText | null) {
  if (!clipboard) {
    return {
      content: [
        {
          type: 'text',
          text: '📋 Clipboard is empty'
        }
      ]
    };
  }

  const contextInfo = buildContextInfo(clipboard);
  const preview = clipboard.content.length > 100 
    ? `${clipboard.content.substring(0, 100)}...` 
    : clipboard.content;
  
  return {
    content: [
      {
        type: 'text',
        text: `📋 Clipboard info:${contextInfo}\\n\\n📝 Content preview (${clipboard.content.length} characters):\\n\`\`\`\\n${preview}\\n\`\`\``
      }
    ]
  };
}

export function handleGetCopyHistory(history: CopiedText[], params: { limit?: number }) {
  const maxHistorySize = 50;
  const limit = Math.min(params.limit || 10, maxHistorySize);
  const recentItems = history.slice(-limit).reverse();

  if (recentItems.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: '📚 Copy history is empty'
        }
      ]
    };
  }

  const historyText = recentItems.map((item, index) => {
    const contextInfo = buildContextInfo(item);
    const preview = item.content.length > 50 
      ? `${item.content.substring(0, 50)}...` 
      : item.content;
    
    return `${index + 1}. ${contextInfo}\\n   Preview: \`${preview.replace(/\\n/g, '\\\\n')}\``;
  }).join('\\n\\n');

  return {
    content: [
      {
        type: 'text',
        text: `📚 Copy History (${recentItems.length} items):\\n\\n${historyText}`
      }
    ]
  };
}
