# GitHub Copilot MCP Text Manager - Usage Guide

## 🎯 Purpose
Efficient code movement with precise positioning. **Reduces token usage** by copying existing code instead of regenerating.

## ⚡ Quick Rules
1. **Read first** - Always check file contents before cutting
2. **Plan dependencies** - Ensure imports/base classes exist in target
3. **Test immediately** - Run code after each operation
4. **Use copy before cut** - Test moves safely first

## 🔧 Safe Workflow
```
1. READ → Understand source structure
2. PLAN → Check dependencies (imports, base classes)  
3. COPY → Test the move first
4. CUT/PASTE → Execute with precision
5. INDENT → Fix indentation if needed
6. TEST → Verify code still works
```

## 📐 Indentation Management
The tool supports **bidirectional indentation** with 4-space increments:

### Positive Values (Indent)
- `indents: 1` → Add 4 spaces
- `indents: 2` → Add 8 spaces  
- `indents: 3` → Add 12 spaces

### Negative Values (Unindent)
- `indents: -1` → Remove up to 4 spaces
- `indents: -2` → Remove up to 8 spaces
- `indents: -3` → Remove up to 12 spaces

### Smart Unindenting
- Won't remove more spaces than exist
- Preserves relative indentation within blocks
- Safely handles mixed indentation levels

## ⚠️ Avoid These Mistakes
- ❌ Moving classes without their base classes
- ❌ Cutting code that other functions depend on
- ❌ Leaving orphaned code fragments
- ❌ Not adding necessary import statements
- ❌ Ignoring indentation levels when moving code
- ❌ Using positive indents when you need to unindent
- ❌ Not checking relative indentation in nested blocks

## 🛠️ Emergency Recovery
```python
# See what was last moved
mcp_text-manager_get_clipboard_info()

# View operation history  
mcp_text-manager_get_copy_history()

# Paste back if needed
mcp_text-manager_paste_text(targetFile="file.py", insertAtLine=X)

# Fix indentation issues
mcp_text-manager_indent_text(file="file.py", startLine=X, endLine=Y, indents=1)
```

## 📋 Best Practice Examples

### Moving a Method
```python
# 1. Read the class to understand structure
# 2. Copy the complete method (including decorators)
# 3. Ensure target has necessary imports
# 4. Cut from source, paste to target
# 5. Test both files
```

### Moving a Class
```python
# 1. Check inheritance hierarchy
# 2. Ensure base classes exist in target
# 3. Copy first to test
# 4. Add imports to source if needed
# 5. Cut and paste with full class definition
```

### Fixing Indentation
```python
# Fix under-indented function
mcp_text-manager_indent_text(file="script.py", startLine=10, endLine=15, indents=1)

# Fix over-indented block  
mcp_text-manager_indent_text(file="script.py", startLine=20, endLine=25, indents=-2)

# Standardize mixed indentation
mcp_text-manager_indent_text(file="script.py", startLine=30, endLine=40, indents=-1)
```

### Code Reorganization with Indentation
```python
# 1. Copy function from nested class to top level
# 2. Paste at target location
# 3. Reduce indentation by 1 level (function was in class)
# 4. Add necessary imports
# 5. Test functionality
```

**Remember**: These tools save tokens by moving existing code. Use thoughtfully to avoid breaking dependencies!
