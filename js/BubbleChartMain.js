// We're not declaring mainCharacters here 
// since it's already defined in main.js

// File paths for word data
const wordDataSeasonsFilePath = `data/script_analyze/output/main_cast_unique_words_seasons.csv`;
const wordDataShowsFilePath = `data/script_analyze/output/main_cast_unique_words_shows.csv`;

// Shared variables - Namespace with 'bubble' prefix to avoid conflicts
let bubbleChart;
let bubbleSelectedSeason = 1; // default for overall view (0 means all seasons)
let bubbleSelectedWordDataType = "season"; // default for word data (season or show)

// Initialize bubble chart with empty data
document.addEventListener('DOMContentLoaded', function bubbleChartInit() {
  // Create the bubble chart with initial empty data
  bubbleChart = new BubbleChart({
    parentElement: '.bubble-chart-section',
    containerWidth: 800,
    containerHeight: 600,
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
    tooltipPadding: 15
  }, []);

  // Load word data and initialize the visualization
  loadBubbleWordData(bubbleSelectedWordDataType, bubbleSelectedSeason);

  // Setup event listeners for bubble chart
  setupBubbleChartEventListeners();
});

// Function to load word data based on selected data type and season
function loadBubbleWordData(dataType, season) {
  // Choose the appropriate file path based on data type
  const filePath = dataType === "season" ? 
    wordDataSeasonsFilePath : 
    wordDataShowsFilePath;
  
  // Update UI based on data type
  if (dataType === "season") {
    document.getElementById("bubble-season-select").style.display = "block";
  } else {
    document.getElementById("bubble-season-select").style.display = "none";
  }

  console.log(`Loading bubble chart word data from ${filePath}`);

  d3.csv(filePath)
    .then(data => {
      console.log(`Loaded ${data.length} records for bubble chart`);
      
      if (data.length === 0) {
        console.warn('No data loaded for bubble chart');
        bubbleChart.updateData([]);
        return;
      }
      
      try {
        // Process the data - Add unique IDs if they don't exist
        data = data.map((d, i) => {
          // If id is missing, generate one
          if (!d.id) d.id = `bubble-data-${i}`;
          return d;
        });
        
        // Process the data - convert numeric fields
        data.forEach(d => {
          // Handle season data if it exists
          if (d.season) d.season = +d.season;
          
          // Ensure count exists and is a number
          d.count = +d.count;
          
          // Handle uniqueness score if it exists
          if (d.uniqueness_score) d.uniqueness_score = +d.uniqueness_score;
        });

        // Filter data by season if in season mode and a specific season is selected
        let filteredData;
        if (dataType === "season") {
          filteredData = season === 0 
            ? data 
            : data.filter(d => d.season === season);
          console.log(`Filtered to ${filteredData.length} bubble chart records for season ${season}`);
        } else {
          filteredData = data; // For whole show, use all data
          console.log(`Using all ${filteredData.length} records for bubble chart whole show view`);
        }

        // Update the bubble chart with new data
        if (bubbleChart) {
          bubbleChart.updateData(filteredData);
        }
      } catch (error) {
        console.error("Error processing bubble chart data:", error);
        // Update with empty data to avoid breaking the visualization
        bubbleChart.updateData([]);
      }
    })
    .catch(error => {
      console.error("Error loading bubble chart word data:", error);
      // Update with empty data to avoid breaking the visualization
      bubbleChart.updateData([]);
    });
}

// Setup event listeners for bubble chart user interactions
function setupBubbleChartEventListeners() {
  // Word data type selector change event
  document.getElementById('word-data-select').addEventListener('change', function(event) {
    handleBubbleWordDataChange(event);
  });
}

// Make sure this function is globally available for the HTML onclick attribute
window.handleBubbleSeasonChange = function(event) {
  const bubbleSeason = +event.target.value;
  console.log(`Bubble chart season changed to: ${bubbleSeason}`);
  bubbleSelectedSeason = bubbleSeason;
  loadBubbleWordData(bubbleSelectedWordDataType, bubbleSeason);
};

// Handle change of word data type (season vs whole show)
// Make this globally available for the HTML onclick attribute
window.handleWordDataChange = function(event) {
  bubbleSelectedWordDataType = event.target.value;
  console.log(`Bubble chart data type changed to: ${bubbleSelectedWordDataType}`);
  // Reset to all seasons when switching data type
  bubbleSelectedSeason = 0;
  if (document.getElementById("bubble-season-select")) {
    document.getElementById("bubble-season-select").value = "0";
  }
  loadBubbleWordData(bubbleSelectedWordDataType, bubbleSelectedSeason);
};

// Local function for internal event handling
function handleBubbleWordDataChange(event) {
  window.handleWordDataChange(event);
}