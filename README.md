# MCP Copilot Text Manager

**Beta** - Efficient copy/cut/paste tools for GitHub Copilot agents. Reduces token usage by moving existing code instead of regenerating it.

## Features
- 📋 **Copy** text with source tracking
- ✂️ **Cut** text with precise positioning  
- 📝 **Paste** directly into files
- 🔢 **Indent/Unindent** lines with customizable spacing (supports negative values for unindenting)
- 📚 **History** of all operations
- 🎯 **Character-level precision**

## Installation

### 1. Download the release build or manually build the MCP Server
```bash
cd src
npm install
npm run build
```

### 2. Configure VS Code
Copy the build folder to your project. 

`Ctrl+Shift+P` -> `MCP: Open User Configuration`

Add to your MCP settings (`mcp.json`):
```json
{
  "servers": {
    "text-manager": {
      "command": "node",
      "args": ["C:/path/to/mcp-copilot-text-manager/src/dist/index.js"],
      "cwd": "C:/path/to/mcp-copilot-text-manager/src"
    }
  }
}
```

### 3. Restart VS Code
`Ctrl+Shift+P` -> `Reload Window`

The tools will be available as `@agent copy`, `@agent cut`, `@agent paste`, `@agent indent` in GitHub Copilot Chat.

## Usage
```
@agent copy the Dog class from sauce.py
@agent cut lines 10-25 from target.py  
@agent paste the copied code to line 50 in main.py
@agent indent lines 15-20 by 2 levels in main.py
@agent indent lines 5-8 by -3 levels in test.py  # Unindent by 3 levels
```

**Note**: Line changes are not visually highlighted in GitHub Copilot Chat like they are in VS Code. To see the actual file modifications, use git version control commands (`git diff`, `git status`) to track changes. The affected line numbers are displayed in the command output for reference.

*Visual diff highlighting in Copilot Chat is planned for a future release.*

## Why Use This?
- **Token Efficient**: Move code instead of regenerating
- **Preserves Context**: Tracks source file and line numbers
- **Precise**: Character-level positioning for surgical edits
- **Safe**: Maintains clipboard history for recovery

## Contributing

### Branching Strategy
- `main` - stable releases
- `develop` - active development
- `feature/*` - new features
- `hotfix/*` - urgent fixes

### Pull Request Process
1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add: your feature"`
4. Push branch: `git push origin feature/your-feature`
5. Open PR with description of changes


## License
MIT License - See [LICENSE](./LICENSE) file for details.

**Attribution Required**: You may use and modify this software, but must retain the original author attribution in all copies and derivatives.

---
🚧 **Beta Status**: Core functionality complete. Report issues on GitHub.
