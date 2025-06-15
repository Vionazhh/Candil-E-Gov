#!/usr/bin/env node

/**
 * Enhanced Unused Code Detector with Detailed Tracing
 * 
 * This script helps detect and report potentially unused code with detailed tracing information
 * to help you verify whether code is actually unused before deletion.
 * 
 * Usage:
 * node scripts/cleanup-unused.js [--remove] [--dir=path/to/scan] [--detailed] [--export-report]
 * 
 * Options:
 * --remove         Actually delete unused files (be careful!)
 * --dir=path       Specify a directory to scan (default: entire project)
 * --detailed       Show detailed tracing information
 * --export-report  Export detailed report to JSON file
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

// Configuration
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const IGNORE_DIRS = ['node_modules', '.git', '.expo', 'build', 'dist', '.vscode', 'coverage'];
const IGNORE_FILES = ['.eslintrc', 'babel.config.js', 'metro.config.js', 'app.json', 'eas.json'];

// Entry point patterns - files that are likely entry points
const ENTRY_POINT_PATTERNS = [
  /\/index\.(ts|tsx|js|jsx)$/,
  /_layout\.(ts|tsx|js|jsx)$/,
  /\/App\.(ts|tsx|js|jsx)$/,
  /app\.json$/,
  /main\.(ts|tsx|js|jsx)$/,
  /\.config\.(ts|js)$/,
  /\.test\.(ts|tsx|js|jsx)$/,
  /\.spec\.(ts|tsx|js|jsx)$/
];

// Parse command line arguments
const args = process.argv.slice(2);
const shouldRemove = args.includes('--remove');
const showDetailed = args.includes('--detailed');
const exportReport = args.includes('--export-report');
const dirArg = args.find(arg => arg.startsWith('--dir='));
const rootDir = dirArg ? dirArg.split('=')[1] : process.cwd();

// Enhanced tracking collections
const analysis = {
  files: new Map(),           // path -> { content, exports, imports, functions, components }
  fileUsage: new Map(),       // file -> { importedBy: Set, references: [] }
  exportUsage: new Map(),     // exportName -> { definedIn: [], usedIn: [] }
  componentUsage: new Map(),  // componentName -> { definedIn: [], usedInJSX: [] }
  functionUsage: new Map(),   // functionName -> { definedIn: [], calledIn: [] }
  unusedFiles: [],
  unusedExports: [],
  unusedComponents: [],
  unusedFunctions: []
};

// Statistics
let stats = {
  filesScanned: 0,
  potentiallyUnusedFiles: 0,
  potentiallyUnusedComponents: 0,
  potentiallyUnusedExports: 0,
  potentiallyUnusedFunctions: 0
};

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m', 
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

/**
 * Main execution function
 */
async function main() {
  console.log(`${colors.cyan}=== Enhanced Unused Code Detector ===${colors.reset}`);
  console.log(`Scanning directory: ${colors.yellow}${rootDir}${colors.reset}`);
  console.log(`Detailed mode: ${showDetailed ? colors.green + 'ON' : colors.red + 'OFF'}${colors.reset}`);
  
  // Step 1: Collect and analyze all files
  await collectAndAnalyzeFiles(rootDir);
  console.log(`\n${colors.blue}Files scanned: ${stats.filesScanned}${colors.reset}`);
  
  // Step 2: Build usage maps
  await buildUsageMaps();
  
  // Step 3: Find unused code with tracing
  await findUnusedCode();
  
  // Step 4: Generate detailed report
  generateDetailedReport();
  
  // Step 5: Export report if requested
  if (exportReport) {
    exportDetailedReport();
  }
}

/**
 * Collect files and perform initial analysis
 */
async function collectAndAnalyzeFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.includes(entry.name)) continue;
      await collectAndAnalyzeFiles(fullPath);
      continue;
    }
    
    const ext = path.extname(entry.name).toLowerCase();
    if (!EXTENSIONS.includes(ext) || IGNORE_FILES.includes(entry.name)) continue;
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const relativePath = path.relative(rootDir, fullPath);
      
      // Analyze file content
      const fileAnalysis = {
        path: fullPath,
        relativePath: relativePath,
        content: content,
        exports: extractExportsWithDetails(fullPath, content),
        imports: extractImportsWithDetails(fullPath, content),
        functions: extractFunctionsWithDetails(fullPath, content),
        components: extractComponentsWithDetails(fullPath, content),
        jsxUsage: extractJSXUsage(content),
        isEntryPoint: isEntryPoint(fullPath),
        size: content.length,
        lines: content.split('\n').length
      };
      
      analysis.files.set(fullPath, fileAnalysis);
      stats.filesScanned++;
      
      process.stdout.write(`\rScanning... ${stats.filesScanned} files`);
    } catch (err) {
      console.error(`\nError reading ${fullPath}: ${err.message}`);
    }
  }
}

/**
 * Extract exports with line numbers and details
 */
function extractExportsWithDetails(filePath, content) {
  const exports = [];
  const lines = content.split('\n');
  
  // Export patterns with line tracking
  const patterns = [
    { regex: /export\s+(default\s+)?(const|let|var|function|class|type|interface)\s+(\w+)/g, type: 'declaration' },
    { regex: /export\s+default\s+(\w+)/g, type: 'default' },
    { regex: /export\s*\{([^}]+)\}/g, type: 'named' }
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1]?.trim() || '';
      
      if (pattern.type === 'named') {
        // Handle named exports
        const namedExports = match[1].split(',').map(name => {
          const cleanName = name.trim().split(' as ')[0].trim();
          return {
            name: cleanName,
            type: 'named',
            line: lineNumber,
            lineContent: lineContent,
            fullMatch: match[0]
          };
        });
        exports.push(...namedExports);
      } else {
        const name = pattern.type === 'default' ? match[1] : match[3];
        exports.push({
          name: name,
          type: pattern.type,
          line: lineNumber,
          lineContent: lineContent,
          fullMatch: match[0]
        });
      }
    }
  });
  
  return exports;
}

/**
 * Extract imports with source resolution
 */
function extractImportsWithDetails(filePath, content) {
  const imports = [];
  const lines = content.split('\n');
  const importRegex = /import\s+(?:(?:(\w+)|{([^}]+)}|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"])/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const [fullMatch, defaultImport, namedImports, namespaceImport, source] = match;
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const lineContent = lines[lineNumber - 1]?.trim() || '';
    
    const baseImport = {
      source: source,
      line: lineNumber,
      lineContent: lineContent,
      fullMatch: fullMatch,
      resolvedPath: resolveImportPath(filePath, source)
    };
    
    if (defaultImport) {
      imports.push({ ...baseImport, name: defaultImport, type: 'default' });
    }
    
    if (namedImports) {
      const names = namedImports.split(',').map(name => name.trim().split(' as ')[0].trim());
      names.forEach(name => {
        imports.push({ ...baseImport, name: name, type: 'named' });
      });
    }
    
    if (namespaceImport) {
      imports.push({ ...baseImport, name: namespaceImport, type: 'namespace' });
    }
  }
  
  return imports;
}

/**
 * Extract functions with usage patterns
 */
function extractFunctionsWithDetails(filePath, content) {
  const functions = [];
  const lines = content.split('\n');
  
  // Function declarations
  const funcDeclRegex = /function\s+(\w+)\s*\([^)]*\)/g;
  let match;
  while ((match = funcDeclRegex.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    functions.push({
      name: match[1],
      type: 'declaration',
      line: lineNumber,
      lineContent: lines[lineNumber - 1]?.trim() || '',
      fullMatch: match[0]
    });
  }
  
  // Arrow functions
  const arrowFuncRegex = /(const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]+)=>/g;
  while ((match = arrowFuncRegex.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    functions.push({
      name: match[2],
      type: 'arrow',
      line: lineNumber,
      lineContent: lines[lineNumber - 1]?.trim() || '',
      fullMatch: match[0]
    });
  }
  
  return functions;
}

/**
 * Extract React components with JSX usage
 */
function extractComponentsWithDetails(filePath, content) {
  const components = [];
  const lines = content.split('\n');
  
  // Component definitions (functions/classes starting with uppercase)
  const componentRegex = /(export\s+)?(default\s+)?(function|const|class)\s+([A-Z]\w+)/g;
  let match;
  while ((match = componentRegex.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    components.push({
      name: match[4],
      type: match[3],
      exported: !!match[1],
      isDefault: !!match[2],
      line: lineNumber,
      lineContent: lines[lineNumber - 1]?.trim() || '',
      fullMatch: match[0]
    });
  }
  
  return components;
}

/**
 * Extract JSX component usage
 */
function extractJSXUsage(content) {
  const usage = [];
  const lines = content.split('\n');
  const jsxRegex = /<([A-Z]\w+)[\s>\/]/g;
  
  let match;
  while ((match = jsxRegex.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    usage.push({
      component: match[1],
      line: lineNumber,
      lineContent: lines[lineNumber - 1]?.trim() || '',
      context: getContextAroundLine(lines, lineNumber - 1, 2)
    });
  }
  
  return usage;
}

/**
 * Build comprehensive usage maps
 */
async function buildUsageMaps() {
  console.log(`\n\n${colors.cyan}Building usage maps...${colors.reset}`);
  
  // Initialize usage maps
  analysis.files.forEach((fileData, filePath) => {
    analysis.fileUsage.set(filePath, { importedBy: new Set(), references: [] });
    
    // Track exports
    fileData.exports.forEach(exp => {
      if (!analysis.exportUsage.has(exp.name)) {
        analysis.exportUsage.set(exp.name, { definedIn: [], usedIn: [] });
      }
      analysis.exportUsage.get(exp.name).definedIn.push({ file: filePath, ...exp });
    });
    
    // Track components
    fileData.components.forEach(comp => {
      if (!analysis.componentUsage.has(comp.name)) {
        analysis.componentUsage.set(comp.name, { definedIn: [], usedInJSX: [] });
      }
      analysis.componentUsage.get(comp.name).definedIn.push({ file: filePath, ...comp });
    });
    
    // Track functions
    fileData.functions.forEach(func => {
      if (!analysis.functionUsage.has(func.name)) {
        analysis.functionUsage.set(func.name, { definedIn: [], calledIn: [] });
      }
      analysis.functionUsage.get(func.name).definedIn.push({ file: filePath, ...func });
    });
  });
  
  // Build import relationships
  analysis.files.forEach((fileData, filePath) => {
    fileData.imports.forEach(imp => {
      // Track file imports
      if (imp.resolvedPath && analysis.files.has(imp.resolvedPath)) {
        analysis.fileUsage.get(imp.resolvedPath).importedBy.add(filePath);
        analysis.fileUsage.get(imp.resolvedPath).references.push({
          file: filePath,
          ...imp
        });
      }
      
      // Track export usage
      if (analysis.exportUsage.has(imp.name)) {
        analysis.exportUsage.get(imp.name).usedIn.push({ file: filePath, ...imp });
      }
    });
    
    // Track JSX usage
    fileData.jsxUsage.forEach(jsx => {
      if (analysis.componentUsage.has(jsx.component)) {
        analysis.componentUsage.get(jsx.component).usedInJSX.push({ file: filePath, ...jsx });
      }
    });
    
    // Track function calls
    fileData.functions.forEach(func => {
      const callPattern = new RegExp(`\\b${func.name}\\s*\\(`, 'g');
      const matches = [...fileData.content.matchAll(callPattern)];
      
      matches.forEach(match => {
        const lineNumber = fileData.content.substring(0, match.index).split('\n').length;
        if (analysis.functionUsage.has(func.name)) {
          analysis.functionUsage.get(func.name).calledIn.push({
            file: filePath,
            line: lineNumber,
            context: getContextAroundLine(fileData.content.split('\n'), lineNumber - 1, 1)
          });
        }
      });
    });
  });
}

/**
 * Find unused code with detailed tracing
 */
async function findUnusedCode() {
  console.log(`\n\n${colors.cyan}Finding unused code...${colors.reset}`);
  
  // Find unused files
  analysis.files.forEach((fileData, filePath) => {
    if (fileData.isEntryPoint) return;
    
    const usage = analysis.fileUsage.get(filePath);
    if (usage.importedBy.size === 0) {
      analysis.unusedFiles.push({
        path: filePath,
        relativePath: fileData.relativePath,
        size: fileData.size,
        lines: fileData.lines,
        exports: fileData.exports.length,
        reason: 'No imports found'
      });
    }
  });
  
  // Find unused exports
  analysis.exportUsage.forEach((usage, name) => {
    if (usage.usedIn.length === 0) {
      analysis.unusedExports.push({
        name: name,
        definedIn: usage.definedIn,
        reason: 'Not imported anywhere'
      });
    }
  });
  
  // Find unused components
  analysis.componentUsage.forEach((usage, name) => {
    if (usage.usedInJSX.length === 0) {
      analysis.unusedComponents.push({
        name: name,
        definedIn: usage.definedIn,
        reason: 'Not used in JSX'
      });
    }
  });
  
  // Find unused functions
  analysis.functionUsage.forEach((usage, name) => {
    // Only consider functions that are called less than their definitions
    if (usage.calledIn.length <= usage.definedIn.length) {
      analysis.unusedFunctions.push({
        name: name,
        definedIn: usage.definedIn,
        calledIn: usage.calledIn,
        reason: usage.calledIn.length === 0 ? 'Never called' : 'Only called at definition'
      });
    }
  });
  
  // Update stats
  stats.potentiallyUnusedFiles = analysis.unusedFiles.length;
  stats.potentiallyUnusedExports = analysis.unusedExports.length;
  stats.potentiallyUnusedComponents = analysis.unusedComponents.length;
  stats.potentiallyUnusedFunctions = analysis.unusedFunctions.length;
}

/**
 * Generate detailed report with tracing information
 */
function generateDetailedReport() {
  console.log(`\n\n${colors.green}=== Detailed Unused Code Report ===${colors.reset}`);
  console.log(`Total files scanned: ${colors.white}${stats.filesScanned}${colors.reset}`);
  
  // Summary
  console.log(`\n${colors.yellow}📊 SUMMARY${colors.reset}`);
  console.log(`• Potentially unused files: ${colors.red}${stats.potentiallyUnusedFiles}${colors.reset}`);
  console.log(`• Potentially unused exports: ${colors.red}${stats.potentiallyUnusedExports}${colors.reset}`);
  console.log(`• Potentially unused components: ${colors.red}${stats.potentiallyUnusedComponents}${colors.reset}`);
  console.log(`• Potentially unused functions: ${colors.red}${stats.potentiallyUnusedFunctions}${colors.reset}`);
  
  if (showDetailed) {
    // Detailed unused files
    if (analysis.unusedFiles.length > 0) {
      console.log(`\n${colors.red}🗄️  UNUSED FILES (${analysis.unusedFiles.length})${colors.reset}`);
      analysis.unusedFiles.forEach((file, index) => {
        console.log(`\n${index + 1}. ${colors.yellow}${file.relativePath}${colors.reset}`);
        console.log(`   📏 Size: ${file.size} bytes, ${file.lines} lines`);
        console.log(`   📤 Exports: ${file.exports}`);
        console.log(`   ❓ Reason: ${file.reason}`);
        console.log(`   🔍 Verification: Check if this file is imported elsewhere or used dynamically`);
      });
    }
    
    // Detailed unused exports
    if (analysis.unusedExports.length > 0) {
      console.log(`\n${colors.red}📤 UNUSED EXPORTS (${analysis.unusedExports.length})${colors.reset}`);
      analysis.unusedExports.slice(0, 10).forEach((exp, index) => {
        console.log(`\n${index + 1}. ${colors.yellow}${exp.name}${colors.reset}`);
        exp.definedIn.forEach(def => {
          console.log(`   📍 Defined in: ${colors.cyan}${path.relative(rootDir, def.file)}:${def.line}${colors.reset}`);
          console.log(`   📝 Code: ${colors.gray}${def.lineContent}${colors.reset}`);
        });
        console.log(`   ❓ Reason: ${exp.reason}`);
        console.log(`   🔍 Verification: Search for '${exp.name}' usage in entire codebase`);
      });
      if (analysis.unusedExports.length > 10) {
        console.log(`   ... and ${analysis.unusedExports.length - 10} more (use --export-report for full list)`);
      }
    }
    
    // Detailed unused components
    if (analysis.unusedComponents.length > 0) {
      console.log(`\n${colors.red}🧩 UNUSED COMPONENTS (${analysis.unusedComponents.length})${colors.reset}`);
      analysis.unusedComponents.slice(0, 5).forEach((comp, index) => {
        console.log(`\n${index + 1}. ${colors.yellow}${comp.name}${colors.reset}`);
        comp.definedIn.forEach(def => {
          console.log(`   📍 Defined in: ${colors.cyan}${path.relative(rootDir, def.file)}:${def.line}${colors.reset}`);
          console.log(`   📝 Code: ${colors.gray}${def.lineContent}${colors.reset}`);
        });
        console.log(`   ❓ Reason: ${comp.reason}`);
        console.log(`   🔍 Verification: Search for '<${comp.name}' in JSX files`);
      });
      if (analysis.unusedComponents.length > 5) {
        console.log(`   ... and ${analysis.unusedComponents.length - 5} more (use --export-report for full list)`);
      }
    }
    
    // Detailed unused functions
    if (analysis.unusedFunctions.length > 0) {
      console.log(`\n${colors.red}⚙️  UNUSED FUNCTIONS (${analysis.unusedFunctions.length})${colors.reset}`);
      analysis.unusedFunctions.slice(0, 5).forEach((func, index) => {
        console.log(`\n${index + 1}. ${colors.yellow}${func.name}${colors.reset}`);
        func.definedIn.forEach(def => {
          console.log(`   📍 Defined in: ${colors.cyan}${path.relative(rootDir, def.file)}:${def.line}${colors.reset}`);
          console.log(`   📝 Code: ${colors.gray}${def.lineContent}${colors.reset}`);
        });
        if (func.calledIn.length > 0) {
          console.log(`   📞 Called in:`);
          func.calledIn.forEach(call => {
            console.log(`     ${colors.cyan}${path.relative(rootDir, call.file)}:${call.line}${colors.reset}`);
          });
        }
        console.log(`   ❓ Reason: ${func.reason}`);
        console.log(`   🔍 Verification: Search for '${func.name}(' in codebase`);
      });
      if (analysis.unusedFunctions.length > 5) {
        console.log(`   ... and ${analysis.unusedFunctions.length - 5} more (use --export-report for full list)`);
      }
    }
  }
  
  // Usage instructions
  console.log(`\n${colors.cyan}🔍 VERIFICATION TIPS${colors.reset}`);
  console.log(`• Use your IDE's "Find in Files" to search for usage`);
  console.log(`• Check for dynamic imports: import('./path')`);
  console.log(`• Look for string-based references: 'ComponentName'`);
  console.log(`• Verify test files aren't importing these`);
  console.log(`• Check for usage in config files or build scripts`);
  
  console.log(`\n${colors.green}📋 NEXT STEPS${colors.reset}`);
  console.log(`• Review each item manually before deletion`);
  console.log(`• Use ${colors.yellow}--export-report${colors.reset} to get JSON report for further analysis`);
  console.log(`• Use ${colors.yellow}--detailed${colors.reset} to see more information`);
  console.log(`• Test your application after removing any code`);
  
  if (shouldRemove) {
    console.log(`\n${colors.red}!!! WARNING: --remove flag is set. Files will be DELETED !!!${colors.reset}`);
    promptDeleteUnusedFiles();
  }
}

/**
 * Export detailed report to JSON
 */
function exportDetailedReport() {
  const reportData = {
    timestamp: new Date().toISOString(),
    rootDir: rootDir,
    stats: stats,
    unusedFiles: analysis.unusedFiles,
    unusedExports: analysis.unusedExports,
    unusedComponents: analysis.unusedComponents,
    unusedFunctions: analysis.unusedFunctions,
    fileUsage: Object.fromEntries(
      Array.from(analysis.fileUsage.entries()).map(([file, usage]) => [
        path.relative(rootDir, file),
        {
          importedBy: Array.from(usage.importedBy).map(f => path.relative(rootDir, f)),
          references: usage.references.map(ref => ({
            ...ref,
            file: path.relative(rootDir, ref.file)
          }))
        }
      ])
    )
  };
  
  const reportPath = path.join(rootDir, 'unused-code-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n${colors.green}📄 Detailed report exported to: ${colors.yellow}${reportPath}${colors.reset}`);
}

/**
 * Helper functions
 */
function isEntryPoint(filePath) {
  return ENTRY_POINT_PATTERNS.some(pattern => pattern.test(filePath));
}

function resolveImportPath(filePath, importPath) {
  if (!importPath.startsWith('.')) return null;
  
  const baseDir = path.dirname(filePath);
  let resolvedPath = path.resolve(baseDir, importPath);
  
  // Try with extensions
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(resolvedPath + ext)) {
      return resolvedPath + ext;
    }
  }
  
  // Try with index files
  for (const ext of EXTENSIONS) {
    const indexPath = path.join(resolvedPath, `index${ext}`);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }
  
  return null;
}

function getContextAroundLine(lines, lineIndex, contextSize) {
  const start = Math.max(0, lineIndex - contextSize);
  const end = Math.min(lines.length, lineIndex + contextSize + 1);
  return lines.slice(start, end);
}

/**
 * Interactive prompt for deletion
 */
async function promptDeleteUnusedFiles() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  try {
    console.log(`\n${colors.red}Files to be deleted:${colors.reset}`);
    analysis.unusedFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.relativePath}`);
    });
    
    const confirmation = await new Promise((resolve) => {
      rl.question(`\n${colors.red}Are you absolutely sure you want to delete these ${analysis.unusedFiles.length} files? (type "DELETE" to confirm) ${colors.reset}`, resolve);
    });
    
    if (confirmation === 'DELETE') {
      console.log(`${colors.red}Deleting files...${colors.reset}`);
      
      let count = 0;
      analysis.unusedFiles.forEach(file => {
        try {
          fs.unlinkSync(file.path);
          console.log(`✅ Deleted: ${file.relativePath}`);
          count++;
        } catch (err) {
          console.error(`❌ Error deleting ${file.relativePath}: ${err.message}`);
        }
      });
      
      console.log(`\n${colors.green}Successfully deleted ${count} files${colors.reset}`);
    } else {
      console.log(`${colors.green}Operation cancelled. No files were deleted.${colors.reset}`);
    }
  } finally {
    rl.close();
  }
}

// Run the main function
main().catch(err => {
  console.error(`\n\n${colors.red}Error: ${err.message}${colors.reset}`);
  console.error(err.stack);
  process.exit(1);
});