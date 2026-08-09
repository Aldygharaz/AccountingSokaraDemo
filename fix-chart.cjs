const fs = require('fs');

let file = 'src/components/dashboard/DashboardView.tsx';
let c = fs.readFileSync(file, 'utf8');

const regex1 = /const filteredStats = monthlyStats\.filter[\s\S]*?\: baseMonthData;/;
const replacement1 = `const currentMonthIdx = new Date().getMonth();
  const monthData = timeframe === '6M'
    ? monthlyStats.slice(Math.max(0, currentMonthIdx - 5), currentMonthIdx + 1)
    : timeframe === 'YTD'
    ? monthlyStats.slice(0, currentMonthIdx + 1)
    : monthlyStats;`;

c = c.replace(regex1, replacement1);

const regex2 = /const getX = \(idx: number\) => 50 \+ idx \* \(\(chartWidth - 100\) \/ \(monthData\.length - 1\)\);/;
const replacement2 = `const getX = (idx: number) => 50 + idx * ((chartWidth - 100) / Math.max(1, monthData.length - 1));
  const formatYAxis = (val: number) => {
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
    if (val >= 1000000) return (val / 1000000).toFixed(0) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toString();
  };`;
c = c.replace(regex2, replacement2);

const regex3 = /\{\[0, 15000000, 30000000, 45000000\]\.map\(\(val, idx\) => \{[\s\S]*?\{\(val \/ 1000000\)\.toFixed\(0\)\}M[\s\S]*?<\/text>[\s\S]*?<\/g>[\s\S]*?\}\)\}/;
const replacement3 = `{[0, maxVal * 0.33, maxVal * 0.66, maxVal].map((val, idx) => {
                const y = getY(val);
                return (
                  <g key={idx}>
                    <line
                      x1="40"
                      y1={y}
                      x2={chartWidth - 20}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-[#3F4147]/80"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="35"
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-slate-400 dark:fill-[#80848E] font-mono font-bold"
                    >
                      {formatYAxis(val)}
                    </text>
                  </g>
                );
              })}`;
c = c.replace(regex3, replacement3);

fs.writeFileSync(file, c);
console.log('Chart fixed.');
