# 🚀 GitHub Release Guide

## Step-by-Step Release Process

### 1. Upload to GitHub (First Time)
```bash
cd "c:\Users\Administrator\Desktop\Important\Tests\Agent\mcp-copilot-text-manager"
git init
git add .
git commit -m "Initial commit: MCP Copilot Text Manager v1.0.1"
git branch -M main
git remote add origin https://github.com/MARS3256/copilot-text-manager-mcp.git
git push -u origin main
```

### 2. Create GitHub Release (Web Interface)

#### Option A: Using GitHub Web Interface
1. Go to your repository: `https://github.com/MARS3256/copilot-text-manager-mcp`
2. Click **"Releases"** on the right sidebar
3. Click **"Create a new release"**
4. Fill in the form:
   - **Tag version**: `v1.0.1`
   - **Release title**: `MCP Copilot Text Manager v1.0.1`
   - **Description**:
     ```markdown
     ## 🎯 First Stable Release
     
     Token-efficient copy/cut/paste tools for GitHub Copilot agents.
     
     ### ✨ Features
     - ✅ Precise copy/cut/paste with character-level positioning
     - ✅ Source file tracking with GitHub-style diffs
     - ✅ Clipboard history management
     - ✅ Token-efficient code movement (no regeneration needed)
     - ✅ Error recovery tools
     
     ### 📦 Installation
     1. Download the release
     2. Extract to your preferred directory
     3. Add to VS Code MCP config:
        ```json
        {
          "servers": {
            "text-manager": {
              "command": "node", 
              "args": ["path/to/build/index.js"]
            }
          }
        }
        ```
     4. Restart VS Code
     5. Use with ` copy`, ` cut`, ` paste`
     
     ### 🐛 Known Issues
     - None reported
     
     ### 👤 Author
     MARS3256
     ```
5. Check **"Set as the latest release"**
6. Click **"Publish release"**

#### Option B: Using Command Line
```bash
# Create and push tag
git tag -a v1.0.1 -m "Release v1.0.1: Core copy/cut/paste functionality"
git push origin v1.0.1

# Then go to GitHub web interface to create release from tag
```

### 3. Attach Release Assets (Optional)
You can attach these files to the release:
- `mcp-copilot-text-manager-v1.0.1.zip` (entire repository)
- `build/` folder as `mcp-server-v1.0.1.zip` (ready-to-use server)

### 4. Future Release Process

#### For version 1.0.2:
```bash
# Update version in src/package.json
# Build new version
cd src
npm run build
cp -r dist/* ../build/

# Commit changes
git add .
git commit -m "Release v1.0.2: [describe changes]"
git push

# Create release
git tag -a v1.0.2 -m "Release v1.0.2: [describe changes]"
git push origin v1.0.2

# Create GitHub release via web interface
```

## 📋 Release Checklist

Before creating a release:
- [ ] Version number updated in `package.json`
- [ ] Code built successfully (`npm run build`)
- [ ] Build files copied to `/build/` directory  
- [ ] Tests pass with sample files
- [ ] README.md updated with new version info
- [ ] CHANGELOG.md created (optional)
- [ ] All changes committed and pushed

## 🎯 Release Naming Convention

- **Stable releases**: `v1.0.1`, `v1.0.2`, `v1.1.0`
- **Beta releases**: `v1.1.0-beta`, `v2.0.0-beta`
- **Release candidates**: `v1.1.0-rc1`, `v1.1.0-rc2`

## 📊 Release Visibility

Your releases will appear:
- ✅ On the right sidebar of your GitHub repo
- ✅ In the "Releases" tab
- ✅ Available for download as ZIP files
- ✅ Discoverable through GitHub search
- ✅ Listed in GitHub's dependency graphs

## 🔗 Useful Links

- **Repository**: https://github.com/MARS3256/copilot-text-manager-mcp
- **Releases**: https://github.com/MARS3256/copilot-text-manager-mcp/releases
- **Issues**: https://github.com/MARS3256/copilot-text-manager-mcp/issues

Now you're ready to create professional GitHub releases! 🚀
