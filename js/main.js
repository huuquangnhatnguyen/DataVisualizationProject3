const nonCharacters = [
  "All",
  "Scene",
  "Voice",
  "Together",
  "Story",
  "Teleplay",
  "Receptionist",
  "Man",
  "Waitress",
  "Girl",
  "Costume",
  "Waiter",
  "Mother",
  "Missy",
  "Guy",
  "Woman",
  "Nurse",
  "Assistant",
  "TV",
  "Employee",
  "Tattooist",
  "Radio",
];
// import the whole show data
// d3.csv("data/big_bang_scripts.csv").then((data) => {
//   data.forEach((d, i) => {
//     d.episode = +d.episode;
//     d.series = +d.series;
//     d.episode_name = d.episode_name_only;
//     d.dialogue = d.dialogue;
//     d.character = d.person_scene;
//   });
//   console.log(data);
// });

// import one episode data
d3.csv("data/big_bang_series_03.csv").then((data) => {
  //   data.forEach((d, i) => {
  //     d.episode = +d.episode;
  //     d.episode_name = d.episode_name_only;
  //     d.dialogue = d.dialogue;
  //     d.character = d.person_scene;
  //   });

  let formattedData = data.map((d) => {
    return {
      episode: +d.episode,
      episode_name: d.episode_name_only,
      character: d.person_scene,
      dialogue: d.dialogue,
    };
  });

  let uniqueEpisodes = UniqueEpisodes(formattedData);
  let uniqueCharacters = UniqueCharacters(formattedData).filter(
    (element) =>
      /^[A-Z][a-zA-Z]*$/.test(element) &&
      !element.startsWith("(") &&
      nonCharacters.includes(element) === false
  );
  let dialoguePerEpisode = uniqueEpisodes.map((episode) => {
    return {
      episode: episode,
      dialogueCount: countDialougePerEpisode(formattedData, episode),
    };
  });

  let dialoguePerCharInEpisode = uniqueEpisodes.map((episode) => {
    let dialogueCount = uniqueCharacters.map((char) => {
      return {
        character: char,
        dialogueCount: countDialougePerCharInAnEpisode(
          formattedData,
          char,
          episode
        ).length,
      };
    });
    return {
      episode: episode,
      dialogueCount: dialogueCount,
    };
  });
  console.log(
    uniqueCharacters,
    uniqueEpisodes,
    dialoguePerEpisode,
    dialoguePerCharInEpisode
  );

  let myStackedAreaChart = new StackAreaChart(
    {
      parentElement: "#stacked-area-chart",
      containerWidth: 600,
      containerHeight: 400,
      margin: { top: 20, right: 30, bottom: 30, left: 40 },
    },
    formattedData
  );
});

// helper functions to format the data
function UniqueEpisodes(data) {
  let uniqueEpisodes = [];

  data.forEach((d) => {
    if (!uniqueEpisodes.includes(d.episode)) {
      uniqueEpisodes.push(d.episode);
    }
  });
  return uniqueEpisodes;
}

function UniqueCharacters(data) {
  let uniqueCharacters = [];

  data.forEach((d) => {
    if (!uniqueCharacters.includes(d.character)) {
      uniqueCharacters.push(d.character);
    }
  });
  return uniqueCharacters;
}

function countDialougePerCharInAnEpisode(data, char, episode) {
  let filterredDataByCharInAnEpisode = data.filter(
    (d) => d.character === char && d.episode === episode
  );
  return filterredDataByCharInAnEpisode;
}

function countDialougePerEpisode(data, episode) {
  let filterredDataByEpisode = data.filter((d) => d.episode === episode);
  return filterredDataByEpisode.length;
}
