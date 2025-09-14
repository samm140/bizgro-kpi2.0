#!/usr/bin/env node

/**
 * Environment Variable Migration Script
 * Automatically updates code from REACT_APP_ to VITE_ prefix
 * 
 * Usage: node migrate-env.js
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m'
};

// Configuration
const config = {
  // Directories to scan
  directories: ['src'],
  
  // File extensions to process
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  
  // Files/directories to ignore
  ignore: ['node_modules', 'build', 'dist', '.git', 'coverage'],
  
  // Replacement patterns
  replacements: [
    {
      name: 'Process.env to import.meta.env',
      pattern: /process\.env\./g,
      replacement: 'import.meta.env.'
    },
    {
      name: 'REACT_APP_ prefix to VITE_',
      pattern: /REACT_APP_/g,
      replacement: 'VITE_'
    }
  ],
  
  // Backup directory
  backupDir: '.env-migration-backup'
};

// Statistics
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacements: 0,
  errors: 0
};

/**
 * Log with color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Create backup directory
 */
function createBackup() {
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
    log(`✓ Created backup directory: ${config.backupDir}`, 'green');
  }
}

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  const basename = path.basename(filePath);
  
  // Check if it's a file we want to process
  if (!config.extensions.includes(ext)) return false;
  
  // Check if it's in an ignored directory
  for (const ignored of config.ignore) {
    if (filePath.includes(ignored)) return false;
  }
  
  return true;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    // Read file content
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = originalContent;
    let fileModified = false;
    
    // Apply replacements
    for (const replacement of config.replacements) {
      const matches = modifiedContent.match(replacement.pattern);
      if (matches) {
        modifiedContent = modifiedContent.replace(
          replacement.pattern,
          replacement.replacement
        );
        fileModified = true;
        stats.replacements += matches.length;
        log(`  → ${replacement.name}: ${matches.length} replacements`, 'yellow');
      }
    }
    
    // If file was modified, create backup and save
    if (fileModified) {
      // Create backup
      const relativePath = path.relative(process.cwd(), filePath);
      const backupPath = path.join(config.backupDir, relativePath);
      const backupDir = path.dirname(backupPath);
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      fs.writeFileSync(backupPath, originalContent);
      
      // Save modified content
      fs.writeFileSync(filePath, modifiedContent);
      
      log(`✓ Modified: ${relativePath}`, 'green');
      stats.filesModified++;
    }
    
    stats.filesProcessed++;
    
  } catch (error) {
    log(`✗ Error processing ${filePath}: ${error.message}`, 'red');
    stats.errors++;
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip ignored directories
      if (!config.ignore.includes(item)) {
        processDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      if (shouldProcessFile(fullPath)) {
        processFile(fullPath);
      }
    }
  }
}

/**
 * Migrate .env file
 */
function migrateEnvFile() {
  const envPath = '.env';
  
  if (!fs.existsSync(envPath)) {
    log('⚠ No .env file found', 'yellow');
    return;
  }
  
  try {
    // Read current .env
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Create backup
    fs.writeFileSync('.env.backup', envContent);
    log('✓ Created .env.backup', 'green');
    
    // Replace REACT_APP_ with VITE_
    const newEnvContent = envContent.replace(/REACT_APP_/g, 'VITE_');
    
    // Count replacements
    const matches = envContent.match(/REACT_APP_/g);
    if (matches) {
      fs.writeFileSync(envPath, newEnvContent);
      log(`✓ Updated .env file: ${matches.length} variables migrated`, 'green');
    } else {
      log('ℹ .env file already uses VITE_ prefix', 'blue');
    }
    
  } catch (error) {
    log(`✗ Error migrating .env: ${error.message}`, 'red');
  }
}

/**
 * Create migration report
 */
function createReport() {
  const report = `
Environment Variable Migration Report
=====================================
Date: ${new Date().toISOString()}

Statistics:
-----------
Files Processed: ${stats.filesProcessed}
Files Modified: ${stats.filesModified}
Total Replacements: ${stats.replacements}
Errors: ${stats.errors}

Backup Location: ${config.backupDir}

Next Steps:
-----------
1. Review the changes in your code
2. Test your application: npm run dev
3. Update any CI/CD environment variables
4. If everything works, you can delete the backup: rm -rf ${config.backupDir}
5. If you need to rollback, restore from: ${config.backupDir}
`;

  fs.writeFileSync('migration-report.txt', report);
  console.log(report);
}

/**
 * Main migration function
 */
function migrate() {
  log('\n🚀 Starting Environment Variable Migration\n', 'bright');
  
  // Create backup directory
  createBackup();
  
  // Migrate .env file
  log('\n📄 Migrating .env file...', 'blue');
  migrateEnvFile();
  
  // Process source files
  log('\n📁 Processing source files...', 'blue');
  for (const dir of config.directories) {
    if (fs.existsSync(dir)) {
      log(`\nScanning ${dir}/...`, 'blue');
      processDirectory(dir);
    } else {
      log(`⚠ Directory not found: ${dir}`, 'yellow');
    }
  }
  
  // Create report
  createReport();
  
  log('\n✅ Migration Complete!', 'green');
  
  if (stats.errors > 0) {
    log(`\n⚠ ${stats.errors} errors occurred. Please review the output above.`, 'yellow');
  }
  
  if (stats.filesModified > 0) {
    log('\n📝 Please review the changes and test your application.', 'blue');
    log('   Run: npm run dev', 'blue');
  }
}

// Run migration
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
