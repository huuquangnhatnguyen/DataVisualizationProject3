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

var colorScale = d3
  .scaleOrdinal()
  .domain(mainCharacters)
  .range([
    "#FF6B6B",
    "#4DABF7",
    "#69DB7C",
    "#B197FC",
    "#FFA94D",
    "#FFD43B",
    "#38D9A9",
  ]);
document.getElementById("defaultOpen").click();

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

  const layerName = charName.replace("tab-", "").toLowerCase();
  d3.selectAll(".layer").style("opacity", 0.6).style("stroke", "none");
  d3.selectAll(`.${layerName}`)
    .style("opacity", 1)
    .style("stroke", "#000")
    .style("stroke-width", 1);
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

let matrix = [];
let chordChart;
d3.csv(
  "data/character_interactions/main_character_interactions_all_seasons.csv"
).then((data) => {
  matrix = Array(mainCharacters.length)
    .fill()
    .map((d) => Array(mainCharacters.length).fill(0));
  data.forEach((d) => {
    let i = mainCharacters.indexOf(d.from);
    let j = mainCharacters.indexOf(d.to);
    if (i >= 0 && j >= 0) {
      matrix[j][i] = +d.count;
    }
  });
  chordChart = new ChordChart(chordConfig, matrix, mainCharacters);
});

const chordConfig = {
  parentElement: "#chord-chart",
  containerWidth: 700,
  containerHeight: 700,
  margin: { top: 50, right: 150, bottom: 50, left: 50 },
};

let chordMode = "Seasonal"; // default mode for Chord chart
let selectedSeasonChord = 1; // default season for Chord chart
let filePathChord = `data/character_interactions/main_character_interactions_all_seasons.csv`;
function handleViewModeChangeChord(event) {
  let chordMode = event.target.value;
  if (chordMode == "show") {
    filePathChord = `data/character_interactions/main_character_interactions_all_seasons.csv`;
    d3.csv(filePathChord).then((data) => {
      matrix = Array(mainCharacters.length)
        .fill()
        .map((d) => Array(mainCharacters.length).fill(0));
      data.forEach((d) => {
        let i = mainCharacters.indexOf(d.from);
        let j = mainCharacters.indexOf(d.to);
        if (i >= 0 && j >= 0) {
          matrix[j][i] = +d.count;
        }
      });
      chordChart.updateData(matrix, mainCharacters);
      document.getElementById("chord-season-select").disabled = true;
    });
  }
  if (chordMode == "season") {
    filePathChord = `data/character_interactions/main_character_interactions_season_0${selectedSeasonChord}.csv`;
    d3.csv(filePathChord).then((data) => {
      matrix = Array(mainCharacters.length)
        .fill()
        .map((d) => Array(mainCharacters.length).fill(0));
      data.forEach((d) => {
        let i = mainCharacters.indexOf(d.from);
        let j = mainCharacters.indexOf(d.to);
        if (i >= 0 && j >= 0) {
          matrix[j][i] = +d.count;
        }
      });
      chordChart.updateData(matrix, mainCharacters);
      document.getElementById("chord-season-select").disabled = false;
    });
  }
}
function handleSeasonChangeChord(event) {
  selectedSeasonChord = Number(event.target.value);
  filePathChord = `data/character_interactions/main_character_interactions_season_0${selectedSeasonChord}.csv`;
  d3.csv(filePathChord).then((data) => {
    matrix = Array(mainCharacters.length)
      .fill()
      .map((d) => Array(mainCharacters.length).fill(0));
    data.forEach((d) => {
      let i = mainCharacters.indexOf(d.from);
      let j = mainCharacters.indexOf(d.to);
      if (i >= 0 && j >= 0) {
        matrix[j][i] = +d.count;
      }
    });
    chordChart.updateData(matrix, mainCharacters);
  });
}

let barChart;
let barMode = "Seasonal"; // default mode for Bar chart
let selectedSeasonBar = 1; // default season for Bar chart
let selectedCharacterBar = mainCharacters[1]; // default character for Bar chart
let color;
d3.csv("data/sheldon_labeled_topics_per_character_season.csv").then((data) => {
  data.forEach((d) => {
    d.n = +d.n;
    d.year = +d.year;
  });
  let filterredData = BarChartDataFilterBySeason(selectedSeasonBar, data);
  filterredData = BarChartDataFilterByCharacter(
    selectedCharacterBar,
    filterredData
  );

  barChart = new BarChart(
    {
      parentElement: "#bar-chart",
      containerWidth: 800,
      containerHeight: 600,
      margin: { top: 40, right: 30, bottom: 50, left: 60 },
    },
    filterredData,
    mainCharacters,
    {
      color: colorScale(selectedCharacterBar),
    }
  );
});

function BarChartDataFilterBySeason(season, data) {
  let filterredData = data.filter((d) => d.year === season);
  return filterredData;
}

function BarChartDataFilterByCharacter(character, data) {
  let filterredData = data.filter((d) => d.character === character);
  return filterredData;
}

function handleSeasonChangeBar(event) {
  selectedSeasonBar = Number(event.target.value);
  console.log(selectedCharacterBar);
  d3.csv("data/sheldon_labeled_topics_per_character_season.csv").then(
    (data) => {
      data.forEach((d) => {
        d.n = +d.n;
        d.year = +d.year;
      });
      let filterredData = BarChartDataFilterBySeason(selectedSeasonBar, data);
      filterredData = BarChartDataFilterByCharacter(
        selectedCharacterBar,
        filterredData
      );
      barChart.updateVis(filterredData, colorScale(selectedCharacterBar));
    }
  );
}

function handleCharacterChangeBar(event) {
  selectedCharacterBar = event.target.value;
  d3.csv("data/sheldon_labeled_topics_per_character_season.csv").then(
    (data) => {
      data.forEach((d) => {
        d.n = +d.n;
        d.year = +d.year;
      });
      let filterredData = BarChartDataFilterBySeason(selectedSeasonBar, data);
      filterredData = BarChartDataFilterByCharacter(
        selectedCharacterBar,
        filterredData
      );
      barChart.updateVis(filterredData, colorScale(selectedCharacterBar));
    }
  );
}
