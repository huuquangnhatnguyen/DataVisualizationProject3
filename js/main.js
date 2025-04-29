// constants
const mainCharacters = [
  "Sheldon",
  "Leonard",
  "Penny",
  "Howard",
  "Bernadette",
  "Raj",
  "Amy",
];

const filePathByEpisodes = `data/script_scrape/big_bang_main_character_dialogues.csv`;
const filePathBySeasons = `data/script_scrape/all_seasons_dialogues_count.csv`;
// shared variables
let seasonOptions = false;
let filePath = filePathBySeasons;
let myStackedAreaChart;
let selectedMode = "Seasonal"; // default mode
let selectedSeason = 1; // default season

let filePathVoronoi = `data/voronoi_data/character_total_dialogue_counts.csv`;
let selectedModeVoronoi = "Seasonal"; // default mode for Voronoi map
let selectedSeasonVoronoi = 1; // default season for Voronoi map
// draw the stacked chart
d3.csv(filePath).then((data) => {
  data.forEach((d) => {
    d.episode = +d.episode;
    d.season = +d.season;
  });
  console.log(data);
  // let filterredData = DataFilterBySeason(selectedSeason, data);
  let filterredData =
    selectedMode == "Episodes"
      ? DataFilterBySeason(selectedSeason, data)
      : data;

  myStackedAreaChart = new StackAreaChart(
    {
      parentElement: "#stacked-area-chart",
      containerWidth: 800,
      containerHeight: 600,
      margin: { top: 40, right: 30, bottom: 50, left: 60 },
      chartTitle: "Big Bang Theory Character Dialogues",
      xAxisTitle: "Season #",
      yAxisTitle: "# of Lines",
    },
    filterredData,
    mainCharacters
  );
});
// helper functions to format the data

function DataFilterBySeason(season, data) {
  let filterredData = data.filter((d) => d.season === season);
  console.log(filterredData, data, season);
  return filterredData;
}

function openTab(evt, charName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(charName).style.display = "block";
  evt.currentTarget.className += " active";
}

function toggleDisplayingMode(event) {
  selectedMode = event.target.value;
  if (selectedMode == "Seasonal") {
    filePath = filePathBySeasons;
    d3.csv(filePath).then((data) => {
      data.forEach((d) => {
        d.episode = +d.episode;
        d.season = +d.season;
      });
      myStackedAreaChart.config.xAxisTitle = "Season #";
      updateStackedAreaChart(data);
    });
    document.getElementById("season-select").style.display = "none";
  }
  if (selectedMode == "Episodes") {
    filePath = filePathByEpisodes;
    d3.csv(filePath).then((data) => {
      data.forEach((d) => {
        d.episode = +d.episode;
        d.season = +d.season;
      });
      myStackedAreaChart.config.xAxisTitle = "Episode #";
      updateStackedAreaChart(data);
    });
    document.getElementById("season-select").style.display = "inline-block";
  }
}

function handleSeasonChange(event) {
  selectedSeason = Number(event.target.value);
  d3.csv(filePathByEpisodes).then((data) => {
    data.forEach((d) => {
      d.episode = +d.episode;
      d.season = +d.season;
    });
    updateStackedAreaChart(data);
  });
}

function updateStackedAreaChart(data) {
  let filterredData =
    selectedMode == "Episodes"
      ? DataFilterBySeason(selectedSeason, data)
      : data;
  myStackedAreaChart.data = filterredData;
  myStackedAreaChart.updateVis();
}

let voronoiMap = new VoronoiMap(
  (_selector = "#visualization"),
  (_mainCharacter = mainCharacters)
);

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
    d.color = colorScale(d);
    totalCost += d.cost;
  });

  // Filter out entries with zero cost
  const filteredData = data.filter((d) => d.cost > 0);

  return {
    data: filteredData,
    totalCost: totalCost,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  // Load data from CSV file
  voronoiMap.initVis();
  voronoiMap.updateWithNewData(filePathVoronoi, processData);
});

function toggleDisplayingModeVoronoi(event) {
  selectedModeVoronoi = event.target.value;
  if (selectedModeVoronoi == "Seasonal") {
    filePathVoronoi = `data/voronoi_data/character_total_dialogue_counts.csv`;
    voronoiMap.updateWithNewData(filePathVoronoi, processData);
    document.getElementById("season-select-voronoi").style.display = "none";
  }
  if (selectedModeVoronoi == "Episodes") {
    filePath = `data/voronoi_data/character_dialogue_counts_season_0${selectedSeasonVoronoi}.csv`;
    voronoiMap.updateWithNewData(filePath, processData);
    document.getElementById("season-select-voronoi").style.display =
      "inline-block";
  }
}

function handleSeasonChangeVoronoi(event) {
  selectedSeasonVoronoi = Number(event.target.value);
  filePath = `data/voronoi_data/character_dialogue_counts_season_0${selectedSeasonVoronoi}.csv`;
  voronoiMap.updateWithNewData(filePath, processData);
}
