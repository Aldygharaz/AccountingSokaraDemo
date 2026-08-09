const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('src/components', (filePath) => {
  if (!filePath.endsWith('.tsx')) return;
  let c = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Add overflow-x-auto to table wrappers
  if (c.includes('<table')) {
    // If table is inside a wrapper that doesn't have overflow-x-auto, we might need to add it.
    // Instead of complex AST, let's just make sure <div className="... overflow-x-auto"> surrounds <table.
    // Let's look for `<div className="w-full overflow-hidden` or `<div className="... rounded-2xl border` and add `overflow-x-auto`
    const oldC = c;
    c = c.replace(/className="w-full overflow-hidden/g, 'className="w-full overflow-x-auto');
    c = c.replace(/className="overflow-hidden/g, 'className="overflow-x-auto overflow-hidden');
    c = c.replace(/className="glass-card rounded-2xl border border-slate-200(\/60)? dark:border-\[#3F4147\]"/g, 'className="glass-card rounded-2xl border border-slate-200$1 dark:border-[#3F4147] overflow-x-auto"');
    if (c !== oldC) changed = true;
  }

  // Add overflow-x-auto to 12-col grids
  if (c.includes('grid-cols-12')) {
    const oldC = c;
    c = c.replace(/className="grid grid-cols-12/g, 'className="grid grid-cols-12 overflow-x-auto min-w-[800px]');
    if (c !== oldC) changed = true;
  }

  if (c.includes('grid-cols-6')) {
    const oldC = c;
    c = c.replace(/className="grid grid-cols-6/g, 'className="grid grid-cols-6 overflow-x-auto min-w-[600px]');
    if (c !== oldC) changed = true;
  }

  // Add dark mode to form labels
  if (c.includes('<label')) {
    const oldC = c;
    c = c.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-200');
    c = c.replace(/text-slate-500/g, 'text-slate-500 dark:text-[#B5BAC1]');
    if (c !== oldC) changed = true;
  }

  // Dark mode inputs
  if (c.includes('<input') || c.includes('<select')) {
    const oldC = c;
    c = c.replace(/bg-white border-slate-200/g, 'bg-white dark:bg-[#1E1F22] border-slate-200 dark:border-[#3F4147] dark:text-[#DBDEE1]');
    c = c.replace(/bg-slate-50 border-slate-200/g, 'bg-slate-50 dark:bg-[#2B2D31] border-slate-200 dark:border-[#3F4147] dark:text-[#DBDEE1]');
    if (c !== oldC) changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, c);
    console.log('Fixed UI in: ' + filePath);
  }
});
