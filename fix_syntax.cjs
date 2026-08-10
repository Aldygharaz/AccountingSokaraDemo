const fs = require('fs');

let analytics = fs.readFileSync('src/components/analytics/AnalyticsView.tsx', 'utf8');
// Fix misplaced import
analytics = analytics.replace("import { useStore } from '../lib/storage';\n", "");
analytics = analytics.replace("import { AppState } from '../../lib/storage';", "import { useStore } from '../../lib/storage';");
fs.writeFileSync('src/components/analytics/AnalyticsView.tsx', analytics);

let forensic = fs.readFileSync('src/components/forensic/ForensicAuditModal.tsx', 'utf8');
forensic = forensic.replace("}) => {\\n", "}) => {");
fs.writeFileSync('src/components/forensic/ForensicAuditModal.tsx', forensic);

console.log("Fixed syntax errors");
