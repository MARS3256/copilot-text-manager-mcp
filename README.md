# MCP Copilot Text Manager

**Beta** - Efficient copy/cut/paste tools for GitHub Copilot agents. Reduces token usage by moving existing code instead of regenerating it.

## Features
- 📋 **Copy** text with source tracking
- ✂️ **Cut** text with precise positioning  
- 📝 **Paste** directly into files
- � **Indent** lines with customizable spacing
- �📚 **History** of all operations
- 🎯 **Character-level precision**

## Installation

### 1. Build the MCP Server
```bash
cd src
npm install
npm run build
```

### 2. Configure VS Code
Add to your MCP settings (`mcp.json`):
```json
{
  "servers": {
    "text-manager": {
      "command": "node",
      "args": ["C:/path/to/mcp-copilot-text-manager/build/index.js"]
    }
  }
}
```

### 3. Restart VS Code
The tools will be available as ` copy`, ` cut`, ` paste` in GitHub Copilot Chat.

## Usage
```
 copy the Dog class from sauce.py
 cut lines 10-25 from target.py  
 @agent paste the copied code to line 50 in main.py
@agent indent lines 15-20 by 2 levels in main.py
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

## Upload Instructions

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit: MCP Copilot Text Manager v1.0.1"
git branch -M main
git remote add origin https://github.com/MARS3256/copilot-text-manager-mcp.git
git push -u origin main
```

### Creating Releases
```bash
git tag -a v1.0.1 -m "Release v1.0.1: Core copy/cut/paste functionality"
git push origin v1.0.1
```

## License
MIT License - See [LICENSE](./LICENSE) file for details.

**Attribution Required**: You may use and modify this software, but must retain the original author attribution in all copies and derivatives.

---
🚧 **Beta Status**: Core functionality complete. Report issues on GitHub.
