const fs = require('fs');
let code = fs.readFileSync('src/components/manual/ManualBookView.tsx', 'utf8');
code = code.replace(/import \{([\s\S]*?)Search,/g, 'import { Lightbulb,\n$1Search,');
code = code.replace(/.*Dampak Finansial:.*/g, '                        <div className="flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-blue-500" /> Dampak Finansial: {topic.businessContext}</div>');
fs.writeFileSync('src/components/manual/ManualBookView.tsx', code);
