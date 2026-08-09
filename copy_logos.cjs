const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\RDZ\\Documents\\Sokara AI\\LogoBrandSokara';
const destDir = path.join(__dirname, 'public');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

fs.readdirSync(srcDir).forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  fs.copyFileSync(srcFile, destFile);
  console.log(`Copied ${file}`);
});
