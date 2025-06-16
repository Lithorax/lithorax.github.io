window.generateAnalysis = generateAnalysis;

function parseCSV(input) {
  return input.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
}

function ternaryToXY(a, b, c) {
  const sum = a + b + c;
  a /= sum; b /= sum; c /= sum;
  const x = 0.5 * (2 * c + a);
  const y = (Math.sqrt (3)/2) * a;
  return [x * 400 + 50, 400 - y * 400];
}

function drawGuides(svg) {
  const lines = [50, 100, 150, 200, 250];
  const texts = ["0", "50", "Weak weathering", "Intermediate weathering", "Strong weathering"];
  lines.forEach((y, i) => {
    svg.innerHTML += `<line x1="50" y1="${y}" x2="450" y2="${y}" stroke="#aaa" stroke-dasharray="4 2"/>`;
    svg.innerHTML += `<text x="55" y="${y - 5}" font-size="10">${texts[i]}</text>`;
  });

  const labels = [
    { x: 250, y: 40, text: "A (Al₂O₃)" },
    { x: 50, y: 420, text: "CN (CaO + Na₂O)" },
    { x: 450, y: 420, text: "K (K₂O)" },
    { x: 280, y: 120, text: "Kaolinite" },
    { x: 370, y: 170, text: "Illite" },
    { x: 400, y: 190, text: "Muscovite" },
    { x: 380, y: 240, text: "K-feldspar" },
    { x: 180, y: 230, text: "Smectite" },
    { x: 150, y: 270, text: "Plagioclase" },
    { x: 240, y: 270, text: "Average gabbro" },
    { x: 300, y: 270, text: "Average granite" }
  ];

  labels.forEach(l => {
    svg.innerHTML += `<text x="${l.x}" y="${l.y}" font-size="10">${l.text}</text>`;
  });

  svg.innerHTML += `<line x1="180" y1="230" x2="240" y2="120" stroke="red" stroke-width="2" marker-end="url(#arrowhead)"/>`;
  svg.innerHTML += `<line x1="280" y1="250" x2="360" y2="120" stroke="red" stroke-width="2" marker-end="url(#arrowhead)"/>`;
}

function generateAnalysis() {
  const al2o3 = parseCSV(document.getElementById('al2o3').value);
  const cn = parseCSV(document.getElementById('cn').value);
  const k2o = parseCSV(document.getElementById('k2o').value);

  if (!(al2o3.length === cn.length && cn.length === k2o.length)) {
    alert('All input lists must be the same length.');
    return;
  }

  const tableRows = [];
  const ciaValues = [];
  const points = [];

  for (let i = 0; i < al2o3.length; i++) {
    const cia = (al2o3[i] / (al2o3[i] + cn[i] + k2o[i])) * 100;
    ciaValues.push(cia.toFixed(2));

    const a = al2o3[i];
    const b = cn[i];
    const c = k2o[i];
    const [x, y] = ternaryToXY(a, b, c);
    points.push({ x, y, label: `S${i + 1}` });

    tableRows.push(`<tr><td>${i + 1}</td><td>${a}</td><td>${b}</td><td>${c}</td><td>${cia.toFixed(2)}</td></tr>`);
  }

  document.getElementById('table-container').innerHTML = `
    <h3>CIA Table</h3>
    <table>
      <thead>
        <tr><th>Sample</th><th>Al₂O₃</th><th>CN</th><th>K₂O</th><th>CIA</th></tr>
      </thead>
      <tbody>${tableRows.join('')}</tbody>
    </table>
  `;

  const plotContainer = document.getElementById('cia-plot');
  plotContainer.innerHTML = `<h3>CIA Plot</h3><svg width="500" height="300">
    <line x1="40" y1="10" x2="40" y2="260" stroke="#000" />
    <line x1="40" y1="260" x2="480" y2="260" stroke="#000" />
    ${ciaValues.map((v, i) => {
      const x = 50 + i * 40;
      const y = 260 - (v / 100 * 250);
      return `<circle cx="${x}" cy="${y}" r="4" fill="green" />
              <text x="${x}" y="${y - 8}" font-size="10" text-anchor="middle">S${i + 1}</text>`;
    }).join('')}
  </svg>`;

  const svg = document.getElementById('ternary-svg');
  svg.innerHTML = `
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="red" />
      </marker>
    </defs>
    <polygon points="250,50 450,400 50,400" stroke="#000" fill="none" />
  `;

  drawGuides(svg);

  svg.innerHTML += points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="5" fill="orange" />
    <text x="${p.x + 5}" y="${p.y - 5}" font-size="10">${p.label}</text>`).join('');
}


