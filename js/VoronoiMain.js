// Main.js - Entry point for the application
// Handles data loading and initialization of the visualization

// Create a new voronoi map visualization
let voronoiMap = new VoronoiMap('#visualization');

// Process the raw data for the visualization
function processData(data, colorScale) {
  let totalCost = 0;
  
  // Process each data item and calculate total
  data.forEach((d, i) => {
    // Assuming CSV has columns 'character' and 'lines'
    // If columns have different names, adjust accordingly
    d.id = i;
    d.composition = d.character; 
    d.cost = +d.lines;           
    d.color = colorScale(i);     
    totalCost += d.cost;
  });
  
  // Filter out entries with zero cost
  const filteredData = data.filter(d => d.cost > 0);
  
  return {
    data: filteredData,
    totalCost: totalCost
  };
}

document.addEventListener('DOMContentLoaded', () => {
  // Load data from CSV file
  const csvPath = "../data/ss1-total-lines.csv";
  
  voronoiMap.initVis();
  voronoiMap.updateWithNewData(csvPath, processData);
});