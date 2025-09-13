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
5. TEST → Verify code still works
```

## ⚠️ Avoid These Mistakes
- ❌ Moving classes without their base classes
- ❌ Cutting code that other functions depend on
- ❌ Leaving orphaned code fragments
- ❌ Not adding necessary import statements

## 🛠️ Emergency Recovery
```python
# See what was last moved
mcp_text-manager_get_clipboard_info()

# View operation history  
mcp_text-manager_get_copy_history()

# Paste back if needed
mcp_text-manager_paste_text(targetFile="file.py", insertAtLine=X)
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

**Remember**: These tools save tokens by moving existing code. Use thoughtfully to avoid breaking dependencies!
