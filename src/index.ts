#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

// Import types
import { CopiedText, CopyTextParams, CutTextParams, PasteTextParams, IndentTextParams } from './types/index.js';

// Import function handlers
import { handleCopyText } from './functions/copy.js';
import { handleCutText } from './functions/cut.js';
import { handlePasteText } from './functions/paste.js';
import { handleIndentText } from './functions/indent.js';
import { handleGetClipboardInfo, handleGetCopyHistory } from './functions/history.js';
import { removeTextFromFile } from './functions/fileOperations.js';

class TextManagerMCP {
  private clipboard: CopiedText | null = null;
  private history: CopiedText[] = [];
  private readonly maxHistorySize = 50;

  constructor() {
    this.setupServer();
  }

  private setupServer() {
    const server = new Server(
      {
        name: 'copilot-text-manager',
        version: '1.0.1',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // List available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'copy_text',
            description: 'Copy text to clipboard with source file context for GitHub Copilot agents. Preserves file path and line numbers for better context tracking.',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: 'The text content to copy'
                },
                sourceFile: {
                  type: 'string',
                  description: 'Source file path where the text came from (required)'
                },
                startLine: {
                  type: 'number',
                  description: 'Starting line number in the source file (required, 1-based)'
                },
                startPosition: {
                  type: 'number',
                  description: 'Starting character position in the start line (optional, 0-based, default: 0)'
                },
                endLine: {
                  type: 'number',
                  description: 'Ending line number in the source file (required, 1-based)'
                },
                endPosition: {
                  type: 'number',
                  description: 'Ending character position in the end line (optional, 0-based, default: end of line)'
                }
              },
              required: ['text', 'sourceFile', 'startLine', 'endLine']
            }
          },
          {
            name: 'cut_text',
            description: 'Cut text from source file and copy to clipboard. Removes text from source and tracks context for GitHub Copilot agents.',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: 'The text content to cut'
                },
                sourceFile: {
                  type: 'string',
                  description: 'Source file path where the text will be removed from (required)'
                },
                startLine: {
                  type: 'number',
                  description: 'Starting line number in the source file (required, 1-based)'
                },
                startPosition: {
                  type: 'number',
                  description: 'Starting character position in the start line (optional, 0-based, default: 0)'
                },
                endLine: {
                  type: 'number',
                  description: 'Ending line number in the source file (required, 1-based)'
                },
                endPosition: {
                  type: 'number',
                  description: 'Ending character position in the end line (optional, 0-based, default: end of line)'
                }
              },
              required: ['text', 'sourceFile', 'startLine', 'endLine']
            }
          },
          {
            name: 'paste_text',
            description: 'Paste the last copied/cut text directly into a file at specified location. Modifies the target file.',
            inputSchema: {
              type: 'object',
              properties: {
                targetFile: {
                  type: 'string',
                  description: 'Target file path where text will be pasted (required)'
                },
                insertAtLine: {
                  type: 'number',
                  description: 'Line number where text will be inserted (required, 1-based)'
                },
                insertAtPosition: {
                  type: 'number',
                  description: 'Character position within the line where text will be inserted (optional, 0-based, default: end of line)'
                }
              },
              required: ['targetFile', 'insertAtLine']
            }
          },
          {
            name: 'indent_text',
            description: 'Add or remove indentation levels (4 spaces each) from lines in a file. Supports both indenting (positive values) and unindenting (negative values). Can process single line or line ranges.',
            inputSchema: {
              type: 'object',
              properties: {
                indents: {
                  type: 'number',
                  description: 'Number of indentation levels to add (positive) or remove (negative). Each level equals 4 spaces. Use negative values like -2 to unindent by 2 levels.'
                },
                startLine: {
                  type: 'number',
                  description: 'Starting line number to indent (required, 1-based)'
                },
                endLine: {
                  type: 'number',
                  description: 'Ending line number to indent (required, 1-based)'
                },
                file: {
                  type: 'string',
                  description: 'File path where lines will be indented (required)'
                }
              },
              required: ['indents', 'startLine', 'endLine', 'file']
            }
          },
          {
            name: 'get_clipboard_info',
            description: 'Get information about the current clipboard content without pasting it. Shows source file context.',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'get_copy_history',
            description: 'Get the history of copied/cut text items for GitHub Copilot agents. Useful for accessing previously copied code.',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of history items to return (default: 10)'
                }
              }
            }
          }
        ]
      };
    });

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'copy_text':
            return handleCopyText(args as unknown as CopyTextParams, this.addToHistory.bind(this));
          
          case 'cut_text':
            return handleCutText(args as unknown as CutTextParams, this.addToHistory.bind(this), removeTextFromFile);
          
          case 'paste_text':
            return handlePasteText(args as unknown as PasteTextParams, this.clipboard);
          
          case 'indent_text':
            return handleIndentText(args as unknown as IndentTextParams);
          
          case 'get_clipboard_info':
            return handleGetClipboardInfo(this.clipboard);
          
          case 'get_copy_history':
            return handleGetCopyHistory(this.history, args as unknown as { limit?: number });
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });

    // Start the server
    const transport = new StdioServerTransport();
    server.connect(transport);
  }

  private addToHistory(item: CopiedText): CopiedText {
    this.clipboard = item;
    this.history.push(item);
    
    // Keep history size manageable
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
    
    return item;
  }
}

// Start the MCP server
new TextManagerMCP();
