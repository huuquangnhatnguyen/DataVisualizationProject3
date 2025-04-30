class ChordChart {
  /**
   * @param {Object} _config
   * @param {Object[]} _data
   * @param {string[]} _labels - Character names for the legend
   */
  constructor(_config, _data, _labels) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || { top: 10, right: 10, bottom: 10, left: 10 },
      legendWidth: _config.legendWidth || 150,
      legendHeight: _config.legendHeight || 20,
    };
    this.data = _data;
    this.labels = _labels || [
      "Character 1",
      "Character 2",
      "Character 3",
      "Character 4",
      "Character 5",
    ];
    this.initVis();
    this.updateVis();
  }

  initVis() {
    const vis = this;

    // Set up dimensions and margins
    vis.width =
      vis.config.containerWidth +
      50 -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Create the SVG container
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left + vis.width / 2}, ${
          vis.config.margin.top + vis.height / 2
        })`
      );

    // Define color scale with improved colors for the characters
    vis.colorScale = d3
      .scaleOrdinal()
      .domain(d3.range(vis.labels.length))
      .range([
        "#e41a1c",
        "#377eb8",
        "#4daf4a",
        "#984ea3",
        "#ff7f00",
        "#ffff33",
        "#a65628",
        "#f781bf",
      ]);

    // Create a matrix
    let matrix = [];
    // fill matrix with the data
    for (let i = 0; i < this.data.length; i++) {
      matrix[i] = new Array(this.data.length).fill(0);
    }
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data.length; j++) {
        matrix[i][j] = this.data[i][j];
      }
    }

    // Generate chord layout with matrix
    const res = d3.chord().padAngle(0.05).sortSubgroups(d3.descending)(matrix);

    // Create groups (outer arcs)
    vis.groups = vis.svg
      .datum(res)
      .append("g")
      .selectAll("g")
      .data((d) => d.groups)
      .enter()
      .append("g");

    // Add the arc paths for each group
    vis.groups
      .append("path")
      .style("fill", (d, i) => vis.colorScale(i))
      .style("stroke", "black")
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(vis.width / 2 - 20)
          .outerRadius(vis.width / 2)
      );

    // Add labels to the arcs
    vis.groups
      .append("text")
      .each((d) => {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr("dy", ".35em")
      .attr("transform", (d) => {
        // Position the text at the middle of the arc
        return `rotate(${(d.angle * 180) / Math.PI - 90}) 
                translate(${vis.width / 2 + 10}) 
                ${d.angle > Math.PI ? "rotate(180)" : ""}`;
      })
      .attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : null))
      .style("fill", "var(--text-color)")

      .text((d, i) => vis.labels[i]);

    // Add ribbons (links between groups)
    vis.chords = vis.svg
      .datum(res)
      .append("g")
      .selectAll("path")
      .data((d) => d)
      .enter()
      .append("path")
      .attr("d", d3.ribbon().radius(vis.width / 2 - 20))
      .style("fill", (d) => vis.colorScale(d.source.index))
      .style("stroke", "black");

    // Add legend container
    vis.legend = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.legendWidth * 2)
      .attr("height", vis.labels.length * 25 + 20)
      .attr("class", "legend")
      .append("g")
      .attr(
        "transform",
        `translate(${vis.width + vis.config.margin.right + 10}px, ${
          vis.config.margin.top + 10
        })`
      );

    // Add legend items
    const legendItems = vis.legend
      .selectAll(".legend-item")
      .data(vis.labels)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    // Add color boxes to legend
    legendItems
      .append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (d, i) => vis.colorScale(i));

    // Add text labels to legend
    legendItems
      .append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("fill", "var(--text-color)")
      .text((d) => d);

    // Add title to legend
    vis.legend
      .append("text")
      .attr("x", 0)
      .attr("y", -5)
      .attr("font-weight", "bold")
      .style("fill", "var(--text-color)")

      .text("Characters");

    // Add tooltip
    vis.tooltip = d3
      .select(vis.config.parentElement)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("pointer-events", "none");
  }

  updateVis() {
    const vis = this;

    // Add interactivity to chords
    vis.chords
      .on("mouseover", function (event, d) {
        // Highlight current chord
        d3.select(this).style("opacity", 1).style("stroke-width", 2);

        // Dim all other chords
        vis.chords.filter((chord) => chord !== d).style("opacity", 0.1);

        // Show tooltip with information
        vis.tooltip
          .style("opacity", 1)
          .html(
            `<strong><span style="color: ${vis.colorScale(d.source.index)}">${
              vis.labels[d.source.index]
            }</span> <span style="color: var(--background-color)">←→</span> <span style="color: ${vis.colorScale(
              d.target.index
            )}">${vis.labels[d.target.index]}</span>
            </strong>`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mousemove", function (event) {
        // Move tooltip with mouse
        vis.tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (event, d) {
        // Restore all chords to original appearance
        vis.chords.style("opacity", 0.8).style("stroke-width", 1);

        // Hide tooltip
        vis.tooltip.style("opacity", 0);
      });

    // Add interactivity to groups/arcs
    vis.groups
      .selectAll("path")
      .on("mouseover", function (event, d) {
        const index = d.index;

        // Highlight all chords connected to this group
        vis.chords
          .filter(
            (chord) =>
              chord.source.index === index || chord.target.index === index
          )
          .style("opacity", 1)
          .style("stroke-width", 2);

        // Dim all other chords
        vis.chords
          .filter(
            (chord) =>
              chord.source.index !== index && chord.target.index !== index
          )
          .style("opacity", 0.1);
      })
      .on("mouseout", function (event, d) {
        // Restore all chords to original appearance
        vis.chords.style("opacity", 0.8).style("stroke-width", 1);
      });
  }

  // Method to update the chart with new data
  updateData(newData, newLabels) {
    if (newData) this.data = newData;
    if (newLabels) this.labels = newLabels;

    // Remove existing elements
    this.svg.selectAll("*").remove();
    d3.select(this.config.parentElement).select("div.tooltip").remove();
    d3.select(this.config.parentElement).select("svg.legend").remove();

    // Re-initialize and update the visualization
    this.initVis();
    this.updateVis();
  }
}
