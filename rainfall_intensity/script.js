function drawRainfallPlot() {
  // Sample Data (replace with real rainfall/time data)
  const time = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00'];
  const intensity = [5, 12, 20, 15, 8, 3];

  const trace = {
    x: time,
    y: intensity,
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#084c26', width: 3 },
    marker: { size: 8 },
    name: 'Rainfall (mm/hr)'
  };

  const layout = {
    title: 'Rainfall Intensity Over Time',
    xaxis: { title: 'Time', showgrid: false },
    yaxis: { title: 'Rainfall Intensity (mm/hr)', showgrid: true },
    plot_bgcolor: 'rgba(255,255,255,0.9)',
    paper_bgcolor: 'rgba(36, 214, 89, 0.1)',
    margin: { t: 50, l: 50, r: 30, b: 50 }
  };

  Plotly.newPlot('plot', [trace], layout);
}
