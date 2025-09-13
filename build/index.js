#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname } from 'path';
import { mkdirSync } from 'fs';
class TextManagerMCP {
    clipboard = null;
    history = [];
    maxHistorySize = 50;
    constructor() {
        this.setupServer();
    }
    setupServer() {
        const server = new Server({
            name: 'copilot-text-manager',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
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
        server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'copy_text':
                        return this.handleCopyText(args);
                    case 'cut_text':
                        return this.handleCutText(args);
                    case 'paste_text':
                        return this.handlePasteText(args);
                    case 'get_clipboard_info':
                        return this.handleGetClipboardInfo();
                    case 'get_copy_history':
                        return this.handleGetCopyHistory(args);
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                throw new McpError(ErrorCode.InternalError, `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
        // Start the server
        const transport = new StdioServerTransport();
        server.connect(transport);
    }
    handleCopyText(params) {
        const copiedItem = {
            content: params.text,
            sourceFile: params.sourceFile,
            startLine: params.startLine,
            endLine: params.endLine,
            copiedAt: new Date()
        };
        this.clipboard = copiedItem;
        this.addToHistory(copiedItem);
        const contextInfo = this.buildContextInfo(copiedItem);
        const positionInfo = this.buildPositionInfo(params.startLine, params.startPosition, params.endLine, params.endPosition);
        return {
            content: [
                {
                    type: 'text',
                    text: `✅ Text copied to clipboard (${params.text.length} characters)${contextInfo}${positionInfo}`
                }
            ]
        };
    }
    handleCutText(params) {
        try {
            // First copy to clipboard
            const cutItem = {
                content: params.text,
                sourceFile: params.sourceFile,
                startLine: params.startLine,
                endLine: params.endLine,
                copiedAt: new Date()
            };
            this.clipboard = cutItem;
            this.addToHistory(cutItem);
            // Then remove from source file
            const diffInfo = this.removeTextFromFile(params);
            const contextInfo = this.buildContextInfo(cutItem);
            const positionInfo = this.buildPositionInfo(params.startLine, params.startPosition, params.endLine, params.endPosition);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✂️ Text cut from ${params.sourceFile} (${params.text.length} characters)${contextInfo}${positionInfo}\n\n${diffInfo}`
                    }
                ]
            };
        }
        catch (error) {
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
    handlePasteText(params) {
        if (!this.clipboard) {
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
            // Ensure target file exists or create it
            if (!existsSync(params.targetFile)) {
                // Create directory if it doesn't exist
                const dir = dirname(params.targetFile);
                if (!existsSync(dir)) {
                    mkdirSync(dir, { recursive: true });
                }
                // Create empty file
                writeFileSync(params.targetFile, '', 'utf8');
            }
            // Read the target file
            const fileContent = readFileSync(params.targetFile, 'utf8');
            const lines = fileContent.split(/\r?\n/);
            // Ensure we have enough lines
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
            const contentLines = this.clipboard.content.split(/\r?\n/);
            if (contentLines.length === 1) {
                // Single line insertion
                const newLine = targetLine.slice(0, insertPosition) +
                    contentLines[0] +
                    targetLine.slice(insertPosition);
                lines[targetLineIndex] = newLine;
            }
            else {
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
                    lines.splice(targetLineIndex + contentLines.length - 1, 0, contentLines[contentLines.length - 1] + lastPart);
                }
            }
            // Write the modified content back to file
            const newContent = lines.join('\n');
            writeFileSync(params.targetFile, newContent, 'utf8');
            // Generate diff information
            const linesAdded = contentLines.length;
            const diffInfo = this.generateDiffInfo(params.targetFile, params.insertAtLine, linesAdded, 0);
            const sourceInfo = this.buildContextInfo(this.clipboard);
            const positionInfo = params.insertAtPosition !== undefined
                ? ` at position ${params.insertAtPosition}`
                : ' at end of line';
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Successfully pasted content to ${params.targetFile} at line ${params.insertAtLine}${positionInfo}${sourceInfo}\n\n📝 Pasted ${this.clipboard.content.length} characters (${this.clipboard.content.split('\n').length} lines)\n\n${diffInfo}`
                    }
                ]
            };
        }
        catch (error) {
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
    handleGetClipboardInfo() {
        if (!this.clipboard) {
            return {
                content: [
                    {
                        type: 'text',
                        text: '📋 Clipboard is empty'
                    }
                ]
            };
        }
        const contextInfo = this.buildContextInfo(this.clipboard);
        const preview = this.clipboard.content.length > 100
            ? `${this.clipboard.content.substring(0, 100)}...`
            : this.clipboard.content;
        return {
            content: [
                {
                    type: 'text',
                    text: `📋 Clipboard info:${contextInfo}\\n\\n📝 Content preview (${this.clipboard.content.length} characters):\\n\`\`\`\\n${preview}\\n\`\`\``
                }
            ]
        };
    }
    handleGetCopyHistory(params) {
        const limit = Math.min(params.limit || 10, this.maxHistorySize);
        const recentItems = this.history.slice(-limit).reverse();
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
            const contextInfo = this.buildContextInfo(item);
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
    addToHistory(item) {
        this.history.push(item);
        // Keep history size manageable
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }
    buildContextInfo(item) {
        let info = `\\n🕒 ${item.copiedAt.toISOString()}`;
        if (item.sourceFile) {
            info += `\\n📁 Source: ${item.sourceFile}`;
            if (item.startLine !== undefined) {
                if (item.endLine !== undefined && item.endLine !== item.startLine) {
                    info += ` (lines ${item.startLine}-${item.endLine})`;
                }
                else {
                    info += ` (line ${item.startLine})`;
                }
            }
        }
        return info;
    }
    buildPositionInfo(startLine, startPos, endLine, endPos) {
        let info = '';
        if (startPos !== undefined || endPos !== undefined) {
            info += `\\n📍 Position: `;
            if (startLine === endLine) {
                info += `line ${startLine}, chars ${startPos || 0}-${endPos || 'end'}`;
            }
            else {
                info += `${startLine}:${startPos || 0} to ${endLine}:${endPos || 'end'}`;
            }
        }
        return info;
    }
    removeTextFromFile(params) {
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
        }
        else {
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
        return this.generateDiffInfo(params.sourceFile, params.startLine, 0, linesRemoved);
    }
    generateDiffInfo(filePath, lineNumber, linesAdded, linesRemoved) {
        const fileName = filePath.split(/[\\\\/]/).pop() || filePath;
        let diffText = '';
        if (linesAdded > 0 && linesRemoved > 0) {
            diffText = `📊 \`${fileName}\` +${linesAdded} -${linesRemoved}`;
        }
        else if (linesAdded > 0) {
            diffText = `📊 \`${fileName}\` +${linesAdded}`;
        }
        else if (linesRemoved > 0) {
            diffText = `📊 \`${fileName}\` -${linesRemoved}`;
        }
        // Add clickable diff link (GitHub Copilot style)
        if (diffText) {
            diffText += `\\n\\n[📝 View changes in ${fileName}](vscode://file/${filePath}:${lineNumber})`;
        }
        return diffText;
    }
}
// Start the MCP server
new TextManagerMCP();
//# sourceMappingURL=index.js.map